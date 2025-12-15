export type JournalType = 'gratitude' | 'reframe';

export interface JournalEntry {
  id: string;
  timestamp: number;
  dateStr: string; // ISO date string YYYY-MM-DD
  type?: JournalType; // 'gratitude' is default if undefined
  
  // Gratitude specific
  items?: [string, string, string];

  // Reframe specific
  challenge?: string;
  reframe?: string;

  // Shared
  aiInsight?: string; // The supportive feedback from AI
  sentiment?: 'joyful' | 'grateful' | 'peaceful' | 'resilient' | 'hopeful' | 'neutral';
  tags?: string[];
}

export interface UserStats {
  totalEntries: number;
  currentStreak: number;
  lastEntryDate: string | null;
}

export enum AppView {
  WRITE = 'WRITE',
  REFRAME = 'REFRAME', // New view
  HISTORY = 'HISTORY',
  INSIGHTS = 'INSIGHTS',
}
