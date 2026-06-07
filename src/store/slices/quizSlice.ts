import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface Question {
  type?: "multiple-choice" | "short-answer" | "multi-select";
  question: string;
  options?: string[];
  correctAnswerIndex?: number;
  correctAnswerIndices?: number[];
  correctAnswer?: string;
}

export interface Quiz {
  id: string;
  title: string;
  data: Question[];
  createdAt: string;
}

export interface Score {
  id: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  timestamp: string;
  questions: Question[];
  userAnswers: Record<number, any>;
}

interface QuizState {
  quizzes: Quiz[];
  scores: Score[];
  activeSessions: Record<string, { currentIndex: number; answers: Record<number, any>; shuffledData?: Question[] }>;
}

const initialState: QuizState = {
  quizzes: [],
  scores: [],
  activeSessions: {},
};

const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {
    setInitialState: (state, action: PayloadAction<QuizState>) => {
      state.quizzes = action.payload.quizzes || [];
      state.scores = action.payload.scores || [];
      state.activeSessions = action.payload.activeSessions || {};
    },
    addQuiz: (state, action: PayloadAction<Quiz>) => {
      state.quizzes.push(action.payload);
    },
    saveScore: (state, action: PayloadAction<Score>) => {
      state.scores.unshift(action.payload);
    },
    deleteQuiz: (state, action: PayloadAction<string>) => {
      state.quizzes = state.quizzes.filter((quiz) => quiz.id !== action.payload);
      delete state.activeSessions[action.payload];
    },
    deleteScore: (state, action: PayloadAction<string>) => {
      state.scores = state.scores.filter((score) => score.id !== action.payload);
    },
    updateActiveSession: (state, action: PayloadAction<{ quizId: string; currentIndex: number; answers: Record<number, any>; shuffledData?: Question[] }>) => {
      state.activeSessions[action.payload.quizId] = {
        currentIndex: action.payload.currentIndex,
        answers: action.payload.answers,
        shuffledData: action.payload.shuffledData || state.activeSessions[action.payload.quizId]?.shuffledData,
      };
    },
    clearActiveSession: (state, action: PayloadAction<string>) => {
      delete state.activeSessions[action.payload];
    },
  },
});

export const { setInitialState, addQuiz, saveScore, deleteQuiz, deleteScore, updateActiveSession, clearActiveSession } = quizSlice.actions;
export default quizSlice.reducer;
