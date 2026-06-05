const WRONG_KEY = 'istqb_wrong_ids';
const ANSWERED_KEY = 'istqb_answered';

export function getWrongIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(WRONG_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addWrongId(id: string) {
  const ids = getWrongIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(WRONG_KEY, JSON.stringify(ids));
  }
}

export function removeWrongId(id: string) {
  const ids = getWrongIds().filter((i) => i !== id);
  localStorage.setItem(WRONG_KEY, JSON.stringify(ids));
}

interface AnswerRecord {
  questionId: string;
  correct: boolean;
}

export function getAnswered(): AnswerRecord[] {
  try {
    return JSON.parse(localStorage.getItem(ANSWERED_KEY) || '[]');
  } catch {
    return [];
  }
}

export function recordAnswer(questionId: string, correct: boolean) {
  const records = getAnswered();
  const existing = records.findIndex((r) => r.questionId === questionId);
  if (existing >= 0) {
    records[existing].correct = correct;
  } else {
    records.push({ questionId, correct });
  }
  localStorage.setItem(ANSWERED_KEY, JSON.stringify(records));

  if (correct) {
    // Don't auto-remove from wrong notes; user decides
  } else {
    addWrongId(questionId);
  }
}
