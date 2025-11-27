import { logInstance } from "./instance";
import { request } from "../utils/request";

// 계좌 별 로그: GET /api/logs/account/{accountNum}
export const fetchLogsByAccountAPI = (accountNum, params) => {
  return request(logInstance, "get", `/account/${accountNum}`, { params });
};

// 내 로그: GET /api/logs/me
export const fetchMyLogsAPI = (params) => {
  return request(logInstance, "get", "/me", { params });
};

// 계좌 + 기간 로그: GET /api/logs/account/{accountNum}/period
export const fetchLogsByAccountPeriodAPI = (accountNum, start, end, params = {}) => {
  return request(logInstance, "get", `/account/${accountNum}/period`, {
    params: { ...params, start, end },
  });
};

// 액션별 로그: GET /api/logs/action/{action}
export const fetchLogsByActionAPI = (action, params) => {
  return request(logInstance, "get", `/action/${action}`, { params });
};
