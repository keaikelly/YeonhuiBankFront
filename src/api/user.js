import { userInstance } from "./instance";
import { request } from "../utils/request";

// 회원가입: POST /api/users/signup
export const signupAPI = ({ userId, name, password }) => {
  return request(userInstance, "post", "/signup", { userId, name, password });
};

// 로그인: POST /api/users/login (JWT 발급)
export const loginAPI = ({ userId, password }) => {
  return request(userInstance, "post", "/login", { userId, password });
};

// 내 정보 조회: GET /api/users/me (JWT 필요)
export const fetchMyInfoAPI = () => {
  return request(userInstance, "get", "/me");
};
