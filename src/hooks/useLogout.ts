import { useNavigate } from "react-router";
import { api } from "@/utils/axios";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useAuth } from "@/context/AuthContext";

export default function useLogout() {
  const { logout: clearAuth } = useAuth();
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await api.get("/api/auth/logout", {
        withCredentials: true,
      });

      clearAuth();

      toast.success("Successfully logged out");

      navigate("/auth", { replace: true });
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.message || "Logout failed"
        );
      } else {
        toast.error("Logout failed");
      }
    }
  };

  return logout;
}