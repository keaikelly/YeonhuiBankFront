import { useEffect, useState } from "react";
import {
  createOrUpdateLimitAPI,
  updateLimitEndDateAPI,
  fetchLimitHistoryAPI,
  fetchActiveLimitsAPI,
} from "../api/transferLimits";
import { fetchMyAccountsAPI } from "../api/accounts";
import styles from "./TransferLimitPage.module.css";

function TransferLimitPage() {
  const [accounts, setAccounts] = useState([]);
  const [accountNum, setAccountNum] = useState("");
  const [activeLimits, setActiveLimits] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [targetLimitId, setTargetLimitId] = useState(null);
  const [endDateInput, setEndDateInput] = useState("");

  const [form, setForm] = useState({
    dailyLimitAmt: "",
    perTxLimitAmt: "",
    note: "",
  });

  // 💡 날짜 포맷 변환
  const formatAmount = (value) => `￦${Number(value || 0).toLocaleString()}`;
  const formatDate = (value, { allowEmptyLabel } = {}) => {
    if (!value) return allowEmptyLabel ? "무기한" : "-";
    return String(value).slice(0, 10).replace(/-/g, ".");
  };
  const convertToLocalDateTime = (dateStr) => {
    if (!dateStr) return null;
    return `${dateStr}T23:59:59`;
  };

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const res = await fetchMyAccountsAPI();
        const data = res?.data?.data ?? res?.data ?? {};
        const content = data?.content || [];
        setAccounts(content);
      } catch {
        setAccounts([]);
      }
    };
    loadAccounts();
  }, []);

  const handleLoad = async (e) => {
    if (e) e.preventDefault();
    if (!accountNum) return;
    try {
      setLoading(true);
      setHasSearched(true);

      const activeRes = await fetchActiveLimitsAPI(accountNum);
      const activeData = activeRes?.data?.data ?? activeRes?.data ?? {};
      const activeContent = activeData?.content || activeData || [];
      setActiveLimits(Array.isArray(activeContent) ? activeContent : []);

      const histRes = await fetchLimitHistoryAPI(accountNum);
      const histData = histRes?.data?.data ?? histRes?.data ?? {};
      const histContent = histData?.content || histData || [];
      setHistory(Array.isArray(histContent) ? histContent : []);
    } catch {
      setActiveLimits([]);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLimit = async (e) => {
    e.preventDefault();
    if (!accountNum) {
      window.alert("계좌를 먼저 선택하세요.");
      return;
    }
    try {
      await createOrUpdateLimitAPI(
        accountNum,
        Number(form.dailyLimitAmt || 0),
        Number(form.perTxLimitAmt || 0),
        form.note
      );
      window.alert("이체 한도가 저장되었습니다.");
      setForm({ dailyLimitAmt: "", perTxLimitAmt: "", note: "" });
      setShowModal(false);
      await handleLoad();
    } catch {
      window.alert("이체 한도 저장에 실패했습니다.");
    }
  };

  const handleOpenEndModal = (limit) => {
    setTargetLimitId(limit.limitId);
    setEndDateInput(limit.endDate ? limit.endDate.slice(0, 10) : "");
    setShowEndModal(true);
  };

  const handleUpdateEndDate = async () => {
    const limitId = targetLimitId;
    const endDate = convertToLocalDateTime(endDateInput);
    try {
      await updateLimitEndDateAPI(limitId, endDate);
      window.alert("종료일이 변경되었습니다.");
      setShowEndModal(false);
      await handleLoad();
    } catch (err) {
      console.error("종료일 변경 실패:", err?.response || err);
      window.alert("종료일 변경에 실패했습니다.");
    }
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.card}>
        <header className={styles.header}>
          <h2 className={styles.title}>이체 한도</h2>
          <p className={styles.muted}>
            계좌별 이체 한도를 확인하고 관리할 수 있어요.
          </p>
        </header>

        {/* 📌 한도 조회 */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>한도 조회</h3>
          <p className={styles.sectionDesc}>
            계좌를 선택하고 '조회' 버튼을 눌러 현재 한도를 확인하세요.
          </p>
          <form className={styles.formInline} onSubmit={handleLoad}>
            <select
              className={styles.input}
              value={accountNum}
              onChange={(e) => setAccountNum(e.target.value)}
            >
              <option value="">계좌 선택하기</option>
              {accounts.map((acc) => (
                <option
                  key={acc.accountNum || acc.id}
                  value={acc.accountNum || acc.id}
                >
                  {acc.accountNum || acc.id}
                </option>
              ))}
            </select>
            <button className={styles.button} disabled={!accountNum || loading}>
              {loading ? "조회 중..." : "조회"}
            </button>
          </form>
        </div>

        {/* 📌 활성 한도 */}
        {hasSearched && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>현재 활성 한도</h3>
            <div className={styles.list}>
              {activeLimits.length === 0 ? (
                <p className={styles.muted}>등록된 활성 한도가 없습니다.</p>
              ) : (
                activeLimits.map((l) => (
                  <div key={l.limitId} className={styles.item}>
                    <div className={styles.amountRow}>
                      <span className={styles.amountLabel}>1일 한도</span>
                      <span className={styles.amountValue}>
                        {formatAmount(l.dailyLimitAmt)}
                      </span>
                    </div>
                    <div className={styles.amountRow}>
                      <span className={styles.amountLabel}>1회 한도</span>
                      <span className={styles.amountValue}>
                        {formatAmount(l.perTxLimitAmt)}
                      </span>
                    </div>
                    <p className={styles.meta}>
                      기간 {formatDate(l.startDate)} ~{" "}
                      {formatDate(l.endDate, { allowEmptyLabel: true })}
                    </p>
                    <button
                      className={styles.smallButton}
                      onClick={() => handleOpenEndModal(l)}
                    >
                      종료일 변경
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 📌 한도 이력 */}
        {hasSearched && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>한도 이력</h3>
            <div className={styles.list}>
              {history.length === 0 ? (
                <p className={styles.muted}>한도 이력이 없습니다.</p>
              ) : (
                history.map((h) => (
                  <div
                    key={h.limitId || `${h.startDate}-${h.dailyLimitAmt}`}
                    className={styles.item}
                  >
                    <div className={styles.amountRow}>
                      <span className={styles.amountLabel}>1일 한도</span>
                      <span className={styles.amountValue}>
                        {formatAmount(h.dailyLimitAmt)}
                      </span>
                    </div>
                    <div className={styles.amountRow}>
                      <span className={styles.amountLabel}>1회 한도</span>
                      <span className={styles.amountValue}>
                        {formatAmount(h.perTxLimitAmt)}
                      </span>
                    </div>
                    <p className={styles.meta}>
                      {formatDate(h.startDate)} ~{" "}
                      {formatDate(h.endDate, { allowEmptyLabel: true })}{" "}
                      {h.note && `· ${h.note}`}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 📌 한도 등록/변경 버튼 */}
        {hasSearched && accountNum && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>한도 설정</h3>
            <p className={styles.sectionDesc}>
              선택한 계좌에 대해 새로운 이체 한도를 등록하거나, 기존 한도를
              변경할 수 있어요.
            </p>
            <button
              className={styles.button}
              onClick={() => setShowModal(true)}
            >
              한도 등록 / 변경
            </button>
          </div>
        )}
      </div>

      {/* ✅ 등록/변경 모달 */}
      {showModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>이체 한도 설정</h3>
            <form className={styles.formStack} onSubmit={handleSaveLimit}>
              <input
                className={styles.input}
                placeholder="1일 한도 (예: 1,000,000)"
                value={form.dailyLimitAmt}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    dailyLimitAmt: e.target.value,
                  }))
                }
              />
              <input
                className={styles.input}
                placeholder="1회 한도 (예: 500,000)"
                value={form.perTxLimitAmt}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    perTxLimitAmt: e.target.value,
                  }))
                }
              />
              <input
                className={styles.input}
                placeholder="메모 (선택사항)"
                value={form.note}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, note: e.target.value }))
                }
              />
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => setShowModal(false)}
                >
                  취소
                </button>
                <button className={styles.button} type="submit">
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ 종료일 변경 모달 */}
      {showEndModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>종료일 변경</h3>
            <p className={styles.modalDesc}>
              종료일을 설정하거나 비워두면 <strong>무기한</strong>으로
              적용됩니다.
            </p>
            <form
              className={styles.formStack}
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateEndDate();
              }}
            >
              <input
                className={styles.input}
                type="date"
                value={endDateInput}
                onChange={(e) => setEndDateInput(e.target.value)}
              />
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => setShowEndModal(false)}
                >
                  취소
                </button>
                <button className={styles.button} type="submit">
                  변경하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default TransferLimitPage;
