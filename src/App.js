import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import AppFrame from "./components/AppFrame";
import StartPage from "./pages/StartPage";
import LoginPage from "./pages/LoginPage";
// import SignupPage from "./pages/SignupPage";
// import MainContainer from "./pages/MainContainer";
// import AccountContainer from "./pages/AccountContainer";
// import TransferContainer from "./pages/TransferContainer";
// import ScheduleContainer from "./pages/ScheduleContainer";

function App() {
  return (
    <BrowserRouter>
      <AppFrame>
        <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/login" element={<LoginPage />} />
          {/* <Route path="/signup" element={<SignupPage />} />
          <Route path="/main" element={<MainContainer />} />
          <Route path="/account" element={<AccountContainer />} />
          <Route path="/transfer" element={<TransferContainer />} />
          <Route path="/schedule" element={<ScheduleContainer />} /> */}
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </AppFrame>
    </BrowserRouter>
  );
}

export default App;
