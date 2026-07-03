import { api } from "../utils/axios";
import { useAuth } from "@/context/AuthContext";
import type { AuthPayload } from "@/context/AuthContext";

export default function useRefresh() {
  const { login, logout } = useAuth();

  const refresh = async () => {
    try {
      const response = await api.get<AuthPayload>(
        "/api/v1/Auth/refresh",
        {
          withCredentials: true,
        }
      );

      login(response.data);

      return response.data;
    } catch {
      logout();
      return null;
    }
  };

  return refresh;
}