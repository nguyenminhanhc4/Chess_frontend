import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from "./layout/main";
import Login from "./layout/Login";
import { UserAuthProvider } from "./context/UserAuthContext";
function App() {
  return (
    <UserAuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </UserAuthProvider>
  );
}

export default App;
