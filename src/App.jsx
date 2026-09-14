import { useMemo, useState } from "react";
import "./App.css";

const DEMO_QUESTION =
  "Does buying NIFTY after a 1% fall work better during high-volatility periods?";

const initialExperiment = {
  instrument: "",
  timeframe: "",
  entryCondition: "",
  exitCondition: "",
  holdingPeriod: "",
  filters: "",
  testPeriod: "",
  costs: "",
  objective: "",
  hypothesis: "",
};

function App() {
  const [view, setView] = useState("research");
  const [question, setQuestion] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [answers, setAnswers] = useState({});
  const [experiment, setExperiment] = useState(initialExperiment);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [experimentResult, setExperimentResult] = useState(null);
  const [runningExperiment, setRunningExperiment] = useState(false);

  const missing = useMemo(
    () => analysis?.missingInformation || [],
    [analysis]
  );

  const runAnalysis = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setError("");
    setAnalysis(null);
    setExperiment(initialExperiment);
    setAnswers({});

    try {
      const response = await fetch("http://localhost:3000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed.");

      setAnalysis(data);
      setExperiment(data.experiment || initialExperiment);
      setView("research");

      setHistory((prev) => [
        ...prev,
        { question: question.trim(), createdAt: new Date().toLocaleTimeString() },
      ].slice(-8));
    } catch (err) {
      setError(
        err.message ||
          "Could not connect to the research assistant. Make sure the backend is running on port 3000."
      );
    } finally {
      setLoading(false);
    }
  };

  const useDemo = () => {
    setQuestion(DEMO_QUESTION);
    setAnalysis(null);
    setError("");
  };

  const applyClarifications = () => {
    const updated = { ...experiment };

    missing.forEach((item) => {
      const key = item.field;
      if (answers[key]) updated[key] = answers[key];
    });

    setExperiment(updated);
    setAnalysis((prev) => ({
      ...prev,
      missingInformation: [],
      status: "ready",
    }));
  };

  const reset = () => {
    setQuestion("");
    setAnalysis(null);
    setAnswers({});
    setExperiment(initialExperiment);
    setError("");
    setView("research");
  };
  const copyExperiment = async () => {
  try {
    await navigator.clipboard.writeText(JSON.stringify(experiment, null, 2));
  } catch {
    setError("Unable to copy the experiment.");
  }
};

  const runExperiment = () => {
  setRunningExperiment(true);
  setExperimentResult(null);

  setTimeout(() => {
    setExperimentResult({
      status: "Illustrative Result",
      sampleSize: 128,
      averageReturn: "+0.84%",
      medianReturn: "+0.51%",
      winRate: "56.3%",
      observation:
        "In this simulated sample, the strategy shows a modest positive result during high-volatility periods.",
      interpretation:
        "The result is encouraging enough to investigate further, but it is not evidence of a reliable trading edge. A real historical backtest with transaction costs, slippage and out-of-sample testing is required.",
      nextSteps: [
        "Compare the result with normal-volatility periods.",
        "Test different holding periods.",
        "Include transaction costs and slippage.",
        "Validate the strategy on an out-of-sample period.",
      ],
    });

    setRunningExperiment(false);
  }, 1600);
};

  const fieldLabel = {
    instrument: "Instrument",
    timeframe: "Timeframe",
    entryCondition: "Entry condition",
    exitCondition: "Exit condition",
    holdingPeriod: "Holding period",
    filters: "Variables / filters",
    testPeriod: "Test period",
    costs: "Cost assumptions",
    objective: "Research objective",
    hypothesis: "Hypothesis",
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div>
          <div className="brand">
            <div className="brand-icon">AI</div>
            <div>
              <h2>TradeLens AI</h2>
              <p>Research Assistant</p>
            </div>
          </div>

          <div className="menu-title">WORKSPACE</div>
          <nav className="menu">
            <button
              className={`menu-btn ${view === "research" ? "active" : ""}`}
              onClick={() => setView("research")}
            >
              <span>⌕</span> Research
            </button>
            <button
              className={`menu-btn ${view === "experiment" ? "active" : ""}`}
              onClick={() => setView("experiment")}
              disabled={!analysis}
            >
              <span>◈</span> Experiment
            </button>
            <button
              className={`menu-btn ${view === "history" ? "active" : ""}`}
              onClick={() => setView("history")}
            >
              <span>↺</span> History
            </button>
          </nav>
        </div>

        <div className="sidebar-bottom">
          <span><i className="status-dot" /> AI Online</span>
          <small>AI Trading Research Assistant</small>
        </div>
      </aside>

      <main className="main">
        <header className="header">
          <div>
            <div className="small-title">AI-NATIVE TRADING RESEARCH</div>
            <h1>From question to experiment</h1>
            <p className="subtitle">
              Turn natural-language trading ideas into clear, testable research definitions.
            </p>
          </div>
          <div className="status"><span /> AI Online</div>
        </header>

        <div className="workspace">
          {view === "history" ? (
            <section className="card history-page">
              <div className="section-kicker">RECENT RESEARCH</div>
              <h2>Question history</h2>
              <p className="muted">Your latest research questions from this session.</p>
              {history.length === 0 ? (
                <div className="empty-small">No questions yet. Start a research experiment.</div>
              ) : (
                <div className="history-list">
                  {[...history].reverse().map((item, index) => (
                    <button
                      className="history-item"
                      key={`${item.createdAt}-${index}`}
                      onClick={() => {
                        setQuestion(item.question);
                        setView("research");
                      }}
                    >
                      <span>RESEARCH</span>
                      <strong>{item.question}</strong>
                      <small>{item.createdAt}</small>
                    </button>
                  ))}
                </div>
              )}
            </section>
          ) : (
            <>
              <section className="card question-card">
                <div className="section-head">
                  <div className="icon-box">⌕</div>
                  <div>
                    <div className="section-kicker">ASK</div>
                    <h2>What do you want to investigate?</h2>
                    <p>Describe the trading idea in natural language. The AI will structure it before making important assumptions.</p>
                  </div>
                </div>

                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder='Example: "Does buying NIFTY after a 1% fall work better during high-volatility periods?"'
                />

                <div className="input-bottom">
                  <button className="demo-link" onClick={useDemo}>
                    Use example question
                  </button>
                  <div>
                    <span>{question.length} characters</span>
                    <button className="new-chat-btn" onClick={reset}>Clear</button>
                    <button
                      className="ask-btn"
                      onClick={runAnalysis}
                      disabled={loading || !question.trim()}
                    >
                      {loading ? "Analyzing..." : "Analyze question →"}
                    </button>
                  </div>
                </div>
              </section>

              {error && <div className="error-box">⚠ {error}</div>}

              {loading && (
                <section className="card loading-card">
                  <div className="loader" />
                  <strong>Understanding your research question...</strong>
                  <span>Extracting market, conditions, filters and missing parameters.</span>
                </section>
              )}

              {analysis && !loading && (
                <>
                  <section className="card pipeline-card">
                    <div className="pipeline">
                      <div className="step done"><b>1</b><span>Understand</span></div>
                      <div className="line done" />
                      <div className={`step ${missing.length ? "current" : "done"}`}><b>2</b><span>Clarify</span></div>
                      <div className="line" />
                      <div className={`step ${missing.length ? "" : "current"}`}><b>3</b><span>Define</span></div>
                    </div>
                  </section>

                  <section className="card">
                    <div className="section-head compact">
                      <div className="icon-box purple">✦</div>
                      <div>
                        <div className="section-kicker">AI UNDERSTANDING</div>
                        <h2>What I understood</h2>
                      </div>
                    </div>

                    <div className="grid">
                      {Object.entries(experiment).map(([key, value]) => (
                        <div className="field" key={key}>
                          <label>{fieldLabel[key]}</label>
                          <div className={value ? "value" : "value missing"}>{value || "Not specified"}</div>
                        </div>
                      ))}
                    </div>

                    {analysis.interpretation && (
                      <div className="interpretation">
                        <b>Research question</b>
                        <p>{analysis.interpretation}</p>
                      </div>
                    )}
                  </section>

                  {missing.length > 0 ? (
                    <section className="card clarify-card">
                      <div className="section-head compact">
                        <div className="icon-box amber">?</div>
                        <div>
                          <div className="section-kicker">CLARIFY</div>
                          <h2>I need a little more information</h2>
                          <p>I will not silently invent important experiment parameters.</p>
                        </div>
                      </div>

                      <div className="clarifications">
                        {missing.map((item) => (
                          <div className="clarification" key={item.field}>
                            <label>{item.question}</label>
                            {item.options?.length ? (
                              <div className="options">
                                {item.options.map((option) => (
                                  <button
                                    key={option}
                                    className={answers[item.field] === option ? "option selected" : "option"}
                                    onClick={() => setAnswers({ ...answers, [item.field]: option })}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <input
                                value={answers[item.field] || ""}
                                onChange={(e) =>
                                  setAnswers({ ...answers, [item.field]: e.target.value })
                                }
                                placeholder={item.placeholder || "Enter a value"}
                              />
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        className="primary-wide"
                        onClick={applyClarifications}
                        disabled={missing.some((item) => !answers[item.field])}
                      >
                        Confirm and define experiment →
                      </button>
                    </section>
                  ) : (
                    <section className="card experiment-card">
                      <div className="experiment-top">
                        <div>
                          <div className="section-kicker">DEFINE</div>
                          <h2>Structured research experiment</h2>
                          <p>Everything below is visible and reviewable before testing.</p>
                        </div>
                        <button className="copy-btn" onClick={copyExperiment}>Copy</button>
                      </div>

                      <div className="experiment-grid">
                        {Object.entries(experiment)
                          .filter(([key]) => ["instrument", "timeframe", "entryCondition", "exitCondition", "holdingPeriod", "filters", "testPeriod", "costs"].includes(key))
                          .map(([key, value]) => (
                            <div className="experiment-field" key={key}>
                              <span>{fieldLabel[key]}</span>
                              <strong>{value || "Not specified"}</strong>
                            </div>
                          ))}
                      </div>

                      <div className="hypothesis-box">
                        <span>HYPOTHESIS</span>
                        <p>{experiment.hypothesis || "No hypothesis generated."}</p>
                      </div>
                      <button
                      className="run-experiment-btn"
                      onClick={runExperiment}
                      disabled={runningExperiment}
                    >
                      {runningExperiment
                        ? "Running research experiment..."
                        : "▶ Run Research Experiment"}
                    </button>
                      <div className="ready-banner">
                        <span>✓</span>
                        <div>
                          <strong>Experiment is ready for testing</strong>
                          <p>This mini prototype defines the research problem. A future version can pass this structure to a backtesting engine.</p>
                        </div>
                      </div>
                    </section>
                  )}
                    {experimentResult && (
                      <section className="card result-card">
                        <div className="result-header">
                          <div>
                            <div className="section-kicker">TEST</div>
                            <h2>Research Result</h2>
                            <p>
                              Illustrative prototype result using simulated data.
                            </p>
                          </div>

                          <span className="result-status">
                            {experimentResult.status}
                          </span>
                        </div>

                        <div className="result-stats">
                          <div>
                            <span>Sample size</span>
                            <strong>{experimentResult.sampleSize}</strong>
                          </div>

                          <div>
                            <span>Average return</span>
                            <strong>{experimentResult.averageReturn}</strong>
                          </div>

                          <div>
                            <span>Median return</span>
                            <strong>{experimentResult.medianReturn}</strong>
                          </div>

                          <div>
                            <span>Win rate</span>
                            <strong>{experimentResult.winRate}</strong>
                          </div>
                        </div>

                        <div className="observation-box">
                          <div className="section-kicker">OBSERVATION</div>
                          <p>{experimentResult.observation}</p>
                        </div>

                        <div className="interpretation-box">
                          <div className="section-kicker">AI INTERPRETATION</div>
                          <p>{experimentResult.interpretation}</p>
                        </div>

                        <div className="next-steps">
                          <div className="section-kicker">INVESTIGATE NEXT</div>

                          <div className="next-list">
                            {experimentResult.nextSteps.map((step, index) => (
                              <div className="next-item" key={index}>
                                <span>{index + 1}</span>
                                <p>{step}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </section>
                    )}
                </>
              )}

              {!analysis && !loading && !error && (
                <section className="card empty">
                  <div className="empty-icon">✦</div>
                  <h3>Your structured experiment will appear here</h3>
                  <p>Start with a market question above. Try the example to see the complete workflow.</p>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
