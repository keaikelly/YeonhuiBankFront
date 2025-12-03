import { transferLimitInstance } from "./instance";
import { request } from "../utils/request";

// 이체한도 등록/변경 POST /api/transfer-limits
export const createOrUpdateLimitAPI = (
  accountNum,
  dailyLimitAmt,
  perTxLimitAmt,
  note
) => {
  return request(transferLimitInstance, "post", "", {
    accountNum,
    dailyLimitAmt,
    perTxLimitAmt,
    note,
  });
};

// 이체한도 endDate 수정: PATCH /api/transfer-limits/{limitId}/end-date
export const updateLimitEndDateAPI = (limitId, endDate) => {
  return request(
    transferLimitInstance,
    "patch",
    `/${limitId}/end-date`,
    { endDate } // RequestBody : { "endDate": "2025-12-31T23:59:59" } 형태
  );
};

// 한도 전체 조회: GET /api/transfer-limits/history/{accountNum}
export const fetchLimitHistoryAPI = (accountNum) => {
  return request(transferLimitInstance, "get", `/history/${accountNum}`);
};

// 활성 한도 조회: GET /api/transfer-limits/active/{accountNum}
export const fetchActiveLimitsAPI = (accountNum) => {
  return request(transferLimitInstance, "get", `/active/${accountNum}`);
};
