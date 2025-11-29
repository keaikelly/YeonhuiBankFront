// import styles from "./TransferPage.module.css";

// function TransferPage({ form, onChange, onSubmit, accounts, selectedAccount }) {
//   const formatAmount = (value) => `￦${Number(value || 0).toLocaleString()}`;
//   return (
//     <section className={styles.panel}>
//       <div className={styles.sectionTitle}>
//         <div>
//           <h2 className={styles.heading}>이체</h2>
//           <p className={styles.label}>
//             이체 한도 {formatAmount(selectedAccount?.limit || 0)}
//           </p>
//         </div>
//         <span className={`${styles.pill} ${styles.small}`}>즉시/예약</span>
//       </div>
//       <form className={styles.formGrid} onSubmit={onSubmit}>
//         <label className={styles.field}>
//           <span>보내는 계좌</span>
//           <select
//             className={styles.select}
//             value={form.from}
//             onChange={(e) =>
//               onChange((prev) => ({ ...prev, from: e.target.value }))
//             }
//           >
//             {accounts.map((acc) => (
//               <option key={acc.id} value={acc.id}>
//                 {acc.name} ({acc.id})
//               </option>
//             ))}
//           </select>
//         </label>
//         <label className={styles.field}>
//           <span>받는 계좌</span>
//           <input
//             placeholder="은행/계좌번호"
//             value={form.to}
//             onChange={(e) =>
//               onChange((prev) => ({ ...prev, to: e.target.value }))
//             }
//           />
//         </label>
//         <label className={styles.field}>
//           <span>금액</span>
//           <input
//             type="number"
//             placeholder="0"
//             value={form.amount}
//             onChange={(e) =>
//               onChange((prev) => ({ ...prev, amount: e.target.value }))
//             }
//           />
//         </label>
//         <label className={styles.field}>
//           <span>메모</span>
//           <input
//             placeholder="예: 점심값"
//             value={form.memo}
//             onChange={(e) =>
//               onChange((prev) => ({ ...prev, memo: e.target.value }))
//             }
//           />
//         </label>
//         <button className={styles.primary} type="submit">
//           이체하기
//         </button>
//       </form>
//     </section>
//   );
// }

// export default TransferPage;
// src/pages/TransferPage.js
import styles from "./TransferPage.module.css";

function TransferPage({ form, onChange, onSubmit, accounts, selectedAccount }) {
  const formatAmount = (value) =>
    `￦${Number(value || 0).toLocaleString()}`;

  return (
    <section className={styles.panel}>
      <div className={styles.sectionTitle}>
        <div>
          <h2 className={styles.heading}>이체</h2>
          <p className={styles.label}>
            이체 한도 {formatAmount(selectedAccount?.limit || 0)}
          </p>
        </div>
        <span className={`${styles.pill} ${styles.small}`}>즉시/예약</span>
      </div>

      <form className={styles.formGrid} onSubmit={onSubmit}>
        {/* 보내는 계좌 */}
        <label className={styles.field}>
          <span>보내는 계좌</span>
          <select
            className={styles.select}
            value={form.fromAccountNum}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                fromAccountNum: e.target.value,
              }))
            }
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.id})
              </option>
            ))}
          </select>
        </label>

        {/* 받는 계좌 */}
        <label className={styles.field}>
          <span>받는 계좌</span>
          <input
            placeholder="은행/계좌번호"
            value={form.toAccountNum}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                toAccountNum: e.target.value,
              }))
            }
          />
        </label>

        {/* 금액 */}
        <label className={styles.field}>
          <span>금액</span>
          <input
            type="number"
            placeholder="0"
            value={form.amount}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                amount: e.target.value,
              }))
            }
          />
        </label>

        {/* 메모 */}
        <label className={styles.field}>
          <span>메모</span>
          <input
            placeholder="예: 점심값"
            value={form.memo}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                memo: e.target.value,
              }))
            }
          />
        </label>

        <button className={styles.primary} type="submit">
          이체하기
        </button>
      </form>
    </section>
  );
}

export default TransferPage;
