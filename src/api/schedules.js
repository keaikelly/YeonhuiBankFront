import { scheduleInstance } from "./instance";
import { request } from "../utils/request";

// 예약 목록 조회 (모두): GET /api/schedules
export const fetchSchedulesAPI = () => {
  return request(scheduleInstance, "get", "/");
};

// 예약 생성: POST /api/schedules
export const createScheduleAPI = (payload) => {
  return request(scheduleInstance, "post", "/", payload);
};
