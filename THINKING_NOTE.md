# Thinking Note

The main product decision was to treat the assistant as a research-definition tool rather than a trading recommendation system.

A natural-language trading question often leaves important parameters unstated. Instead of silently filling those gaps, the prototype identifies missing information and asks the user to clarify it. This makes the research process more transparent and reduces the risk of testing a different strategy from the one the user intended.

The core flow is:

ASK → UNDERSTAND → CLARIFY → DEFINE → TEST → LEARN

The structured experiment contains the instrument, timeframe, entry and exit conditions, holding period, filters, test period, cost assumptions, objective and hypothesis.

For the prototype, the experiment result is simulated rather than presented as real historical performance. This was intentional because the purpose of the assignment is to demonstrate the product workflow and reasoning structure, not to fabricate financial evidence.

A production version would connect the structured experiment to a real historical market-data and backtesting engine, including transaction costs, slippage and out-of-sample validation.