import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import { Award, Calendar, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { deleteScore } from "../store/slices/quizSlice";

const History = () => {
  const dispatch = useDispatch();
  const scores = useSelector((state: RootState) => state.quiz.scores);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (confirm("Delete this history record?")) {
      dispatch(deleteScore(id));
    }
  };

  return (
    <div className="pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-bold dark:text-white">Quiz History</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Your past performance and achievements</p>
      </header>

      {scores.length === 0 ? (
        <div className="bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl p-8 text-center">
          <p className="text-zinc-500 dark:text-zinc-400 mb-4">You haven't played any quizzes yet.</p>
          <Link to="/" className="inline-flex items-center px-4 py-2 bg-black dark:bg-zinc-100 text-white dark:text-black rounded-xl hover:opacity-80 transition-all shadow-lg">
            Find a Quiz to Play
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {scores.map((record) => {
            const percentage = (record.score / record.totalQuestions) * 100;
            const date = new Date(record.timestamp).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <Link
                key={record.id}
                to={`/review/${record.id}`}
                className="bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-sm transition-all hover:border-zinc-400 dark:hover:border-white/20 active:scale-[0.99] group relative"
              >
                <div className="flex items-center flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4 bg-zinc-200 dark:bg-white/10 text-black dark:text-white border border-zinc-300 dark:border-white/10 shrink-0">
                    <Award size={24} />
                  </div>
                  <div className="truncate">
                    <h3 className="font-bold dark:text-white truncate group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">{record.quizTitle}</h3>
                    <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      <Calendar size={12} className="mr-1" />
                      {date}
                    </div>
                  </div>
                </div>

                <div className="flex items-center ml-4">
                  <div className="text-right mr-4">
                    <div className="text-lg font-bold dark:text-white">
                      {record.score}/{record.totalQuestions}
                    </div>
                    <div className="text-xs font-bold uppercase tracking-tight text-zinc-500 dark:text-zinc-400">{percentage.toFixed(0)}%</div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, record.id)}
                    className="p-2 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                    title="Delete Record"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;
