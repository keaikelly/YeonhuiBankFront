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

  // 수정 모달
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);

  // 실행 로그 모달
  const [showRunModal, setShowRunModal] = useState(false);
  const [runLogs, setRunLogs] = useState([]);
  // 프론트에서 즉시실행(run-now) 시 발생한 실패 메시지를 임시 실행로그로 보관
  const [localRunErrors, setLocalRunErrors] = useState({});

  // -----------------------------
  // 생성 폼 상태
  // -----------------------------
  const [form, setForm] = useState({
    from: "",
    to: "",
    amount: "",
    memo: "",

    // DAILY / WEEKLY / MONTHLY / CUSTOM / ONCE
    frequency: "WEEKLY",
    weekday: "MO", // WEEKLY 기본 요일
    monthday: 1, // MONTHLY 기본 일자

    // CUSTOM용 필드
    customMode: "DAILY_INTERVAL", // DAILY_INTERVAL / WEEKLY_INTERVAL / MONTHLY_INTERVAL / MONTHLY_INTERVAL_BYDAY / MINUTELY_INTERVAL
    customInterval: "3",
    customMonthDay: "15",

    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
    time: "08:00",
  });

  // -----------------------------
  // RRULE 생성 함수
  // -----------------------------
  const buildRRule = (f) => {
    // CUSTOM일 때만 RRULE 생성, 나머지는 서버에서 frequency만 사용
    if (f.frequency !== "CUSTOM") return null;

    const interval = Number(f.customInterval || 1);
    const day = Number(f.customMonthDay || 1);

    switch (f.customMode) {
      case "DAILY_INTERVAL":
        return `FREQ=DAILY;INTERVAL=${interval}`;
      case "WEEKLY_INTERVAL":
        // 예: FREQ=WEEKLY;INTERVAL=2;BYDAY=TU
        if (f.weekday) {
          return `FREQ=WEEKLY;INTERVAL=${interval};BYDAY=${f.weekday}`;
        }
        return `FREQ=WEEKLY;INTERVAL=${interval}`;
      case "MONTHLY_INTERVAL":
        return `FREQ=MONTHLY;INTERVAL=${interval}`;
      case "MONTHLY_INTERVAL_BYDAY":
        return `FREQ=MONTHLY;INTERVAL=${interval};BYMONTHDAY=${day}`;
      case "MINUTELY_INTERVAL":
        // 1분마다 → FREQ=MINUTELY, 5분마다 → FREQ=MINUTELY;INTERVAL=5
        return interval > 1
          ? `FREQ=MINUTELY;INTERVAL=${interval}`
          : "FREQ=MINUTELY";
      default:
        return null;
    }
  };

  // frequency는 enum 그대로 전송
  const resolveFrequencyForPayload = (f) => f.frequency;

  // -----------------------------
  // RRULE 파싱 헬퍼 (수정 모달 + 표시용)
  // -----------------------------
  const parseRRule = (rrule) => {
    if (!rrule) return {};
    const parts = rrule.split(";");
    const map = {};

    parts.forEach((p) => {
      const [k, v] = p.split("=");
      if (!k || !v) return;
      map[k.trim().toUpperCase()] = v.trim().toUpperCase();
    });

    const freq = map.FREQ; // DAILY / WEEKLY / MONTHLY / MINUTELY
    const interval = map.INTERVAL ? Number(map.INTERVAL) : 1;
    const byMonthDay = map.BYMONTHDAY ? Number(map.BYMONTHDAY) : undefined;
    const byDay = map.BYDAY || undefined;

    return { freq, interval, byMonthDay, byDay };
  };

  // -----------------------------
  // 스크롤 보정
  // -----------------------------
  const scrollFrameToTop = () => {
    const frame = document.querySelector(".phone-frame");
    if (frame) frame.scrollTo({ top: 0, behavior: "smooth" });
  };

  // -----------------------------
  // 계좌 목록 로드
  // -----------------------------
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const res = await fetchMyAccountsAPI();
        const data = res?.data?.data ?? {};
        const list = Array.isArray(data.content) ? data.content : [];
        setAccounts(list);

        const first = accountId || String(list[0]?.accountId || "");
        setForm((prev) => ({ ...prev, from: first }));
      } catch (e) {
        console.error(e);
      }
    };
    loadAccounts();
  }, [accountId]);

  // -----------------------------
  // 예약 목록 로드
  // -----------------------------
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

  // -----------------------------
  // 예약 생성
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const fromAcc = accounts.find((a) => String(a.accountId) === form.from);
      if (!fromAcc) {
        alert("보내는 계좌를 선택하세요.");
        return;
      }

      if (!form.to) {
        alert("받는 계좌번호를 입력하세요.");
        return;
      }

      if (!form.amount || Number(form.amount) <= 0) {
        alert("금액을 올바르게 입력하세요.");
        return;
      }

      const frequencyToSend = resolveFrequencyForPayload(form);
      const runTime = `${form.time}:00`;
      // 커스텀 주기가 아닐 때는 항상 rrule을 빈 문자열로 보낸다.
      let rruleValue = "";
      if (frequencyToSend === "CUSTOM") {
        const built = buildRRule(form); // CUSTOM일 때만 값, 나머지는 null
        rruleValue = built || "";
      }

      const payload = {
        fromAccountId: fromAcc.accountId,
        toAccountNum: form.to,
        amount: Number(form.amount),
        frequency: frequencyToSend,
        startDate: form.startDate,
        endDate: form.endDate || null,
        runTime,
        memo: form.memo,
        // 백엔드에 그대로 저장되는 RRULE 원문 (생성/수정 공통)
        rrule: rruleValue,
        // 혹시 백엔드가 rruleString 필드명을 볼 수도 있으니 같이 보내줌
        rruleString: rruleValue,
      };

      console.log("예약 생성 payload", {
        ...payload,
        설명:
          frequencyToSend === "CUSTOM" && rruleValue
            ? `커스텀 패턴 (${formatPattern(rruleValue)})`
            : `기본 주기 (${frequencyToSend})`,
      });

      await createScheduleAPI(payload);

      alert("예약 등록 완료");
      setShowCreateModal(false);
      await loadSchedules();
    } catch (e) {
      console.error(e);
      alert("예약 생성 실패");
    }
  };

  // -----------------------------
  // 수정 버튼 → 모달 열기
  // -----------------------------
  const handleEdit = async (scheduleId) => {
    try {
      scrollFrameToTop();

      const res = await fetchScheduleDetailAPI(scheduleId);
      const data = res?.data?.data;
      if (!data) {
        alert("수정 정보를 불러오지 못했습니다.");
        return;
      }

      const { freq, interval, byMonthDay, byDay } = parseRRule(
        data.rruleString || data.rrule || ""
      );

      // 기본값들
      let weekday = "MO";
      let monthday = 1;

      if (data.frequency === "WEEKLY" && byDay) {
        weekday = byDay;
      }
      if (data.frequency === "MONTHLY" && byMonthDay) {
        monthday = byMonthDay;
      }

      // CUSTOM인 경우에만 custom UI 세팅
      let customMode = "DAILY_INTERVAL";
      let customInterval = "1";
      let customMonthDay = "1";

      if (data.frequency === "CUSTOM") {
        if (freq === "DAILY") {
          customMode = "DAILY_INTERVAL";
          customInterval = String(interval || 1);
        } else if (freq === "WEEKLY") {
          customMode = "WEEKLY_INTERVAL";
          customInterval = String(interval || 1);
          if (byDay) {
            weekday = byDay;
          }
        } else if (freq === "MONTHLY") {
          if (byMonthDay) {
            customMode = "MONTHLY_INTERVAL_BYDAY";
            customInterval = String(interval || 1);
            customMonthDay = String(byMonthDay);
          } else {
            customMode = "MONTHLY_INTERVAL";
            customInterval = String(interval || 1);
          }
        } else if (freq === "MINUTELY") {
          customMode = "MINUTELY_INTERVAL";
          customInterval = String(interval || 1);
        }
      }

      setEditData({
        scheduleId,
        amount: data.amount,
        memo: data.memo ?? "",
        frequency: data.frequency, // DAILY / WEEKLY / MONTHLY / CUSTOM / ONCE
        startDate: data.startDate?.slice(0, 10),
        endDate: data.endDate ? data.endDate.slice(0, 10) : "",
        rrule: data.rruleString || data.rrule || "",

        weekday,
        monthday,

        customMode,
        customInterval,
        customMonthDay,
      });

      setShowEditModal(true);
    } catch (e) {
      console.error(e);
      alert("불러오기 실패");
    }
  };

  // -----------------------------
  // 수정 저장
  // -----------------------------
  const handleSaveEdit = async () => {
    try {
      if (!editData) return;

      if (!editData.amount || Number(editData.amount) <= 0) {
        alert("금액을 올바르게 입력하세요.");
        return;
      }

      const frequencyToSend = resolveFrequencyForPayload(editData);
      // 커스텀 주기가 아닐 때는 항상 rrule을 빈 문자열로 보낸다.
      let rruleValue = "";
      if (frequencyToSend === "CUSTOM") {
        const built = buildRRule(editData); // CUSTOM일 때만 값
        rruleValue = built || "";
      }

      const payload = {
        amount: Number(editData.amount),
        frequency: frequencyToSend,
        startDate: editData.startDate,
        endDate: editData.endDate || null,
        memo: editData.memo,
        // 백엔드에 저장될 RRULE 원문
        rrule: rruleValue,
        // rruleString 이름도 함께 전송 (백엔드 양쪽 대응용)
        rruleString: rruleValue,
      };

      console.log("예약 수정 payload", editData.scheduleId, {
        ...payload,
        설명:
          frequencyToSend === "CUSTOM" && rruleValue
            ? `커스텀 패턴 (${formatPattern(rruleValue)})`
            : `기본 주기 (${frequencyToSend})`,
      });

      await updateScheduleAPI(editData.scheduleId, payload);

      alert("수정 완료");
      setShowEditModal(false);
      await loadSchedules();
    } catch (e) {
      console.error(e);
      alert("수정 실패");
    }
  };

  // -----------------------------
  // 상태변경 / 즉시 실행 / 실행 로그
  // -----------------------------
  const handlePause = async (id) => {
    try {
      await pauseScheduleAPI(id);
      alert("일시정지되었습니다.");
      await loadSchedules();
    } catch (e) {
      console.error(e);
      alert("일시정지 실패");
    }
  };

  const handleResume = async (id) => {
    try {
      await resumeScheduleAPI(id);
      alert("재개되었습니다.");
      await loadSchedules();
    } catch (e) {
      console.error(e);
      alert("재개 실패");
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("예약이체를 취소할까요?")) return;
    try {
      await cancelScheduleAPI(id);
      alert("취소되었습니다.");
      await loadSchedules();
    } catch (e) {
      console.error(e);
      alert("취소 실패");
    }
  };

  const handleRunNow = async (id) => {
    try {
      await runNowScheduleAPI(id);
      alert("예약이체를 즉시 실행했습니다.");
      await loadSchedules();
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.result ||
        "예약이체 즉시 실행에 실패했습니다.";
      alert(msg);

      // 즉시실행 실패를 실행 로그 형태로도 남겨, 나중에 실행로그 모달에서 확인 가능하게 함
      const errorLog = {
        runId: `local-${Date.now()}`,
        result: "FAILURE",
        executedAt: new Date().toISOString(),
        message: msg,
      };
      setLocalRunErrors((prev) => ({
        ...prev,
        [id]: [...(prev[id] || []), errorLog],
      }));
    }
  };

  const handleViewRuns = async (scheduleId) => {
    try {
      scrollFrameToTop();
      const res = await fetchRunsByScheduleAPI(scheduleId);
      const raw = res?.data?.data ?? res?.data ?? {};
      const list = Array.isArray(raw?.content)
        ? raw.content
        : Array.isArray(raw)
        ? raw
        : [];
      const extra = localRunErrors[scheduleId] || [];
      // 백엔드 실행로그 + 프론트에서 수집한 run-now 실패로그 함께 표시
      setRunLogs([...list, ...extra]);
      setShowRunModal(true);
    } catch (e) {
      console.error(e);
      alert("실행 로그를 불러오지 못했습니다.");
    }
  };

  // -----------------------------
  // 포맷 헬퍼
  // -----------------------------
  const formatAmount = (v) => `₩${Number(v || 0).toLocaleString()}`;
  const formatDateTime = (v) =>
    v ? `${v.slice(0, 10)} ${v.slice(11, 16)}` : "-";

  const formatPattern = (rrule) => {
    if (!rrule) return "-";

    const { freq, interval, byMonthDay, byDay } = parseRRule(rrule);
    const n = interval || 1;

    const weekdayMap = {
      MO: "월요일",
      TU: "화요일",
      WE: "수요일",
      TH: "목요일",
      FR: "금요일",
      SA: "토요일",
      SU: "일요일",
    };

    if (freq === "DAILY") {
      return n > 1 ? `${n}일마다` : "매일";
    }
    if (freq === "WEEKLY") {
      const base = n > 1 ? `${n}주마다` : "매주";
      if (byDay && weekdayMap[byDay]) {
        return `${base} ${weekdayMap[byDay]}`;
      }
      return base;
    }
    if (freq === "MONTHLY") {
      const base = n > 1 ? `${n}개월마다` : "매월";
      if (byMonthDay) {
        return `${base} ${byMonthDay}일`;
      }
      return base;
    }
    if (freq === "MINUTELY") {
      return n > 1 ? `${n}분마다` : "1분마다";
    }

    return rrule;
  };

  // -----------------------------
  // 화면
  // -----------------------------
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

        {/* 예약 목록 */}
        <div className={styles.scheduleList}>
          {schedules.map((item) => {
            const fromAcc = accounts.find(
              (a) => Number(a.accountId) === Number(item.fromAccountId)
            );
            const fromLabel = fromAcc
              ? fromAcc.accountNum
              : `계좌ID ${item.fromAccountId}`;

            const toAcc = accounts.find(
              (a) =>
                item.toAccountId != null &&
                Number(a.accountId) === Number(item.toAccountId)
            );
            const toLabel =
              item.toAccountNum ||
              toAcc?.accountNum ||
              (item.toAccountId != null ? `계좌ID ${item.toAccountId}` : "-");

            return (
              <div key={item.scheduleId} className={styles.schedule}>
                <div>
                  <p className={styles.title}>{formatAmount(item.amount)}</p>
                  <p className={styles.time}>
                    {fromLabel} → {toLabel}
                    <br />
                    상태: {item.scheduledStatus} / {item.frequency}
                    <br />
                    다음 실행: {formatDateTime(item.nextRunAt)}
                    {item.rrule && (
                      <>
                        <br />
                        <span className={styles.muted}>
                          패턴: {formatPattern(item.rrule)}
                        </span>
                      </>
                    )}
                    {item.memo && (
                      <>
                        <br />
                        <span className={styles.muted}>메모: {item.memo}</span>
                      </>
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

                  {item.scheduledStatus === "ACTIVE" ? (
                    <button
                      className={styles.smallButton}
                      onClick={() => handlePause(item.scheduleId)}
                    >
                      일시정지
                    </button>
                  ) : item.scheduledStatus === "PAUSED" ? (
                    <button
                      className={styles.smallButton}
                      onClick={() => handleResume(item.scheduleId)}
                    >
                      재개
                    </button>
                  ) : null}

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

      {/* 생성 모달 */}
      {showCreateModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>새 예약이체 등록</h3>
            <p className={styles.modalDesc}>
              보내는 계좌, 받는 계좌번호, 금액과 주기를 입력해 자동 이체를
              설정하세요.
            </p>

            <form className={styles.formGrid} onSubmit={handleSubmit}>
              {/* 보내는 계좌 */}
              <label className={styles.field}>
                <span>보내는 계좌</span>
                <select
                  className={styles.select}
                  value={form.from}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      from: e.target.value,
                    }))
                  }
                >
                  {accounts.map((a) => (
                    <option key={a.accountId} value={String(a.accountId)}>
                      {a.accountNum}
                    </option>
                  ))}
                </select>
              </label>

              {/* 받는 계좌번호 */}
              <label className={styles.field}>
                <span>받는 계좌번호</span>
                <input
                  className={styles.select}
                  placeholder="예: 112-0000-123456"
                  value={form.to}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, to: e.target.value }))
                  }
                />
              </label>

              {/* 금액 */}
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

              {/* 메모 */}
              <label className={styles.field}>
                <span>메모</span>
                <input
                  value={form.memo}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, memo: e.target.value }))
                  }
                />
              </label>

              {/* 주기 선택 */}
              <label className={styles.field}>
                <span>주기</span>
                <select
                  className={styles.select}
                  value={form.frequency}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      frequency: value,
                    }));
                  }}
                >
                  <option value="ONCE">1회</option>
                  <option value="DAILY">매일</option>
                  <option value="WEEKLY">매주</option>
                  <option value="MONTHLY">매월</option>
                  <option value="CUSTOM">커스텀</option>
                </select>
              </label>

              {/* WEEKLY 세부 설정 */}
              {form.frequency === "WEEKLY" && (
                <div className={`${styles.field} ${styles.fieldPlaceholder}`} />
              )}

              {/* MONTHLY 세부 설정 */}
              {form.frequency === "MONTHLY" && (
                <div className={`${styles.field} ${styles.fieldPlaceholder}`} />
              )}

              {/* DAILY / ONCE → 별도 세부 설정 없음 (placeholder로 자리만 채움) */}
              {(form.frequency === "DAILY" || form.frequency === "ONCE") && (
                <div className={`${styles.field} ${styles.fieldPlaceholder}`} />
              )}

              {/* CUSTOM 세부 설정 */}
              {form.frequency === "CUSTOM" && (
                <label className={styles.field}>
                  <span>커스텀 반복</span>
                  <div className={styles.customBox}>
                    <select
                      className={styles.select}
                      value={form.customMode}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          customMode: e.target.value,
                        }))
                      }
                    >
                      <option value="DAILY_INTERVAL">N일마다</option>
                      <option value="WEEKLY_INTERVAL">N주마다</option>
                      <option value="MONTHLY_INTERVAL">N개월마다</option>
                      <option value="MONTHLY_INTERVAL_BYDAY">
                        N개월마다 N일
                      </option>
                      <option value="MINUTELY_INTERVAL">N분마다</option>
                    </select>

                    {/* interval */}
                    <span className={styles.suffix}>간격 N</span>
                    <input
                      type="number"
                      min="1"
                      className={styles.select}
                      style={{ maxWidth: 90 }}
                      value={form.customInterval}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          customInterval: e.target.value,
                        }))
                      }
                    />

                    {/* N주마다 → 요일 선택 */}
                    {form.customMode === "WEEKLY_INTERVAL" && (
                      <>
                        <span className={styles.suffix}>요일</span>
                        <select
                          className={styles.select}
                          style={{ maxWidth: 120 }}
                          value={form.weekday}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              weekday: e.target.value,
                            }))
                          }
                        >
                          <option value="MO">월요일</option>
                          <option value="TU">화요일</option>
                          <option value="WE">수요일</option>
                          <option value="TH">목요일</option>
                          <option value="FR">금요일</option>
                          <option value="SA">토요일</option>
                          <option value="SU">일요일</option>
                        </select>
                      </>
                    )}

                    {/* N개월마다 N일일 때 날짜 입력 */}
                    {form.customMode === "MONTHLY_INTERVAL_BYDAY" && (
                      <>
                        <span className={styles.suffix}>날짜</span>
                        <input
                          type="number"
                          min="1"
                          max="31"
                          className={styles.select}
                          style={{ maxWidth: 90 }}
                          value={form.customMonthDay}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              customMonthDay: e.target.value,
                            }))
                          }
                        />
                      </>
                    )}
                  </div>
                </label>
              )}

              {/* 시작일 / 종료일 / 시간 */}
              <label className={styles.field}>
                <span>시작일</span>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, startDate: e.target.value }))
                  }
                />
              </label>

              <label className={styles.field}>
                <span>종료일(선택)</span>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, endDate: e.target.value }))
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
                  예약 등록
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
              {/* 금액 */}
              <label className={styles.field}>
                <span>금액</span>
                <input
                  type="number"
                  value={editData.amount}
                  onChange={(e) =>
                    setEditData((prev) => ({
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
                  value={editData.memo}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, memo: e.target.value }))
                  }
                />
              </label>

              {/* 주기 */}
              <label className={styles.field}>
                <span>주기</span>
                <select
                  className={styles.select}
                  value={editData.frequency}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditData((prev) => ({
                      ...prev,
                      frequency: value,
                    }));
                  }}
                >
                  <option value="ONCE">1회</option>
                  <option value="DAILY">매일</option>
                  <option value="WEEKLY">매주</option>
                  <option value="MONTHLY">매월</option>
                  <option value="CUSTOM">커스텀</option>
                </select>
              </label>

              {/* WEEKLY 설정 */}
              {editData.frequency === "WEEKLY" && (
                <label className={styles.field}>
                  {/* <span>요일</span> */}
                  {/* <select
                    className={styles.select}
                    value={editData.weekday}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        weekday: e.target.value,
                      }))
                    }
                  >
                    <option value="MO">월요일</option>
                    <option value="TU">화요일</option>
                    <option value="WE">수요일</option>
                    <option value="TH">목요일</option>
                    <option value="FR">금요일</option>
                    <option value="SA">토요일</option>
                    <option value="SU">일요일</option>
                  </select> */}
                </label>
              )}

              {/* MONTHLY 설정 */}
              {editData.frequency === "MONTHLY" && (
                <label className={styles.field}>
                  {/* <span>일자</span>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    className={styles.select}
                    value={editData.monthday}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        monthday: e.target.value,
                      }))
                    }
                  /> */}
                </label>
              )}

              {/* DAILY / ONCE placeholder */}
              {(editData.frequency === "DAILY" ||
                editData.frequency === "ONCE") && (
                <div className={`${styles.field} ${styles.fieldPlaceholder}`} />
              )}

              {/* CUSTOM 수정 UI */}
              {editData.frequency === "CUSTOM" && (
                <label className={styles.field}>
                  <span>커스텀 반복</span>
                  <div className={styles.customBox}>
                    <select
                      className={styles.select}
                      value={editData.customMode}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          customMode: e.target.value,
                        }))
                      }
                    >
                      <option value="DAILY_INTERVAL">N일마다</option>
                      <option value="WEEKLY_INTERVAL">N주마다</option>
                      <option value="MONTHLY_INTERVAL">N개월마다</option>
                      <option value="MONTHLY_INTERVAL_BYDAY">
                        N개월마다 N일
                      </option>
                      <option value="MINUTELY_INTERVAL">N분마다</option>
                    </select>

                    <span className={styles.suffix}>간격 N</span>
                    <input
                      type="number"
                      min="1"
                      className={styles.select}
                      style={{ maxWidth: 90 }}
                      value={editData.customInterval}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          customInterval: e.target.value,
                        }))
                      }
                    />

                    {editData.customMode === "WEEKLY_INTERVAL" && (
                      <>
                        <span className={styles.suffix}>요일</span>
                        <select
                          className={styles.select}
                          style={{ maxWidth: 90 }}
                          value={editData.weekday}
                          onChange={(e) =>
                            setEditData((prev) => ({
                              ...prev,
                              weekday: e.target.value,
                            }))
                          }
                        >
                          {/* <option value="MO">월요일</option>
                          <option value="TU">화요일</option>
                          <option value="WE">수요일</option>
                          <option value="TH">목요일</option>
                          <option value="FR">금요일</option>
                          <option value="SA">토요일</option>
                          <option value="SU">일요일</option> */}
                        </select>
                      </>
                    )}

                    {editData.customMode === "MONTHLY_INTERVAL_BYDAY" && (
                      <>
                        <span className={styles.suffix}>날짜</span>
                        <input
                          type="number"
                          min="1"
                          max="31"
                          className={styles.select}
                          style={{ maxWidth: 90 }}
                          value={editData.customMonthDay}
                          onChange={(e) =>
                            setEditData((prev) => ({
                              ...prev,
                              customMonthDay: e.target.value,
                            }))
                          }
                        />
                      </>
                    )}
                  </div>
                </label>
              )}

              {/* 시작일 / 종료일 */}
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
