// src/pages/ScheduleRunPage.js
import { useEffect, useState } from "react";
import { fetchRunsByScheduleAPI } from "../api/scheduledTransferRuns";
import { fetchMyAccountsAPI } from "../api/accounts";
import {
  fetchSchedulesByFromAccountAPI,
} from "../api/scheduledTransactions";
import styles from "./ScheduleRunPage.module.css";

function ScheduleRunPage() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(""); // 🔹 계좌 PK(id) 기준
  const [schedules, setSchedules] = useState([]);
  const [scheduleId, setScheduleId] = useState("");
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1) 내 계좌 목록 불러오기
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        // GET /api/accounts/me
        const res = await fetchMyAccountsAPI();
        const data = res?.data?.data ?? res?.data ?? {};
        const content = data?.content || [];
        setAccounts(content);

        // 🔹 초기 선택 계좌: id 사용
        if (content[0]?.id != null) {
          setSelectedAccountId(String(content[0].id));
        }
      } catch {
        setAccounts([]);
      }
    };
    loadAccounts();
  }, []);

  // 2) 선택한 계좌의 예약이체 목록 불러오기
  useEffect(() => {
    const loadSchedules = async () => {
      if (!selectedAccountId) return;

      try {
        const fromId = Number(selectedAccountId);
        if (Number.isNaN(fromId)) {
          console.warn("fromAccountId가 숫자가 아닙니다:", selectedAccountId);
          setSchedules([]);
          return;
        }

        // GET /api/scheduled-transactions/account/{fromAccountId}
        const res = await fetchSchedulesByFromAccountAPI(fromId);
        const data = res?.data?.data ?? res?.data ?? {};
        const content = data?.content || data || [];
        setSchedules(content);

        if (content[0]?.scheduleId || content[0]?.id) {
          setScheduleId(String(content[0].scheduleId || content[0].id));
        } else {
          setScheduleId("");
        }
      } catch (e) {
        console.error(e);
        setSchedules([]);
      }
    };
    loadSchedules();
  }, [selectedAccountId]);

  // 3) 실행 로그 조회
  const handleLoad = async (e) => {
    e.preventDefault();
    if (!scheduleId) return;
    try {
      setLoading(true);
      // GET /api/scheduled-transfer-runs/schedule/{scheduleId}
      const res = await fetchRunsByScheduleAPI(scheduleId);
      const data = res?.data?.data ?? res?.data ?? [];
      setRuns(data);
    } catch (e) {
      console.error(e);
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
          {/* 계좌 선택: value = id */}
          <select
            className={styles.input}
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={String(acc.id)}>
                {acc.accountType || "계좌"} · {acc.accountNum || acc.id}
              </option>
            ))}
          </select>

          {/* 예약이체 선택: value = scheduleId */}
          <select
            className={styles.input}
            value={scheduleId}
            onChange={(e) => setScheduleId(e.target.value)}
          >
            {schedules.map((s) => (
              <option key={s.scheduleId || s.id} value={String(s.scheduleId || s.id)}>
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
