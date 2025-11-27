import { useEffect, useState } from "react";
import { fetchAbnormalByAccountAPI } from "../api/abnormalTransfers";
import { fetchMyAccountsAPI } from "../api/accounts";
import styles from "./AbnormalPage.module.css";

function AbnormalPage() {
  const [accounts, setAccounts] = useState([]);
  const [accountNum, setAccountNum] = useState("");
  const [alerts, setAlerts] = useState([]);
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
      // GET /api/abn-transfers/account/{accountNum}
      const res = await fetchAbnormalByAccountAPI(accountNum);
      const data = res?.data?.data ?? res?.data ?? [];
      setAlerts(data);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.card}>
        <header className={styles.header}>
          <h2 className={styles.title}>이상거래 알림</h2>
          <p className={styles.muted}>계좌별 이상거래를 조회합니다.</p>
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
          {alerts.length === 0 ? (
            <p className={styles.muted}>알림이 없습니다.</p>
          ) : (
            alerts.map((a) => (
              <div key={a.alertId} className={styles.item}>
                <p className={styles.label}>{a.ruleCode}</p>
                <p className={styles.meta}>{a.detailMessage}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default AbnormalPage;
