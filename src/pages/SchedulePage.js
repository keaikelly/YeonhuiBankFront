import styles from './SchedulePage.module.css';

function SchedulePage({ schedules, form, onChange, onSubmit, accounts }) {
  const formatAmount = (value) => `￦${Number(value || 0).toLocaleString()}`;
  return (
    <section className={styles.panel}>
      <div className={styles.sectionTitle}>
        <h2 className={styles.heading}>예약이체 관리</h2>
        <span className={`${styles.pill} ${styles.small}`}>자동 송금</span>
      </div>
      <div className={styles.stack}>
        <div className={styles.scheduleList}>
          {schedules.map((item) => (
            <div key={item.id} className={styles.schedule}>
              <div>
                <p className={styles.title}>{item.memo}</p>
                <p className={styles.time}>
                  {item.day} · {item.from} → {item.to}
                </p>
              </div>
              <p className={styles.amount}>{formatAmount(item.amount)}</p>
            </div>
          ))}
          {schedules.length === 0 ? <p className={styles.muted}>등록된 예약이 없습니다</p> : null}
        </div>
        <form className={styles.formGrid} onSubmit={onSubmit}>
          <label className={styles.field}>
            <span>보내는 계좌</span>
            <select
              className={styles.select}
              value={form.from}
              onChange={(e) => onChange((prev) => ({ ...prev, from: e.target.value }))}
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.id})
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>받는 계좌</span>
            <input
              placeholder="은행/계좌번호"
              value={form.to}
              onChange={(e) => onChange((prev) => ({ ...prev, to: e.target.value }))}
            />
          </label>
          <label className={styles.field}>
            <span>금액</span>
            <input
              type="number"
              placeholder="0"
              value={form.amount}
              onChange={(e) => onChange((prev) => ({ ...prev, amount: e.target.value }))}
            />
          </label>
          <label className={styles.field}>
            <span>메모</span>
            <input
              placeholder="예: 적금, 월세"
              value={form.memo}
              onChange={(e) => onChange((prev) => ({ ...prev, memo: e.target.value }))}
            />
          </label>
          <label className={styles.field}>
            <span>주기</span>
            <select
              className={styles.select}
              value={form.day}
              onChange={(e) => onChange((prev) => ({ ...prev, day: e.target.value }))}
            >
              <option>매달 1일</option>
              <option>매달 15일</option>
              <option>매달 25일</option>
              <option>매주 월요일</option>
              <option>매주 금요일</option>
            </select>
          </label>
          <button className={styles.primary} type="submit">
            예약이체 등록
          </button>
        </form>
      </div>
    </section>
  );
}

export default SchedulePage;
