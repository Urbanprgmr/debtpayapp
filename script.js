// Utility Functions for localStorage with safe defaults
function getData() {
  let income = JSON.parse(localStorage.getItem('income') || '{}');
  if (typeof income !== 'object' || income === null) income = {};
  income.dailyIncome = parseFloat(income.dailyIncome) || 0;
  income.repaymentPercent = parseFloat(income.repaymentPercent) || 0;
  return {
    debtsIOwe: JSON.parse(localStorage.getItem('debtsIOwe') || '[]'),
    debtsOwedToMe: JSON.parse(localStorage.getItem('debtsOwedToMe') || '[]'),
    income,
    expenses: JSON.parse(localStorage.getItem('expenses') || '[]')
  };
}

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  renderLists();
  renderExpenses();
  calculateResults();
}

// Debts Functions
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
  const name = prompt("Enter new name:");
  const amount = parseFloat(prompt("Enter new amount:"));
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

// Income Functions
function saveIncomeExpense() {
  const dailyIncome = parseFloat(document.getElementById('daily-income').value);
  const repaymentPercent = parseFloat(document.getElementById('repayment-percent').value);
  const income = { dailyIncome, repaymentPercent };
  saveData('income', income);
}

function editIncome() {
  const dailyIncome = parseFloat(prompt("New Daily Income (MVR):"));
  const repaymentPercent = parseFloat(prompt("New Repayment %:"));
  saveData('income', { dailyIncome, repaymentPercent });
}

// Expense Tracker Functions
function addExpense() {
  const category = document.getElementById('expense-category').value;
  const amount = parseFloat(document.getElementById('expense-amount').value);
  const frequency = document.getElementById('expense-frequency').value;
  if (category && amount > 0 && frequency) {
    const expenses = getData().expenses;
    expenses.push({ category, amount, frequency });
    saveData('expenses', expenses);
    document.getElementById('expense-category').value = '';
    document.getElementById('expense-amount').value = '';
  }
}

function editExpense(index) {
  const category = prompt("Expense Category:");
  const amount = parseFloat(prompt("Expense Amount:"));
  const frequency = prompt("Frequency (daily, monthly, one-time):");
  if (category && amount > 0 && (frequency === 'daily' || frequency === 'monthly' || frequency === 'one-time')) {
    const data = getData();
    data.expenses[index] = { category, amount, frequency };
    saveData('expenses', data.expenses);
  }
}

function deleteExpense(index) {
  const data = getData();
  data.expenses.splice(index, 1);
  saveData('expenses', data.expenses);
}

function renderExpenses() {
  const expenses = getData().expenses;
  const list = document.getElementById('expense-list');
  list.innerHTML = '';
  expenses.forEach((e, i) => {
    list.innerHTML += `<li>${e.category} - MVR ${e.amount} (${e.frequency})
      <div class="actions">
        <button onclick="editExpense(${i})">Edit</button>
        <button onclick="deleteExpense(${i})">Delete</button>
      </div>
    </li>`;
  });
}

