
function getData() {
  return {
    debtsIOwe: JSON.parse(localStorage.getItem('debtsIOwe') || '[]'),
    debtsOwedToMe: JSON.parse(localStorage.getItem('debtsOwedToMe') || '[]'),
    income: JSON.parse(localStorage.getItem('income') || '{}')
  };
}

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  renderLists();
  calculateResults();
}

function addDebtIOwe() {
  const name = document.getElementById('owe-name').value;
  const amount = parseFloat(document.getElementById('owe-amount').value);
  if (name && amount > 0) {
    const debts = getData().debtsIOwe;
    debts.push({ name, amount });
    saveData('debtsIOwe', debts);
    document.getElementById('owe-name').value = '';
    document.getElementById('owe-amount').value = '';
  }
}

function addDebtOwedToMe() {
  const name = document.getElementById('owed-name').value;
  const amount = parseFloat(document.getElementById('owed-amount').value);
  if (name && amount > 0) {
    const debts = getData().debtsOwedToMe;
    debts.push({ name, amount });
    saveData('debtsOwedToMe', debts);
    document.getElementById('owed-name').value = '';
    document.getElementById('owed-amount').value = '';
  }
}

function saveIncomeExpense() {
  const dailyIncome = parseFloat(document.getElementById('daily-income').value || 0);
  const dailyExpenses = parseFloat(document.getElementById('daily-expenses').value || 0);
  const repaymentPercent = parseFloat(document.getElementById('repayment-percent').value || 0);
  const income = { dailyIncome, dailyExpenses, repaymentPercent };
  saveData('income', income);
}

function renderLists() {
  const data = getData();
  const oweList = document.getElementById('debts-i-owe-list');
  const owedList = document.getElementById('debts-owed-to-me-list');

  oweList.innerHTML = '';
  data.debtsIOwe.forEach(d => {
    const li = document.createElement('li');
    li.textContent = `${d.name} - MVR ${d.amount}`;
    oweList.appendChild(li);
  });

  owedList.innerHTML = '';
  data.debtsOwedToMe.forEach(d => {
    const li = document.createElement('li');
    li.textContent = `${d.name} - MVR ${d.amount}`;
    owedList.appendChild(li);
  });
}

function calculateResults() {
  const data = getData();
  const totalDebtIOwe = data.debtsIOwe.reduce((sum, d) => sum + d.amount, 0);
  const totalDebtOwed = data.debtsOwedToMe.reduce((sum, d) => sum + d.amount, 0);
  const { dailyIncome = 0, dailyExpenses = 0, repaymentPercent = 0 } = data.income;

  const availableIncome = dailyIncome - dailyExpenses;
  const repayPerDay = (availableIncome * repaymentPercent) / 100;
  const days = repayPerDay > 0 ? Math.ceil(totalDebtIOwe / repayPerDay) : 'N/A';
  const afterOwedCalc = totalDebtIOwe - totalDebtOwed;

  document.getElementById('available-income').innerText = `Available Daily Income After Expenses: MVR ${availableIncome}`;
  document.getElementById('total-debt').innerText = `Total Debt You Owe: MVR ${totalDebtIOwe}`;
  document.getElementById('days-to-repay').innerText = `Days to Repay: ${days}`;
  document.getElementById('after-owed-calculation').innerText = `If debts owed to you are returned now, you still need: MVR ${afterOwedCalc > 0 ? afterOwedCalc : 0}`;
  document.getElementById('analysis-result').innerText =
    totalDebtOwed >= totalDebtIOwe
      ? 'You can fully pay your debts if everyone pays you back!'
      : `You still need to pay MVR ${totalDebtIOwe - totalDebtOwed} after receiving what others owe.`;

  renderPieChart(data.debtsIOwe);
  renderBarChart(dailyIncome, dailyExpenses, repayPerDay);
  renderProgressBar(totalDebtOwed, totalDebtIOwe);
}

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
    sortedDebts = debts;
  }

  let remaining = sortedDebts.map(d => d.amount);
  let days = 0;

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

// Chart-related
let pieChartInstance, barChartInstance;
function renderPieChart(debts) {
  const names = debts.map(d => d.name);
  const amounts = debts.map(d => d.amount);
  const ctx = document.getElementById('debtPieChart').getContext('2d');
  if (pieChartInstance) pieChartInstance.destroy();
  pieChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: names,
      datasets: [{ data: amounts }]
    }
  });
}

function renderBarChart(income, expenses, repay) {
  const ctx = document.getElementById('financeBarChart').getContext('2d');
  if (barChartInstance) barChartInstance.destroy();
  barChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Income', 'Expenses', 'Repayment'],
      datasets: [{
        label: 'Daily MVR',
        data: [income, expenses, repay]
      }]
    }
  });
}

function renderProgressBar(owedToYou, oweTotal) {
  const paidRatio = owedToYou / oweTotal;
  const percent = Math.min(Math.round(paidRatio * 100), 100);
  document.getElementById('progress-bar-fill').style.width = `${percent}%`;
  document.getElementById('progress-label').innerText = `Progress: ${percent}% of debt covered if all returns are paid.`;
}

window.onload = () => {
  renderLists();
  calculateResults();
};

function renderIncomeDetails() {
  const { dailyIncome = 0, dailyExpenses = 0, repaymentPercent = 0 } = getData().income;
  document.getElementById('income-details').innerHTML = `
    <p>Saved Income: MVR ${dailyIncome}</p>
    <p>Daily Expenses: MVR ${dailyExpenses}</p>
    <p>Repayment %: ${repaymentPercent}%</p>
    <button onclick="editIncome()">Edit Income & Expenses</button>
  `;
}

function editIncome() {
  const dailyIncome = parseFloat(prompt("Enter your daily income (MVR):") || 0);
  const dailyExpenses = parseFloat(prompt("Enter your daily expenses (MVR):") || 0);
  const repaymentPercent = parseFloat(prompt("Enter repayment percentage of available income:") || 0);
  const income = { dailyIncome, dailyExpenses, repaymentPercent };
  saveData('income', income);
}

function renderBarChart(income, expenses, repay) {
  const ctx = document.getElementById('financeBarChart').getContext('2d');
  if (!ctx || isNaN(income) || isNaN(expenses) || isNaN(repay)) return;

  if (window.barChartInstance) window.barChartInstance.destroy();

  window.barChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Income', 'Expenses', 'Repayment'],
      datasets: [{
        label: 'Daily MVR',
        data: [income, expenses, repay],
        backgroundColor: ['#4caf50', '#f44336', '#ff9800']
      }]
    }
  });
}

function renderLineChart(debtHistory) {
  const ctx = document.getElementById('lineChart').getContext('2d');
  if (!ctx || !Array.isArray(debtHistory)) return;

  if (window.lineChartInstance) window.lineChartInstance.destroy();

  const labels = debtHistory.map((_, i) => `Day ${i + 1}`);
  const data = {
    labels: labels,
    datasets: [{
      label: 'Remaining Debt',
      data: debtHistory,
      borderColor: '#f44336',
      fill: false,
      tension: 0.3
    }]
  };

  window.lineChartInstance = new Chart(ctx, {
    type: 'line',
    data: data
  });
}
