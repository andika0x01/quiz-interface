import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { ChevronLeft, CheckCircle2, XCircle, Home, RotateCcw } from "lucide-react";
import { MathJax } from "better-react-mathjax";

const QuizReview = () => {
  const { scoreId } = useParams<{ scoreId: string }>();

  const scoreRecord = useSelector((state: RootState) => state.quiz.scores.find((s) => s.id === scoreId));

  if (!scoreRecord) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold dark:text-white mb-4">Review record not found</h2>
        <Link to="/history" className="text-zinc-500 hover:underline">
          Back to History
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-24 max-w-2xl mx-auto">
      <header className="mb-8">
        <Link to="/history" className="inline-flex items-center text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors mb-4 text-sm font-medium">
          <ChevronLeft size={20} className="mr-1 shrink-0" />
          Back to History
        </Link>
        <h1 className="text-3xl font-bold dark:text-white mb-2">{scoreRecord.quizTitle}</h1>
        <div className="flex items-center gap-4 text-zinc-500 dark:text-zinc-400 text-sm">
          <span>
            Score:{" "}
            <span className="dark:text-white font-bold">
              {scoreRecord.score}/{scoreRecord.totalQuestions}
            </span>
          </span>
          <span>•</span>
          <span>
            {new Date(scoreRecord.timestamp).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </header>

      <div className="space-y-8">
        {scoreRecord.questions.map((question, qIdx) => {
          const userAnswer = scoreRecord.userAnswers[qIdx];
          let isCorrect = false;

          if (question.type === "short-answer") {
            isCorrect = typeof userAnswer === "string" && userAnswer.trim().toLowerCase() === question.correctAnswer?.trim().toLowerCase();
          } else if (question.type === "multi-select") {
            const correctIndices = question.correctAnswerIndices || [];
            const userIndices = Array.isArray(userAnswer) ? userAnswer : [];
            isCorrect = correctIndices.length === userIndices.length && correctIndices.every((val) => userIndices.includes(val));
          } else {
            isCorrect = userAnswer === question.correctAnswerIndex;
          }

          return (
            <div key={qIdx} className="bg-zinc-50 dark:bg-zinc-900 rounded-3xl p-6 md:p-8 border border-zinc-200 dark:border-white/10 shadow-sm relative overflow-hidden">
              <div className="mb-6">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Question {qIdx + 1}</span>
                  {isCorrect ? (
                    <span className="flex items-center text-black dark:text-white text-xs font-bold uppercase tracking-tight bg-zinc-200 dark:bg-white/10 px-2 py-1 rounded-lg border border-zinc-300 dark:border-white/20">
                      <CheckCircle2 size={20} className="mr-1 shrink-0" /> Correct
                    </span>
                  ) : (
                    <span className="flex items-center text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-tight bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg border border-zinc-200 dark:border-white/5">
                      <XCircle size={20} className="mr-1 shrink-0" /> Incorrect
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold dark:text-white">
                  <MathJax>{question.question}</MathJax>
                </h2>
              </div>

              <div className="space-y-3">
                {question.type === "short-answer" ? (
                  <div className="space-y-4">
                    <div
                      className={`p-4 rounded-2xl border-2 ${
                        isCorrect ? "border-black dark:border-white bg-zinc-100 dark:bg-white/5" : "border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950"
                      }`}
                    >
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Your Answer:</p>
                      <p className={`font-bold ${isCorrect ? "text-black dark:text-white" : "text-zinc-500 dark:text-zinc-400"}`}>
                        {userAnswer || <span className="italic opacity-50">No answer</span>}
                      </p>
                    </div>
                    {!isCorrect && (
                      <div className="p-4 rounded-2xl border-2 border-black dark:border-white bg-zinc-100 dark:bg-white/5">
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Correct Answer:</p>
                        <p className="font-bold text-black dark:text-white">{question.correctAnswer}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  question.options?.map((option, oIdx) => {
                    const isUserSelected = question.type === "multi-select" ? Array.isArray(userAnswer) && userAnswer.includes(oIdx) : userAnswer === oIdx;

                    const isCorrectOption = question.type === "multi-select" ? question.correctAnswerIndices?.includes(oIdx) : question.correctAnswerIndex === oIdx;

                    let variant = "border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/2 text-zinc-400 dark:text-zinc-500 opacity-60";
                    if (isCorrectOption) {
                      variant = "border-black dark:border-white bg-zinc-100 dark:bg-white/10 text-black dark:text-white font-bold";
                    } else if (isUserSelected && !isCorrectOption) {
                      variant = "border-zinc-400 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400";
                    }

                    return (
                      <div key={oIdx} className={`w-full p-4 text-left border-2 rounded-2xl font-medium flex justify-between items-center transition-all ${variant}`}>
                        <MathJax className="flex-1">{option}</MathJax>
                        {isCorrectOption && <CheckCircle2 className="text-black dark:text-white shrink-0" size={20} />}
                        {isUserSelected && !isCorrectOption && <XCircle className="text-zinc-500 dark:text-zinc-400 shrink-0" size={20} />}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 flex gap-4">
        <Link
          to={`/quiz/${scoreRecord.quizId}`}
          className="flex-1 flex items-center justify-center py-4 px-6 bg-black dark:bg-zinc-100 text-white dark:text-black rounded-2xl font-bold hover:opacity-80 transition-all shadow-xl active:scale-95"
        >
          <RotateCcw size={20} className="mr-2" />
          Retake Quiz
        </Link>
        <Link
          to="/"
          className="flex-1 flex items-center justify-center py-4 px-6 bg-zinc-100 dark:bg-white/5 text-zinc-800 dark:text-zinc-300 rounded-2xl font-bold hover:bg-zinc-200 dark:hover:bg-white/10 transition-all border border-zinc-200 dark:border-white/10"
        >
          <Home size={20} className="mr-2" />
          Home
        </Link>
      </div>
    </div>
  );
};

export default QuizReview;
