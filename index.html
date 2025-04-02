// Load on start
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

function addDebtIOwe() {
  const name = document.getElementById('owe-name').value;
  const amount = parseFloat(document.getElementById('owe-amount').value);
  if (name && amount > 0) {
    const debts = getData().debtsIOwe;
    debts.push({ name, amount });
    saveData('debtsIOwe', debts);
  }
}

function addDebtOwedToMe() {
  const name = document.getElementById('owed-name').value;
  const amount = parseFloat(document.getElementById('owed-amount').value);
  if (name && amount > 0) {
    const debts = getData().debtsOwedToMe;
    debts.push({ name, amount });
    saveData('debtsOwedToMe', debts);
  }
}

function saveIncome() {
  const current = parseFloat(document.getElementById('current-income').value || 0);
  const estimatedDaily = parseFloat(document.getElementById('daily-income').value || 0);
  const repaymentPercent = parseFloat(document.getElementById('repayment-percent').value || 0);
  const income = { current, estimatedDaily, repaymentPercent };
  saveData('income', income);
}

function renderLists() {
  const data = getData();
  const oweList = document.getElementById('debts-i-owe-list');
  const owedList = document.getElementById('debts-owed-to-me-list');

  oweList.innerHTML = '';
  data.debtsIOwe.forEach(d => {
    oweList.innerHTML += `<li>${d.name} - MVR ${d.amount}</li>`;
  });

  owedList.innerHTML = '';
  data.debtsOwedToMe.forEach(d => {
    owedList.innerHTML += `<li>${d.name} - MVR ${d.amount}</li>`;
  });
}

function calculateResults() {
  const data = getData();
  const totalDebtIOwe = data.debtsIOwe.reduce((sum, d) => sum + d.amount, 0);
  const totalDebtOwed = data.debtsOwedToMe.reduce((sum, d) => sum + d.amount, 0);
  const { estimatedDaily = 0, repaymentPercent = 0 } = data.income;

  const dailyRepayment = (estimatedDaily * repaymentPercent) / 100;
  const daysToRepay = dailyRepayment > 0 ? Math.ceil(totalDebtIOwe / dailyRepayment) : 'N/A';
  const afterOwedCalc = totalDebtIOwe - totalDebtOwed;

  document.getElementById('total-debt').innerText = `Total Debt You Owe: MVR ${totalDebtIOwe}`;
  document.getElementById('days-to-repay').innerText = `Days to Repay with ${repaymentPercent}% of MVR ${estimatedDaily}/day: ${daysToRepay} days`;
  document.getElementById('after-owed-calculation').innerText = `If debts owed to you are paid now, you still need: MVR ${afterOwedCalc > 0 ? afterOwedCalc : 0}`;
}
