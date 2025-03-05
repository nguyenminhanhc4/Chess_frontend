const Header = () => {
  return (
    <header className="w-full bg-gray-800 text-white py-2 px-4 flex items-center justify-between shadow-md">
      {/* Phần bên trái: tiêu đề */}
      <div className="text-lg md:text-xl font-bold">
        My Chess App
      </div>
      {/* Phần bên phải: thông tin tài khoản */}
      <div className="flex items-center space-x-2">
        <span className="text-sm">Tài khoản: NguyenVanA</span>
        {/* Nếu có avatar, có thể thêm hình ảnh */}
        <img 
          className="w-8 h-8 rounded-full" 
          src="../../public/vite.svg" 
          alt="Avatar" 
        />
      </div>
    </header>
  );
};
export default Header;
