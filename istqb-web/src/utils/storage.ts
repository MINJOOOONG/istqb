const WRONG_KEY = 'istqb_wrong_ids';
const ANSWERED_KEY = 'istqb_answered';
const WRONG_NOTES_KEY = 'istqb_wrong_notes';

// --- Legacy interfaces (for migration) ---
interface LegacyAnswerRecord {
  questionId: string;
  correct: boolean;
}

// --- New interfaces ---
export interface WrongNoteRecord {
  questionId: string;
  selectedAnswers: string[];
  correctAnswers: string[];
  isCorrect: boolean;
  date: string;
  chapter: number;
  section: string;
  wrongCount: number;
  lastRetryDate?: string;
  lastRetryCorrect?: boolean;
  manualSave: boolean;
}

export interface ChapterStat {
  chapter: number;
  total: number;
  correct: number;
  wrong: number;
  rate: number;
}

// --- Migration ---
function migrateIfNeeded() {
  // Already migrated?
  if (localStorage.getItem(WRONG_NOTES_KEY)) return;

  const oldWrongIds = getWrongIdsLegacy();
  const oldAnswered = getLegacyAnswered();

  if (oldWrongIds.length === 0 && oldAnswered.length === 0) return;

  const notes: Record<string, WrongNoteRecord> = {};

  for (const id of oldWrongIds) {
    const answered = oldAnswered.find((a) => a.questionId === id);
    notes[id] = {
      questionId: id,
      selectedAnswers: [],
      correctAnswers: [],
      isCorrect: false,
      date: new Date().toISOString(),
      chapter: 0,
      section: '',
      wrongCount: 1,
      manualSave: false,
      ...(answered ? { isCorrect: answered.correct } : {}),
    };
  }

  localStorage.setItem(WRONG_NOTES_KEY, JSON.stringify(notes));
}

function getWrongIdsLegacy(): string[] {
  try {
    return JSON.parse(localStorage.getItem(WRONG_KEY) || '[]');
  } catch {
    return [];
  }
}

function getLegacyAnswered(): LegacyAnswerRecord[] {
  try {
    return JSON.parse(localStorage.getItem(ANSWERED_KEY) || '[]');
  } catch {
    return [];
  }
}

// --- Wrong Notes CRUD ---

