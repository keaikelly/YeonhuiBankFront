import { useEffect, useState } from "react";
import { fetchActiveLimitsAPI } from "../api/transferLimits";
import { fetchMyAccountsAPI } from "../api/accounts";
import styles from "./TransferLimitPage.module.css";

function TransferLimitPage() {
  const [accounts, setAccounts] = useState([]);
  const [accountNum, setAccountNum] = useState("");
  const [limits, setLimits] = useState([]);
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
      // GET /api/transfer-limits/active/{accountNum}
      const res = await fetchActiveLimitsAPI(accountNum);
      const data = res?.data?.data ?? res?.data ?? [];
      setLimits(data);
    } catch {
      setLimits([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.card}>
        <header className={styles.header}>
          <h2 className={styles.title}>이체 한도</h2>
          <p className={styles.muted}>계좌별 활성 한도 조회</p>
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
          {limits.length === 0 ? (
            <p className={styles.muted}>등록된 한도가 없습니다.</p>
          ) : (
            limits.map((l) => (
              <div key={l.limitId} className={styles.item}>
                <p className={styles.label}>일 한도 {l.dailyLimitAmt}</p>
                <p className={styles.meta}>건당 한도 {l.perTxLimitAmt}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default TransferLimitPage;
