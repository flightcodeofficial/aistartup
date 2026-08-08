export interface StepProgress {
  stepId: string; // "w2-d1-s1"
  completed: boolean;
  completedAt?: number;
  favorited: boolean;
  note: string;
  /** Quiz 단계 결과. 다시 풀면 최신 결과로 덮어쓴다. */
  quizScore?: { correct: number; total: number };
}

export interface LastPosition {
  week: number;
  day: number;
  stepNumber: number;
}

/** Lesson Content Engine(PPT형 page01~pageNN) 안에서의 진행 상태.
 *  key는 `w{week}-d{day}-l{lesson}` 형태. */
export interface LessonPageProgress {
  currentPage: number;
  visitedPages: number[];
  updatedAt: number;
}

export interface ProgressState {
  steps: Record<string, StepProgress>;
  lastPosition: LastPosition;
  lessonPages: Record<string, LessonPageProgress>;
}
