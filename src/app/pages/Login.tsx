import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Eye, EyeOff, Lock, Mail, AlertTriangle } from "lucide-react";
import emblemImg from "../../imports/emblem.png";
import logoImg from "../../imports/logo.png";
import bgImg from "../../imports/image-1.png";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lastLogin, setLastLogin] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Check for account lockout in localStorage
    const lockedUntil = localStorage.getItem("accountLockedUntil");
    if (lockedUntil) {
      const lockTime = new Date(lockedUntil);
      if (new Date() < lockTime) {
        setIsLocked(true);
        setError("Account Locked – Contact Administrator");
      } else {
        localStorage.removeItem("accountLockedUntil");
        localStorage.removeItem("failedAttempts");
      }
    }

    // Load failed attempts
    const attempts = localStorage.getItem("failedAttempts");
    if (attempts) {
      setFailedAttempts(parseInt(attempts));
    }

    // Load last login timestamp
    const lastLoginTime = localStorage.getItem("lastLoginTime");
    if (lastLoginTime) {
      setLastLogin(lastLoginTime);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) {
      setError("Account Locked – Contact Administrator");
      return;
    }

    if (email === "officer@disaster-management.gov" && password === "password123") {
      // Successful login
      const currentTime = new Date().toLocaleString();

      // Create audit entry
      const auditEntry = {
        timestamp: currentTime,
        userId: email,
        action: "LOGIN_SUCCESS",
        ipAddress: "Mock IP: 192.168.1.1"
      };

      // Save audit log
      const existingAudit = localStorage.getItem("loginAudit");
      const auditLog = existingAudit ? JSON.parse(existingAudit) : [];
      auditLog.push(auditEntry);
      localStorage.setItem("loginAudit", JSON.stringify(auditLog));

      // Update last login time
      localStorage.setItem("lastLoginTime", currentTime);

      // Clear failed attempts
      localStorage.removeItem("failedAttempts");
      setFailedAttempts(0);

      login();
      navigate("/");
    } else {
      // Failed login
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);
      localStorage.setItem("failedAttempts", newFailedAttempts.toString());

      // Create audit entry for failed login
      const auditEntry = {
        timestamp: new Date().toLocaleString(),
        userId: email,
        action: "LOGIN_FAILED",
        ipAddress: "Mock IP: 192.168.1.1"
      };

      const existingAudit = localStorage.getItem("loginAudit");
      const auditLog = existingAudit ? JSON.parse(existingAudit) : [];
      auditLog.push(auditEntry);
      localStorage.setItem("loginAudit", JSON.stringify(auditLog));

      if (newFailedAttempts >= 5) {
        // Lock account for 30 minutes
        const lockUntil = new Date();
        lockUntil.setMinutes(lockUntil.getMinutes() + 30);
        localStorage.setItem("accountLockedUntil", lockUntil.toISOString());
        setIsLocked(true);
        setError("Account Locked – Contact Administrator");
      } else {
        setError(`Invalid credentials. ${5 - newFailedAttempts} attempts remaining.`);
      }
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#F8F9FB] font-sans">
      {/* Left Section */}
      <div className="hidden lg:flex flex-col w-1/2 bg-[#F7F5F0] relative overflow-hidden p-12 justify-center items-center">
        {/* Optional background texture/image overlay with low opacity */}
        {/* <div className="absolute inset-0 z-0 opacity-10">
          <ImageWithFallback src={bgImg} alt="Background" className="w-full h-full object-cover" />
        </div> */}
        
        <div className="z-10 flex flex-col items-center text-center max-w-xl">
          <div className="flex gap-8 mb-8 items-center justify-center">
            <ImageWithFallback src={emblemImg} alt="Maharashtra Emblem" className="h-32 object-contain" />
            <div className="w-px h-24 bg-gray-300"></div>
            <ImageWithFallback src={logoImg} alt="SDMA Logo" className="h-28 object-contain" />
          </div>
          
          <h2 className="text-[#0B1F4D] text-sm md:text-base font-bold tracking-[0.2em] mb-4 uppercase">
            Government of Maharashtra
          </h2>
          
          <h1 className="text-[#0B1F4D] text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            Disaster Management,<br />
            Relief & Rehabilitation<br />
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
            <h2 className="text-3xl font-bold text-[#0B1F4D] mb-2">Portal Sign In</h2>
            <p className="text-[#64748B]">Enter your official credentials to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#0F172A] ml-1">Official Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#1E5AA8] transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-[#F8F9FB] border border-gray-200 rounded-xl text-[#0F172A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20 focus:border-[#1E5AA8] transition-all duration-200"
                  placeholder="officer@disaster-management.gov"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#0F172A] ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#1E5AA8] transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-3.5 bg-[#F8F9FB] border border-gray-200 rounded-xl text-[#0F172A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20 focus:border-[#1E5AA8] transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#0B1F4D] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className={`p-3 border rounded-lg flex items-center gap-2 ${
                isLocked ? 'bg-red-50 border-red-200' : 'bg-red-50 border-red-100'
              }`}>
                {isLocked && <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />}
                <p className="text-sm text-red-600 text-center font-medium flex-1">{error}</p>
              </div>
            )}

            {lastLogin && !error && (
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-sm text-blue-700 text-center">Last login: {lastLogin}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLocked}
              className={`w-full font-semibold py-4 px-4 rounded-xl shadow-lg transition-all duration-300 ${
                isLocked
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#0B1F4D] hover:bg-[#1E5AA8] text-white shadow-[#0B1F4D]/20 hover:shadow-xl hover:-translate-y-0.5'
              }`}
            >
              {isLocked ? 'Account Locked' : 'Secure Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-[#64748B]">
            <p>Mock Credentials: <br/>officer@disaster-management.gov / password123</p>
            {failedAttempts > 0 && failedAttempts < 5 && (
              <p className="mt-2 text-orange-600 font-medium">
                Warning: {failedAttempts} failed attempt{failedAttempts > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
        
        <div className="mt-12 text-center text-[#64748B] text-sm">
          <p>Disaster Management Portal © 2026</p>
          <p className="mt-1">Designed for Government of Maharashtra</p>
        </div>
      </div>
    </div>
  );
}
