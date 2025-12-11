import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAccountAPI } from "../api/accounts";
import styles from "./AccountCreatePage.module.css";

function AccountCreatePage() {
  const navigate = useNavigate();
  const [accountNum, setAccountNum] = useState("");
  const [accountType, setAccountType] = useState("NORMAL");
  const [initialBalance, setInitialBalance] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accountNum) {
      window.alert("계좌번호를 입력하세요.");
      return;
    }
    try {
      setLoading(true);
      // POST /api/accounts : 계좌 생성
      await createAccountAPI({
        accountNum,
        accountType,
        initialBalance: Number(initialBalance || 0),
      });
      window.alert("계좌가 생성되었습니다.");
      // 생성 직후 이체 한도 설정 페이지로 이동
      navigate("/limits");
    } catch (err) {
      window.alert("계좌 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.card}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>계좌 개설</p>
          <h2 className={styles.title}>새 계좌 만들기</h2>
        </header>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>계좌번호</span>
            <input
              value={accountNum}
              onChange={(e) => setAccountNum(e.target.value)}
              placeholder="예: 112-000-000000"
            />
          </label>
          {/* <label className={styles.field}>
            <span>계좌 유형</span>
            <select value={accountType} onChange={(e) => setAccountType(e.target.value)}>
              <option value="NORMAL">입출금</option>
              <option value="SAVING">저축</option>
              <option value="EMERGENCY">비상금</option>
            </select>
          </label> */}
          <label className={styles.field}>
            <span>초기 잔액</span>
            <input
              type="number"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              placeholder="0"
            />
          </label>
          <button className={styles.primary} type="submit" disabled={loading}>
            {loading ? "생성 중..." : "계좌 개설"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default AccountCreatePage;
