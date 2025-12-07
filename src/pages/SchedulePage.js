import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./SchedulePage.module.css";

import {
  createScheduleAPI,
  resumeScheduleAPI,
  pauseScheduleAPI,
  fetchScheduleDetailAPI,
  cancelScheduleAPI,
  updateScheduleAPI,
  runNowScheduleAPI,
  fetchMySchedulesAPI,
  fetchMySchedulesByStatusAPI,
} from "../api/scheduledTransactions";
import { fetchRunsByScheduleAPI } from "../api/scheduledTransferRuns";
import { fetchMyAccountsAPI } from "../api/accounts";

function ScheduleContainer() {
  const { accountId } = useParams();

  const [accounts, setAccounts] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // === 수정 모달 ===
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);

  // === 실행 로그 모달 ===
  const [showRunModal, setShowRunModal] = useState(false);
  const [runLogs, setRunLogs] = useState([]);

  // -----------------------------------------
  // 생성 폼
  // -----------------------------------------
  const [form, setForm] = useState({
    from: "",
    to: "",
    amount: "",
    memo: "",
    frequency: "WEEKLY",
    weekday: "MO",
    monthday: 1,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
    time: "08:00",
  });

  // -----------------------------------------
  // RRULE 생성 (생성 시에만 사용)
  // -----------------------------------------
  const buildRRule = (f) => {
    if (f.frequency === "DAILY") return "FREQ=DAILY";
    if (f.frequency === "WEEKLY") return `FREQ=WEEKLY;BYDAY=${f.weekday}`;
    if (f.frequency === "MONTHLY")
      return `FREQ=MONTHLY;BYMONTHDAY=${f.monthday}`;
    return null;
  };

  // -----------------------------------------
  // 공통: 모달 열 때 스크롤을 맨 위로
  // -----------------------------------------
  const scrollFrameToTop = () => {
    const frame = document.querySelector(".phone-frame");
    if (frame) {
      frame.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // -----------------------------------------
  // 계좌 목록 로드
  // -----------------------------------------
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const res = await fetchMyAccountsAPI();
        const data = res?.data?.data ?? {};
        const list = Array.isArray(data.content) ? data.content : [];

        setAccounts(list);

        const initial = accountId || String(list[0]?.accountId || "");
        setForm((prev) => ({ ...prev, from: initial }));
      } catch (e) {
        console.error(e);
      }
    };
    loadAccounts();
  }, [accountId]);

  // -----------------------------------------
  // 예약 목록 로드 (상태별 서버에서 조회)
  // -----------------------------------------
  const loadSchedules = async () => {
    try {
      let list = [];

      if (statusFilter === "ALL") {
        const res = await fetchMySchedulesAPI(0, 50, ["createdAt,desc"]);
        list = res?.data?.data?.content ?? [];
      } else {
        const res = await fetchMySchedulesByStatusAPI(statusFilter, {
          page: 0,
          size: 50,
          sort: ["createdAt,desc"],
        });
        list = res?.data?.data?.content ?? [];
      }

      setSchedules(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, [statusFilter]);

  // -----------------------------------------
  // 예약 생성
  // -----------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const fromAcc = accounts.find((a) => String(a.accountId) === form.from);
      if (!fromAcc) return alert("보내는 계좌 오류");

      const rrule = buildRRule(form);
      const runTime = `${form.time}:00`;

      await createScheduleAPI({
        fromAccountId: fromAcc.accountId,
        toAccountId: Number(form.to),
        amount: Number(form.amount),
        frequency: form.frequency,
        startDate: form.startDate,
        endDate: form.endDate || null,
        runTime,
        rrule,
        memo: form.memo,
      });

      alert("예약 등록 완료");
      setShowCreateModal(false);
      await loadSchedules();
    } catch (e) {
      console.error(e);
      alert("예약 생성 실패");
    }
  };

  // -----------------------------------------
  // 수정 버튼 → 모달 열기
  // -----------------------------------------
  const handleEdit = async (scheduleId) => {
    try {
      scrollFrameToTop();

      const res = await fetchScheduleDetailAPI(scheduleId);
      const data = res?.data?.data;
      if (!data) return alert("수정 정보를 불러오지 못했습니다.");

      setEditData({
        scheduleId,
        amount: data.amount,
        memo: data.memo,
        frequency: data.frequency,
        startDate: data.startDate?.slice(0, 10),
        endDate: data.endDate ? data.endDate.slice(0, 10) : "",
      });

      setShowEditModal(true);
    } catch (e) {
      console.error(e);
      alert("불러오기 실패");
    }
  };

  // -----------------------------------------
  // 수정 저장
  // -----------------------------------------
  const handleSaveEdit = async () => {
    try {
      await updateScheduleAPI(
        editData.scheduleId,
        Number(editData.amount),
        editData.frequency,
        editData.startDate,
        editData.endDate || null,
        editData.memo
      );

      alert("수정 완료");
      setShowEditModal(false);
      await loadSchedules();
    } catch (e) {
      console.error(e);
      alert("수정 실패");
    }
  };

  // -----------------------------------------
  // 기타 기능
  // -----------------------------------------
  const handlePause = async (id) => {
    await pauseScheduleAPI(id);
    alert("일시정지됨");
    await loadSchedules();
  };

  const handleResume = async (id) => {
    await resumeScheduleAPI(id);
    alert("재개됨");
    await loadSchedules();
  };

  const handleCancel = async (id) => {
    if (!window.confirm("취소할까요?")) return;
    await cancelScheduleAPI(id);
    alert("취소됨");
    await loadSchedules();
  };

  // -----------------------------------------
  // 즉시 실행
  // -----------------------------------------
  const handleRunNow = async (id) => {
    try {
      await runNowScheduleAPI(id);
      alert("예약이체를 즉시 실행했습니다.");
      await loadSchedules();
    } catch (e) {
      console.error(e);
      alert("즉시 실행에 실패했습니다.");
    }
  };

  // ---------------------------
  // 실행 로그 보기 (예약이체 로그)
  // ---------------------------
  const handleViewRuns = async (scheduleId) => {
    try {
      scrollFrameToTop();

      const res = await fetchRunsByScheduleAPI(scheduleId);
      const data = res?.data?.data ?? res?.data ?? [];
      const list = Array.isArray(data) ? data : [];
      setRunLogs(list);
      setShowRunModal(true);
    } catch (e) {
      console.error(e);
      alert("예약 실행 로그를 불러오지 못했습니다.");
    }
  };

  const formatAmount = (v) => `₩${Number(v).toLocaleString()}`;
  const formatDateTime = (v) =>
    v ? `${v.slice(0, 10)} ${v.slice(11, 16)}` : "-";

  // -----------------------------------------
  // 화면
  // -----------------------------------------
  return (
    <>
      <section className={styles.panel}>
        <div className={styles.sectionTitle}>
          <h2 className={styles.heading}>예약이체 관리</h2>

          <select
            className={styles.select}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ACTIVE">진행중만</option>
            <option value="ALL">전체</option>
          </select>
        </div>

        {/* 예약 리스트 */}
        <div className={styles.scheduleList}>
          {schedules.map((item) => {
            const fromAcc = accounts.find(
              (a) => Number(a.accountId) === Number(item.fromAccountId)
            );
            const fromLabel = fromAcc
              ? fromAcc.accountNum
              : `계좌ID ${item.fromAccountId}`;

            return (
              <div key={item.scheduleId} className={styles.schedule}>
                <div>
                  <p className={styles.title}>{formatAmount(item.amount)}</p>
                  <p className={styles.time}>
                    {fromLabel} → {item.toAccountId} (ID)
                    <br />
                    상태: {item.scheduledStatus} / {item.frequency}
                    <br />
                    다음 실행: {formatDateTime(item.nextRunAt)}
                    {item.memo && (
                      <span className={styles.muted}>메모: {item.memo}</span>
                    )}
                  </p>
                </div>

                <div className={styles.buttonGroup}>
                  <button
                    className={styles.smallButton}
                    onClick={() => handleEdit(item.scheduleId)}
                  >
                    수정
                  </button>

                  {item.scheduledStatus === "ACTIVE" && (
                    <button
                      className={styles.smallButton}
                      onClick={() => handlePause(item.scheduleId)}
                    >
                      일시정지
                    </button>
                  )}

                  {item.scheduledStatus === "PAUSED" && (
                    <button
                      className={styles.smallButton}
                      onClick={() => handleResume(item.scheduleId)}
                    >
                      재개
                    </button>
                  )}

                  <button
                    className={styles.smallButton}
                    onClick={() => handleCancel(item.scheduleId)}
                  >
                    취소
                  </button>

                  <button
                    className={styles.smallButton}
                    onClick={() => handleRunNow(item.scheduleId)}
                  >
                    즉시 실행
                  </button>

                  <button
                    className={styles.smallButton}
                    onClick={() => handleViewRuns(item.scheduleId)}
                  >
                    실행 로그
                  </button>
                </div>
              </div>
            );
          })}

          {schedules.length === 0 && (
            <p className={styles.muted}>등록된 예약이 없습니다.</p>
          )}
        </div>

        <button
          className={styles.primary}
          onClick={() => {
            scrollFrameToTop();
            setShowCreateModal(true);
          }}
        >
          새 예약 만들기
        </button>
      </section>

      {/* 새 예약 생성 모달 */}
      {showCreateModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>새 예약이체 등록</h3>
            <p className={styles.modalDesc}>
              보내는 계좌, 받는 계좌 ID, 금액과 주기를 입력해 자동 이체를
              설정하세요.
            </p>

            <form className={styles.formGrid} onSubmit={handleSubmit}>
              <label className={styles.field}>
                <span>보내는 계좌</span>
                <select
                  className={styles.select}
                  value={form.from}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, from: e.target.value }))
                  }
                >
                  {accounts.map((a) => (
                    <option key={a.accountId} value={String(a.accountId)}>
                      {a.accountNum}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.field}>
                <span>받는 계좌 accountId</span>
                <input
                  className={styles.select}
                  placeholder="예: 12"
                  value={form.to}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, to: e.target.value }))
                  }
                />
              </label>

              <label className={styles.field}>
                <span>금액</span>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, amount: e.target.value }))
                  }
                />
              </label>

              <label className={styles.field}>
                <span>메모</span>
                <input
                  value={form.memo}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, memo: e.target.value }))
                  }
                />
              </label>

              <label className={styles.field}>
                <span>주기</span>
                <select
                  className={styles.select}
                  value={form.frequency}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      frequency: e.target.value,
                    }))
                  }
                >
                  <option value="DAILY">매일</option>
                  <option value="WEEKLY">매주</option>
                  <option value="MONTHLY">매월</option>
                </select>
              </label>

              <label className={styles.field}>
                <span>시작일</span>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                />
              </label>

              <label className={styles.field}>
                <span>종료일(선택)</span>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                />
              </label>

              <label className={styles.field}>
                <span>실행 시간</span>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, time: e.target.value }))
                  }
                />
              </label>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.smallButton}
                  onClick={() => setShowCreateModal(false)}
                >
                  닫기
                </button>
                <button className={styles.primary} type="submit">
                  예약이체 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 수정 모달 */}
      {showEditModal && editData && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>예약 수정</h3>

            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>금액</span>
                <input
                  type="number"
                  value={editData.amount}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, amount: e.target.value }))
                  }
                />
              </label>

              <label className={styles.field}>
                <span>메모</span>
                <input
                  value={editData.memo}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, memo: e.target.value }))
                  }
                />
              </label>

              <label className={styles.field}>
                <span>주기</span>
                <select
                  className={styles.select}
                  value={editData.frequency}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      frequency: e.target.value,
                    }))
                  }
                >
                  <option value="DAILY">매일</option>
                  <option value="WEEKLY">매주</option>
                  <option value="MONTHLY">매월</option>
                  <option value="ONCE">1회</option>
                </select>
              </label>

              <label className={styles.field}>
                <span>시작일</span>
                <input
                  type="date"
                  value={editData.startDate}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                />
              </label>

              <label className={styles.field}>
                <span>종료일</span>
                <input
                  type="date"
                  value={editData.endDate}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.smallButton}
                onClick={() => setShowEditModal(false)}
              >
                닫기
              </button>
              <button className={styles.primary} onClick={handleSaveEdit}>
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 실행 로그 모달 */}
      {showRunModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>예약 실행 로그</h3>
            <p className={styles.modalDesc}>
              선택한 예약이체에 대해 실행된 이력입니다.
            </p>

            <div className={styles.runList}>
              {runLogs.length === 0 ? (
                <p className={styles.muted}>실행 이력이 없습니다.</p>
              ) : (
                runLogs.map((run) => (
                  <div key={run.runId} className={styles.runItem}>
                    <div className={styles.runHeader}>
                      <span className={styles.runResult}>{run.result}</span>
                      <span className={styles.runTime}>{run.executedAt}</span>
                    </div>
                    {run.message && (
                      <p className={styles.runMessage}>{run.message}</p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.smallButton}
                onClick={() => setShowRunModal(false)}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ScheduleContainer;
