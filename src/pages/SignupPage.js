import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signupAPI } from "../api/user";
import styles from "./SignupPage.module.css";

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !userId || !password) {
      window.alert("이름, 아이디, 비밀번호를 모두 입력하세요.");
      return;
    }
    try {
      setLoading(true);
      await signupAPI({ name, userId, password });
      window.alert("회원가입이 완료되었습니다. 로그인해 주세요.");
      navigate("/login");
    } catch (err) {
      window.alert("회원가입에 실패했습니다.");
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
          <h2 className={styles.title}>회원가입</h2>
          <span className={styles.pill}>새 계정</span>
        </header>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>이름</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름 입력" />
          </label>
          <label className={styles.field}>
            <span>아이디</span>
            <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="아이디 입력" />
          </label>
          <label className={styles.field}>
            <span>비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
            />
          </label>
          <button className={styles.primary} type="submit" disabled={loading}>
            {loading ? "가입 중..." : "가입하기"}
          </button>
        </form>
        <div className={styles.signupCta}>
          <span>이미 계정이 있으신가요?</span>
          <Link to="/login" className={styles.signupButton}>
            로그인
          </Link>
        </div>
      </div>
    </section>
  );
}

export default SignupPage;
