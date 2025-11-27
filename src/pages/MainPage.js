import styles from "./MainPage.module.css";

function MainPage({ user, accounts }) {
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const formatAmount = (value) => `￦${Number(value || 0).toLocaleString()}`;

  return (
    <>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>환영합니다</p>
          <h1 className={styles.title}>{user.name}님, 좋은 하루에요</h1>
        </div>
        <span className={styles.pill}>프리미엄</span>
      </header>

      <section className={styles.balanceCard}>
        <div className={styles.balanceRow}>
          <div>
            <p className={styles.label}>총 자산</p>
            <p className={styles.balance}>{formatAmount(totalBalance)}</p>
          </div>
          <span className={styles.trend}>▲ +3.2% 이번 주</span>
        </div>
        <div className={styles.subBalance}>
          {accounts.map((acc) => (
            <div key={acc.id}>
              <p className={styles.label}>
                {acc.name} · {acc.id}
              </p>
              <p className={styles.subAmount}>{formatAmount(acc.balance)}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default MainPage;
