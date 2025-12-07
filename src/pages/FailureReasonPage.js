import { useState } from "react";
import {
  createFailureReasonAPI,
  fetchFailureReasonAPI,
} from "../api/failureReasons";
import styles from "./FailureReasonPage.module.css";

function FailureReasonPage() {
  const [reasonCode, setReasonCode] = useState("");
  const [description, setDescription] = useState("");
  const [lookupCode, setLookupCode] = useState("");
  const [result, setResult] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!reasonCode || !description) {
      window.alert("코드와 설명을 입력하세요.");
      return;
    }
    try {
      await createFailureReasonAPI({ reasonCode, description });
      window.alert("실패 사유가 등록되었습니다.");
      setReasonCode("");
      setDescription("");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.result ||
        "등록에 실패했습니다.";
      window.alert(msg);
    }
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!lookupCode) {
      window.alert("조회할 코드 값을 입력하세요.");
      return;
    }
    try {
      const res = await fetchFailureReasonAPI(lookupCode);
      const data = res?.data?.data ?? res?.data ?? {};
      setResult(data);
    } catch (err) {
      setResult(null);
      window.alert("코드 정보를 불러오지 못했습니다.");
    }
  };

  return (
    <section className={styles.panel}>
      <div className={styles.sectionTitle}>
        <h2 className={styles.heading}>이체 실패 사유 코드 관리</h2>
      </div>

      {/* 등록 */}
      <form className={styles.formGrid} onSubmit={handleCreate}>
        <label className={styles.field}>
          <span className={styles.label}>코드</span>
          <input
            className={styles.select}
            value={reasonCode}
            onChange={(e) => setReasonCode(e.target.value)}
            placeholder="예: INSUFFICIENT_FUNDS"
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>설명</span>
          <input
            className={styles.select}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="예: 잔액 부족"
          />
        </label>
        <button className={styles.primary} type="submit">
          실패 사유 등록
        </button>
      </form>

      {/* 조회 */}
      <form className={styles.formGrid} onSubmit={handleLookup}>
        <label className={styles.field}>
          <span className={styles.label}>코드 조회</span>
          <input
            className={styles.select}
            value={lookupCode}
            onChange={(e) => setLookupCode(e.target.value)}
            placeholder="예: INSUFFICIENT_FUNDS"
          />
        </label>
        <button className={styles.primary} type="submit">
          코드 조회
        </button>
      </form>

      {result && (
        <div className={styles.infoCard}>
          <p className={styles.label}>코드</p>
          <p className={styles.subAmount}>{result.reasonCode}</p>
          <p className={styles.label}>설명</p>
          <p className={styles.subAmount}>{result.description}</p>
        </div>
      )}
    </section>
  );
}

export default FailureReasonPage;
