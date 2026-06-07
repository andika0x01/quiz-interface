import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { MathJaxContext } from "better-react-mathjax";
import { store } from "./store";

import "./index.css";
import App from "./App.tsx";
import Home from "./pages/Home.tsx";
import CreateQuiz from "./pages/CreateQuiz.tsx";
import QuizPlay from "./pages/QuizPlay.tsx";
import History from "./pages/History.tsx";
import QuizReview from "./pages/QuizReview.tsx";
import Settings from "./pages/Settings.tsx";

const mathJaxConfig = {
  loader: { load: ["input/tex", "output/chtml"] },
  tex: {
    inlineMath: [
      ["$", "$"],
      ["\\(", "\\)"],
    ],
    displayMath: [
      ["$$", "$$"],
      ["\\[", "\\]"],
    ],
  },
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <MathJaxContext config={mathJaxConfig}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />}>
              <Route index element={<Home />} />
              <Route path="create" element={<CreateQuiz />} />
              <Route path="history" element={<History />} />
              <Route path="quiz/:id" element={<QuizPlay />} />
              <Route path="review/:scoreId" element={<QuizReview />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </MathJaxContext>
    </Provider>
  </StrictMode>
);
