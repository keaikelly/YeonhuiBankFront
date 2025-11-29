import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginAPI } from "../api/user";
import styles from "./LoginPage.module.css";

function LoginPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId || !password) {
      window.alert("아이디와 비밀번호를 입력하세요.");
      return;
    }
    try {
      setLoading(true);
      // 이전 로그인 토큰 제거
      localStorage.removeItem("token");
      localStorage.removeItem("name");
      localStorage.removeItem("user");

      const res = await loginAPI({ userId, password });
      const token = res?.data?.data?.token || res?.data?.token;
      const name = res?.data?.data?.name || userId;
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("name", name);
      }
      // 로그인 성공 직후
      console.log("받은 토큰:", token);
      localStorage.setItem("token", token);
      window.alert("로그인 완료");
      navigate("/main");
    } catch (err) {
      // 실패 시에도 토큰 정리
      localStorage.removeItem("token");
      localStorage.removeItem("name");
      localStorage.removeItem("user");
      window.alert("로그인에 실패했습니다. 아이디/비밀번호를 확인하세요.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.card}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>YeonhuiBank</p>
          <h2 className={styles.title}>로그인</h2>
          <span className={styles.pill}>안전한 접속</span>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>아이디</span>
            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="아이디 입력"
              autoComplete="username"
            />
          </label>
          <label className={styles.field}>
            <span>비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              autoComplete="current-password"
            />
          </label>
          <button className={styles.primary} type="submit" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className={styles.signupCta}>
          <span>처음이신가요?</span>
          <Link to="/signup" className={styles.signupButton}>
            회원가입
          </Link>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
