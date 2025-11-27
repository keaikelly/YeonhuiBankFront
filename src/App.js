import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import './App.css';
import { addSchedule, getAccounts, getSchedules, getTransactionsByAccount, login, signup, transfer } from './api/mockApi';
import AccountDetailPage from './pages/AccountDetailPage';
import AuthPage from './pages/AuthPage';
import MainPage from './pages/MainPage';
import SchedulePage from './pages/SchedulePage';
import TransferPage from './pages/TransferPage';

const formatAmount = (value) => `￦${Number(value || 0).toLocaleString()}`;

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

function AppShell() {
  const [user, setUser] = useState({ name: '연희', email: 'yeonhui@bank.com' });
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [transferForm, setTransferForm] = useState({
    from: '',
    to: '',
    amount: '',
    memo: '',
  });
  const [scheduleForm, setScheduleForm] = useState({
    from: '',
    to: '',
    amount: '',
    memo: '',
    day: '매달 1일',
  });
  const [alert, setAlert] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const [acc, sch] = await Promise.all([getAccounts(), getSchedules()]);
      setAccounts(acc);
      setSchedules(sch);
      if (acc.length) {
        setSelectedAccountId(acc[0].id);
        setTransferForm((prev) => ({ ...prev, from: acc[0].id }));
        setScheduleForm((prev) => ({ ...prev, from: acc[0].id }));
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedAccountId) return;
    const loadTx = async () => {
      const tx = await getTransactionsByAccount(selectedAccountId);
      setTransactions(tx);
    };
    loadTx();
  }, [selectedAccountId]);

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === selectedAccountId) || accounts[0] || {},
    [accounts, selectedAccountId],
  );

  const handleAuth = async (type, payload) => {
    const res = type === 'signup' ? await signup(payload) : await login(payload);
    setUser(res);
    setAlert(`${type === 'signup' ? '회원가입' : '로그인'} 완료`);
    navigate('/');
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      const result = await transfer(transferForm);
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === transferForm.from ? { ...acc, balance: result.balance } : acc)),
      );
      if (transferForm.from === selectedAccountId) {
        setTransactions((prev) => [result.transaction, ...prev]);
      }
      setAlert(`${transferForm.to}로 ${formatAmount(transferForm.amount)} 이체 완료`);
      setTransferForm((prev) => ({ ...prev, amount: '', memo: '' }));
    } catch (err) {
      setAlert(err.message);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!scheduleForm.to || !scheduleForm.amount) throw new Error('예약이체 정보를 채워주세요');
      const entry = await addSchedule({ ...scheduleForm, amount: Number(scheduleForm.amount) });
      setSchedules((prev) => [...prev, entry]);
      setScheduleForm((prev) => ({ ...prev, amount: '', memo: '' }));
      setAlert('예약이체가 추가되었습니다');
    } catch (err) {
      setAlert(err.message);
    }
  };

  const navItems = [
    { path: '/signup', label: '회원가입' },
    { path: '/login', label: '로그인' },
    { path: '/', label: '메인' },
    { path: '/account', label: '계좌상세' },
    { path: '/transfer', label: '이체' },
    { path: '/schedule', label: '예약이체' },
  ];

  return (
    <div className="App">
      <div className="phone-frame">
        <div className="top-bar">
          <span className="carrier">YEONHUI</span>
          <span className="time">09:41</span>
          <span className="status">5G · 82%</span>
        </div>

        <TabNav items={navItems} />

        {alert ? <div className="toast">{alert}</div> : null}

        <Routes>
          <Route path="/signup" element={<AuthPage mode="signup" onSubmit={handleAuth} />} />
          <Route path="/login" element={<AuthPage mode="login" onSubmit={handleAuth} />} />
          <Route path="/" element={<MainPage user={user} accounts={accounts} />} />
          <Route
            path="/account/:accountId?"
            element={
              <AccountDetailRoute
                account={selectedAccount}
                transactions={transactions}
                onSelect={setSelectedAccountId}
                accounts={accounts}
                selectedAccountId={selectedAccountId}
              />
            }
          />
          <Route
            path="/transfer"
            element={
              <TransferPage
                form={transferForm}
                onChange={setTransferForm}
                onSubmit={handleTransfer}
                accounts={accounts}
                selectedAccount={selectedAccount}
              />
            }
          />
          <Route
            path="/schedule"
            element={
              <SchedulePage
                schedules={schedules}
                form={scheduleForm}
                onChange={setScheduleForm}
                onSubmit={handleScheduleSubmit}
                accounts={accounts}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function TabNav({ items }) {
  const location = useLocation();
  return (
    <nav className="tab-nav">
      {items.map((item) => {
        const active =
          item.path === '/'
            ? location.pathname === '/'
            : location.pathname === item.path || location.pathname.startsWith(item.path);
        return (
          <Link key={item.path} to={item.path} className={`tab ${active ? 'active' : ''}`}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function AccountDetailRoute({ account, accounts, transactions, onSelect, selectedAccountId }) {
  const { accountId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (accountId && accountId !== selectedAccountId) {
      onSelect(accountId);
    }
  }, [accountId, onSelect, selectedAccountId]);

  const handleSelect = (id) => {
    onSelect(id);
    navigate(`/account/${id}`);
  };

  if (!accounts.length) return null;

  return (
    <AccountDetailPage
      account={account}
      transactions={transactions}
      onSelect={handleSelect}
      accounts={accounts}
    />
  );
}

export default App;
