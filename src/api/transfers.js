import { transactionInstance } from "./instance";
import { request } from "../utils/request";

// 입금: POST /api/transactions/deposit
export const depositAPI = (payload) => {
  return request(transactionInstance, "post", "/deposit", payload);
};

// 출금: POST /api/transactions/withdraw
export const withdrawAPI = (payload) => {
  return request(transactionInstance, "post", "/withdraw", payload);
};

// 이체: POST /api/transactions/transfer
export const createTransferAPI = (payload) => {
  return request(transactionInstance, "post", "/transfer", payload);
};

// 내가 보낸 거래 조회: GET /api/transactions/sent
export const fetchSentTransactionsAPI = (params) => {
  return request(transactionInstance, "get", "/sent", { params });
};

// 내가 받은 거래 조회: GET /api/transactions/received
export const fetchReceivedTransactionsAPI = (params) => {
  return request(transactionInstance, "get", "/received", { params });
};
