import  { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { Input } from "antd";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import emblemImg from "../../imports/emblem.png";
import logoImg from "../../imports/logo.png";
import { AxiosError } from "axios";
import { api } from "../../utils/axios";
import { useAuth } from "../../context/AuthContext";
import type { AuthPayload } from "../../context/AuthContext";
import toast from "react-hot-toast";

type LoginFormInputs = {
  username: "";
  password: "";
};

export function Login() {
  const navigate = useNavigate();
  const { login, auth } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    if (auth?.accessToken) {
      navigate("/", { replace: true });
    }
  }, [auth, navigate]);

  const onSubmit = async (data: LoginFormInputs) => {
    setLoading(true);

    try {
      const response = await api.post<AuthPayload>("/api/v1/Auth/login", {
        username: data.username,
        password: data.password,
      });

      if (response.status === 200) {
        toast.success("Login successful");
      }
      login(response.data);

      if (response.data.mustChangePassword) {
        navigate("/change-password", { replace: true });
        return;
      }

      navigate("/", { replace: true });
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.title ?? "Invalid username or password"
        );
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#F8F9FB] font-sans">
      {/* Left Section */}
      <div className="hidden lg:flex flex-col w-1/2 bg-[#F7F5F0] relative overflow-hidden p-12 justify-center items-center">
        <div className="z-10 flex flex-col items-center text-center max-w-xl">
          <div className="flex gap-8 mb-8 items-center justify-center">
            <ImageWithFallback
              src={emblemImg}
              alt="Maharashtra Emblem"
              className="h-32 object-contain"
            />
            <div className="w-px h-24 bg-gray-300"></div>
            <ImageWithFallback
              src={logoImg}
              alt="SDMA Logo"
              className="h-28 object-contain"
            />
          </div>

          <h2 className="text-[#0B1F4D] text-sm md:text-base font-bold tracking-[0.2em] mb-4 uppercase">
            Government of Maharashtra
          </h2>

          <h1 className="text-[#0B1F4D] text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            Disaster Management,
            <br />
            Relief & Rehabilitation
            <br />
            Department
          </h1>

          <p className="text-[#64748B] text-lg font-medium max-w-md">
            Project Pipeline Monitoring & Procurement System
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 lg:p-10 border border-gray-100 transition-all duration-300">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-[#0B1F4D] mb-2">
              Portal Sign In
            </h2>
            <p className="text-[#64748B]">
              Enter your official credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="login-username" className="text-sm font-semibold text-[#0F172A] ml-1">
                Username
              </label>
              <Controller
                name="username"
                control={control}
                rules={{ required: "Username is required" }}
                render={({ field }) => (
                  <Input
                    {...field}
                    size="large"
                    id="login-username"
                    prefix={<User className="h-5 w-5 text-gray-400 mr-1.5 transition-colors" aria-hidden="true" />}
                    className="bg-[#F8F9FB] border-gray-200 rounded-xl text-[#0F172A] placeholder-gray-400 hover:border-[#1E5AA8] focus:border-[#1E5AA8] focus-within:border-[#1E5AA8] focus-within:ring-2 focus-within:ring-[#1E5AA8]/20 transition-all duration-200 py-3 [&>input]:bg-[#F8F9FB]"
                    placeholder="Enter your username"
                  />
                )}
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="login-password" className="text-sm font-semibold text-[#0F172A] ml-1">
                Password
              </label>
              <Controller
                name="password"
                control={control}
                rules={{ required: "Password is required" }}
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    size="large"
                    id="login-password"
                    prefix={<Lock className="h-5 w-5 text-gray-400 mr-1.5 transition-colors" aria-hidden="true" />}
                    iconRender={(visible) =>
                      visible ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-[#0B1F4D] transition-colors cursor-pointer" aria-label="Hide password" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-[#0B1F4D] transition-colors cursor-pointer" aria-label="Show password" />
                      )
                    }
                    className="bg-[#F8F9FB] border-gray-200 rounded-xl text-[#0F172A] placeholder-gray-400 hover:border-[#1E5AA8] focus:border-[#1E5AA8] focus-within:border-[#1E5AA8] focus-within:ring-2 focus-within:ring-[#1E5AA8]/20 transition-all duration-200 py-3 [&>input]:bg-[#F8F9FB]"
                    placeholder="••••••••"
                  />
                )}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full font-semibold py-4 px-4 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#0B1F4D] hover:bg-[#1E5AA8] text-white shadow-[#0B1F4D]/20 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
              }`}
            >
              {loading ? (
                <>
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span>Signing In...</span>
                </>
              ) : (
                "Secure Sign In"
              )}
            </button>
          </form>
        </div>

        <div className="mt-12 text-center text-[#64748B] text-sm">
          <p>Disaster Management Portal © 2026</p>
          <p className="mt-1">Designed for Government of Maharashtra</p>
        </div>
      </div>
    </div>
  );
}