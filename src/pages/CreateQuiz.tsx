import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Copy, Check, Save, AlertCircle, Plus, Trash2 } from "lucide-react";
import { addQuiz } from "../store/slices/quizSlice";
import type { Question } from "../store/slices/quizSlice";

const CreateQuiz = () => {
  const [title, setTitle] = useState("");
  const [jsonInputs, setJsonInputs] = useState<string[]>([""]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const aiPrompt = `Please generate a quiz in JSON format with the following structure:
[
  {
    "type": "multiple-choice",
    "question": "Question text here",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correctAnswerIndex": 0
  },
  {
    "type": "multi-select",
    "question": "Select all that apply",
    "options": ["Choice A", "Choice B", "Choice C", "Choice D"],
    "correctAnswerIndices": [0, 2]
  },
  {
    "type": "short-answer",
    "question": "Question text here",
    "correctAnswer": "The answer"
  }
]
Please provide a quiz about [TOPIC HERE] with at least 5 questions (mix of multiple-choice, multi-select, and short-answer). If the topic involves math or science, use LaTeX format for formulas. Return ONLY the JSON array inside a markdown code block.`;

  const copyPrompt = () => {
    navigator.clipboard.writeText(aiPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...jsonInputs];
    newInputs[index] = value;
    setJsonInputs(newInputs);
  };

  const addInput = () => {
    setJsonInputs([...jsonInputs, ""]);
  };

  const removeInput = (index: number) => {
    const newInputs = jsonInputs.filter((_, i) => i !== index);
    setJsonInputs(newInputs.length ? newInputs : [""]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter a quiz title");
      return;
    }

    try {
      let combinedData: Question[] = [];

      for (let i = 0; i < jsonInputs.length; i++) {
        const input = jsonInputs[i].trim();
        if (!input) continue;

        let parsedData;
        try {
          parsedData = JSON.parse(input) as Question[];
        } catch (parseErr) {
          throw new Error(`Invalid JSON format in Source ${i + 1}`);
        }

        if (!Array.isArray(parsedData) || parsedData.length === 0) {
          throw new Error(`Source ${i + 1} must be a non-empty JSON array`);
        }

        for (const item of parsedData) {
          if (!item.question) {
            throw new Error(`Invalid question format in Source ${i + 1}. Each item must have a 'question'.`);
          }

          if (item.type === "short-answer") {
            if (typeof item.correctAnswer !== "string" || !item.correctAnswer.trim()) {
              throw new Error(`Invalid short-answer format in Source ${i + 1}. Must have a 'correctAnswer' (string).`);
            }
          } else if (item.type === "multi-select") {
            if (!Array.isArray(item.options) || !Array.isArray(item.correctAnswerIndices)) {
              throw new Error(`Invalid multi-select format in Source ${i + 1}. Must have 'options' (array) and 'correctAnswerIndices' (array of numbers).`);
            }
          } else {
            // Default to multiple-choice
            if (!Array.isArray(item.options) || typeof item.correctAnswerIndex !== "number") {
              throw new Error(`Invalid multiple-choice format in Source ${i + 1}. Must have 'options' (array) and 'correctAnswerIndex' (number).`);
            }
          }
        }

        combinedData = [...combinedData, ...parsedData];
      }

      if (combinedData.length === 0) {
        throw new Error("Please provide at least one valid JSON array of questions.");
      }

      const newQuiz = {
        id: crypto.randomUUID(),
        title: title.trim(),
        data: combinedData,
        createdAt: new Date().toISOString(),
      };

      dispatch(addQuiz(newQuiz));
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON format");
    }
  };

  return (
    <div className="pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-bold dark:text-white">Create New Quiz</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Step 1: Get data from AI. <br /> Step 2: Paste it here.
        </p>
      </header>

      <div className="bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-2xl p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-lg font-semibold dark:text-white flex items-center">
            <AlertCircle size={20} className="mr-2" />
            AI Prompt Helper
          </h2>
          <button
            onClick={copyPrompt}
            className="flex items-center text-xs font-medium bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-zinc-300 px-3 py-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-white/10 transition-colors backdrop-blur-sm"
          >
            {copied ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
            {copied ? "Copied!" : "Copy Prompt"}
          </button>
        </div>
        <pre className="text-xs text-zinc-600 dark:text-zinc-400 bg-white dark:bg-black/40 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap leading-relaxed border border-zinc-200 dark:border-white/5">
          {aiPrompt}
        </pre>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
            Quiz Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., General Knowledge Quiz"
            className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 backdrop-blur-md dark:text-white focus:ring-2 focus:ring-zinc-500/50 outline-none transition-all placeholder:text-zinc-600"
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400">JSON Data</label>

          {jsonInputs.map((input, index) => (
            <div key={index} className="relative">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Source {index + 1}</span>
                {jsonInputs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInput(index)}
                    className="text-zinc-400 hover:text-black dark:hover:text-white p-1 rounded-full transition-all"
                    title="Remove this source"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <textarea
                rows={6}
                value={input}
                onChange={(e) => handleInputChange(index, e.target.value)}
                placeholder="Paste your JSON array here..."
                className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 backdrop-blur-md dark:text-white focus:ring-2 focus:ring-zinc-500/50 outline-none transition-all font-mono text-sm placeholder:text-zinc-600"
              />
            </div>
          ))}

          <button
            type="button"
            onClick={addInput}
            className="w-full flex items-center justify-center text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/10 transition-all border border-zinc-200 dark:border-white/10 px-3 py-3 rounded-2xl"
          >
            <Plus size={16} className="mr-1" />
            Add Another Source
          </button>
        </div>

        {error && (
          <div className="flex items-center text-zinc-800 dark:text-zinc-200 text-sm bg-zinc-100 dark:bg-zinc-900 p-3 rounded-xl border border-zinc-300 dark:border-white/10">
            <AlertCircle size={16} className="mr-2 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full flex items-center justify-center py-4 px-6 bg-black dark:bg-zinc-100 text-white dark:text-black rounded-2xl font-bold hover:bg-zinc-800 dark:hover:bg-white transition-all shadow-xl active:scale-[0.98]"
        >
          <Save size={20} className="mr-2" />
          Create Quiz
        </button>
      </form>
    </div>
  );
};

export default CreateQuiz;
