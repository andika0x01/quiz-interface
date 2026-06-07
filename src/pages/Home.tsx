import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import { updateActiveSession, deleteQuiz } from "../store/slices/quizSlice";
import type { Quiz } from "../store/slices/quizSlice";
import { Link, useNavigate } from "react-router-dom";
import { Play, Trash2, Award, AlertCircle, Share2, Check } from "lucide-react";

const Home = () => {
  const quizzes = useSelector((state: RootState) => state.quiz.quizzes);
  const scores = useSelector((state: RootState) => state.quiz.scores);
  const activeSessions = useSelector((state: RootState) => state.quiz.activeSessions);
  const settings = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getBestScore = (quizId: string) => {
    const quizScores = scores.filter((s) => s.quizId === quizId);
    if (quizScores.length === 0) return null;
    return Math.max(...quizScores.map((s) => (s.score / s.totalQuestions) * 100));
  };

  const handleDelete = () => {
    if (deleteId) {
      dispatch(deleteQuiz(deleteId));
      setDeleteId(null);
    }
  };

  const handleShare = async (quiz: Quiz) => {
    setSharingId(quiz.id);
    try {
      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: quiz.title,
          data: quiz.data,
        }),
      });

      if (response.ok) {
        const { id } = await response.json();
        const shareUrl = `${window.location.origin}/quiz/shared/${id}`;
        await navigator.clipboard.writeText(shareUrl);
        setCopiedId(quiz.id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (error) {
      console.error("Failed to share quiz:", error);
    } finally {
      setSharingId(null);
    }
  };

  const startQuiz = (quiz: Quiz) => {
    const hasActiveSession = !!activeSessions[quiz.id];
    if (hasActiveSession) {
      navigate(`/quiz/${quiz.id}`);
      return;
    }

    let quizData = [...quiz.data];
    if (settings.randomize) {
      // Shuffle questions
      quizData = [...quizData].sort(() => Math.random() - 0.5);

      // Shuffle options for each question
      quizData = quizData.map((q) => {
        if (!q.options || q.options.length === 0) return q;

        const indexedOptions = q.options.map((opt, idx) => ({ opt, originalIdx: idx }));
        const shuffledOptions = [...indexedOptions].sort(() => Math.random() - 0.5);

        const newOptions = shuffledOptions.map((o) => o.opt);
        const mapping = new Map(shuffledOptions.map((o, newIdx) => [o.originalIdx, newIdx]));

        const newQuestion = { ...q, options: newOptions };

        if (q.correctAnswerIndex !== undefined) {
          newQuestion.correctAnswerIndex = mapping.get(q.correctAnswerIndex);
        }

        if (q.correctAnswerIndices !== undefined) {
          newQuestion.correctAnswerIndices = q.correctAnswerIndices.map((idx) => mapping.get(idx) as number);
        }

        return newQuestion;
      });
    }

    dispatch(
      updateActiveSession({
        quizId: quiz.id,
        currentIndex: 0,
        answers: {},
        shuffledData: quizData,
      })
    );
    navigate(`/quiz/${quiz.id}`);
  };

  const navigate = useNavigate();

  return (
    <div className="pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-bold dark:text-white">My Quizzes</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Choose a quiz to start playing</p>
      </header>

      {quizzes.length === 0 ? (
        <div className="bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-2xl p-8 text-center">
          <p className="text-zinc-500 dark:text-zinc-400 mb-4">You haven't created any quizzes yet.</p>
          <Link
            to="/create"
            className="inline-flex items-center px-4 py-2 bg-black dark:bg-zinc-100 text-white dark:text-black rounded-xl hover:opacity-80 transition-all shadow-lg"
          >
            Create Your First Quiz
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((quiz) => {
            const bestScore = getBestScore(quiz.id);
            const hasActiveSession = !!activeSessions[quiz.id];

            return (
              <div
                key={quiz.id}
                className="bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm transition-all hover:border-zinc-400 dark:hover:border-white/20"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold dark:text-white">{quiz.title}</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{quiz.data.length} Questions</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleShare(quiz)}
                      disabled={sharingId === quiz.id}
                      className={`p-2 rounded-full transition-all ${
                        copiedId === quiz.id ? "text-green-500 bg-green-500/10" : "text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10"
                      }`}
                      title="Share Quiz"
                    >
                      {copiedId === quiz.id ? <Check size={20} /> : <Share2 size={20} className={sharingId === quiz.id ? "animate-pulse" : ""} />}
                    </button>
                    <button
                      onClick={() => setDeleteId(quiz.id)}
                      className="p-2 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 rounded-full transition-all hover:bg-zinc-100 dark:hover:bg-white/10"
                      title="Delete Quiz"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {bestScore !== null ? (
                    <div className="flex items-center text-zinc-600 dark:text-zinc-400 text-sm font-medium">
                      <Award size={20} className="mr-1 shrink-0" />
                      Best: {bestScore.toFixed(0)}%
                    </div>
                  ) : (
                    <div className="text-zinc-400 dark:text-zinc-500 text-sm italic">Not played yet</div>
                  )}

                  <button
                    onClick={() => startQuiz(quiz)}
                    className={`flex items-center px-4 py-2 rounded-xl transition-all font-medium text-sm shadow-md active:scale-95 ${
                      hasActiveSession ? "bg-zinc-200 dark:bg-zinc-700 text-black dark:text-white" : "bg-black dark:bg-zinc-100 text-white dark:text-black"
                    }`}
                  >
                    <Play size={20} className={`mr-2 shrink-0 ${hasActiveSession ? "" : "fill-current"}`} />
                    {hasActiveSession ? "Resume" : "Play Now"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-3xl p-6 w-full max-w-sm relative z-10 shadow-2xl">
            <div className="flex items-center justify-center w-12 h-12 bg-zinc-100 dark:bg-white/10 text-black dark:text-white rounded-full mb-4 mx-auto">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-xl font-bold dark:text-white text-center mb-2">Delete Quiz?</h3>
            <p className="text-zinc-500 text-center mb-6">This action cannot be undone. All your progress for this quiz will be lost.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 px-4 bg-zinc-100 dark:bg-white/5 text-zinc-800 dark:text-zinc-300 rounded-2xl font-bold hover:bg-zinc-200 dark:hover:bg-white/10 transition-all border border-zinc-200 dark:border-white/10"
              >
                Cancel
              </button>
              <button onClick={handleDelete} className="flex-1 py-3 px-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold hover:opacity-80 transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
