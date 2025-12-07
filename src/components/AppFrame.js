import { useLocation, useNavigate, Link } from "react-router-dom";

function AppFrame({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const showChrome = !["/", "/login", "/signup"].includes(location.pathname);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="App">
      <div className="phone-frame">
        {showChrome && (
          <>
            <div className="app-banner">
              <span className="app-badge">YEONHUI</span>
              <span className="app-sub">Secure Banking</span>
            </div>
            <nav className="page-nav">
              <Link to="/main" className="nav-link">
                홈
              </Link>

              <Link to="/account/create" className="nav-link">
                계좌개설
              </Link>
              <Link to="/transfer" className="nav-link">
                이체
              </Link>
              <Link to="/schedule/any" className="nav-link">
                예약이체
              </Link>
              <Link to="/logs" className="nav-link">
                로그
              </Link>
              <Link to="/limits" className="nav-link">
                한도
              </Link>
              <Link to="/abnormal" className="nav-link">
                이상거래
              </Link>
              <button type="button" className="nav-link" onClick={handleLogout}>
                로그아웃
              </button>
            </nav>
          </>
        )}
        {children}
      </div>
    </div>
  );
}

export default AppFrame;
