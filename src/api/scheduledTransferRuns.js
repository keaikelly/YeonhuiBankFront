import { scheduledRunInstance } from "./instance";
import { request } from "../utils/request";

// 특정 예약이체 실행 로그: GET /api/scheduled-transfer-runs/schedule/{scheduleId}
export const fetchRunsByScheduleAPI = (scheduleId, params) => {
  return request(scheduledRunInstance, "get", `/schedule/${scheduleId}`, { params });
};
