import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import { setSettings } from "../store/slices/settingsSlice";
import { Moon, Sun, Type, Shuffle, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Settings = () => {
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings);

  const toggleTheme = () => {
    dispatch(setSettings({ theme: settings.theme === "oled" ? "light" : "oled" }));
  };

  const setFontSize = (size: "small" | "normal" | "large") => {
    dispatch(setSettings({ fontSize: size }));
  };

  const toggleRandomize = () => {
    dispatch(setSettings({ randomize: !settings.randomize }));
  };

  return (
    <div className="pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-bold dark:text-white">Settings</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Customize your quiz experience</p>
      </header>

      <div className="space-y-6">
        {/* Theme Setting */}
        <section className="bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              {settings.theme === "oled" ? <Moon size={20} className="mr-3 shrink-0 dark:text-white" /> : <Sun size={20} className="mr-3 shrink-0" />}
              <div>
                <h2 className="font-bold dark:text-white">Appearance</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Toggle OLED Dark Mode</p>
              </div>
            </div>
            <button onClick={toggleTheme} className={`w-14 h-8 rounded-full relative transition-colors ${settings.theme === "oled" ? "bg-zinc-700" : "bg-zinc-300"}`}>
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${settings.theme === "oled" ? "left-7" : "left-1"}`} />
            </button>
          </div>
        </section>

        {/* Font Size Setting */}
        <section className="bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-3xl p-6">
          <div className="flex items-center mb-6">
            <Type size={20} className="mr-3 shrink-0 dark:text-white" />
            <div>
              <h2 className="font-bold dark:text-white">Font Size</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Adjust text readability</p>
            </div>
          </div>

          <div className="flex bg-zinc-200 dark:bg-white/5 p-1 rounded-2xl border border-zinc-300 dark:border-white/10">
            {(["small", "normal", "large"] as const).map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-sm transition-all capitalize ${
                  settings.fontSize === size
                    ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </section>

        {/* Randomize Setting */}
        <section className="bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shuffle size={20} className="mr-3 shrink-0 dark:text-white" />
              <div>
                <h2 className="font-bold dark:text-white">Randomize</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Shuffle questions & options</p>
              </div>
            </div>
            <button onClick={toggleRandomize} className={`w-14 h-8 rounded-full relative transition-colors ${settings.randomize ? "bg-zinc-700" : "bg-zinc-300"}`}>
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${settings.randomize ? "left-7" : "left-1"}`} />
            </button>
          </div>
        </section>
      </div>

      <div className="mt-12 text-center">
        <p className="text-zinc-600 text-xs">Monochrome OLED Interface v2.0</p>
      </div>
    </div>
  );
};

export default Settings;
