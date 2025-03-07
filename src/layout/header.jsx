import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserAuthContext } from '../context/UserAuthContext';
import { FaSignOutAlt } from 'react-icons/fa';

const Header = () => {
  const { user, updateUserFromToken } = useContext(UserAuthContext);

  const handleLogout = () => {
    localStorage.removeItem('token');
    updateUserFromToken(); // Cập nhật context sau khi đăng xuất
  };

  return (
    <header className="w-full bg-gray-800 text-white py-1 px-2 flex items-center justify-between shadow-md">
      {/* Phần bên trái: logo và tên app */}
      <div className="flex items-center">
        <div className="w-16 h-16 rounded-full overflow-hidden mr-2">
          <img
            src="/logo_chess_app.png"  // Đường dẫn từ thư mục public
            alt="Chess App Logo"
            className="object-cover w-full h-full"
          />
        </div>
        <div className="text-lg md:text-xl font-bold">My Chess App</div>
      </div>

      {/* Phần bên phải: thông tin đăng nhập/đăng xuất */}
      <div className="flex items-center space-x-4">
        {user ? (
          <div className="flex items-center space-x-3">
            <span className="text-sm md:text-base">Xin chào, {user.username}</span>
            <button onClick={handleLogout} className="text-red-500 hover:text-red-600">
              <FaSignOutAlt size={24} />
            </button>
          </div>
        ) : (
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
