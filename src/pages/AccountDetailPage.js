import styles from './AccountDetailPage.module.css';

function AccountDetailPage({ account, transactions, accounts, onSelect }) {
  const formatAmount = (value) => `￦${Number(value || 0).toLocaleString()}`;
  return (
    <section className={styles.panel}>
      <div className={styles.sectionTitle}>
        <h2 className={styles.heading}>계좌 상세</h2>
        <select value={account.id} onChange={(e) => onSelect(e.target.value)} className={styles.select}>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name} ({acc.id})
            </option>
          ))}
        </select>
      </div>
      <div className={styles.stack}>
        <div className={styles.infoCard}>
          <p className={styles.label}>계좌번호</p>
          <p className={styles.subAmount}>{account.id}</p>
          <p className={styles.label}>현재잔액</p>
          <p className={styles.balance}>{formatAmount(account.balance)}</p>
          <p className={styles.label}>이체 한도</p>
          <p className={styles.subAmount}>{formatAmount(account.limit)}</p>
        </div>
        <div className={styles.transactionList}>
          {transactions.map((item) => (
            <div key={item.id} className={styles.transaction}>
              <div>
                <p className={styles.title}>
                  {item.title} <span className={styles.chip}>{item.type}</span>
                </p>
                <p className={styles.time}>
                  {item.datetime} · {item.memo}
                </p>
              </div>
              <p className={`${styles.amount} ${item.amount > 0 ? styles.positive : ''}`}>
                {formatAmount(item.amount)}
              </p>
            </div>
          ))}
          {transactions.length === 0 ? <p className={styles.muted}>거래 내역이 없습니다</p> : null}
        </div>
      </div>
    </section>
  );
}

export default AccountDetailPage;
