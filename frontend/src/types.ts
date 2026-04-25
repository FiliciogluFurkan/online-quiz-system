export type User = {
  id: number;
  email: string;
  fullName: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  active: boolean;
}

export type Exam = {
  id: number;
  title: string;
  description: string;
  duration: number;
  startTime: string;
  endTime: string;
  published: boolean;
}

export type Question = {
  id: number;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  questionText: string;
  options?: string;
  points: number;
}
