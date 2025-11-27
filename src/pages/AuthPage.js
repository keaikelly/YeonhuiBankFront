import { useState } from 'react';
import styles from './AuthPage.module.css';

function AuthPage({ mode, onSubmit }) {
  const [name, setName] = useState(mode === 'login' ? '연희' : '');
  const [email, setEmail] = useState('yeonhui@bank.com');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(mode, { name: name || '연희', email });
  };

  return (
    <section className={styles.panel}>
      <div className={styles.sectionTitle}>
        <div>
          <p className={styles.eyebrow}>{mode === 'signup' ? '새 계좌 개설' : '기존 고객'}</p>
          <h2 className={styles.title}>{mode === 'signup' ? '회원가입' : '로그인'}</h2>
        </div>
        <span className={`${styles.pill} ${styles.small}`}>데베설 Front</span>
      </div>
      <form className={styles.formGrid} onSubmit={handleSubmit}>
        {mode === 'signup' ? (
          <label className={styles.field}>
            <span>이름</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름을 입력" />
          </label>
        ) : (
          <input type="hidden" value={name} />
        )}
        <label className={styles.field}>
          <span>이메일</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@bank.com" />
        </label>
        <label className={styles.field}>
          <span>비밀번호</span>
          <input type="password" placeholder="••••••••" />
        </label>
        <button className={styles.primary} type="submit">
          {mode === 'signup' ? '가입하기' : '로그인'}
        </button>
      </form>
    </section>
  );
}

export default AuthPage;
