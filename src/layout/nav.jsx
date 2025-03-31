import { FaGamepad, FaRobot, FaChartBar, FaHome, FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { toast } from "react-toastify";
import { UserAuthContext } from "../context/UserAuthContext";
import ProtectedLink from "./ProtectedLink"; // Đảm bảo đường dẫn chính xác

const Nav = () => {
  const { user } = useContext(UserAuthContext);
  const navigate = useNavigate();

  // Hàm xử lý cho các đường dẫn cần đăng nhập
  const handleProtectedClick = (e, path) => {
    if (!user) {
      e.preventDefault();
      toast.warn("Bạn phải đăng nhập để sử dụng tính năng này!");
      navigate("/login");
    }
  };

  return (
    <nav className="min-h-screen bg-gray-700 text-white p-6 w-full flex flex-col justify-between">
      <div>
        {/* Logo và tiêu đề */}
        <div className="flex flex-col items-start mb-8">
          <div className="flex items-center space-x-1">
            <div className="w-16 h-16 rounded-full overflow-hidden">
              <img
                src="/logo_chess_app.png"
                alt="Chess App Logo"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="text-xl font-bold">Chess App</div>
          </div>
        </div>

        {/* Nếu đã đăng nhập thì hiển thị thông tin người dùng */}
        {user && (
          <div className="flex items-center space-x-2 mb-8">
            <img
              src={user.profilePicture || "/user_default.jpg"}
              alt="Avatar"
              className="w-10 h-10 rounded-full border-2 border-blue-300"
            />
            <div>
              <div className="font-semibold">{user.username}</div>
              <div className="text-sm text-gray-200">
                Rating: {user.rating ?? 600}
              </div>
            </div>
          </div>
        )}

        {/* Danh sách chức năng */}
        <ul className="space-y-4">
          <li className="text-gray-400 uppercase text-xs tracking-wider">
            Chế độ chơi
          </li>
          <li className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-600 cursor-pointer">
            <FaGamepad />
            <ProtectedLink to="/online" className="text-white">
              Chơi trực tuyến
            </ProtectedLink>
          </li>
          <li className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-600 cursor-pointer">
            <FaRobot />
            {/* Cho phép chơi với máy mà không cần đăng nhập */}
            <Link to="/main" className="text-white">
              Chơi với máy
            </Link>
          </li>
          <li className="mt-6 text-gray-400 uppercase text-xs tracking-wider">
            Phân tích & Lịch sử
          </li>
          <li className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-600 cursor-pointer">
            <FaChartBar />
            <ProtectedLink to="/history" className="text-white">
              Lưu trữ & phân tích ván đấu
            </ProtectedLink>
          </li>
          <li className="mt-6 text-gray-400 uppercase text-xs tracking-wider">
            Khác
          </li>
          <li className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-600 cursor-pointer">
            <FaHome />
            <Link to="/" className="text-white">
              Trang chủ
            </Link>
          </li>
          <li className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-600 cursor-pointer">
            <FaUser />
            <ProtectedLink to="/profile" className="text-white">
              Hồ sơ
            </ProtectedLink>
          </li>
        </ul>
      </div>

      <div className="mt-8">
        <hr className="border-gray-600 mb-4" />
        <div className="text-sm text-gray-300">© 2025 Chess App</div>
      </div>
    </nav>
  );
};

export default Nav;
