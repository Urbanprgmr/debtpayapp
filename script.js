
function simulateStrategy() {
  const data = getData();
  const debts = [...data.debtsIOwe];
  const strategy = document.getElementById('strategy-select').value;
  const repayDaily = parseFloat(document.getElementById('custom-repay').value || 0);
  let sortedDebts = [];

  if (strategy === 'snowball') {
    sortedDebts = debts.sort((a, b) => a.amount - b.amount);
  } else if (strategy === 'avalanche') {
    sortedDebts = debts.sort((a, b) => b.amount - a.amount);
  } else {
    sortedDebts = debts; // manual order
  }

  let remaining = sortedDebts.map(d => d.amount);
  let days = 0;
  let totalDebt = remaining.reduce((sum, amt) => sum + amt, 0);

  if (repayDaily > 0) {
    while (remaining.reduce((sum, amt) => sum + amt, 0) > 0) {
      for (let i = 0; i < remaining.length; i++) {
        if (remaining[i] > 0) {
          const payment = Math.min(remaining[i], repayDaily);
          remaining[i] -= payment;
          break;
        }
      }
      days++;
    }
  }

  document.getElementById('strategy-results').innerText = repayDaily > 0
    ? `Using ${strategy} strategy: You'll clear all debts in ${days} days with MVR ${repayDaily}/day.`
    : 'Please enter a valid daily repayment amount.';
}