// Calculations
function calculateResults() {
  const data = getData();
  const { dailyIncome, repaymentPercent } = data.income;

  const dailyExp = data.expenses.reduce((sum, exp) => {
    if (exp.frequency === 'daily') return sum + exp.amount;
    if (exp.frequency === 'monthly') return sum + exp.amount / 30;
    return sum;
  }, 0);

  const monthlyExp = data.expenses.reduce((sum, exp) => {
    if (exp.frequency === 'daily') return sum + exp.amount * 30;
    if (exp.frequency === 'monthly') return sum + exp.amount;
    if (exp.frequency === 'one-time') return sum + exp.amount;
    return sum;
  }, 0);

  const available = (dailyIncome || 0) - dailyExp;
  const repay = available * (repaymentPercent || 0) / 100;
  const totalOwe = data.debtsIOwe.reduce((s, d) => s + d.amount, 0);
  const totalOwed = data.debtsOwedToMe.reduce((s, d) => s + d.amount, 0);
  const days = repay > 0 ? Math.ceil(totalOwe / repay) : 'N/A';
  const remaining = Math.max(0, totalOwe - totalOwed);

  document.getElementById('available-income').innerText = `Available Income: MVR ${available.toFixed(2)}`;
  document.getElementById('total-debt').innerText = `Total Debt: MVR ${totalOwe}`;
  document.getElementById('days-to-repay').innerText = `Days to Repay: ${days}`;
  document.getElementById('after-owed-calculation').innerText = `Still Needed: MVR ${remaining}`;
  document.getElementById('analysis-result').innerText =
    totalOwed >= totalOwe ? "You're fully covered if debts are returned!" :
    `You still need MVR ${remaining} even after returns.`;

  const monthlyIncome = (dailyIncome || 0) * 30;
  document.getElementById('monthly-income').innerText = `Monthly Income: MVR ${monthlyIncome}`;
  document.getElementById('monthly-expenses').innerText = `Monthly Expenses: MVR ${monthlyExp.toFixed(2)}`;
  const monthlyDebtPayment = (repay || 0) * 30;
  document.getElementById('monthly-debt-payment').innerText = `Monthly Debt Payment: MVR ${monthlyDebtPayment.toFixed(2)}`;
  const monthlyBalance = monthlyIncome - monthlyExp - monthlyDebtPayment;
  document.getElementById('monthly-balance').innerText = `Monthly Balance: MVR ${monthlyBalance.toFixed(2)}`;

  renderBarChart(dailyIncome, dailyExp, repay);
}

// Strategy Simulation
function simulateStrategy() {
  const data = getData();
  const strategy = document.getElementById('strategy-select').value;
  const repayPerDay = parseFloat(document.getElementById('custom-repay').value || 0);
  const debts = [...data.debtsIOwe];
  if (repayPerDay <= 0 || debts.length === 0) {
    document.getElementById('strategy-results').innerText = 'Enter a valid repayment amount and ensure at least one debt exists.';
    return;
  }
  if (strategy === 'snowball') debts.sort((a, b) => a.amount - b.amount);
  if (strategy === 'avalanche') debts.sort((a, b) => b.amount - a.amount);

  let remaining = debts.map(d => d.amount);
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
    `Using ${strategy}, you'll clear debts in ${days} days with MVR ${repayPerDay}/day.`;
  renderLineChart(history);
}

// Charts

let currentPeriod = 'daily';
let currentChart = 'line';

function setPeriod(period) {
  currentPeriod = period;
  renderCharts();
}

function showChart(type) {
  currentChart = type;
  document.getElementById('lineChart').style.display = type === 'line' ? 'block' : 'none';
  document.getElementById('financeBarChart').style.display = type === 'bar' ? 'block' : 'none';
  renderCharts();
}

function renderCharts() {
  const periodLabel = currentPeriod.charAt(0).toUpperCase() + currentPeriod.slice(1);
  const income = currentPeriod === 'daily' ? 100 : currentPeriod === 'weekly' ? 700 : 3000;
  const expenses = income * 0.6;
  const repay = income * 0.2;

  if (currentChart === 'bar') {
    const ctx = document.getElementById('financeBarChart').getContext('2d');
    if (window.barChart) window.barChart.destroy();
    window.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Income', 'Expenses', 'Repayment'],
        datasets: [{
          label: `${periodLabel} Finance Overview`,
          data: [income, expenses, repay],
          backgroundColor: ['#4caf50', '#f44336', '#ff9800']
        }]
      }
    });
  } else if (currentChart === 'line') {
    const ctx = document.getElementById('lineChart').getContext('2d');
    const debt = [1000];
    for (let i = 1; i <= 10; i++) {
      debt.push(debt[i - 1] - repay / 2);
    }
    if (window.lineChart) window.lineChart.destroy();
    window.lineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: debt.map((_, i) => `${periodLabel} ${i + 1}`),
        datasets: [{
          label: `Debt Over ${periodLabel}s`,
          data: debt,
          borderColor: '#3f51b5',
          tension: 0.3,
          fill: false
        }]
      }
    });
  }
}

window.onload = () => {
  showChart('line');
  setPeriod('daily');
};
