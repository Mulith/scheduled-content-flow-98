
import { AuthPage } from "@/components/AuthPage";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const navigate = useNavigate();

  return <AuthPage onBack={() => navigate("/")} />;
};

export default Auth;
