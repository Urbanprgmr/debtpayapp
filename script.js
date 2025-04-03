
function getData() {
  let income = JSON.parse(localStorage.getItem('income') || '{}');
  if (typeof income !== 'object' || income === null) income = {};
  income.dailyIncome = income.dailyIncome || 0;
  income.dailyExpenses = income.dailyExpenses || 0;
  income.repaymentPercent = income.repaymentPercent || 0;
  return {
    debtsIOwe: JSON.parse(localStorage.getItem('debtsIOwe') || '[]'),
    debtsOwedToMe: JSON.parse(localStorage.getItem('debtsOwedToMe') || '[]'),
    income
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
    const list = getData().debtsIOwe;
    list.push({ name, amount });
    saveData('debtsIOwe', list);
    document.getElementById('owe-name').value = '';
    document.getElementById('owe-amount').value = '';
  }
}

function addDebtOwedToMe() {
  const name = document.getElementById('owed-name').value;
  const amount = parseFloat(document.getElementById('owed-amount').value);
  if (name && amount > 0) {
    const list = getData().debtsOwedToMe;
    list.push({ name, amount });
    saveData('debtsOwedToMe', list);
    document.getElementById('owed-name').value = '';
    document.getElementById('owed-amount').value = '';
  }
}

function editDebt(key, index) {
  const name = prompt("Edit name:");
  const amount = parseFloat(prompt("Edit amount:"));
  if (name && amount > 0) {
    const data = getData();
    data[key][index] = { name, amount };
    saveData(key, data[key]);
  }
}

function deleteDebt(key, index) {
  const data = getData();
  data[key].splice(index, 1);
  saveData(key, data[key]);
}

function saveIncomeExpense() {
  const dailyIncome = parseFloat(document.getElementById('daily-income').value);
  const dailyExpenses = parseFloat(document.getElementById('daily-expenses').value);
  const repaymentPercent = parseFloat(document.getElementById('repayment-percent').value);
  saveData('income', { dailyIncome, dailyExpenses, repaymentPercent });
}

function editIncome() {
  const dailyIncome = parseFloat(prompt("Daily Income:"));
  const dailyExpenses = parseFloat(prompt("Daily Expenses:"));
  const repaymentPercent = parseFloat(prompt("Repayment %:"));
  saveData('income', { dailyIncome, dailyExpenses, repaymentPercent });
}

function renderLists() {
  const { debtsIOwe, debtsOwedToMe, income } = getData();
  const oweList = document.getElementById('debts-i-owe-list');
  const owedList = document.getElementById('debts-owed-to-me-list');
  oweList.innerHTML = ''; owedList.innerHTML = '';
  debtsIOwe.forEach((d, i) => {
    oweList.innerHTML += `<li>${d.name} - MVR ${d.amount}
      <div class="actions">
        <button onclick="editDebt('debtsIOwe', ${i})">Edit</button>
        <button onclick="deleteDebt('debtsIOwe', ${i})">Delete</button>
      </div></li>`;
  });
  debtsOwedToMe.forEach((d, i) => {
    owedList.innerHTML += `<li>${d.name} - MVR ${d.amount}
      <div class="actions">
        <button onclick="editDebt('debtsOwedToMe', ${i})">Edit</button>
        <button onclick="deleteDebt('debtsOwedToMe', ${i})">Delete</button>
      </div></li>`;
  });
  document.getElementById('income-details').innerHTML = `
    <p>Daily Income: MVR ${income.dailyIncome}</p>
    <p>Daily Expenses: MVR ${income.dailyExpenses}</p>
    <p>Repayment %: ${income.repaymentPercent}%</p>
    <button onclick="editIncome()">Edit</button>
  `;
}

function calculateResults() {
  const data = getData();
  const { dailyIncome, dailyExpenses, repaymentPercent } = data.income;
  const totalOwe = data.debtsIOwe.reduce((sum, d) => sum + d.amount, 0);
  const totalOwed = data.debtsOwedToMe.reduce((sum, d) => sum + d.amount, 0);
  const available = dailyIncome - dailyExpenses;
  const repay = available * repaymentPercent / 100;
  const days = repay > 0 ? Math.ceil(totalOwe / repay) : 'N/A';
  const remaining = Math.max(0, totalOwe - totalOwed);

  document.getElementById('available-income').innerText = `Available Income: MVR ${available}`;
  document.getElementById('total-debt').innerText = `Total Debt: MVR ${totalOwe}`;
  document.getElementById('days-to-repay').innerText = `Days to Repay: ${days}`;
  document.getElementById('after-owed-calculation').innerText = `Still Needed: MVR ${remaining}`;

  document.getElementById('analysis-result').innerText =
    totalOwed >= totalOwe ? "You're fully covered if debts are returned!" :
    `You still need MVR ${remaining} even after returns.`;

  renderBarChart(dailyIncome, dailyExpenses, repay);
}

function simulateStrategy() {
  const { debtsIOwe } = getData();
  const strategy = document.getElementById('strategy-select').value;
  const repayPerDay = parseFloat(document.getElementById('custom-repay').value || 0);
  if (repayPerDay <= 0 || debtsIOwe.length === 0) {
    document.getElementById('strategy-results').innerText = 'Enter a valid amount and have at least one debt.';
    return;
  }

  let sortedDebts = [...debtsIOwe];
  if (strategy === 'snowball') sortedDebts.sort((a, b) => a.amount - b.amount);
  if (strategy === 'avalanche') sortedDebts.sort((a, b) => b.amount - a.amount);

  let remaining = sortedDebts.map(d => d.amount);
  let history = [remaining.reduce((sum, a) => sum + a, 0)];
  let days = 0;

  while (history[history.length - 1] > 0 && days < 365) {
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i] > 0) {
        remaining[i] -= Math.min(remaining[i], repayPerDay);
        break;
      }
    }
    history.push(remaining.reduce((s, a) => s + a, 0));
    days++;
  }

  document.getElementById('strategy-results').innerText =
    `Using ${strategy}, you’ll clear all debts in ${days} days with MVR ${repayPerDay}/day.`;

  renderLineChart(history);
}

// Chart drawing functions
function renderBarChart(income, expenses, repay) {
  const ctx = document.getElementById('financeBarChart').getContext('2d');
  if (window.barChart) window.barChart.destroy();
  window.barChart = new Chart(ctx, {
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
function renderLineChart(history) {
  const ctx = document.getElementById('lineChart').getContext('2d');
  if (window.lineChart) window.lineChart.destroy();
  window.lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: history.map((_, i) => `Day ${i}`),
      datasets: [{
        label: 'Debt Remaining',
        data: history,
        borderColor: '#3f51b5',
        fill: false,
        tension: 0.3
      }]
    }
  });
}
window.onload = () => {
  renderLists();
  calculateResults();
};
