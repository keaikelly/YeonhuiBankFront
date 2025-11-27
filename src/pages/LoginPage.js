import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginAPI } from "../api/user";

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
      const res = await loginAPI({ userId, password });
      const token = res?.data?.data?.token || res?.data?.token;
      const name = res?.data?.data?.name || userId;
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("name", name);
      }
      window.alert("로그인 완료");
      navigate("/main");
    } catch (err) {
      window.alert("로그인에 실패했습니다. 아이디/비밀번호를 확인하세요.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel">
      <div className="section-title">
        <div>
          <p className="eyebrow">YeonhuiBank</p>
          <h2>로그인</h2>
        </div>
        <span className="pill small">안전한 접속</span>
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label className="field">
          <span>아이디</span>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="아이디 입력"
            autoComplete="username"
          />
        </label>
        <label className="field">
          <span>비밀번호</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 입력"
            autoComplete="current-password"
          />
        </label>
        <button className="primary" type="submit" disabled={loading}>
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>
      <p className="label" style={{ marginTop: 12 }}>
        처음이신가요? <Link to="/signup">회원가입</Link>
      </p>
    </section>
  );
}

export default LoginPage;
