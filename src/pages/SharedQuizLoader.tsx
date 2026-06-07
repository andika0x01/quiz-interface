import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addQuiz } from "../store/slices/quizSlice";
import type { RootState } from "../store";
import { Loader2, AlertCircle } from "lucide-react";

const SharedQuizLoader = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const quizzes = useSelector((state: RootState) => state.quiz.quizzes);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!id) return;

      try {
        // First check by ID
        if (quizzes.find((q) => q.id === id)) {
          navigate("/", { replace: true });
          return;
        }

        const response = await fetch(`/api/quizzes/${id}`);
        if (!response.ok) {
          throw new Error("Quiz not found or failed to load");
        }

        const quizData = await response.json();

        // Also check by content (in case of legacy UUIDs)
        const contentMatch = quizzes.find((q) => q.title === quizData.title && JSON.stringify(q.data) === JSON.stringify(quizData.data));

        if (contentMatch) {
          navigate("/", { replace: true });
          return;
        }

        // Add to local storage via Redux
        dispatch(
          addQuiz({
            id: id,
            title: quizData.title,
            data: quizData.data,
            createdAt: new Date().toISOString(),
          })
        );

        // Redirect to home
        navigate("/", { replace: true });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      }
    };

    fetchQuiz();
  }, [id, dispatch, navigate, quizzes]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Oops!</h2>
        <p className="text-zinc-500 mb-6">{error}</p>
        <button onClick={() => navigate("/")} className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl font-medium">
          Go Back Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <Loader2 className="animate-spin text-zinc-400 mb-4" size={48} />
      <p className="text-zinc-500 animate-pulse">Loading shared quiz...</p>
    </div>
  );
};

export default SharedQuizLoader;
