import { useEffect, useState } from "react";
import { fetchMyAccountsAPI } from "../api/accounts";
import {
  depositAPI,
  withdrawAPI,
  fetchSentTransactionsAPI,
  fetchReceivedTransactionsAPI,
} from "../api/transfers";
import styles from "./VirtualATMPage.module.css";

const VirtualATMPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [type, setType] = useState("DEPOSIT"); // DEPOSIT | WITHDRAW
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);

  // ============================================
  // 1. 계좌 불러오기
  // ============================================
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchMyAccountsAPI({ page: 0, size: 10, sort: "" });
        const data = res?.data?.data ?? res?.data ?? {};
        const content = data?.content || [];

        console.log("📌 불러온 계좌 목록:", content);

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

  useEffect(() => {
    console.log("👉 현재 선택된 계좌:", currentAccount);
  }, [currentAccount]);

  // ============================================
  // 2. 거래 내역 불러오기
  // ============================================
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
    if (selectedAccountId) loadHistory(selectedAccountId);
  }, [selectedAccountId]);

  // ============================================
  // 3. 입금 / 출금 실행
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentAccount) return alert("계좌를 선택하세요.");
    if (!amount || Number(amount) <= 0) return alert("금액을 입력하세요.");

    const amt = Number(amount);

    try {
      if (type === "DEPOSIT") {
        const payload = {
          toAccountNum: String(currentAccount.accountNum),
          amount: amt,
          memo,
        };

        console.log("📤 입금 요청:", payload);
        await depositAPI(payload);
      } else {
        const payload = {
          fromAccountNum: String(currentAccount.accountNum),
          amount: amt,
          memo,
        };

        console.log("📤 출금 요청:", payload);
        await withdrawAPI(payload);
      }

      alert("가상 ATM 거래가 완료되었습니다.");
      setAmount("");
      setMemo("");

      await loadHistory(currentAccount.accountId);
    } catch (e) {
      console.error("❌ ATM 오류:", e?.response?.data);

      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.result ||
        "요청 처리에 실패했습니다.";

      alert(msg);
    }
  };

  const formatAmount = (v) => `￦${Number(v || 0).toLocaleString()}`;

  // ============================================
  // 4. UI
  // ============================================
  return (
    <section className={styles.panel}>
      <div className={styles.sectionTitle}>
        <h2 className={styles.heading}>가상 입출금(ATM)</h2>
      </div>

      {/* ================== 입력 폼 ================== */}
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

        {currentAccount && (
          <p style={{ fontSize: "12px", color: "#777" }}>
            송금에 사용되는 실제 계좌번호: {currentAccount.accountNum}
          </p>
        )}

        <label className={styles.field}>
          <span className={styles.label}>유형</span>
          <select
            className={styles.select}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="DEPOSIT">입금</option>
            <option value="WITHDRAW">출금</option>
          </select>
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
            placeholder="예: 테스트 입금, 테스트 출금"
          />
        </label>

        <button
          className={styles.primary}
          type="submit"
          disabled={!currentAccount || !amount}
        >
          {type === "DEPOSIT" ? "입금 실행" : "출금 실행"}
        </button>
      </form>

      {/* ================== 거래 내역 ================== */}
      <div className={styles.historySection}>
        <p className={styles.label}>최근 보낸 거래</p>
        <div className={styles.historyList}>
          {sent.length > 0 ? (
            sent.map((tx) => (
              <div key={tx.transactionId} className={styles.historyItem}>
                <span className={styles.historyTitle}>
                  출금 · {formatAmount(tx.amount)}
                </span>
                <span className={styles.historyMeta}>{tx.createdAt}</span>
              </div>
            ))
          ) : (
            <p className={styles.muted}>보낸 거래가 없습니다.</p>
          )}
        </div>

        <p className={styles.label}>최근 받은 거래</p>
        <div className={styles.historyList}>
          {received.length > 0 ? (
            received.map((tx) => (
              <div key={tx.transactionId} className={styles.historyItem}>
                <span className={styles.historyTitle}>
                  입금 · {formatAmount(tx.amount)}
                </span>
                <span className={styles.historyMeta}>{tx.createdAt}</span>
              </div>
            ))
          ) : (
            <p className={styles.muted}>받은 거래가 없습니다.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default VirtualATMPage;
