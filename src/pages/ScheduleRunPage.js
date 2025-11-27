import { useEffect, useState } from "react";
import { fetchRunsByScheduleAPI } from "../api/scheduledTransferRuns";
import { fetchMyAccountsAPI } from "../api/accounts";
import { fetchSchedulesByFromAccountAPI } from "../api/scheduledTransactions";
import styles from "./ScheduleRunPage.module.css";

function ScheduleRunPage() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [scheduleId, setScheduleId] = useState("");
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        // GET /api/accounts/me
        const res = await fetchMyAccountsAPI();
        const data = res?.data?.data ?? res?.data ?? {};
        const content = data?.content || [];
        setAccounts(content);
        if (content[0]?.accountNum) setSelectedAccount(content[0].accountNum);
      } catch {
        setAccounts([]);
      }
    };
    loadAccounts();
  }, []);

  useEffect(() => {
    const loadSchedules = async () => {
      if (!selectedAccount) return;
      try {
        // GET /api/scheduled-transactions/account/{fromAccountId}
        const res = await fetchSchedulesByFromAccountAPI(selectedAccount);
        const data = res?.data?.data ?? res?.data ?? {};
        const content = data?.content || data || [];
        setSchedules(content);
        if (content[0]?.scheduleId || content[0]?.id) {
          setScheduleId(content[0].scheduleId || content[0].id);
        }
      } catch {
        setSchedules([]);
      }
    };
    loadSchedules();
  }, [selectedAccount]);

  const handleLoad = async (e) => {
    e.preventDefault();
    if (!scheduleId) return;
    try {
      setLoading(true);
      // GET /api/scheduled-transfer-runs/schedule/{scheduleId}
      const res = await fetchRunsByScheduleAPI(scheduleId);
      const data = res?.data?.data ?? res?.data ?? [];
      setRuns(data);
    } catch {
      setRuns([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.card}>
        <header className={styles.header}>
          <h2 className={styles.title}>예약 실행 로그</h2>
          <p className={styles.muted}>예약 이체 실행 이력 조회</p>
        </header>
        <form className={styles.form} onSubmit={handleLoad}>
          <select
            className={styles.input}
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
          >
            {accounts.map((acc) => (
              <option key={acc.accountNum || acc.id} value={acc.accountNum || acc.id}>
                {acc.accountType || "계좌"} · {acc.accountNum || acc.id}
              </option>
            ))}
          </select>
          <select
            className={styles.input}
            value={scheduleId}
            onChange={(e) => setScheduleId(e.target.value)}
          >
            {schedules.map((s) => (
              <option key={s.scheduleId || s.id} value={s.scheduleId || s.id}>
                {s.memo || "예약"} · {s.scheduleId || s.id}
              </option>
            ))}
          </select>
          <button className={styles.button} type="submit">
            {loading ? "조회 중..." : "조회"}
          </button>
        </form>
        <div className={styles.list}>
          {runs.length === 0 ? (
            <p className={styles.muted}>실행 이력이 없습니다.</p>
          ) : (
            runs.map((run) => (
              <div key={run.runId} className={styles.item}>
                <p className={styles.label}>{run.result}</p>
                <p className={styles.meta}>{run.executedAt}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default ScheduleRunPage;
