window.onload = () => {
  renderLists();
  calculateResults();
};

function getData() {
  return {
    debtsIOwe: JSON.parse(localStorage.getItem('debtsIOwe') || '[]'),
    debtsOwedToMe: JSON.parse(localStorage.getItem('debtsOwedToMe') || '[]'),
    income: JSON.parse(localStorage.getItem('income') || '{}')
  };
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
  renderLists();
  calculateResults();
}

// ===== Debt Handlers =====
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

function editDebt(key, index) {
  const newName = prompt("Enter new name:");
  const newAmount = parseFloat(prompt("Enter new amount:"));
  if (newName && newAmount > 0) {
    const data = getData();
    data[key][index] = { name: newName, amount: newAmount };
    saveData(key, data[key]);
  }
}

function deleteDebt(key, index) {
  const data = getData();
  data[key].splice(index, 1);
  saveData(key, data[key]);
}

// ===== Income & Simulation =====
function saveIncomeExpense() {
  const dailyIncome = parseFloat(document.getElementById('daily-income').value || 0);
  const dailyExpenses = parseFloat(document.getElementById('daily-expenses').value || 0);
  const repaymentPercent = parseFloat(document.getElementById('repayment-percent').value || 0);
  const income = { dailyIncome, dailyExpenses, repaymentPercent };
  saveData('income', income);
}

// ===== Render Lists =====
function renderLists() {
  const data = getData();
  const oweList = document.getElementById('debts-i-owe-list');
  const owedList = document.getElementById('debts-owed-to-me-list');

  oweList.innerHTML = '';
  data.debtsIOwe.forEach((d, i) => {
    oweList.innerHTML += `
      <li>
        ${d.name} - MVR ${d.amount}
        <div class="actions">
          <button onclick="editDebt('debtsIOwe', ${i})">Edit</button>
          <button onclick="deleteDebt('debtsIOwe', ${i})">Delete</button>
        </div>
      </li>`;
  });

  owedList.innerHTML = '';
  data.debtsOwedToMe.forEach((d, i) => {
    owedList.innerHTML += `
      <li>
        ${d.name} - MVR ${d.amount}
        <div class="actions">
          <button onclick="editDebt('debtsOwedToMe', ${i})">Edit</button>
          <button onclick="deleteDebt('debtsOwedToMe', ${i})">Delete</button>
        </div>
      </li>`;
  });
}

// ===== Calculation & Simulation =====
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

  analyzeDebtPayback(totalDebtIOwe, totalDebtOwed, repayPerDay);
}

function analyzeDebtPayback(owe, owed, repayPerDay) {
  const debtAfterReturn = owe - owed;
  const days = repayPerDay > 0 ? Math.ceil(debtAfterReturn / repayPerDay) : 'N/A';
  let text = `Remaining debt after receiving what others owe: MVR ${debtAfterReturn > 0 ? debtAfterReturn : 0}. `;
  text += (debtAfterReturn <= 0)
    ? `You can fully pay your debts if everyone pays you back!`
    : `With your savings plan, it'll take ~${days} days to pay the rest.`;
  document.getElementById('analysis-result').innerText = text;
}
