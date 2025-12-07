import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import AppFrame from "./components/AppFrame";
import StartPage from "./pages/StartPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MainPage from "./pages/MainPage";
import AccountDetail from "./pages/AccountDetail";
import TransferPage from "./pages/TransferPage";
import VirtualATMPage from "./pages/VirtualATMPage";
import ScheduleContainer from "./pages/SchedulePage";
import AccountCreatePage from "./pages/AccountCreatePage";
import LogsPage from "./pages/LogsPage";
import AbnormalPage from "./pages/AbnormalPage";
import TransferLimitPage from "./pages/TransferLimitPage";

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
          <Route path="/account/:accountNum" element={<AccountDetail />} />
          <Route path="/transfer" element={<TransferPage />} />
          <Route path="/virtual-atm" element={<VirtualATMPage />} />
          <Route path="/schedule/:accountId" element={<ScheduleContainer />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/abnormal" element={<AbnormalPage />} />
          <Route path="/limits" element={<TransferLimitPage />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </AppFrame>
    </BrowserRouter>
  );
}

export default App;
