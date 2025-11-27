import { scheduledTxInstance } from "./instance";
import { request } from "../utils/request";

// 예약이체 생성: POST /api/scheduled-transactions
export const createScheduleAPI = (payload) => {
  return request(scheduledTxInstance, "post", "/", payload);
};

// 내가 만든 예약 목록: GET /api/scheduled-transactions/my
export const fetchMySchedulesAPI = (params) => {
  return request(scheduledTxInstance, "get", "/my", { params });
};

// 상태별 예약 목록: GET /api/scheduled-transactions/my/status
export const fetchMySchedulesByStatusAPI = (status, params = {}) => {
  return request(scheduledTxInstance, "get", "/my/status", { params: { ...params, status } });
};

// 출금계좌 기준 예약 목록: GET /api/scheduled-transactions/account/{fromAccountId}
export const fetchSchedulesByFromAccountAPI = (fromAccountId, params) => {
  return request(scheduledTxInstance, "get", `/account/${fromAccountId}`, { params });
};

// 예약 단건 조회: GET /api/scheduled-transactions/{id}
export const fetchScheduleDetailAPI = (scheduleId) => {
  return request(scheduledTxInstance, "get", `/${scheduleId}`);
};

// 예약 수정: PATCH /api/scheduled-transactions/{id}
export const updateScheduleAPI = (scheduleId, payload) => {
  return request(scheduledTxInstance, "patch", `/${scheduleId}`, payload);
};

// 예약 취소: DELETE /api/scheduled-transactions/{id}
export const cancelScheduleAPI = (scheduleId) => {
  return request(scheduledTxInstance, "delete", `/${scheduleId}`);
};

// 예약 일시정지: POST /api/scheduled-transactions/{id}/pause
export const pauseScheduleAPI = (scheduleId) => {
  return request(scheduledTxInstance, "post", `/${scheduleId}/pause`);
};

// 예약 재개: POST /api/scheduled-transactions/{id}/resume
export const resumeScheduleAPI = (scheduleId) => {
  return request(scheduledTxInstance, "post", `/${scheduleId}/resume`);
};
