import { abnTransferInstance } from "./instance";
import { request } from "../utils/request";

// 계좌번호 기준 이상거래 조회: GET /api/abn-transfers/account/{accountNum}
export const fetchAbnormalByAccountAPI = (accountNum) => {
  return request(abnTransferInstance, "get", `/account/${accountNum}`);
};
