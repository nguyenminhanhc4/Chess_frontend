import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from "./layout/main";
import Login from "./layout/Login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/main" element={<MainLayout />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
