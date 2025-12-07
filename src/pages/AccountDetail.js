import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchAccountAPI } from "../api/accounts";
import { fetchLogsByAccountAPI } from "../api/logs";
import { fetchSchedulesByFromAccountAPI } from "../api/scheduledTransactions";
import styles from "./AccountDetail.module.css";
import { fetchActiveLimitsAPI } from "../api/transferLimits";

function AccountDetail() {
  const { accountNum } = useParams(); // URL에서 계좌번호 받기
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        // 계좌 정보 불러오기
        const res = await fetchAccountAPI(accountNum);
        const data = res?.data?.data ?? res?.data ?? {};

        const mappedAccount = {
          id: data.accountId || data.id,
          accountNum: data.accountNum,
          balance: data.balance || 0,
          limit: data.dailyLimitAmt || 0,
        };

        setAccount(mappedAccount);

        try {
          //  계좌별 로그 조회 API: GET /api/logs/account/{accountNum}
          const txRes = await fetchLogsByAccountAPI(accountNum, {
            page: 0,
            size: 50,
            sort: "",
          });
          const txData = txRes?.data?.data ?? txRes?.data ?? {};
          const txContent = txData?.content || txData || [];
          const mappedTransactions = txContent.map((log) => ({
            id: log.logId || log.id,
            title: log.action || "거래",
            type: log.action || "",
            datetime: log.createdAt || "",
            beforeBalance: Number(log.beforeBalance ?? 0),
            afterBalance: Number(log.afterBalance ?? 0),
          }));
          setTransactions(mappedTransactions);
        } catch {
          setTransactions([]);
        }

        // 📘 계좌 기준 예약이체 목록 조회 API:
        // GET /api/scheduled-transactions/account/{fromAccountId}
        try {
          if (mappedAccount.id) {
            const schRes = await fetchSchedulesByFromAccountAPI(
              mappedAccount.id,
              0,
              10,
              ["createdAt,desc"]
            );
            const schData = schRes?.data?.data ?? schRes?.data ?? {};
            const schContent = schData?.content || schData || [];
            setSchedules(schContent);
          } else {
            setSchedules([]);
          }
        } catch {
          setSchedules([]);
        }
      } catch {
        setAccount(null);
      }
    };
    if (accountNum) load();
  }, [accountNum]);

  const formatAmount = (value) => `￦${Number(value || 0).toLocaleString()}`;
  const formatDateTime = (v) => {
    if (!v) return "-";
    const d = v.slice(0, 10).replace(/-/g, ".");
    const t = v.slice(11, 16);
    return `${d} ${t}`;
  };
  const formatAction = (action) => {
    if (!action) return "";
    switch (action) {
      case "DEPOSIT":
        return "입금";
      case "WITHDRAW":
        return "출금";
      case "TRANSFER_CREDIT":
        return "입금(이체 수신)";
      case "TRANSFER_DEBIT":
        return "출금(이체 발신)";
      case "FRAUD":
        return "이상거래";
      case "ADJUST":
        return "정정/조정";
      default:
        return action;
    }
  };

  if (!account) return null;

  return (
    <section className={styles.panel}>
      <div className={styles.sectionTitle}>
        <h2 className={styles.heading}>계좌 상세</h2>
      </div>

      <div className={styles.stack}>
        <div className={styles.infoCard}>
          <p className={styles.label}>계좌번호</p>
          <p className={styles.subAmount}>{account.accountNum}</p>
          <p className={styles.label}>현재잔액</p>
          <p className={styles.balance}>{formatAmount(account.balance)}</p>
          <p className={styles.label}>하루 이체 한도</p>
          <p className={styles.subAmount}>{formatAmount(account.limit)}</p>
        </div>

        {/* 거래 내역 */}
        <div className={styles.transactionList}>
          {transactions.map((item) => (
            <div key={item.id} className={styles.transaction}>
              <div>
                <p className={styles.title}>
                  {formatAction(item.type)}{" "}
                  {/* <span className={styles.chip}>
                    {formatAmount(item.afterBalance - item.beforeBalance)}
                  </span> */}
                </p>
                <p className={styles.time}>
                  {formatDateTime(item.datetime)} · 잔액{" "}
                  {formatAmount(item.afterBalance)}
                </p>
              </div>
              <p
                className={`${styles.amount} ${
                  item.afterBalance - item.beforeBalance > 0
                    ? styles.positive
                    : item.afterBalance - item.beforeBalance < 0
                    ? styles.negative
                    : ""
                }`}
              >
                {formatAmount(item.afterBalance - item.beforeBalance)}
              </p>
            </div>
          ))}

          {transactions.length === 0 && (
            <p className={styles.muted}>거래 내역이 없습니다</p>
          )}
        </div>

        {/* 예약이체 내역 */}
        <div className={styles.transactionList}>
          <p className={styles.label}>예약이체</p>
          {schedules.map((item) => (
            <div key={item.scheduleId} className={styles.transaction}>
              <div>
                <p className={styles.title}>
                  {formatAmount(item.amount)}{" "}
                  <span className={styles.chip}>{item.scheduledStatus}</span>
                </p>
                <p className={styles.time}>
                  주기: {item.frequency} · 다음 실행:{" "}
                  {formatDateTime(item.nextRunAt)}
                  {item.memo && <> · 메모: {item.memo}</>}
                </p>
              </div>
            </div>
          ))}

          {schedules.length === 0 && (
            <p className={styles.muted}>이 계좌로 설정된 예약이체가 없습니다</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default AccountDetail;
