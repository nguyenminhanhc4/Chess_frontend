import { useState, useContext } from "react";
import axios from "axios";
import { GiChessKing } from "react-icons/gi";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { UserAuthContext } from "../context/UserAuthContext";
import { getSessionId } from "../utils/session";
import { SwitchTransition, CSSTransition } from "react-transition-group";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const navigate = useNavigate();
  const { updateUserFromToken } = useContext(UserAuthContext);

  // State management
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form states
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");

  // Reset form khi chuyển đổi
  const switchForm = (isLoginForm) => {
    setIsLogin(isLoginForm);
    setError("");
    setLoginEmail("");
    setLoginPassword("");
    setRegisterUsername("");
    setRegisterEmail("");
    setRegisterPassword("");
    setRegisterConfirmPassword("");
  };

  // Xử lý đăng nhập
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          email: loginEmail,
          password: loginPassword,
        }
      );

      const sessionId = getSessionId();
      localStorage.setItem(`authToken_${sessionId}`, response.data.token);
      updateUserFromToken();
      navigate("/");
    } catch (error) {
      setError(error.response?.data?.message || "Đăng nhập thất bại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý đăng ký
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (registerPassword !== registerConfirmPassword) {
        throw new Error("Mật khẩu nhập lại không khớp!");
      }

      await axios.post("http://localhost:8080/api/auth/register", {
        username: registerUsername,
        email: registerEmail,
        password: registerPassword,
        confirmPassword: registerConfirmPassword,
      });

      setError(""); // Clear error nếu thành công
      toast.success("Đăng ký thành công! Hãy đăng nhập.");
      switchForm(true);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Styles
  const floatingInput =
    "block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-600 appearance-none focus:outline-none focus:ring-0 focus:border-indigo-500 peer";
  const floatingLabel =
    "absolute text-sm text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-indigo-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 shadow-2xl rounded-xl p-6 md:p-10 w-full max-w-md">
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 text-red-300 text-sm rounded-lg">
            ⚠️ {error}
          </div>
        )}

        <div
          className={`transition-all duration-300 ease-out ${
            isLogin ? "opacity-100 translate-y-0" : "opacity-100 translate-y-4"
          }`}>
          <GiChessKing className="mx-auto text-5xl text-gray-300 mb-4" />
          <SwitchTransition mode="out-in">
            {isLogin ? (
              <CSSTransition key="login" timeout={300} classNames="fade">
                <div>
                  <h2 className="text-3xl font-extrabold text-white text-center mb-8 font-serif">
                    Đăng nhập
                  </h2>

                  <form onSubmit={handleLoginSubmit}>
                    {/* Email Field */}
                    <div className="relative z-0 w-full mb-6 group">
                      <input
                        type="email"
                        id="loginEmail"
                        autoComplete="email"
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

                    {/* Password Field với toggle */}
                    <div className="relative z-0 w-full mb-6 group">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="loginPassword"
                        autoComplete="current-password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder=" "
                        className={floatingInput}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-3 text-gray-400 hover:text-gray-200">
                        {showPassword ? <FaEye /> : <FaEyeSlash />}
                      </button>
                      <label htmlFor="loginPassword" className={floatingLabel}>
                        Mật khẩu
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-md shadow hover:bg-indigo-700 transition duration-150 ease-in-out">
                      {isSubmitting ? (
                        <div className="animate-spin h-5 w-5 border-2 border-white/30 rounded-full border-t-transparent mx-auto" />
                      ) : (
                        "Đăng nhập"
                      )}
                    </button>
                  </form>

                  <p className="text-center text-sm text-gray-300 mt-6">
                    Chưa có tài khoản?{" "}
                    <button
                      onClick={() => switchForm(false)}
                      className="font-medium text-indigo-400 hover:underline transition-colors duration-200 hover:text-indigo-300">
                      Đăng ký
                    </button>
                  </p>
                </div>
              </CSSTransition>
            ) : (
              <CSSTransition key="register" timeout={300} classNames="fade">
                <div>
                  <h2 className="text-3xl font-extrabold text-white text-center mb-8 font-serif">
                    Đăng ký
                  </h2>

                  <form onSubmit={handleRegisterSubmit}>
                    {/* Username Field */}
                    <div className="relative z-0 w-full mb-6 group">
                      <input
                        type="text"
                        id="registerUsername"
                        autoComplete="username"
                        value={registerUsername}
                        onChange={(e) => setRegisterUsername(e.target.value)}
                        placeholder=" "
                        className={floatingInput}
                        required
                      />
                      <label
                        htmlFor="registerUsername"
                        className={floatingLabel}>
                        Tên người dùng
                      </label>
                    </div>

                    {/* Email Field */}
                    <div className="relative z-0 w-full mb-6 group">
                      <input
                        type="email"
                        id="registerEmail"
                        autoComplete="email"
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

                    {/* Password Field với toggle */}
                    <div className="relative z-0 w-full mb-6 group">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="registerPassword"
                        autoComplete="new-password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        placeholder=" "
                        className={floatingInput}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-3 text-gray-400 hover:text-gray-200">
                        {showPassword ? <FaEye /> : <FaEyeSlash />}
                      </button>
                      <label
                        htmlFor="registerPassword"
                        className={floatingLabel}>
                        Mật khẩu
                      </label>
                    </div>

                    {/* Confirm Password Field với toggle */}
                    <div className="relative z-0 w-full mb-6 group">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="registerConfirmPassword"
                        autoComplete="new-password"
                        value={registerConfirmPassword}
                        onChange={(e) =>
                          setRegisterConfirmPassword(e.target.value)
                        }
                        placeholder=" "
                        className={floatingInput}
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-2 top-3 text-gray-400 hover:text-gray-200">
                        {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                      </button>
                      <label
                        htmlFor="registerConfirmPassword"
                        className={floatingLabel}>
                        Nhập lại mật khẩu
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-md shadow hover:bg-indigo-700 transition duration-150 ease-in-out">
                      {isSubmitting ? (
                        <div className="animate-spin h-5 w-5 border-2 border-white/30 rounded-full border-t-transparent mx-auto" />
                      ) : (
                        "Đăng ký"
                      )}
                    </button>
                  </form>

                  <p className="text-center text-sm text-gray-300 mt-6">
                    Đã có tài khoản?{" "}
                    <button
                      onClick={() => switchForm(true)}
                      className="font-medium text-indigo-400 hover:underline transition-colors duration-200 hover:text-indigo-300">
                      Đăng nhập
                    </button>
                  </p>
                </div>
              </CSSTransition>
            )}
          </SwitchTransition>
        </div>
      </div>
    </div>
  );
};

export default Login;
