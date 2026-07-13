export type CapsuleStatus = "PROCESSING" | "READY" | "OPENED";

export type PassionCategory =
  | "Coding"
  | "Music"
  | "Sport"
  | "Travel"
  | "Art"
  | "Startup"
  | "Other";

export const PASSION_CATEGORIES: PassionCategory[] = [
  "Coding",
  "Music",
  "Sport",
  "Travel",
  "Art",
  "Startup",
  "Other",
];

export interface AIAnalysisResult {
  summary: string;
  emotion: string;
  keywords: string[];
  futureLetter: string;
  advice: string;
  obstacles: string[];
}

export interface ReflectionResult {
  growth: string;
  achievements: string[];
  missedGoals: string[];
  suggestions: string[];
  encouragement: string;
}

export interface CapsuleListItem {
  id: string;
  title: string;
  category: string;
  status: CapsuleStatus;
  openDate: string;
  createdAt: string;
  emotion: string | null;
  isOpen: boolean;
}

export interface CapsuleDetail {
  id: string;
  title: string;
  category: string;
  goal: string;
  imageUrl: string | null;
  voiceUrl: string | null;
  status: CapsuleStatus;
  openDate: string;
  createdAt: string;
  isOpen: boolean;
  analysis: {
    summary: string;
    emotion: string;
    keywords: string[];
    futureLetter?: string;
    advice?: string;
    obstacles?: string[];
    audioUrl?: string | null;
  } | null;
  reflections: {
    id: string;
    reflection: string;
    analysis: ReflectionResult;
    createdAt: string;
  }[];
}

export interface ApiError {
  error: string;
  code?: string;
}
