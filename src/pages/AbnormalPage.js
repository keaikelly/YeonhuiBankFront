import { useEffect, useState } from "react";
import { fetchAbnormalByAccountAPI } from "../api/abnormalTransfers";
import { fetchMyAccountsAPI } from "../api/accounts";
import styles from "./AbnormalPage.module.css";

function AbnormalPage() {
  const [accounts, setAccounts] = useState([]);
  const [accountNum, setAccountNum] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 계좌 목록 로드
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const res = await fetchMyAccountsAPI();
        const data = res?.data?.data ?? res?.data ?? {};
        const content = data?.content || [];
        setAccounts(content);
      } catch {
        setAccounts([]);
      }
    };
    loadAccounts();
  }, []);

  // 이상거래 조회
  const loadAbn = async (e) => {
    e.preventDefault();
    if (!accountNum) return;
    try {
      setLoading(true);
      const res = await fetchAbnormalByAccountAPI(accountNum);
      const data = res?.data?.data ?? res?.data ?? [];
      setAlerts(data);
      setMessage(data.length === 0 ? "이상거래가 없습니다." : "");
    } catch {
      setAlerts([]);
      setMessage("조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 알림 요약 함수: 같은 알림끼리 묶고, 건수와 마지막 발생시각 계산
  const summarizeAlerts = (alerts) => {
    const grouped = {};

    alerts.forEach((a) => {
      const key = `${a.accountNum}|${a.ruleCode}|${a.detailMessage}`;
      if (!grouped[key]) {
        grouped[key] = {
          ...a,
          count: 1,
          latestAt: a.createdAt,
        };
      } else {
        grouped[key].count += 1;
        if (new Date(a.createdAt) > new Date(grouped[key].latestAt)) {
          grouped[key].latestAt = a.createdAt;
        }
      }
    });

    return Object.values(grouped);
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.card}>
        <header className={styles.header}>
          <h2 className={styles.title}>이상거래 알림</h2>
          <p className={styles.muted}>계좌별 이상거래를 조회합니다.</p>
        </header>

        <form className={styles.form} onSubmit={loadAbn}>
          <select
            className={styles.input}
            value={accountNum}
            onChange={(e) => setAccountNum(e.target.value)}
          >
            <option value="">계좌 선택하기</option>
            {accounts.map((acc) => (
              <option
                key={acc.accountNum || acc.id}
                value={acc.accountNum || acc.id}
              >
                {acc.accountNum || acc.id}
              </option>
            ))}
          </select>
          <button
            className={styles.button}
            type="submit"
            disabled={!accountNum || loading}
          >
            {loading ? "조회 중..." : "조회"}
          </button>
        </form>

        <div className={styles.list}>
          {message && <p className={styles.muted}>{message}</p>}

          {!message &&
            summarizeAlerts(alerts).map((a, i) => (
              <div key={i} className={styles.item}>
                <p className={styles.label}>🔔 계좌 | {a.accountNum}</p>
                <p>{a.detailMessage}</p>
                <p className={styles.meta}>
                  총 {a.count}건 발생 (마지막:{" "}
                  {new Date(a.latestAt).toLocaleString()})
                </p>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}

export default AbnormalPage;
