# TradeLens AI - AI Trading Research Assistant

Mini prototype for Option 1 of the AI Trading Research Assistant assignment.

## What it demonstrates

**ASK → UNDERSTAND → CLARIFY → DEFINE**

A user enters a trading research question in natural language. The OpenAI-powered backend extracts the experiment structure, explicitly identifies missing information, and lets the user confirm those parameters before showing the final structured experiment.

The prototype intentionally does not pretend to be a production trading or backtesting platform.

## Architecture

```text
React + Vite frontend
        |
        | POST /api/analyze
        v
Express backend
        |
        | OpenAI Responses API
        v
Structured JSON experiment
        |
        v
Clarification UI → Final Experiment
```

## Technologies

- React
- Vite
- Express
- OpenAI API
- JavaScript
- CSS

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` in the project root:

```env
OPENAI_API_KEY=your_key_here
```

3. Start the backend:

```bash
node server.js
```

4. In another terminal, start the frontend:

```bash
npm run dev
```

5. Open the local Vite URL shown in the terminal.

## Demo

Use the example question:

> Does buying NIFTY after a 1% fall work better during high-volatility periods?

The system should identify the known parameters and ask for missing information such as holding period before marking the experiment ready.

## AI Usage

AI was used as a development partner to help structure the natural-language research workflow, generate/refine UI code, and draft the prompt for transparent experiment extraction. The implementation was reviewed and adapted to make ambiguity visible rather than allowing the model to silently invent important trading parameters.

## Key decisions

- Separate interpretation from experiment definition.
- Make missing parameters visible.
- Ask for clarification instead of silently assuming critical values.
- Keep the experiment representation simple enough to pass into a future backtesting engine.
- Do not claim historical performance without a real dataset/test.

## Future improvements

- Connect to a market-data provider.
- Add a real backtesting engine.
- Add transaction costs and slippage models.
- Store experiments in a database.
- Add experiment comparison and saved research memory.
