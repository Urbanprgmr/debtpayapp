
function getData() {
  const debtsIOwe = JSON.parse(localStorage.getItem('debtsIOwe') || '[]');
  const debtsOwedToMe = JSON.parse(localStorage.getItem('debtsOwedToMe') || '[]');
  let income = JSON.parse(localStorage.getItem('income') || '{}');

  // Validate and repair structure
  if (typeof income !== 'object' || income === null) income = {};
  if (typeof income.dailyIncome !== 'number') income.dailyIncome = 0;
  if (typeof income.dailyExpenses !== 'number') income.dailyExpenses = 0;
  if (typeof income.repaymentPercent !== 'number') income.repaymentPercent = 0;

  return { debtsIOwe, debtsOwedToMe, income };
}

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  renderLists();
  calculateResults();
}

function renderLists() {
  const { debtsIOwe, debtsOwedToMe, income } = getData();
  const oweList = document.getElementById('debts-i-owe-list');
  const owedList = document.getElementById('debts-owed-to-me-list');
  oweList.innerHTML = ''; owedList.innerHTML = '';
  debtsIOwe.forEach((d, i) => {
    oweList.innerHTML += `<li>${d.name} - MVR ${d.amount}
      <div class="actions">
        <button onclick="editDebt('debtsIOwe',${i})">Edit</button>
        <button onclick="deleteDebt('debtsIOwe',${i})">Delete</button>
      </div></li>`;
  });
  debtsOwedToMe.forEach((d, i) => {
    owedList.innerHTML += `<li>${d.name} - MVR ${d.amount}
      <div class="actions">
        <button onclick="editDebt('debtsOwedToMe',${i})">Edit</button>
        <button onclick="deleteDebt('debtsOwedToMe',${i})">Delete</button>
      </div></li>`;
  });
  document.getElementById('income-details').innerHTML = `
    <p>Daily Income: MVR ${income.dailyIncome}</p>
    <p>Daily Expenses: MVR ${income.dailyExpenses}</p>
    <p>Repayment %: ${income.repaymentPercent}%</p>
    <button onclick="editIncome()">Edit</button>
  `;
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
function saveIncomeExpense() {
  const dailyIncome = parseFloat(document.getElementById('daily-income').value);
  const dailyExpenses = parseFloat(document.getElementById('daily-expenses').value);
  const repaymentPercent = parseFloat(document.getElementById('repayment-percent').value);
  saveData('income', { dailyIncome, dailyExpenses, repaymentPercent });
}
function editIncome() {
  const dailyIncome = parseFloat(prompt("New Income (MVR):"));
  const dailyExpenses = parseFloat(prompt("New Expenses (MVR):"));
  const repaymentPercent = parseFloat(prompt("New Repayment %:"));
  saveData('income', { dailyIncome, dailyExpenses, repaymentPercent });
}
function calculateResults() {
  const data = getData();
  const income = data.income;
  const totalDebtIOwe = data.debtsIOwe.reduce((sum, d) => sum + d.amount, 0);
  const totalDebtOwed = data.debtsOwedToMe.reduce((sum, d) => sum + d.amount, 0);
  const available = income.dailyIncome - income.dailyExpenses;
  const repayPerDay = available * income.repaymentPercent / 100;
  const days = repayPerDay > 0 ? Math.ceil(totalDebtIOwe / repayPerDay) : 'N/A';
  const afterOwed = Math.max(0, totalDebtIOwe - totalDebtOwed);

  document.getElementById('available-income').innerText = `Available Income: MVR ${available}`;
  document.getElementById('total-debt').innerText = `Total Debt: MVR ${totalDebtIOwe}`;
  document.getElementById('days-to-repay').innerText = `Days to Repay: ${days}`;
  document.getElementById('after-owed-calculation').innerText = `Still need: MVR ${afterOwed}`;

  document.getElementById('analysis-result').innerText =
    totalDebtOwed >= totalDebtIOwe ? "You're covered if they repay you!" :
    `You still owe MVR ${totalDebtIOwe - totalDebtOwed} even after returns.`;

  renderBarChart(income.dailyIncome, income.dailyExpenses, repayPerDay);
}

function simulateStrategy() {
  const data = getData();
  const strategy = document.getElementById('strategy-select').value;
  const repayDaily = parseFloat(document.getElementById('custom-repay').value || 0);
  let debts = [...data.debtsIOwe];

  if (repayDaily <= 0 || debts.length === 0) {
    document.getElementById('strategy-results').innerText = 'Enter valid repayment and debts.';
    return;
  }

  if (strategy === 'snowball') debts.sort((a, b) => a.amount - b.amount);
  if (strategy === 'avalanche') debts.sort((a, b) => b.amount - a.amount);

  let remaining = debts.map(d => d.amount);
  let history = [remaining.reduce((s, a) => s + a, 0)];
  let days = 0;

  while (history[history.length - 1] > 0 && days < 365) {
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i] > 0) {
        let pay = Math.min(remaining[i], repayDaily);
        remaining[i] -= pay;
        break;
      }
    }
    history.push(remaining.reduce((s, a) => s + a, 0));
    days++;
  }

  document.getElementById('strategy-results').innerText =
    `Using ${strategy}, you’ll repay in ${days} days at MVR ${repayDaily}/day.`;

  renderLineChart(history);
}

// Charts
function renderBarChart(income, expenses, repay) {
  const ctx = document.getElementById('financeBarChart').getContext('2d');
  if (!ctx || isNaN(income) || isNaN(expenses) || isNaN(repay)) return;
  if (window.barChart) window.barChart.destroy();
  window.barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Income', 'Expenses', 'Repayment'],
      datasets: [{ data: [income, expenses, repay], backgroundColor: ['#4caf50', '#f44336', '#ff9800'] }]
    }
  });
}
function renderLineChart(data) {
  const ctx = document.getElementById('lineChart').getContext('2d');
  if (window.lineChart) window.lineChart.destroy();
  window.lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map((_, i) => `Day ${i}`),
      datasets: [{ label: 'Debt Remaining', data, borderColor: '#f44336', tension: 0.3 }]
    }
  });
}
window.onload = () => { renderLists(); calculateResults(); };
