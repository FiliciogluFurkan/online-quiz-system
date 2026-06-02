export type User = {
  id: number;
  email: string;
  fullName: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  active: boolean;
};

export type Exam = {
  id: number;
  title: string;
  description: string;
  duration: number;
  startTime: string;
  endTime: string;
  published: boolean;
  instructor?: User | null;
  createdAt?: string;
};

export type Question = {
  id: number;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  questionText: string;
  options?: string;
  points: number;
  correctAnswer?: string;
  category?: { id: number; name: string };
};

// ─── API response shapes ───

export type ExamWithStats = {
  exam: Exam;
  enrolledCount: number;
  completedCount: number;
  avgScore: number | null;
};

export type CategoryBreakdown = {
  category: { id: number; name: string } | null;
  earned: number;
  total: number;
  successRate: number;
  questionCount: number;
};

export type ExamAggregate = {
  classSize: number;
  completedCount: number;
  average: number;
  median: number;
  max: number;
  min: number;
  stdDev: number;
  histogram: {
    bins: number[];
    counts: number[];
  };
  yourScore: number;
  yourPercentile: number;
};

export type AuditLogEntry = {
  id: number;
  entityType: string;
  entityId: number;
  action: string;
  payload?: string;
  userId?: number;
  userName?: string;
  createdAt: string;
};
