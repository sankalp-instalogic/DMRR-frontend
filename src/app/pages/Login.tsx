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
import { Button } from "../components/ui/button";
import { Spinner } from "../components/ui/spinner";

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
    <div className="flex min-h-screen w-full bg-background font-sans">
      {/* Left Section */}
      <div className="hidden lg:flex flex-col w-1/2 bg-[#F7F5F0] relative overflow-hidden p-12 justify-center items-center">
        <div className="z-10 flex flex-col items-center text-center max-w-xl">
          <div className="flex gap-8 mb-8 items-center justify-center">
            <ImageWithFallback
              src={emblemImg}
              alt="Maharashtra Emblem"
              className="h-32 object-contain"
            />
            <div className="w-px h-24 bg-muted"></div>
            <ImageWithFallback
              src={logoImg}
              alt="SDMA Logo"
              className="h-28 object-contain"
            />
          </div>

          <h2 className="text-primary text-sm md:text-base font-bold tracking-[0.2em] mb-4 uppercase">
            Government of Maharashtra
          </h2>

          <h1 className="text-primary text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            Disaster Management,
            <br />
            Relief & Rehabilitation
            <br />
            Department
          </h1>

          <p className="text-muted-foreground text-lg font-medium max-w-md">
            Project Pipeline Monitoring & Procurement System
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-12">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 lg:p-10 border border-border transition-all duration-300">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-primary mb-2">
              Portal Sign In
            </h2>
            <p className="text-muted-foreground">
              Enter your official credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="login-username" className="text-sm font-semibold text-foreground ml-1">
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
                    prefix={<User className="h-5 w-5 text-muted-foreground mr-1.5 transition-colors" aria-hidden="true" />}
                    className="bg-background border-border rounded-xl text-foreground placeholder-muted-foreground hover:border-secondary focus:border-secondary focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20 transition-all duration-200 py-3 [&>input]:bg-background"
                    placeholder="Enter your username"
                  />
                )}
              />
              {errors.username && (
                <p className="text-destructive text-xs mt-1 ml-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="login-password" className="text-sm font-semibold text-foreground ml-1">
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
                    prefix={<Lock className="h-5 w-5 text-muted-foreground mr-1.5 transition-colors" aria-hidden="true" />}
                    iconRender={(visible) =>
                      visible ? (
                        <EyeOff className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" aria-label="Hide password" />
                      ) : (
                        <Eye className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer" aria-label="Show password" />
                      )
                    }
                    className="bg-background border-border rounded-xl text-foreground placeholder-muted-foreground hover:border-secondary focus:border-secondary focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20 transition-all duration-200 py-3 [&>input]:bg-background"
                    placeholder="••••••••"
                  />
                )}
              />
              {errors.password && (
                <p className="text-destructive text-xs mt-1 ml-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className={`w-full h-auto py-4 rounded-xl shadow-lg ${
                loading
                  ? "bg-muted-foreground cursor-no-drop"
                  : "hover:bg-secondary shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
              }`}
            >
              {loading ? (
                <>
                  <Spinner inline iconClassName="size-4" />
                  <span>Signing In...</span>
                </>
              ) : (
                "Secure Sign In"
              )}
            </Button>
          </form>
        </div>

        <div className="mt-12 text-center text-muted-foreground text-sm">
          <p>Disaster Management Portal © 2026</p>
          <p className="mt-1">Designed for Government of Maharashtra</p>
        </div>
      </div>
    </div>
  );
}