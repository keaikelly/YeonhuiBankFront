import axios from "axios";

const API_PREFIX = (process.env.REACT_APP_URL || "").replace(/\/$/, "");
const API_BASE = `${API_PREFIX}/api`;

// -----------------------------------------------------------------
// 1. 인스턴스 생성 (기존 로직 유지)
// -----------------------------------------------------------------

// 공통 /api prefix 인스턴스 (기본)
const defaultInstance = axios.create({
  baseURL: API_BASE || "/api",
});

// /api 하위 인스턴스들
const userInstance = axios.create(defaultInstance.defaults);
userInstance.defaults.baseURL += "/users";

const accountInstance = axios.create(defaultInstance.defaults);
accountInstance.defaults.baseURL += "/accounts";

const transactionInstance = axios.create(defaultInstance.defaults);
transactionInstance.defaults.baseURL += "/transactions";

const scheduledTxInstance = axios.create(defaultInstance.defaults);
scheduledTxInstance.defaults.baseURL += "/scheduled-transactions";

const scheduledRunInstance = axios.create(defaultInstance.defaults);
scheduledRunInstance.defaults.baseURL += "/scheduled-transfer-runs";

const abnTransferInstance = axios.create(defaultInstance.defaults);
abnTransferInstance.defaults.baseURL += "/abn-transfers";

const logInstance = axios.create(defaultInstance.defaults);
logInstance.defaults.baseURL += "/logs";

const transferLimitInstance = axios.create(defaultInstance.defaults);
transferLimitInstance.defaults.baseURL += "/transfer-limits";

const failureReasonInstance = axios.create(defaultInstance.defaults);
failureReasonInstance.defaults.baseURL += "/failure-reasons";

// -----------------------------------------------------------------
// 2. JWT 인터셉터 로직 함수 정의
// -----------------------------------------------------------------

const attachTokenInterceptor = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");

      // 🚨 [필수 복구] 토큰을 붙이지 않아도 되는 public 경로 로직
      const isPublic =
        config.url?.includes("/signup") ||
        config.url?.includes("/login") ||
        config.url?.includes("/failure-reasons") ||
        config.url?.includes("/logs/account") ||
        config.url?.includes("/abn-transfers");

      // 💡 [수정] 토큰이 존재하고 Public 경로가 아닐 때만 헤더를 설정합니다.
      if (token && !isPublic) {
        config.headers.Authorization = `Bearer ${token}`;
      } else if (!token && !isPublic) {
        // 토큰이 없는데 인증이 필요한 경로라면, 헤더를 설정하지 않아
        // 백엔드에서 403을 발생시킵니다 (정상적인 인가 실패 처리).
      }

      return config;
    },
    (error) => Promise.reject(error)
  );
};

attachTokenInterceptor(defaultInstance);
attachTokenInterceptor(userInstance);
attachTokenInterceptor(accountInstance);
attachTokenInterceptor(transactionInstance);
attachTokenInterceptor(scheduledTxInstance);
attachTokenInterceptor(scheduledRunInstance);
attachTokenInterceptor(abnTransferInstance);
attachTokenInterceptor(logInstance);
attachTokenInterceptor(transferLimitInstance);
attachTokenInterceptor(failureReasonInstance);

// -----------------------------------------------------------------
// 4. Export
// -----------------------------------------------------------------

export {
  defaultInstance,
  userInstance,
  accountInstance,
  transactionInstance,
  scheduledTxInstance,
  scheduledRunInstance,
  abnTransferInstance,
  logInstance,
  transferLimitInstance,
  failureReasonInstance,
};
