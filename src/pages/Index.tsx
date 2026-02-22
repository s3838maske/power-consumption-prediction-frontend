import { Navigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks";

const Index = () => {
  const { user, token } = useAppSelector((state) => state.auth);
  
  if (token && user) {
    return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/user/dashboard"} replace />;
  }
  
  return <Navigate to="/auth/login" replace />;
};

export default Index;
