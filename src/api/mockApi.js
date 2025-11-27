const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

let accounts = [
  { id: '112-268-993102', name: '주거래 입출금', balance: 1820000, limit: 3000000 },
  { id: '112-110-667010', name: '비상금 통장', balance: 1662230, limit: 1500000 },
  { id: '112-500-778990', name: '여행 적금', balance: 482500, limit: 2000000 },
];

let transactions = [
  {
    id: 1,
    accountId: '112-268-993102',
    title: '급여 입금',
    datetime: '2024-12-02 08:00',
    amount: 2900000,
    type: '입금',
    memo: '11월 급여',
  },
  {
    id: 2,
    accountId: '112-268-993102',
    title: '배달의민족',
    datetime: '2024-12-01 19:22',
    amount: -18900,
    type: '출금',
    memo: '저녁',
  },
  {
    id: 3,
    accountId: '112-110-667010',
    title: '스타벅스',
    datetime: '2024-12-01 09:32',
    amount: -5800,
    type: '출금',
    memo: '아메리카노',
  },
  {
    id: 4,
    accountId: '112-500-778990',
    title: '이자 입금',
    datetime: '2024-11-30 00:15',
    amount: 9200,
    type: '입금',
    memo: '정기이자',
  },
];

let schedules = [
  {
    id: 'sch-1',
    from: '112-268-993102',
    to: '112-110-667010',
    amount: 200000,
    memo: '월세',
    day: '매달 25일',
  },
  {
    id: 'sch-2',
    from: '112-268-993102',
    to: '112-500-778990',
    amount: 100000,
    memo: '여행 적금',
    day: '매주 월요일',
  },
];

export async function signup(payload) {
  await delay();
  return { name: payload.name || '연희', email: payload.email };
}

export async function login(payload) {
  await delay();
  return { name: payload.name || '연희', email: payload.email };
}

export async function getAccounts() {
  await delay();
  return accounts.map((acc) => ({ ...acc }));
}

export async function getTransactionsByAccount(accountId) {
  await delay();
  return transactions.filter((t) => t.accountId === accountId).map((t) => ({ ...t }));
}

export async function transfer({ from, to, amount, memo }) {
  await delay();
  const amt = Number(amount);
  if (!from || !to || !amt || amt <= 0) throw new Error('이체 정보를 확인하세요');
  const account = accounts.find((a) => a.id === from);
  if (!account) throw new Error('계좌를 찾을 수 없습니다');
  if (account.balance < amt) throw new Error('잔액이 부족합니다');

  account.balance -= amt;
  const tx = {
    id: transactions.length + 1,
    accountId: from,
    title: to,
    datetime: new Date().toISOString().slice(0, 16).replace('T', ' '),
    amount: -amt,
    type: '출금',
    memo: memo || '이체',
  };
  transactions = [tx, ...transactions];
  return { balance: account.balance, transaction: tx };
}

export async function getSchedules() {
  await delay();
  return schedules.map((s) => ({ ...s }));
}

export async function addSchedule(data) {
  await delay();
  const entry = { ...data, id: `sch-${schedules.length + 1}` };
  schedules = [...schedules, entry];
  return entry;
}
