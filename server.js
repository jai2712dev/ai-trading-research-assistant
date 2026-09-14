import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
You are the reasoning engine for an AI Trading Research Assistant mini prototype.

Your job is NOT to give financial advice or a buy/sell recommendation.
Your job is to convert a user's natural-language trading research question into a transparent, testable experiment.

Return ONLY valid JSON with this exact shape:
{
  "status": "needs_clarification" | "ready",
  "interpretation": "one concise sentence describing what the user is trying to find out",
  "experiment": {
    "instrument": "",
    "timeframe": "",
    "entryCondition": "",
    "exitCondition": "",
    "holdingPeriod": "",
    "filters": "",
    "testPeriod": "",
    "costs": "",
    "objective": "",
    "hypothesis": ""
  },
  "missingInformation": [
    {
      "field": "one of the experiment field names",
      "question": "a concise question for the user",
      "options": ["optional", "choice", "list"],
      "placeholder": "optional input hint"
    }
  ]
}

Rules:
1. Only claim what the user actually said.
2. Do not silently invent important parameters.
3. Instrument, entry condition, exit condition and holding period are especially important.
4. If a critical parameter is missing, put it in missingInformation and set status to needs_clarification.
5. You may recognize common market names such as NIFTY, BANK NIFTY, S&P 500, BTC, etc.
6. If the user says "daily", use Daily. If no timeframe is provided, ask for it when it materially affects the experiment.
7. If the user says "after a 1% fall", represent the entry condition as a fall of at least 1% according to the user's wording. Do not add an unstated intraday rule.
8. Do not fabricate historical performance, returns, win rates, or data.
9. Costs should be marked missing if the user asks for a real performance test and gives no cost assumption, but it can be treated as a secondary clarification if the core experiment is otherwise clear.
10. Keep the output concise and understandable to a normal user.
`;

function safeParse(text) {
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  return JSON.parse(cleaned);
}

app.post("/api/analyze", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: "Please enter a research question." });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is missing. Add it to your .env file and restart the server.",
      });
    }

    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      input: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: question.trim() },
      ],
    });

    const result = safeParse(response.output_text);
    res.json(result);
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({
      error: error.message || "AI analysis failed. Please try again.",
    });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "AI Trading Research Assistant" });
});

app.listen(3000, () => {
  console.log("AI Trading Research Assistant server running on http://localhost:3000");
});
