import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import AppFrame from "./components/AppFrame";
import StartPage from "./pages/StartPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MainPage from "./pages/MainPage";
import AccountListPage from "./pages/AccountListPage";
import AccountDetailContainer from "./pages/AccountDetailContainer";
import TransferContainer from "./pages/TransferContainer";
import ScheduleContainer from "./pages/ScheduleContainer";
import AccountCreatePage from "./pages/AccountCreatePage";
import LogsPage from "./pages/LogsPage";
import AbnormalPage from "./pages/AbnormalPage";
import TransferLimitPage from "./pages/TransferLimitPage";
import ScheduleRunPage from "./pages/ScheduleRunPage";

function App() {
  return (
    <BrowserRouter>
      <AppFrame>
        <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/main" element={<MainPage />} />
          <Route path="/account/create" element={<AccountCreatePage />} />
          <Route path="/account" element={<AccountListPage />} />
          <Route
            path="/account/:accountId"
            element={<AccountDetailContainer />}
          />
          <Route path="/transfer/:accountId" element={<TransferContainer />} />
          <Route path="/schedule/:accountId" element={<ScheduleContainer />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/abnormal" element={<AbnormalPage />} />
          <Route path="/limits" element={<TransferLimitPage />} />
          <Route path="/runs" element={<ScheduleRunPage />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </AppFrame>
    </BrowserRouter>
  );
}

export default App;
