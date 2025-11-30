import { accountInstance } from "./instance";
import { request } from "../utils/request";

// 계좌 생성: POST /api/accounts
export const createAccountAPI = (payload) => {
  return request(accountInstance, "post", "", payload);
};

// 단일 계좌 조회(소유자 검증): GET /api/accounts/{accountNum}
export const fetchAccountAPI = (accountNum) => {
  return request(accountInstance, "get", `/${accountNum}`);
};

// 내 계좌 목록: GET /api/accounts/me (JWT 필요, pageable)
export const fetchMyAccountsAPI = (params) => {
  return request(accountInstance, "get", "/me", { params });
};
