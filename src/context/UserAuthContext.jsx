import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { getSessionId } from "../utils/session";
const baseURL = import.meta.env.VITE_API_URL;

export const UserAuthContext = createContext();

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userStatus, setUserStatus] = useState("offline");

  const updateUserFromToken = async () => {
    const sessionId = getSessionId();
    const tokenKey = "authToken_" + sessionId;
    const token = localStorage.getItem(tokenKey);
    console.log("Token lấy từ localStorage:", token);
    if (token) {
      try {
        // Gọi trực tiếp jwt_decode(token) mà không cần .default
        const decoded = jwtDecode(token);
        console.log("Payload sau khi decode:", decoded);
        const userId = decoded.sub;
        const response = await axios.get(`${baseURL}/api/users/${userId}`);
        console.log("Thông tin user từ API:", response.data);
        setUser(response.data);
        setUserStatus("online");
      } catch (error) {
        console.error("Lỗi khi lấy thông tin user từ API:", error);
        setUser(null);
        setUserStatus("offline");
      }
    } else {
      setUser(null);
      setUserStatus("offline");
    }
  };

  const logout = () => {
    const sessionId = getSessionId();
    const tokenKey = "authToken_" + sessionId;
    localStorage.removeItem(tokenKey);
    setUser(null);
    setUserStatus("offline");
    window.location.href = "/";
  };

  useEffect(() => {
    updateUserFromToken();
  }, []);

  UserAuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return (
    <UserAuthContext.Provider
      value={{
        user,
        setUser,
        userStatus,
        setUserStatus,
        updateUserFromToken,
        logout,
      }}>
      {children}
    </UserAuthContext.Provider>
  );
};
