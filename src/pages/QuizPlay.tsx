import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import { ChevronRight, ChevronLeft, Award, Home, RotateCcw, Save, CheckCircle2, XCircle } from "lucide-react";
import { MathJax } from "better-react-mathjax";
import { saveScore, updateActiveSession, clearActiveSession } from "../store/slices/quizSlice";

const QuizPlay = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const scrollRef = useRef<HTMLDivElement>(null);

  const quiz = useSelector((state: RootState) => state.quiz.quizzes.find((q) => q.id === id));
  const settings = useSelector((state: RootState) => state.settings);

  const activeSession = useSelector((state: RootState) => (id ? state.quiz.activeSessions[id] : null));

  const [currentIndex, setCurrentIndex] = useState(activeSession?.currentIndex || 0);
  const [answers, setAnswers] = useState<Record<number, any>>(activeSession?.answers || {});
  const [checkedQuestions, setCheckedQuestions] = useState<Record<number, boolean>>(activeSession?.checkedQuestions || {});
  const [isFinished, setIsFinished] = useState(false);
  const [finalScoreId, setFinalScoreId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const quizData = activeSession?.shuffledData || quiz?.data || [];
  const currentQuestion = quizData[currentIndex];

  useEffect(() => {
    if (!quiz) {
      navigate("/");
    }
  }, [quiz, navigate]);

  useEffect(() => {
    if (currentQuestion?.type === "short-answer" && !isFinished) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [currentIndex, isFinished, currentQuestion?.type]);

  useEffect(() => {
    if (id) {
      dispatch(
        updateActiveSession({
          quizId: id,
          currentIndex,
          answers,
          checkedQuestions,
          shuffledData: activeSession?.shuffledData,
        })
      );
    }
  }, [id, currentIndex, answers, checkedQuestions, dispatch]);

  useEffect(() => {
    // Scroll active question into view
    if (scrollRef.current) {
      const activeBtn = scrollRef.current.children[currentIndex] as HTMLElement;
      if (activeBtn) {
        scrollRef.current.scrollTo({
          left: activeBtn.offsetLeft - scrollRef.current.offsetWidth / 2 + activeBtn.offsetWidth / 2,
          behavior: "smooth",
        });
      }
    }
  }, [currentIndex]);

  if (!quiz || quizData.length === 0) return null;

  const handleAnswer = (answer: any) => {
    if (settings.showAnswerImmediately && checkedQuestions[currentIndex]) return;

    if (currentQuestion.type === "multi-select") {
      const currentAnswers = Array.isArray(answers[currentIndex]) ? [...answers[currentIndex]] : [];
      const index = currentAnswers.indexOf(answer);
      if (index > -1) {
        currentAnswers.splice(index, 1);
      } else {
        currentAnswers.push(answer);
      }
      setAnswers((prev) => ({ ...prev, [currentIndex]: currentAnswers }));
    } else {
      setAnswers((prev) => ({
        ...prev,
        [currentIndex]: answer,
      }));
    }
  };

  const handleCheckAnswer = () => {
    setCheckedQuestions((prev) => ({ ...prev, [currentIndex]: true }));
  };

  const handleNext = () => {
    if (currentIndex === quizData.length - 1) {
      handleSubmit();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const calculateScore = () => {
    let score = 0;
    quizData.forEach((q, idx) => {
      const userAnswer = answers[idx];
      if (q.type === "short-answer") {
        if (typeof userAnswer === "string" && userAnswer.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase()) {
          score++;
        }
      } else if (q.type === "multi-select") {
        const correctIndices = q.correctAnswerIndices || [];
        const userIndices = Array.isArray(userAnswer) ? userAnswer : [];
        if (correctIndices.length === userIndices.length && correctIndices.every((val) => userIndices.includes(val))) {
          score++;
        }
      } else {
        if (userAnswer === q.correctAnswerIndex) {
          score++;
        }
      }
    });
    return score;
  };

  const handleSubmit = () => {
    const scoreValue = calculateScore();
    const scoreId = crypto.randomUUID();

    dispatch(
      saveScore({
        id: scoreId,
        quizId: quiz.id,
        quizTitle: quiz.title,
        score: scoreValue,
        totalQuestions: quizData.length,
        timestamp: new Date().toISOString(),
        questions: quizData,
        userAnswers: answers,
      })
    );

    if (id) {
      dispatch(clearActiveSession(id));
    }

    setFinalScoreId(scoreId);
    setIsFinished(true);
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setAnswers({});
    setIsFinished(false);
    setFinalScoreId(null);
  };

  if (isFinished) {
    const scoreValue = calculateScore();
    const percentage = (scoreValue / quizData.length) * 100;

    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <div className="bg-zinc-100 dark:bg-zinc-900 rounded-3xl p-8 shadow-2xl border border-zinc-200 dark:border-white/10 w-full max-w-md relative overflow-hidden">
          <div className="w-24 h-24 bg-zinc-200 dark:bg-white/10 text-black dark:text-white rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-300 dark:border-white/10 relative z-10">
            <Award size={48} />
          </div>
          <h2 className="text-3xl font-bold dark:text-white mb-2 relative z-10">Quiz Completed!</h2>
          <p className="text-zinc-500 mb-8 relative z-10">{quiz.title}</p>

          <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
            <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-zinc-200 dark:border-white/10">
              <span className="block text-2xl font-bold dark:text-white">
                {scoreValue}/{quizData.length}
              </span>
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Score</span>
            </div>
            <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-zinc-200 dark:border-white/10">
              <span className="block text-2xl font-bold dark:text-white">{percentage.toFixed(0)}%</span>
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Result</span>
            </div>
          </div>

          <div className="space-y-3 relative z-10">
            <Link
              to={`/review/${finalScoreId}`}
              className="w-full flex items-center justify-center py-4 px-6 bg-black dark:bg-zinc-100 text-white dark:text-black rounded-2xl font-bold hover:opacity-90 transition-all shadow-xl active:scale-95"
            >
              Review Answers
            </Link>
            <button
              onClick={restartQuiz}
              className="w-full flex items-center justify-center py-4 px-6 bg-zinc-100 dark:bg-white/5 text-zinc-800 dark:text-zinc-300 rounded-2xl font-bold hover:bg-zinc-200 dark:hover:bg-white/10 transition-all border border-zinc-200 dark:border-white/10"
            >
              <RotateCcw size={20} className="mr-2" />
              Try Again
            </button>
            <Link
              to="/"
              className="w-full flex items-center justify-center py-4 px-6 bg-transparent text-zinc-500 rounded-2xl font-bold hover:text-zinc-800 dark:hover:text-zinc-300 transition-all"
            >
              <Home size={20} className="mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 max-w-2xl mx-auto">
      {/* Top Navigation - Question Numbers */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold dark:text-white truncate mr-4">{quiz.title}</h1>
          <button onClick={() => navigate("/")} className="flex items-center text-zinc-500 hover:text-black dark:hover:text-white transition-colors text-sm font-medium">
            <Save size={20} className="mr-1 shrink-0" />
            Save & Exit
          </button>
        </div>

        <div ref={scrollRef} className="flex gap-3 overflow-x-auto py-4 px-6 scroll-smooth">
          {quizData.map((_, index) => {
            const answer = answers[index];
            const isAnswered = settings.showAnswerImmediately
              ? checkedQuestions[index]
              : answer !== undefined && (typeof answer === "string" ? answer.trim() !== "" : Array.isArray(answer) ? answer.length > 0 : true);
            const isActive = currentIndex === index;

            return (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all border-2 ${
                  isActive
                    ? "bg-black dark:bg-zinc-100 border-zinc-400 dark:border-white text-white dark:text-black scale-110 z-10"
                    : isAnswered
                      ? "bg-zinc-200 dark:bg-white/20 border-zinc-400 dark:border-white/30 text-black dark:text-white"
                      : "bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-400 dark:text-zinc-500"
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-zinc-100 dark:bg-zinc-900 rounded-3xl p-6 md:p-8 border border-zinc-200 dark:border-white/10 shadow-sm mb-6">
        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 block">Question {currentIndex + 1}</span>
        <h2 className="text-2xl font-bold dark:text-white leading-tight">
          <MathJax>{currentQuestion.question}</MathJax>
        </h2>
        {currentQuestion.type === "multi-select" && <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 italic">Select multiple answers</p>}
      </div>

      <div className="space-y-4 mb-8">
        {currentQuestion.type === "short-answer" ? (
          <div className="space-y-4">
            <input
              ref={inputRef}
              type="text"
              value={answers[currentIndex] || ""}
              onChange={(e) => handleAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (settings.showAnswerImmediately && !checkedQuestions[currentIndex]) {
                    handleCheckAnswer();
                  } else {
                    handleNext();
                  }
                }
              }}
              disabled={settings.showAnswerImmediately && checkedQuestions[currentIndex]}
              placeholder="Type your answer here..."
              className={`w-full p-5 bg-zinc-100 dark:bg-white/5 border-2 rounded-2xl font-medium outline-none transition-all dark:text-white placeholder:text-zinc-600 ${
                settings.showAnswerImmediately && checkedQuestions[currentIndex]
                  ? answers[currentIndex]?.trim().toLowerCase() === currentQuestion.correctAnswer?.trim().toLowerCase()
                    ? "border-black dark:border-white"
                    : "border-zinc-300 dark:border-zinc-700 opacity-80"
                  : "border-zinc-200 dark:border-white/10 focus:border-zinc-400 dark:focus:border-white/40 focus:bg-white dark:focus:bg-white/10"
              }`}
            />
            {settings.showAnswerImmediately &&
              checkedQuestions[currentIndex] &&
              answers[currentIndex]?.trim().toLowerCase() !== currentQuestion.correctAnswer?.trim().toLowerCase() && (
                <div className="p-4 rounded-2xl border-2 border-black dark:border-white bg-zinc-100 dark:bg-white/5">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Correct Answer:</p>
                  <p className="font-bold text-black dark:text-white">{currentQuestion.correctAnswer}</p>
                </div>
              )}
          </div>
        ) : (
          currentQuestion.options?.map((option, index) => {
            const isSelected =
              currentQuestion.type === "multi-select" ? Array.isArray(answers[currentIndex]) && answers[currentIndex].includes(index) : answers[currentIndex] === index;

            const isChecked = settings.showAnswerImmediately && checkedQuestions[currentIndex];
            const isCorrectOption = currentQuestion.type === "multi-select" ? currentQuestion.correctAnswerIndices?.includes(index) : currentQuestion.correctAnswerIndex === index;

            let variant = isSelected
              ? "border-black dark:border-white bg-zinc-200 dark:bg-white/20 dark:text-white ring-2 ring-black/5 dark:ring-white/10"
              : "border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/10 hover:border-zinc-300 dark:hover:border-white/20";

            let icon = null;
            if (isChecked) {
              if (isCorrectOption) {
                if (isSelected) {
                  variant = "border-black dark:border-white bg-zinc-100 dark:bg-white/10 text-black dark:text-white font-bold";
                  icon = <CheckCircle2 className="text-black dark:text-white shrink-0" size={20} />;
                } else {
                  variant = "border-dashed border-black/40 dark:border-white/40 bg-zinc-100/50 dark:bg-white/5 text-black/60 dark:text-white/60 font-bold";
                  icon = <CheckCircle2 className="text-black/30 dark:text-white/30 shrink-0" size={20} />;
                }
              } else if (isSelected && !isCorrectOption) {
                variant = "border-zinc-400 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400";
                icon = <XCircle className="text-zinc-500 dark:text-zinc-400 shrink-0" size={20} />;
              } else {
                variant = "border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/2 text-zinc-400 dark:text-zinc-500 opacity-60";
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={isChecked}
                className={`w-full p-5 text-left border-2 rounded-2xl font-medium transition-all ${variant}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    {currentQuestion.type === "multi-select" && !isChecked && (
                      <div
                        className={`w-5 h-5 rounded border mr-3 flex items-center justify-center ${isSelected ? "bg-black dark:bg-white border-black dark:border-white" : "border-zinc-400 dark:border-zinc-600"}`}
                      >
                        {isSelected && <div className="w-2 h-2 bg-white dark:bg-black rounded-sm" />}
                      </div>
                    )}
                    <MathJax className="flex-1">{option}</MathJax>
                  </div>
                  {icon}
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className={`flex-1 flex items-center justify-center py-4 px-6 rounded-2xl font-bold transition-all border border-zinc-200 dark:border-white/10 ${
            currentIndex === 0
              ? "bg-zinc-50 dark:bg-white/2 text-zinc-300 dark:text-zinc-700 cursor-not-allowed"
              : "bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10 active:scale-95"
          }`}
        >
          <ChevronLeft size={20} className="mr-1" />
          Previous
        </button>

        {settings.showAnswerImmediately && !checkedQuestions[currentIndex] ? (
          <button
            onClick={handleCheckAnswer}
            disabled={
              currentQuestion.type !== "short-answer" && (answers[currentIndex] === undefined || (Array.isArray(answers[currentIndex]) && answers[currentIndex].length === 0))
            }
            className={`flex-1 flex items-center justify-center py-4 px-6 rounded-2xl font-bold transition-all shadow-xl active:scale-95 ${
              currentQuestion.type !== "short-answer" && (answers[currentIndex] === undefined || (Array.isArray(answers[currentIndex]) && answers[currentIndex].length === 0))
                ? "bg-zinc-200 dark:bg-white/5 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
                : "bg-black dark:bg-white text-white dark:text-black hover:opacity-80"
            }`}
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className={`flex-1 flex items-center justify-center py-4 px-6 rounded-2xl font-bold transition-all shadow-xl active:scale-95 ${
              currentIndex === quizData.length - 1
                ? "bg-black dark:bg-white text-white dark:text-black hover:opacity-80"
                : "bg-black dark:bg-zinc-100 text-white dark:text-black hover:opacity-80"
            }`}
          >
            {currentIndex === quizData.length - 1 ? "Submit Quiz" : "Next Question"}
            {currentIndex !== quizData.length - 1 && <ChevronRight size={20} className="ml-1" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizPlay;