function getAllWrongNotes(): Record<string, WrongNoteRecord> {
  migrateIfNeeded();
  try {
    return JSON.parse(localStorage.getItem(WRONG_NOTES_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveAllWrongNotes(notes: Record<string, WrongNoteRecord>) {
  localStorage.setItem(WRONG_NOTES_KEY, JSON.stringify(notes));
}

export function getWrongNotes(): WrongNoteRecord[] {
  return Object.values(getAllWrongNotes());
}

export function getWrongNote(questionId: string): WrongNoteRecord | undefined {
  return getAllWrongNotes()[questionId];
}

export function saveWrongNote(record: Omit<WrongNoteRecord, 'wrongCount'> & { wrongCount?: number }) {
  const notes = getAllWrongNotes();
  const existing = notes[record.questionId];
  const wrongCount = record.wrongCount ?? (existing ? existing.wrongCount + 1 : 1);

  notes[record.questionId] = { ...record, wrongCount };
  saveAllWrongNotes(notes);

  // Keep legacy storage in sync
  syncLegacyWrongIds(notes);
}

export function removeWrongNote(questionId: string) {
  const notes = getAllWrongNotes();
  delete notes[questionId];
  saveAllWrongNotes(notes);
  syncLegacyWrongIds(notes);
}

export function updateWrongNote(questionId: string, updates: Partial<WrongNoteRecord>) {
  const notes = getAllWrongNotes();
  if (notes[questionId]) {
    notes[questionId] = { ...notes[questionId], ...updates };
    saveAllWrongNotes(notes);
  }
}

function syncLegacyWrongIds(notes: Record<string, WrongNoteRecord>) {
  const ids = Object.keys(notes);
  localStorage.setItem(WRONG_KEY, JSON.stringify(ids));
}

// --- Backward-compatible API ---
// These functions maintain the same interface as before

export function getWrongIds(): string[] {
  migrateIfNeeded();
  return Object.keys(getAllWrongNotes());
}

export function addWrongId(id: string) {
  const notes = getAllWrongNotes();
  if (!notes[id]) {
    notes[id] = {
      questionId: id,
      selectedAnswers: [],
      correctAnswers: [],
      isCorrect: false,
      date: new Date().toISOString(),
      chapter: 0,
      section: '',
      wrongCount: 1,
      manualSave: false,
    };
    saveAllWrongNotes(notes);
    syncLegacyWrongIds(notes);
  }
}

export function removeWrongId(id: string) {
  removeWrongNote(id);
}

// --- Answer Recording ---

export interface AnswerRecord {
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

export function recordAnswer(
  questionId: string,
  correct: boolean,
  options?: {
    selectedAnswers?: string[];
    correctAnswers?: string[];
    chapter?: number;
    section?: string;
  }
) {
  // Update legacy answered list
  const records = getAnswered();
  const existing = records.findIndex((r) => r.questionId === questionId);
  if (existing >= 0) {
    records[existing].correct = correct;
  } else {
    records.push({ questionId, correct });
  }
  localStorage.setItem(ANSWERED_KEY, JSON.stringify(records));

  // Update wrong notes
  if (!correct) {
    const notes = getAllWrongNotes();
    const existingNote = notes[questionId];
    const wrongCount = existingNote ? existingNote.wrongCount + 1 : 1;

    notes[questionId] = {
      questionId,
      selectedAnswers: options?.selectedAnswers ?? [],
      correctAnswers: options?.correctAnswers ?? [],
      isCorrect: false,
      date: new Date().toISOString(),
      chapter: options?.chapter ?? existingNote?.chapter ?? 0,
      section: options?.section ?? existingNote?.section ?? '',
      wrongCount,
      manualSave: existingNote?.manualSave ?? false,
    };
    saveAllWrongNotes(notes);
    syncLegacyWrongIds(notes);
  } else {
    // When correct, update retry info but don't remove from wrong notes
    const notes = getAllWrongNotes();
    if (notes[questionId]) {
      notes[questionId].lastRetryDate = new Date().toISOString();
      notes[questionId].lastRetryCorrect = true;
      saveAllWrongNotes(notes);
    }
  }
}

// --- Chapter Stats ---

export function getChapterStats(): ChapterStat[] {
  const answered = getAnswered();
  const statsMap = new Map<number, { total: number; correct: number; wrong: number }>();

  // We need chapter info - get it from wrong notes where available
  const notes = getAllWrongNotes();

  for (const record of answered) {
    const note = notes[record.questionId];
    // Try to extract chapter from question ID pattern "ctfl-X-NN"
    const chapter = note?.chapter ?? 0;
    if (chapter === 0) {
      // Can't determine chapter from ID alone; skip
      continue;
    }
    const stat = statsMap.get(chapter) ?? { total: 0, correct: 0, wrong: 0 };
    stat.total++;
    if (record.correct) stat.correct++;
    else stat.wrong++;
    statsMap.set(chapter, stat);
  }

  return Array.from(statsMap.entries())
    .map(([chapter, stat]) => ({
      chapter,
      ...stat,
      rate: stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0,
    }))
    .sort((a, b) => a.chapter - b.chapter);
}

// Enhanced chapter stats that uses question data for accurate chapter mapping
export function getChapterStatsWithQuestions(
  questions: { id: string; chapter: number }[]
): ChapterStat[] {
  const answered = getAnswered();
  const questionChapterMap = new Map(questions.map((q) => [q.id, q.chapter]));
  const statsMap = new Map<number, { total: number; correct: number; wrong: number }>();

  for (const record of answered) {
    const chapter = questionChapterMap.get(record.questionId);
    if (chapter === undefined) continue;

    const stat = statsMap.get(chapter) ?? { total: 0, correct: 0, wrong: 0 };
    stat.total++;
    if (record.correct) stat.correct++;
    else stat.wrong++;
    statsMap.set(chapter, stat);
  }

  return Array.from(statsMap.entries())
    .map(([chapter, stat]) => ({
      chapter,
      ...stat,
      rate: stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0,
    }))
    .sort((a, b) => a.chapter - b.chapter);
}
