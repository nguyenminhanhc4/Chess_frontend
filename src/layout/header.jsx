import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import * as jwtDecode from "jwt-decode"; // Sử dụng cú pháp import toàn bộ module

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accountInfo, setAccountInfo] = useState({
    username: "",
    avatar: "/path/to/default-avatar.jpg",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      try {
        // Decode token để lấy thông tin người dùng
        const decoded = jwtDecode.default(token);
        setAccountInfo((prev) => ({
          ...prev,
          username: decoded.username || "DefaultUsername",
        }));
      } catch (error) {
        console.error("Lỗi decode token:", error);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <header className="w-full bg-gray-800 text-white py-2 px-8 flex items-center justify-between shadow-md">
      <div className="text-lg md:text-xl font-bold">My Chess App</div>
      <div className="flex items-center space-x-2">
        {isLoggedIn ? (
          <>
            <span className="text-sm">Tài khoản: {accountInfo.username}</span>
            <img
              className="w-8 h-8 rounded-full"
              src={accountInfo.avatar}
              alt="Avatar"
            />
          </>
        ) : (
          <Link to="/login">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
              Đăng nhập
            </button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
