import { Link } from "react-router-dom";
import { useContext } from "react";
import { toast } from "react-toastify";
import { UserAuthContext } from "../context/UserAuthContext";

const ProtectedLink = ({ to, children, ...props }) => {
  const { user } = useContext(UserAuthContext);

  const handleClick = (e) => {
    if (!user) {
      e.preventDefault();
      toast.warn("Bạn phải đăng nhập để sử dụng tính năng này!");
    }
  };

  return (
    <Link to={to} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
};

export default ProtectedLink;
