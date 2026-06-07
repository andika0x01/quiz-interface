import { Hono } from "hono";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// Helper function to calculate SHA-256 hash
async function calculateHash(content: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(content);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

app.get("/api/quizzes/:id", async (c) => {
  const id = c.req.param("id");
  const { DB } = c.env;

  const quiz = await DB.prepare("SELECT content FROM quizzes WHERE id = ?").bind(id).first<{ content: string }>();

  if (!quiz) {
    return c.json({ error: "Quiz not found" }, 404);
  }

  return c.json(JSON.parse(quiz.content));
});

app.post("/api/quizzes", async (c) => {
  const body = await c.req.json();
  const content = JSON.stringify(body);
  const id = await calculateHash(content);
  const { DB } = c.env;

  try {
    await DB.prepare("INSERT OR IGNORE INTO quizzes (id, content) VALUES (?, ?)").bind(id, content).run();

    return c.json({ id });
  } catch (error) {
    console.error("Database error:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

export default app;
