import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "./store";
import BottomNav from "./components/BottomNav";

function App() {
  const location = useLocation();
  const isPlaying = location.pathname.startsWith("/quiz/") || location.pathname.startsWith("/review/");
  const { theme, fontSize } = useSelector((state: RootState) => state.settings);

  useEffect(() => {
    if (theme === "oled") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // global font size
    if (fontSize === "small") document.documentElement.style.fontSize = "14px";
    else if (fontSize === "large") document.documentElement.style.fontSize = "18px";
    else document.documentElement.style.fontSize = "16px";
  }, [theme, fontSize]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === "oled" ? "bg-black text-zinc-200" : "bg-white text-zinc-900"} font-mono relative`}>
      <main className="container mx-auto px-4 pt-8 pb-32 max-w-lg relative z-10">
        <Outlet />
      </main>

      {/* Hide bottom nav when playing quiz for better focus */}
      {!isPlaying && <BottomNav />}
    </div>
  );
}

export default App;
