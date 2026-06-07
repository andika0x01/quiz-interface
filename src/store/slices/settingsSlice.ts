import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface SettingsState {
  theme: "oled" | "light";
  fontSize: "small" | "normal" | "large";
  randomize: boolean;
}

const initialState: SettingsState = {
  theme: "oled",
  fontSize: "normal",
  randomize: false,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      return { ...state, ...action.payload };
    },
    toggleTheme: (state) => {
      state.theme = state.theme === "oled" ? "light" : "oled";
    },
    setFontSize: (state, action: PayloadAction<SettingsState["fontSize"]>) => {
      state.fontSize = action.payload;
    },
    setRandomize: (state, action: PayloadAction<boolean>) => {
      state.randomize = action.payload;
    },
  },
});

export const { setSettings, toggleTheme, setFontSize, setRandomize } = settingsSlice.actions;
export default settingsSlice.reducer;
