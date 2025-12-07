import { useEffect, useState } from "react";
import { fetchMyAccountsAPI } from "../api/accounts";
import {
  createTransferAPI,
  fetchSentTransactionsAPI,
  fetchReceivedTransactionsAPI,
} from "../api/transfers";
import { fetchAbnormalByAccountAPI } from "../api/abnormalTransfers";
import styles from "./TransferPage.module.css";

const TransferPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");

  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");

  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchMyAccountsAPI({
          page: 0,
          size: 10,
          sort: ["createdAt,desc"],
        });
        const data = res?.data?.data ?? res?.data ?? {};
        const content = data?.content || [];
        setAccounts(content);

        if (content[0]?.accountId) {
          setSelectedAccountId(String(content[0].accountId));
        }
      } catch {
        setAccounts([]);
      }
    };
    load();
  }, []);

  const currentAccount = accounts.find(
    (a) => String(a.accountId) === String(selectedAccountId)
  );

  const loadHistory = async (accountId) => {
    if (!accountId) return;
    try {
      const baseParams = { page: 0, size: 10, sort: "" };

      const sentRes = await fetchSentTransactionsAPI({
        ...baseParams,
        fromAccountId: Number(accountId),
      });
      const sentData = sentRes?.data?.data ?? sentRes?.data ?? {};
      setSent(sentData?.content || []);

      const recvRes = await fetchReceivedTransactionsAPI({
        ...baseParams,
        toAccountId: Number(accountId),
      });
      const recvData = recvRes?.data?.data ?? recvRes?.data ?? {};
      setReceived(recvData?.content || []);
    } catch {
      setSent([]);
      setReceived([]);
    }
  };

  useEffect(() => {
    if (selectedAccountId) {
      loadHistory(selectedAccountId);
    }
  }, [selectedAccountId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentAccount) {
      window.alert("계좌를 선택하세요.");
      return;
    }
    if (!toAccount) {
      window.alert("받는 계좌번호를 입력하세요.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      window.alert("금액을 입력하세요.");
      return;
    }

    const baseAmount = Number(amount || 0);

    try {
      const payload = {
        fromAccountNum: currentAccount.accountNum,
        toAccountNum: toAccount,
        amount: baseAmount,
        memo,
      };
      await createTransferAPI(payload);

      try {
        const res = await fetchAbnormalByAccountAPI(currentAccount.accountNum);
        const data = res?.data?.data ?? res?.data ?? [];
        if (Array.isArray(data) && data.length > 0) {
          window.alert(`이상거래 알림 ${data.length}건이 감지되었습니다.`);
        }
      } catch {
        // ignore
      }

      window.alert("처리가 완료되었습니다.");
      setAmount("");
      setMemo("");
      setToAccount("");
      await loadHistory(currentAccount.accountId);
    } catch {
      window.alert("요청 처리에 실패했습니다.");
    }
  };

  const formatAmount = (v) => `￦${Number(v || 0).toLocaleString()}`;

  return (
    <section className={styles.panel}>
      <div className={styles.sectionTitle}>
        <h2 className={styles.heading}>이체</h2>
        {/* <span className={styles.pill}>실제 계좌로 연동된 화면</span> */}
      </div>

      <form className={styles.formGrid} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span className={styles.label}>내 계좌</span>
          <select
            className={styles.select}
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
          >
            {accounts.map((acc) => (
              <option key={acc.accountId} value={String(acc.accountId)}>
                {acc.accountNum} ({formatAmount(acc.balance)})
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>받는 계좌번호</span>
          <input
            className={styles.select}
            value={toAccount}
            onChange={(e) => setToAccount(e.target.value)}
            placeholder="은행/계좌번호"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>금액</span>
          <input
            type="number"
            className={styles.select}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>메모</span>
          <input
            className={styles.select}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="예: 점심값, 월세"
          />
        </label>

        <button
          className={styles.primary}
          type="submit"
          disabled={!currentAccount || !amount || !toAccount}
        >
          이체 실행
        </button>
      </form>

      <div className={styles.historySection}>
        <p className={styles.label}>최근 보낸 거래</p>
        <div className={styles.historyList}>
          {sent.map((tx) => (
            <div key={tx.transactionId} className={styles.historyItem}>
              <span className={styles.historyTitle}>
                출금 · {formatAmount(tx.amount)}
              </span>
              <span className={styles.historyMeta}>{tx.createdAt}</span>
            </div>
          ))}
          {sent.length === 0 && (
            <p className={styles.muted}>보낸 거래가 없습니다.</p>
          )}
        </div>

        <p className={styles.label}>최근 받은 거래</p>
        <div className={styles.historyList}>
          {received.map((tx) => (
            <div key={tx.transactionId} className={styles.historyItem}>
              <span className={styles.historyTitle}>
                입금 · {formatAmount(tx.amount)}
              </span>
              <span className={styles.historyMeta}>{tx.createdAt}</span>
            </div>
          ))}
          {received.length === 0 && (
            <p className={styles.muted}>받은 거래가 없습니다.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default TransferPage;
