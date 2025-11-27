import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyInfoAPI } from "../api/user";
import { fetchMyAccountsAPI } from "../api/accounts";
import styles from "./MainPage.module.css";

function MainPage() {
  const [profileName, setProfileName] = useState("");
  const [accounts, setAccounts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // GET /api/users/me : 이름 조회
        const res = await fetchMyInfoAPI();
        const data = res?.data?.data ?? res?.data ?? {};
        if (data?.name) {
          setProfileName(data.name);
        }
      } catch (err) {
        // ignore if not logged in
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        // GET /api/accounts/me : 내 계좌 목록 조회
        const res = await fetchMyAccountsAPI();
        const data = res?.data?.data ?? res?.data ?? {};
        const content = data?.content || data?.data?.content || [];
        setAccounts(content);
      } catch (err) {
        setAccounts([]);
      }
    };
    loadAccounts();
  }, []);

  const totalBalance = useMemo(
    () => accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0),
    [accounts]
  );
  const formatAmount = (value) => `￦${Number(value || 0).toLocaleString()}`;
  const hasAccount = accounts.length > 0;

  return (
    <>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>환영합니다</p>
          <h1 className={styles.title}>
            {profileName ? `${profileName}님, 좋은 하루에요` : "계정을 연동하세요"}
          </h1>
        </div>
        <span className={styles.pill}>프리미엄</span>
      </header>

      <section className={styles.balanceCard}>
        <div className={styles.balanceRow}>
          <div>
            <p className={styles.label}>총 자산</p>
            <p className={styles.balance}>{formatAmount(totalBalance)}</p>
          </div>
          <span className={styles.trend}>
            {hasAccount ? "▲ +3.2% 이번 주" : "연동 후 표시"}
          </span>
        </div>
        <div className={styles.accountList}>
          {hasAccount ? (
            accounts.map((acc) => (
              <button
                key={acc.accountNum || acc.id}
                className={styles.accountCard}
                onClick={() => navigate(`/account/${acc.accountNum || acc.id}`)}
              >
                <p className={styles.label}>
                  {acc.accountType || "계좌"} · {acc.accountNum || acc.id}
                </p>
                <p className={styles.subAmount}>{formatAmount(acc.balance)}</p>
                <div className={styles.cardActions}>
                  <span
                    className={styles.actionChip}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/transfer/${acc.accountNum || acc.id}`);
                    }}
                  >
                    이체
                  </span>
                  <span
                    className={styles.actionChip}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/schedule/${acc.accountNum || acc.id}`);
                    }}
                  >
                    예약이체
                  </span>
                </div>
              </button>
            ))
          ) : (
            <p className={styles.label}>계좌를 연동하면 잔액이 표시됩니다.</p>
          )}
        </div>
      </section>
    </>
  );
}

export default MainPage;
