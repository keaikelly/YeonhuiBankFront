import { useLocation } from "react-router-dom";

function AppFrame({ children }) {
  const location = useLocation();
  const showChrome = !["/", "/login", "/signup"].includes(location.pathname);

  return (
    <div className="App">
      <div className="phone-frame">
        {showChrome && (
          <div className="app-banner">
            <span className="app-badge">YEONHUI</span>
            <span className="app-sub">Secure Banking</span>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export default AppFrame;
