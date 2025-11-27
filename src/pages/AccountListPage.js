import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyAccountsAPI } from "../api/accounts";
import styles from "./AccountListPage.module.css";

const formatAmount = (value) => `￦${Number(value || 0).toLocaleString()}`;

function AccountListPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      // GET /api/accounts/me : 내 계좌 목록 조회
      try {
        const res = await fetchMyAccountsAPI();
        const data = res?.data?.data ?? res?.data ?? {};
        const content = data?.content || [];
        setAccounts(content);
      } catch (err) {
        setAccounts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <section className={styles.wrapper}>
        <div className={styles.card}>계좌를 불러오는 중...</div>
      </section>
    );
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.card}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>내 계좌</p>
            <h2 className={styles.title}>계좌 목록</h2>
          </div>
        </header>
        <div className={styles.list}>
          {accounts.length ? (
            accounts.map((acc) => (
              <button
                key={acc.accountNum || acc.id}
                className={styles.item}
                onClick={() => navigate(`/account/${acc.accountNum || acc.id}`)}
              >
                <div>
                  <p className={styles.label}>
                    {acc.accountType || "계좌"} · {acc.accountNum || acc.id}
                  </p>
                  <p className={styles.meta}>{acc.createdAt || ""}</p>
                </div>
                <p className={styles.amount}>{formatAmount(acc.balance)}</p>
              </button>
            ))
          ) : (
            <p className={styles.empty}>계좌가 없습니다.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default AccountListPage;
