import React, { useState } from 'react';
import axios from 'axios';
import { GiChessKing } from 'react-icons/gi';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Login = () => {
  const navigate = useNavigate(); // Khởi tạo navigate

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
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email: loginEmail,
        password: loginPassword,
      });
      console.log("Đăng nhập thành công:", response.data);
      
      // Lưu token vào localStorage
      localStorage.setItem('token', response.data.token);
      
      // Chuyển hướng đến trang Main
      navigate('/main');
      
    } catch (error) {
      console.error("Lỗi đăng nhập:", error.response ? error.response.data : error.message);
      alert("Đăng nhập thất bại!");
    }
  };

  // Xử lý submit cho form đăng ký
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (registerPassword !== registerConfirmPassword) {
      alert("Mật khẩu nhập lại không khớp!");
      return;
    }
    try {
      const response = await axios.post('http://localhost:8080/api/auth/register', {
        username: registerUsername,
        email: registerEmail,
        password: registerPassword,
        confirmPassword: registerConfirmPassword,
      });
      console.log("Đăng ký thành công:", response.data);
      alert("Đăng ký thành công! Hãy đăng nhập.");
      setIsLogin(true);
    } catch (error) {
      console.error("Lỗi đăng ký:", error.response ? error.response.data : error.message);
      alert("Đăng ký thất bại!");
    }
  };

  // Class cho floating input field
  const floatingInput = "block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:border-indigo-500 peer";
  const floatingLabel =
    "absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-indigo-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0";

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
              {/* Email */}
              <div className="relative z-0 w-full mb-6 group">
                <input
                  type="email"
                  id="loginEmail"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder=" "
                  className={floatingInput}
                  required
                />
                <label htmlFor="loginEmail" className={floatingLabel}>
                  Email
                </label>
              </div>
              {/* Mật khẩu */}
              <div className="relative z-0 w-full mb-6 group">
                <input
                  type="password"
                  id="loginPassword"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder=" "
                  className={floatingInput}
                  required
                />
                <label htmlFor="loginPassword" className={floatingLabel}>
                  Mật khẩu
                </label>
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
              {/* Tên người dùng */}
              <div className="relative z-0 w-full mb-6 group">
                <input
                  type="text"
                  id="registerUsername"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  placeholder=" "
                  className={floatingInput}
                  required
                />
                <label htmlFor="registerUsername" className={floatingLabel}>
                  Tên người dùng
                </label>
              </div>
              {/* Email */}
              <div className="relative z-0 w-full mb-6 group">
                <input
                  type="email"
                  id="registerEmail"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder=" "
                  className={floatingInput}
                  required
                />
                <label htmlFor="registerEmail" className={floatingLabel}>
                  Email
                </label>
              </div>
              {/* Mật khẩu */}
              <div className="relative z-0 w-full mb-6 group">
                <input
                  type="password"
                  id="registerPassword"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder=" "
                  className={floatingInput}
                  required
                />
                <label htmlFor="registerPassword" className={floatingLabel}>
                  Mật khẩu
                </label>
              </div>
              {/* Nhập lại mật khẩu */}
              <div className="relative z-0 w-full mb-6 group">
                <input
                  type="password"
                  id="registerConfirmPassword"
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  placeholder=" "
                  className={floatingInput}
                  required
                />
                <label htmlFor="registerConfirmPassword" className={floatingLabel}>
                  Nhập lại mật khẩu
                </label>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-md shadow hover:bg-indigo-700 transition duration-150 ease-in-out"
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
