import { Link } from 'react-router-dom';

const Header = () => {
  const isLoggedIn = false; // Thay đổi logic xác thực khi có API

  return (
    <header className="w-full bg-gray-800 text-white py-2 px-8 flex items-center justify-between shadow-md">
      <div className="text-lg md:text-xl font-bold">My Chess App</div>
      <div className="flex items-center space-x-2">
        {isLoggedIn ? (
          <>
            <span className="text-sm">Tài khoản: NguyenVanA</span>
            <img
              className="w-8 h-8 rounded-full"
              src="/path/to/avatar.jpg"
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
