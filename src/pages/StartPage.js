import { Link, useNavigate } from "react-router-dom";
import styles from "./StartPage.module.css";

function StartPage() {
  const navigate = useNavigate();
  return (
    <div className={styles.wrapper}>
      <section className={styles.card}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>YeonhuiBank</p>
            <h2 className={styles.title}>오늘도 안전한 금융</h2>
          </div>
          <span className={styles.pill}>Welcome</span>
        </div>
        <p className={styles.description}>로그인 후 계좌를 확인하세요. 계정이 없으면 간단히 가입할 수 있어요.</p>
        <div className={styles.stack}>
          <button className={styles.primary} onClick={() => navigate("/login")}>
            로그인하기
          </button>
          <Link to="/signup" className={styles.linkButton}>
            회원가입으로 이동
          </Link>
        </div>
      </section>
    </div>
  );
}

export default StartPage;
