
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
function saveIncomeExpense() {
  const dailyIncome = parseFloat(document.getElementById('daily-income').value);
  const dailyExpenses = parseFloat(document.getElementById('daily-expenses').value);
  const repaymentPercent = parseFloat(document.getElementById('repayment-percent').value);
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
    <p>Daily Income: MVR ${income.dailyIncome || 0}</p>
    <p>Expenses: MVR ${income.dailyExpenses || 0}</p>
    <p>Repayment %: ${income.repaymentPercent || 0}%</p>
    <button onclick="editIncome()">Edit</button>
  `;
}
function editDebt(key, i) {
  const name = prompt("Name:");
  const amount = parseFloat(prompt("Amount:"));
  if (name && amount > 0) {
    const data = getData();
    data[key][i] = { name, amount };
    saveData(key, data[key]);
  }
}
function deleteDebt(key, i) {
  const data = getData();
  data[key].splice(i, 1);
  saveData(key, data[key]);
}
function editIncome() {
  const income = {
    dailyIncome: parseFloat(prompt("Income:")),
    dailyExpenses: parseFloat(prompt("Expenses:")),
    repaymentPercent: parseFloat(prompt("Repayment %:"))
  };
  saveData('income', income);
}
function calculateResults() {
  const data = getData();
  const income = data.income || {};
  const totalOwe = data.debtsIOwe.reduce((s, d) => s + d.amount, 0);
  const totalOwed = data.debtsOwedToMe.reduce((s, d) => s + d.amount, 0);
  const available = (income.dailyIncome || 0) - (income.dailyExpenses || 0);
  const repay = available * (income.repaymentPercent || 0) / 100;
  const days = repay > 0 ? Math.ceil(totalOwe / repay) : 'N/A';
  document.getElementById('available-income').innerText = `Available Income: MVR ${available}`;
  document.getElementById('total-debt').innerText = `Total Debt: MVR ${totalOwe}`;
  document.getElementById('days-to-repay').innerText = `Days to Repay: ${days}`;
  document.getElementById('after-owed-calculation').innerText = `After returns, need: MVR ${Math.max(0, totalOwe - totalOwed)}`;
  document.getElementById('analysis-result').innerText =
    totalOwed >= totalOwe ? "You're covered if others repay you!" :
    `You still owe: MVR ${totalOwe - totalOwed}`;
}
window.onload = () => { renderLists(); calculateResults(); };
