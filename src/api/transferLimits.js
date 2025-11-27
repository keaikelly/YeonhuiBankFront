import { transferLimitInstance } from "./instance";
import { request } from "../utils/request";

// 이체한도 등록/변경: POST /api/transfer-limits
export const createOrUpdateLimitAPI = (payload) => {
  return request(transferLimitInstance, "post", "/", payload);
};

// 활성 한도 조회: GET /api/transfer-limits/active/{accountNum}
export const fetchActiveLimitsAPI = (accountNum) => {
  return request(transferLimitInstance, "get", `/active/${accountNum}`);
};

// 한도 이력 조회: GET /api/transfer-limits/history/{accountNum}
export const fetchLimitHistoryAPI = (accountNum) => {
  return request(transferLimitInstance, "get", `/history/${accountNum}`);
};

// endDate 수정: PATCH /api/transfer-limits/{limitId}/end-date
export const updateLimitEndDateAPI = (limitId, payload) => {
  return request(transferLimitInstance, "patch", `/${limitId}/end-date`, payload);
};
