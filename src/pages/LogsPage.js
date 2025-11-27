import { useEffect, useState } from "react";
import { fetchLogsByAccountAPI } from "../api/logs";
import { fetchMyAccountsAPI } from "../api/accounts";
import styles from "./LogsPage.module.css";

function LogsPage() {
  const [accounts, setAccounts] = useState([]);
  const [accountNum, setAccountNum] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const handleLoad = async (e) => {
    e.preventDefault();
    if (!accountNum) return;
    try {
      setLoading(true);
      // GET /api/logs/account/{accountNum}
      const res = await fetchLogsByAccountAPI(accountNum);
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
          <h2 className={styles.title}>계좌 로그</h2>
          <p className={styles.muted}>내 계좌를 선택해 로그를 조회합니다.</p>
        </header>
        <form className={styles.form} onSubmit={handleLoad}>
          <select
            className={styles.input}
            value={accountNum}
            onChange={(e) => setAccountNum(e.target.value)}
          >
            {accounts.map((acc) => (
              <option key={acc.accountNum || acc.id} value={acc.accountNum || acc.id}>
                {acc.accountType || "계좌"} · {acc.accountNum || acc.id}
              </option>
            ))}
          </select>
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
                <p className={styles.label}>{log.action}</p>
                <p className={styles.meta}>{log.createdAt}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default LogsPage;
