import { scheduledTxInstance } from "./instance";
import { request } from "../utils/request";

// 예약이체 생성: POST /api/scheduled-transactions
export const createScheduleAPI = (payload) => {
  return request(scheduledTxInstance, "post", "", payload);
};

// 예약 즉시 실행: POST /api/scheduled-transactions/{id}/run-now
export const runNowScheduleAPI = (scheduleId) => {
  return request(scheduledTxInstance, "post", `/${scheduleId}/run-now`);
};

// 예약 재개: POST /api/scheduled-transactions/{id}/resume
export const resumeScheduleAPI = (scheduleId) => {
  return request(scheduledTxInstance, "post", `/${scheduleId}/resume`);
};

// 예약 일시정지: POST /api/scheduled-transactions/{id}/pause
export const pauseScheduleAPI = (scheduleId) => {
  return request(scheduledTxInstance, "post", `/${scheduleId}/pause`);
};

// 예약 단건 조회: GET /api/scheduled-transactions/{id}
export const fetchScheduleDetailAPI = (scheduleId) => {
  return request(scheduledTxInstance, "get", `/${scheduleId}`);
};

// 예약 취소: DELETE /api/scheduled-transactions/{id}
export const cancelScheduleAPI = (scheduleId) => {
  return request(scheduledTxInstance, "delete", `/${scheduleId}`);
};

// 예약 수정: PATCH /api/scheduled-transactions/{id}
export const updateScheduleAPI = (
  scheduleId,
  amount,
  frequency,
  startDate,
  endDate,
  memo
) => {
  return request(scheduledTxInstance, "patch", `/${scheduleId}`, {
    amount,
    frequency,
    startDate,
    endDate,
    memo,
  });
};

// 예약 실패 실행 로그 조회: GET /api/scheduled-transactions/{id}/runs/failures
export const fetchScheduleFailuresAPI = (scheduleId) => {
  return request(scheduledTxInstance, "get", `/${scheduleId}/runs/failures`);
};

// 내가 만든 예약 목록: GET /api/scheduled-transactions/my
export const fetchMySchedulesAPI = (page, size, sort) => {
  return request(scheduledTxInstance, "get", "/my", {
    params: { page, size, sort },
  });
};

// 상태별 예약이체 조회: GET /api/scheduled-transactions/my/status
export const fetchMySchedulesByStatusAPI = (status, { page, size, sort }) => {
  return request(scheduledTxInstance, "get", "/my/status", {
    params: { status, page, size, sort },
  });
};

// 출금계좌 기준 예약 목록: GET /api/scheduled-transactions/account/{fromAccountId}
export const fetchSchedulesByFromAccountAPI = (
  fromAccountId,
  page,
  size,
  sort
) => {
  return request(scheduledTxInstance, "get", `/account/${fromAccountId}`, {
    params: { page, size, sort },
  });
};
