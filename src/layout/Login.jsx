import React, { useState } from 'react';
import { GiChessKing } from 'react-icons/gi';

const Login = () => {
  // State để theo dõi xem hiển thị form đăng nhập hay đăng ký
  const [isLogin, setIsLogin] = useState(true);

  // State cho form đăng nhập
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // State cho form đăng ký
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  // Xử lý submit cho form đăng nhập
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    console.log("Đăng nhập:", loginEmail, loginPassword);
    // Xử lý đăng nhập (gọi API, vv.)
  };

  // Xử lý submit cho form đăng ký
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (registerPassword !== registerConfirmPassword) {
      alert("Mật khẩu nhập lại không khớp!");
      return;
    }
    console.log("Đăng ký:", registerUsername, registerEmail, registerPassword);
    // Xử lý đăng ký (gọi API, vv.)
  };

  // Class dùng chung cho các trường nhập liệu
  const inputClass =
    "appearance-none block w-full bg-gray-700 text-white border border-gray-600 rounded-md py-3 px-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 shadow-2xl rounded-xl p-10 w-full max-w-md">
        {/* Biểu tượng vua cờ */}
        <GiChessKing className="mx-auto text-5xl text-gray-300 mb-4" />
        {isLogin ? (
          <>
            <h2 className="text-3xl font-extrabold text-white text-center mb-8 font-serif">
              Đăng nhập
            </h2>
            <form onSubmit={handleLoginSubmit}>
              <div className="mb-5">
                <label
                  htmlFor="loginEmail"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="loginEmail"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  className={inputClass}
                  required
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="loginPassword"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Mật khẩu
                </label>
                <input
                  type="password"
                  id="loginPassword"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className={inputClass}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-md shadow hover:bg-indigo-700 transition duration-150 ease-in-out"
              >
                Đăng nhập
              </button>
            </form>
            <p className="text-center text-sm text-gray-400 mt-6">
              Chưa có tài khoản?{' '}
              <button
                onClick={() => setIsLogin(false)}
                className="font-medium text-indigo-400 hover:underline"
              >
                Đăng ký
              </button>
            </p>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-extrabold text-white text-center mb-8 font-serif">
              Đăng ký
            </h2>
            <form onSubmit={handleRegisterSubmit}>
              <div className="mb-5">
                <label
                  htmlFor="registerUsername"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Tên người dùng
                </label>
                <input
                  type="text"
                  id="registerUsername"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  placeholder="Nhập tên của bạn"
                  className={inputClass}
                  required
                />
              </div>
              <div className="mb-5">
                <label
                  htmlFor="registerEmail"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="registerEmail"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  className={inputClass}
                  required
                />
              </div>
              <div className="mb-5">
                <label
                  htmlFor="registerPassword"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Mật khẩu
                </label>
                <input
                  type="password"
                  id="registerPassword"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className={inputClass}
                  required
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="registerConfirmPassword"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Nhập lại mật khẩu
                </label>
                <input
                  type="password"
                  id="registerConfirmPassword"
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  className={inputClass}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gray-700 text-white font-semibold rounded-md shadow hover:bg-gray-600 transition duration-150 ease-in-out"
              >
                Đăng ký
              </button>
            </form>
            <p className="text-center text-sm text-gray-400 mt-6">
              Đã có tài khoản?{' '}
              <button
                onClick={() => setIsLogin(true)}
                className="font-medium text-indigo-400 hover:underline"
              >
                Đăng nhập
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
