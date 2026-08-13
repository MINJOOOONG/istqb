# -*- coding: utf-8 -*-
"""원본 샘플 시험 PDF에서 지문(문제 번호 ~ 첫 보기 직전) 영역을 잘라 이미지로 내보낸다.

표, 결함 보고서 박스, 상태 전이 다이어그램, 그래프처럼 텍스트 추출로는
원본 레이아웃을 살릴 수 없는 문항에서만 사용한다.

사용법:
    python3 scripts/extract-question-images.py          # 이미지 생성 + questions.json 갱신
    python3 scripts/extract-question-images.py --report # 어떤 문항이 대상인지만 출력
"""
import argparse
import collections
import json
import pathlib
import re

import pymupdf

ROOT = pathlib.Path(__file__).resolve().parents[2]
QUESTIONS_PATH = ROOT / 'istqb-web/src/data/questions.json'
IMAGE_DIR = ROOT / 'istqb-web/public/question-images'

PDFS = {
    'A': ROOT / 'files/ISTQB_FL_v4.0_샘플문제_A_v1.7_한글_v1.0.pdf',
    'B': ROOT / 'files/ISTQB_FL_v4.0_샘플문제_B_v1.7_한글_v1.0.pdf',
    'C': ROOT / 'files/ISTQB_FL_v4.0_샘플문제_C_v1.6_한글_v1.0.pdf',
    'D': ROOT / 'files/ISTQB_FL_v4.0_샘플문제_D_v1.5_한글_v1.0.1.pdf',
}

QUESTION_HEAD = re.compile(r'^\s*(\d{1,2})\.\s')
OPTION_HEAD = re.compile(r'^\s*a[.)]\s')
ZOOM = 3  # 216dpi. 레티나 화면에서도 또렷하게 보이는 최소 배율
PADDING = 7  # pt
# 머리말 로고와 꼬리말(사이트 주소, 쪽 번호)은 지문이 아니므로 제외한다
HEADER_BOTTOM = 90
FOOTER_TOP = 780


def page_lines(page):
    """페이지의 텍스트 줄을 (문자열, 사각형)으로 돌려준다."""
    lines = []
    for block in page.get_text('dict')['blocks']:
        for line in block.get('lines', []):
            text = ''.join(span['text'] for span in line['spans'])
            lines.append((text, pymupdf.Rect(line['bbox'])))
    lines.sort(key=lambda item: item[1].y0)
    return lines


# 문제 번호는 왼쪽 여백에서 시작하고, 보기(a.)와 지문 속 번호 목록은 들여쓰기된다
HEAD_MAX_X = 80
OPTION_MIN_X = 84


def is_question_head(text, rect, number=None):
    match = QUESTION_HEAD.match(text)
    if not match or rect.x0 > HEAD_MAX_X or rect.y0 <= HEADER_BOTTOM:
        return False
    return number is None or int(match.group(1)) == number


def stem_rect(page, question_number):
    """문제 번호 줄부터 첫 보기(a.) 직전까지의 영역을 찾는다."""
    lines = page_lines(page)
    start = None
    for index, (text, rect) in enumerate(lines):
        if is_question_head(text, rect, question_number):
            start = index
            break
    if start is None:
        return None

    top = lines[start][1].y0
    bottom = FOOTER_TOP
    for text, rect in lines[start + 1:]:
        is_option = OPTION_HEAD.match(text) and rect.x0 >= OPTION_MIN_X
        if is_option or is_question_head(text, rect):
            bottom = rect.y0
            break

    region = pymupdf.Rect(0, top, page.rect.width, bottom)
    content = None
    for _, rect in lines[start:]:
        if rect.y1 <= bottom and rect.y0 >= top - 1:
            content = rect if content is None else content | rect
    for drawing in page.get_drawings():
        rect = drawing['rect']
        if rect.y0 >= top - 2 and rect.y1 <= bottom + 2 and rect.width > 1:
            content = rect if content is None else content | rect
    if content is None:
        return None

    content = content & region
    return pymupdf.Rect(
        max(content.x0 - PADDING, 0),
        max(content.y0 - PADDING, HEADER_BOTTOM - PADDING),
        min(content.x1 + PADDING, page.rect.width),
        min(content.y1 + PADDING, FOOTER_TOP),
    )


def has_layout(page, rect):
    """해당 영역에 표 선이나 그림이 있는지 — 텍스트만으로는 못 살리는 문항인지 판단한다."""
    strokes = 0
    for drawing in page.get_drawings():
        box = drawing['rect']
        if not box.intersects(rect):
            continue
        # 표 테두리는 두께가 없는 선으로 그려지므로 길이만 본다
        if max(box.width, box.height) > 30:
            strokes += 1
    if strokes >= 3:
        return True
    for image in page.get_image_info():
        if pymupdf.Rect(image['bbox']).intersects(rect):
            return True
    return False


def find_page(doc, question_number):
    """문제 번호로 시작하는 페이지를 찾는다."""
    for number in range(len(doc)):
        page = doc[number]
        for text, rect in page_lines(page):
            if is_question_head(text, rect, question_number):
                return page
    return None


def collect(questions):
    """대상 문항별로 (문항, 페이지, 잘라낼 영역)을 모은다."""
    docs = {key: pymupdf.open(path) for key, path in PDFS.items()}
    found = []
    for question in questions:
        exam_set = question['examSet'].upper()
        doc = docs.get(exam_set)
        if doc is None:
            continue
        number = int(question['questionNumber'])
        page = find_page(doc, number)
        if page is None:
            continue
        rect = stem_rect(page, number)
        if rect is None or rect.height < 20:
            continue
        if not has_layout(page, rect):
            continue
        found.append((question, page, rect))
    return found


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--report', action='store_true', help='대상 문항만 출력')
    args = parser.parse_args()

    questions = json.loads(QUESTIONS_PATH.read_text(encoding='utf-8'),
                           object_pairs_hook=collections.OrderedDict)
    targets = collect(questions)

    if args.report:
        for question, page, rect in targets:
            print(f"{question['id']:<12} p{page.number + 1:>2} "
                  f"{rect.width:>6.1f}x{rect.height:>6.1f}  {question['questionText'].splitlines()[0][:40]}")
        print(f'\n대상 {len(targets)}개 / 전체 {len(questions)}개')
        return

    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    sizes = {}
    for question, page, rect in targets:
        pixmap = page.get_pixmap(clip=rect, matrix=pymupdf.Matrix(ZOOM, ZOOM))
        target = IMAGE_DIR / f"{question['id']}.png"
        pixmap.save(target)
        sizes[question['id']] = (pixmap.width, pixmap.height)

    for question in questions:
        size = sizes.get(question['id'])
        if size:
            question['stemImage'] = {
                'src': f"/question-images/{question['id']}.png",
                'width': size[0],
                'height': size[1],
            }
        else:
            question.pop('stemImage', None)

    with QUESTIONS_PATH.open('w', encoding='utf-8') as handle:
        json.dump(questions, handle, ensure_ascii=False, indent=2)
        handle.write('\n')

    total = sum((IMAGE_DIR / f'{qid}.png').stat().st_size for qid in sizes)
    print(f'이미지 {len(sizes)}개, 합계 {total / 1e6:.1f} MB')


main()
