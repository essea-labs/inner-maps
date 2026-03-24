// ===== SHARED TYPES =====

export type ScreenName =
  | 'landing'
  | 'name'
  | 'birthday'
  | 'quiz'
  | 'miniReveal'
  | 'signup'
  | 'results'
  | 'connections'
  | 'inviteLanding'
  | 'compatibility'
  | 'individualReport'
  | 'compatibilityReport';

export interface Section {
  id: string;
  name: string;
  icon: string;
  questions: number;
}

export interface CognitiveQuestion {
  q: string;
  a: string;
  b: string;
}

export interface AttachmentQuestion {
  q: string;
  dim: 'anxiety' | 'avoidance';
}

export interface ConnectionQuestion {
  q: string;
  a: string;
  b: string;
  aType: string;
  bType: string;
}

export interface EnneagramQuestion {
  q: string;
  type: number;
  name: string;
  desc: string;
}

export interface StarSign {
  sign: string;
  symbol: string;
  emoji: string;
  dates: string;
  tagline: string;
  desc: string;
  month: number[];
}

export interface QuizAnswers {
  cognitive: (string | null)[];
  attachment: (number | null)[];
  connection: (string | null)[];
  enneagram: (number | string | null)[];
}

export interface QuizResults {
  cognitiveType: string;
  cognitiveTypeName: string;
  cognitiveTypeDesc: string;
  attachmentStyle: string;
  attachmentDesc: string;
  anxiety: string;
  avoidance: string;
  connectionScores: Record<string, number>;
  connectionSorted: [string, number][];
  connectionNames: Record<string, string>;
  connectionDescs: Record<string, string>;
  topConnection: string;
  enneagramType: number;
  enneagramWing: number;
  enneagramName: string;
  enneagramDisplay: string;
  starSign: StarSign | null;
}

export interface CompatDimension {
  score: number;
  insight: string;
  detail: string;
}

export interface CompatibilityResult {
  zodiac: CompatDimension;
  personality: CompatDimension;
  attachment: CompatDimension;
  connection: CompatDimension;
  enneagram: CompatDimension;
  overall: number;
}

export interface Connection {
  name: string;
  status: 'completed' | 'pending';
  results?: QuizResults;
  invitedDaysAgo?: number;
}
