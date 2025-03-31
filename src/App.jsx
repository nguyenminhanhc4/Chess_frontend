import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/main";
import PvpPage from "./layout/PvpPage";
import Login from "./layout/Login";
import HomePage from "./layout/homePage";
import HistoryPage from "./layout/HistoryPage";
import AnalysisPage from "./layout/AnalysisPage";
import ProfilePage from "./layout/ProfilePage ";
import { UserAuthProvider } from "./context/UserAuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <UserAuthProvider>
      <Router>
        <Routes>
          <Route path="/main" element={<MainLayout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/analysis/:gameId" element={<AnalysisPage />} />
          <Route path="/online" element={<PvpPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
        <ToastContainer />
      </Router>
    </UserAuthProvider>
  );
}

export default App;
