import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Import đúng cách cho jwt-decode v4
import { FaSignOutAlt } from "react-icons/fa";
const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accountInfo, setAccountInfo] = useState({
    username: "",
    avatar: "../../public/vite.svg",
  });

  // Sử dụng useEffect để log ra mỗi khi isLoggedIn thay đổi
  useEffect(() => {
    console.log("Trạng thái đăng nhập (isLoggedIn):", isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    // Kiểm tra token khi component mount
    checkLoginStatus();
    
    // Thêm event listener để kiểm tra khi localStorage thay đổi
    window.addEventListener('storage', checkLoginStatus);
    
    // Cleanup function
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  // Hàm kiểm tra trạng thái đăng nhập
  const checkLoginStatus = () => {
    const token = localStorage.getItem("token");
    console.log("Token hiện tại:", token ? "Có token" : "Không có token");
    
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded);
        
        // Kiểm tra cấu trúc token và thông tin cần thiết
        if (decoded && decoded.username) {
          console.log("Token hợp lệ, đăng nhập với user:", decoded.username);
          setIsLoggedIn(true);
          setAccountInfo({
            username: decoded.username,
            avatar: decoded.avatar || "../../public/vite.svg",
          });
        } else {
          // Token không chứa thông tin cần thiết
          console.log("Token không chứa thông tin username cần thiết");
          // KHÔNG tự động xóa token nếu không có username
          // Chỉ đặt trạng thái không đăng nhập
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Lỗi decode token:", error);
        // KHÔNG tự động xóa token nếu có lỗi decode
        // Chỉ đặt trạng thái không đăng nhập
        setIsLoggedIn(false);
      }
    } else {
      // Không có token
      console.log("Không tìm thấy token trong localStorage");
      setIsLoggedIn(false);
    }
  };

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    console.log("Người dùng chọn đăng xuất");
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setAccountInfo({
      username: "",
      avatar: "../../public/vite.svg",
    });
  };

  // Log đầy đủ thông tin token để debug
  const debugToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      console.log("Token đầy đủ:", token);
      try {
        const decoded = jwtDecode(token);
        console.log("Token được decode:", JSON.stringify(decoded, null, 2));
      } catch (error) {
        console.error("Không thể decode token:", error);
      }
    } else {
      console.log("Không có token để debug");
    }
  };

  return (
    <header className="w-full bg-gray-800 text-white py-2 px-8 flex items-center justify-between shadow-md">
      <div className="text-lg md:text-xl font-bold" onClick={debugToken}>My Chess App</div>
      <div className="flex items-center space-x-4">
        {isLoggedIn ? (
          // Hiển thị thông tin tài khoản khi đã đăng nhập
          <div className="flex items-center space-x-3">
            <span className="text-sm md:text-base">Xin chào, {accountInfo.username}</span>
            <img
              className="w-8 h-8 rounded-full border-2 border-blue-300"
              src={accountInfo.avatar}
              alt="Avatar"
            />
            <button onClick={handleLogout} className="text-red-500 hover:text-red-600">
              <FaSignOutAlt size={24} />
            </button>
          </div>
        ) : (
          // Hiển thị nút đăng nhập khi chưa đăng nhập
          <Link to="/login">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded font-medium">
              Đăng nhập
            </button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;