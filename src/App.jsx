import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from "./layout/main";
import PvpPage from './layout/PvpPage';
import Login from "./layout/Login";
import HomePage from "./layout/homePage";
import HistoryPage from './layout/HistoryPage';
import AnalysisPage from './layout/AnalysisPage';
import { UserAuthProvider } from "./context/UserAuthContext";

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
        </Routes>
      </Router>
    </UserAuthProvider>
  );
}

export default App;
