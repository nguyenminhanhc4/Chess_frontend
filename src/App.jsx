import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from "./layout/main";
import Login from "./layout/Login";
import HomePage from "./layout/homePage";
import HistoryPage from './layout/HistoryPage';
import { UserAuthProvider } from "./context/UserAuthContext";
function App() {
  return (
    <UserAuthProvider>
      <Router>
        <Routes>
          <Route path="/main" element={<MainLayout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/analysis" element={<HistoryPage />} />
        </Routes>
      </Router>
    </UserAuthProvider>
  );
}

export default App;
