# -*- coding: utf-8 -*-
"""원본 PDF의 줄 정보를 이용해 지문 텍스트를 다시 만든다.

PDF에서 뽑아낸 지문은 시험지의 줄바꿈이 그대로 남아 있어 문장이 잘리거나
("정렬 함수 / 를 테스트하고") 반대로 단어가 붙어버린다("프로세스의처음").
PDF 줄 끝에는 원래의 띄어쓰기가 남아 있으므로, 줄 끝 공백이 있을 때만
공백을 넣어 이어 붙이면 원문 그대로 복원할 수 있다.

목록 항목과 문단 구분은 들여쓰기와 빈 줄로 판별해 줄바꿈을 유지한다.
이미지로 보여주는 문항(stemImage)은 건드리지 않는다.

사용법:
    python3 scripts/rebuild-question-text.py           # questions.json 갱신
    python3 scripts/rebuild-question-text.py --dry-run # 바뀌는 내용만 출력
"""
import argparse
import collections
import json
import pathlib
import re

import pymupdf

ROOT = pathlib.Path(__file__).resolve().parents[2]
QUESTIONS_PATH = ROOT / 'istqb-web/src/data/questions.json'

PDFS = {
    'A': ROOT / 'files/ISTQB_FL_v4.0_샘플문제_A_v1.7_한글_v1.0.pdf',
    'B': ROOT / 'files/ISTQB_FL_v4.0_샘플문제_B_v1.7_한글_v1.0.pdf',
    'C': ROOT / 'files/ISTQB_FL_v4.0_샘플문제_C_v1.6_한글_v1.0.pdf',
    'D': ROOT / 'files/ISTQB_FL_v4.0_샘플문제_D_v1.5_한글_v1.0.1.pdf',
}

QUESTION_HEAD = re.compile(r'^\s*(\d{1,2})\.\s')
OPTION_HEAD = re.compile(r'^\s*[a-e][.)]\s')
LIST_HEAD = re.compile(r'^\s*(•|[-–]\s|\(\d+\)|\d+[.)]\s|[A-Z][.)]\s|[Ⅰ-ⅿ]+[.)]|TC\d+|AC\d+|Req\s*\d+)')
BULLET_GLYPHS = {'\uf06c': '•', '\uf0b7': '•', '\u25cf': '•', '\u25aa': '•'}

HEADER_BOTTOM = 90
FOOTER_TOP = 780
HEAD_MAX_X = 80
OPTION_MIN_X = 84
LINE_TOLERANCE = 4  # pt. 같은 줄로 볼 세로 오차
INDENT_STEP = 7  # pt. 이만큼 들여쓰기가 달라지면 새 줄로 본다


def visual_lines(page):
    """글머리 기호처럼 조각난 조각들을 한 줄로 합쳐 (x, y, 텍스트) 목록을 만든다."""
    fragments = []
    for block in page.get_text('dict')['blocks']:
        for line in block.get('lines', []):
            text = ''.join(span['text'] for span in line['spans'])
            for glyph, replacement in BULLET_GLYPHS.items():
                text = text.replace(glyph, replacement)
            fragments.append((line['bbox'][1], line['bbox'][0], text))

    fragments.sort()
    merged = []
    for top, left, text in fragments:
        if merged and abs(merged[-1][0] - top) <= LINE_TOLERANCE:
            merged[-1][2] += text
            continue
        merged.append([top, left, text])
    return [(top, left, text) for top, left, text in merged]


def is_question_head(text, left, top, number=None):
    match = QUESTION_HEAD.match(text)
    if not match or left > HEAD_MAX_X or top <= HEADER_BOTTOM:
        return False
    return number is None or int(match.group(1)) == number


def stem_lines(doc, question_number):
    """문제 번호 줄부터 첫 보기 직전까지의 줄을 모은다."""
    for index in range(len(doc)):
        lines = visual_lines(doc[index])
        start = None
        for position, (top, left, text) in enumerate(lines):
            if is_question_head(text, left, top, question_number):
                start = position
                break
        if start is None:
            continue

        collected = []
        for top, left, text in lines[start:]:
            if top > FOOTER_TOP:
                break
            if collected:
                if OPTION_HEAD.match(text) and left >= OPTION_MIN_X:
                    break
                if is_question_head(text, left, top):
                    break
            collected.append((left, text))
        return collected
    return None


def rebuild(lines):
    """줄 끝 공백과 들여쓰기를 이용해 문단/목록을 복원한다."""
    paragraphs = []
    current = []
    previous_indent = None
    previous_open = False  # 앞 줄이 공백 없이 끝났는지(=단어 중간에서 잘린 줄)

    for position, (left, raw) in enumerate(lines):
        text = raw.strip()
        if not text:
            if current:
                paragraphs.append(current)
                current = []
            previous_indent = None
            continue

        starts_list = bool(LIST_HEAD.match(text))
        indent_changed = previous_indent is not None and abs(left - previous_indent) > INDENT_STEP
        if current and not starts_list and not indent_changed:
            separator = ' ' if previous_open else ''
            current[-1] = f'{current[-1]}{separator}{text}'
        else:
            current.append(text)

        # 문제 번호가 붙은 첫 줄은 번호만큼 내어쓰기되어 있으므로 기준으로 삼지 않는다
        previous_indent = None if position == 0 else left
        previous_open = raw.endswith(' ')

    if current:
        paragraphs.append(current)

    return '\n\n'.join('\n'.join(paragraph) for paragraph in paragraphs)


def squeeze(text):
    """글머리 기호와 공백을 뺀 알맹이만 남긴다 — 원문 대조용."""
    return re.sub(r'[\s•\uf06c\uf0b7]+', '', text)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()

    questions = json.loads(QUESTIONS_PATH.read_text(encoding='utf-8'),
                           object_pairs_hook=collections.OrderedDict)
    docs = {key: pymupdf.open(path) for key, path in PDFS.items()}

    changed = 0
    skipped = []
    for question in questions:
        if question.get('stemImage'):
            continue
        doc = docs.get(question['examSet'].upper())
        if doc is None:
            continue

        lines = stem_lines(doc, int(question['questionNumber']))
        if not lines:
            skipped.append((question['id'], '지문 위치를 못 찾음'))
            continue

        text = rebuild(lines)
        text = QUESTION_HEAD.sub('', text, count=1)
        # 복원한 글자가 원래 지문과 같은지 확인한다. 다르면 손대지 않는다
        if squeeze(text) != squeeze(question['questionText']):
            skipped.append((question['id'], '원문과 불일치'))
            continue
        if text == question['questionText']:
            continue

        if args.dry_run:
            print(f"=== {question['id']}")
            print(text)
            print()
        question['questionText'] = text
        changed += 1

    print(f'다시 만든 문항 {changed}개, 건너뛴 문항 {len(skipped)}개')
    for question_id, reason in skipped:
        print(f'  - {question_id}: {reason}')

    if not args.dry_run:
        with QUESTIONS_PATH.open('w', encoding='utf-8') as handle:
            json.dump(questions, handle, ensure_ascii=False, indent=2)
            handle.write('\n')


main()
