import { useEffect, useState } from "react";
import {
  fetchLogsByAccountAPI,
  fetchMyLogsAPI,
  fetchLogsByActionAPI,
  fetchLogsByAccountPeriodAPI,
} from "../api/logs";
import { fetchMyAccountsAPI } from "../api/accounts";
import styles from "./LogsPage.module.css";

const ACTION_OPTIONS = [
  { value: "DEPOSIT", label: "입금" },
  { value: "WITHDRAW", label: "출금" },
  { value: "TRANSFER_DEBIT", label: "출금(이체 발신)" },
  { value: "TRANSFER_CREDIT", label: "입금(이체 수신)" },
  { value: "FRAUD", label: "이상거래" },
  { value: "ADJUST", label: "정정/조정" },
];

function LogsPage() {
  const [mode, setMode] = useState("ACCOUNT"); // ACCOUNT | ME | ACTION
  const [accounts, setAccounts] = useState([]);
  const [accountNum, setAccountNum] = useState("");
  const [action, setAction] = useState(ACTION_OPTIONS[0].value);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [usePeriod, setUsePeriod] = useState(false);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        // GET /api/accounts/me : 내 계좌 목록 조회
        const res = await fetchMyAccountsAPI();
        const data = res?.data?.data ?? res?.data ?? {};
        const content = data?.content || [];
        setAccounts(content);
        if (content[0]?.accountNum) setAccountNum(content[0].accountNum);
      } catch {
        setAccounts([]);
      }
    };
    loadAccounts();
  }, []);

  const formatDateTime = (v) => {
    if (!v) return "-";
    const d = v.slice(0, 10).replace(/-/g, ".");
    const t = v.slice(11, 16);
    return `${d} ${t}`;
  };

  const formatAction = (action) => {
    if (!action) return "";
    const found = ACTION_OPTIONS.find((opt) => opt.value === action);
    return found ? found.label : action;
  };

  const handleLoad = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const params = {
        page: 0,
        size: 50,
        sort: "",
      };

      let res;
      if (mode === "ACCOUNT") {
        if (!accountNum) return;
        if (usePeriod && startDate && endDate) {
          // 계좌 + 기간 로그: GET /api/logs/account/{accountNum}/period
          res = await fetchLogsByAccountPeriodAPI(
            accountNum,
            `${startDate}T00:00:00`,
            `${endDate}T23:59:59`,
            params
          );
        } else {
          // 계좌 별 로그: GET /api/logs/account/{accountNum}
          res = await fetchLogsByAccountAPI(accountNum, params);
        }
      } else if (mode === "ME") {
        // 내 로그: GET /api/logs/me
        res = await fetchMyLogsAPI(params);
      } else if (mode === "ACTION") {
        // 액션 타입별 로그: GET /api/logs/action/{action}
        res = await fetchLogsByActionAPI(action, params);
      }

      const data = res?.data?.data ?? res?.data ?? {};
      const content = data?.content || data || [];
      setLogs(content);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.card}>
        <header className={styles.header}>
          <h2 className={styles.title}>로그 조회</h2>
          <p className={styles.muted}>
            계좌별 / 내 로그 / 액션별로 로그를 확인할 수 있어요. 계좌별 모드에서 기간을 비워두면 전체 기간 로그가 조회됩니다.
          </p>
        </header>

        <form className={styles.form} onSubmit={handleLoad}>
          <select
            className={styles.input}
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="ACCOUNT">계좌별</option>
            <option value="ME">내 로그</option>
            <option value="ACTION">액션별</option>
          </select>

          {mode === "ACCOUNT" && (
            <>
              <select
                className={styles.input}
                value={accountNum}
                onChange={(e) => setAccountNum(e.target.value)}
              >
                {accounts.map((acc) => (
                  <option
                    key={acc.accountNum || acc.id}
                    value={acc.accountNum || acc.id}
                  >
                    {acc.accountNum || acc.id}
                  </option>
                ))}
              </select>
              <div className={styles.dateToggleRow}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => setUsePeriod((prev) => !prev)}
                >
                  {usePeriod ? "기간 지우기" : "기간 추가하기"}
                </button>
              </div>
              {usePeriod && (
                <div className={styles.dateGroup}>
                  <span className={styles.dateLabel}>기간 (선택)</span>
                  <div className={styles.dateRow}>
                    <input
                      type="date"
                      className={styles.input}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    <span className={styles.dateSeparator}>~</span>
                    <input
                      type="date"
                      className={styles.input}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {mode === "ACTION" && (
            <select
              className={styles.input}
              value={action}
              onChange={(e) => setAction(e.target.value)}
            >
              {ACTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} ({opt.value})
                </option>
              ))}
            </select>
          )}

          <button className={styles.button} type="submit">
            {loading ? "조회 중..." : "조회"}
          </button>
        </form>

        <div className={styles.list}>
          {logs.length === 0 ? (
            <p className={styles.muted}>로그가 없습니다.</p>
          ) : (
            logs.map((log) => (
              <div key={log.logId || log.id} className={styles.item}>
                <p className={styles.label}>{formatAction(log.action)}</p>
                <p className={styles.meta}>계좌번호 | {log.accountNum}</p>
                <p className={styles.meta}>
                  {formatDateTime(log.createdAt)} ·{" "}
                  {`잔액 ${Number(log.afterBalance ?? 0).toLocaleString()}원`}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default LogsPage;
