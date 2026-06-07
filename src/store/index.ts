import { configureStore } from "@reduxjs/toolkit";
import quizReducer, { setInitialState as setQuizInitialState } from "./slices/quizSlice";
import settingsReducer, { setSettings as setSettingsInitialState } from "./slices/settingsSlice";

const STORAGE_KEY = "quiz_app_state_v2"; // Changed key to avoid conflicts with old state structure

export const store = configureStore({
  reducer: {
    quiz: quizReducer,
    settings: settingsReducer,
  },
});

// Load state from localStorage
const savedState = localStorage.getItem(STORAGE_KEY);
if (savedState) {
  try {
    const parsedState = JSON.parse(savedState);
    if (parsedState.quiz) store.dispatch(setQuizInitialState(parsedState.quiz));
    if (parsedState.settings) store.dispatch(setSettingsInitialState(parsedState.settings));
  } catch (e) {
    console.error("Failed to load state from localStorage", e);
  }
}

// Save state to localStorage on every change
store.subscribe(() => {
  const state = store.getState();
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      quiz: state.quiz,
      settings: state.settings,
    })
  );
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
