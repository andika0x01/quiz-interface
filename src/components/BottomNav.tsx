import { NavLink } from "react-router-dom";
import { Home, PlusCircle, History, Settings } from "lucide-react";

const BottomNav = () => {
  return (
    <nav className="fixed bottom-6 left-6 right-6 bg-zinc-100/80 dark:bg-zinc-950/40 backdrop-blur-xl border border-zinc-200 dark:border-white/10 px-4 py-3 flex justify-around items-center z-50 shadow-2xl rounded-full max-w-sm mx-auto">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex items-center justify-center p-2 rounded-full transition-all ${isActive ? "text-black dark:text-white bg-black/5 dark:bg-white/5" : "text-zinc-500 hover:text-black dark:hover:text-white"}`
        }
      >
        <Home size={24} />
      </NavLink>
      <NavLink
        to="/create"
        className={({ isActive }) =>
          `flex items-center justify-center p-2 rounded-full transition-all ${isActive ? "text-black dark:text-white bg-black/5 dark:bg-white/5" : "text-zinc-500 hover:text-black dark:hover:text-white"}`
        }
      >
        <PlusCircle size={24} />
      </NavLink>
      <NavLink
        to="/history"
        className={({ isActive }) =>
          `flex items-center justify-center p-2 rounded-full transition-all ${isActive ? "text-black dark:text-white bg-black/5 dark:bg-white/5" : "text-zinc-500 hover:text-black dark:hover:text-white"}`
        }
      >
        <History size={24} />
      </NavLink>
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `flex items-center justify-center p-2 rounded-full transition-all ${isActive ? "text-black dark:text-white bg-black/5 dark:bg-white/5" : "text-zinc-500 hover:text-black dark:hover:text-white"}`
        }
      >
        <Settings size={24} />
      </NavLink>
    </nav>
  );
};

export default BottomNav;
