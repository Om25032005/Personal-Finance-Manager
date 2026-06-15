const { GoogleGenerativeAI } = require('@google/generative-ai');

// 1. Local Rules-Based Analytical Engine
const generateLocalInsights = (stats, budgets, goals) => {
  const insights = [];

  // Metrics
  const { totalIncome, totalExpense, netSavings, savingsRate, categoryBreakdown } = stats;

  // A. Spending Pattern Analysis
  if (totalExpense > totalIncome) {
    insights.push({
      category: 'Spending Pattern Analysis',
      tip: '🚨 Critical: Your expenses exceeded your income this month. You are running a deficit of $' + Math.abs(netSavings).toFixed(2) + '. Review non-essential categories immediately.'
    });
  } else if (savingsRate < 10) {
    insights.push({
      category: 'Spending Pattern Analysis',
      tip: '⚠️ Low Savings: Your savings rate is only ' + savingsRate.toFixed(1) + '%. Financial advisors recommend aiming for at least a 20% savings rate.'
    });
  } else {
    insights.push({
      category: 'Spending Pattern Analysis',
      tip: '🟢 Healthy Savings: Great job! Your savings rate is ' + savingsRate.toFixed(1) + '%, which is on target. Keep maintaining this ratio.'
    });
  }

  // B. Savings Recommendations
  if (goals.length === 0) {
    insights.push({
      category: 'Savings Recommendations',
      tip: '💡 Plan Ahead: You do not have any active savings goals. Creating specific, deadline-oriented savings goals (e.g. Emergency Fund, Vacation) increases the likelihood of saving successfully.'
    });
  } else {
    const laggingGoals = goals.filter(g => {
      const remaining = g.targetAmount - g.savedAmount;
      return remaining > 0 && new Date(g.deadline) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Expiry in < 30 days
    });

    if (laggingGoals.length > 0) {
      insights.push({
        category: 'Savings Recommendations',
        tip: `⏳ Urgency: Your goal "${laggingGoals[0].title}" is ending within 30 days. You need to save an additional $${(laggingGoals[0].targetAmount - laggingGoals[0].savedAmount).toFixed(2)} to complete it.`
      });
    } else {
      insights.push({
        category: 'Savings Recommendations',
        tip: '📈 Interest Optimizer: Consider putting your savings goals money into a High-Yield Savings Account (HYSA) to leverage compound interest.'
      });
    }
  }

  // C. Expense Optimization Suggestions
  const highExpenseCategory = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0];
  if (highExpenseCategory) {
    const [catName, catAmount] = highExpenseCategory;
    const catPercent = totalExpense > 0 ? (catAmount / totalExpense) * 100 : 0;
    
    if (catPercent > 30 && catName !== 'Rent') {
      insights.push({
        category: 'Expense Optimization Suggestions',
        tip: `🔍 Category Focus: You spent $${catAmount.toFixed(2)} on ${catName}, representing ${catPercent.toFixed(1)}% of your total expenses. Try setting a strict budget for ${catName} next month.`
      });
    } else {
      insights.push({
        category: 'Expense Optimization Suggestions',
        tip: '🛒 Smart Buying: Review your recurring subscriptions. Cancelling even one unused streaming service or membership can free up $10-$20 a month.'
      });
    }
  } else {
    insights.push({
      category: 'Expense Optimization Suggestions',
      tip: '📝 Track Everything: Start logging all small daily expenses, like coffee or snacks, as they accumulate quickly and often go unnoticed.'
    });
  }

  // D. Budget Improvement Tips
  if (budgets.length === 0) {
    insights.push({
      category: 'Budget Improvement Tips',
      tip: '🛠️ Set Boundaries: You have not configured any monthly budgets. Set category-wise monthly limits (e.g., Food, Transport) to keep your spending controlled.'
    });
  } else {
    insights.push({
      category: 'Budget Improvement Tips',
      tip: '🔄 Enforce Limits: Review your budget utilisation dashboard weekly. Adjusting category thresholds mid-month when alerts trigger prevents end-of-month overruns.'
    });
  }

  return insights;
};

// 2. Main Entry Point
const getFinancialInsights = async (stats, budgets, goals) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'PLACEHOLDER') {
    console.log('Gemini API key not found. Using local rule-based system.');
    return generateLocalInsights(stats, budgets, goals);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Format financial data context
    const financialDataStr = JSON.stringify({
      monthSummary: {
        totalIncome: stats.totalIncome,
        totalExpense: stats.totalExpense,
        netSavings: stats.netSavings,
        savingsRate: stats.savingsRate,
        categoryBreakdown: stats.categoryBreakdown
      },
      budgets: budgets.map(b => ({ category: b.category, limit: b.monthlyLimit })),
      goals: goals.map(g => ({ title: g.title, target: g.targetAmount, saved: g.savedAmount, deadline: g.deadline }))
    }, null, 2);

    const prompt = `
      You are an expert personal finance advisor. Analyze the following user monthly financial data:
      ${financialDataStr}

      Generate 4 concise, actionable, and personalized pieces of financial advice.
      Exactly one tip must correspond to each of these 4 categories:
      1. "Spending Pattern Analysis"
      2. "Savings Recommendations"
      3. "Expense Optimization Suggestions"
      4. "Budget Improvement Tips"

      Respond ONLY with a valid JSON array of objects. Do not include markdown formatting, backticks, or text before/after the JSON.
      Each object must have the following keys:
      - "category": The exact category name listed above
      - "tip": A brief, actionable piece of advice (1-2 sentences)

      Example Output Format:
      [
        {
          "category": "Spending Pattern Analysis",
          "tip": "Example tip..."
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    // Clean up potential markdown formatting backticks from Gemini
    if (text.startsWith('```json')) {
      text = text.substring(7, text.length - 3).trim();
    } else if (text.startsWith('```')) {
      text = text.substring(3, text.length - 3).trim();
    }

    const parsedInsights = JSON.parse(text);
    if (Array.isArray(parsedInsights) && parsedInsights.length > 0) {
      return parsedInsights;
    }

    throw new Error('Parsed response is not a valid array');
  } catch (error) {
    console.error('Gemini AI failed, falling back to local recommendations:', error.message);
    return generateLocalInsights(stats, budgets, goals);
  }
};

module.exports = { getFinancialInsights };
