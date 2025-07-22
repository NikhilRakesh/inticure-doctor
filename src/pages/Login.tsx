import { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  Mail,
  Smartphone,
  Lock,
  ArrowRight,
  RotateCw,
  User,
  Shield,
} from "lucide-react";
import { api } from "../lib/api";
import { useToast } from "../context/ToastProvider";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../features/Auth/authSlice";

const Login = () => {
  const [loginMethod, setLoginMethod] = useState<"email" | "mobile">("mobile");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [activeOtpIndex, setActiveOtpIndex] = useState(0);
  const [step, setStep] = useState<"input" | "otp">("input");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    mobile: "",
    otp: "",
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);

  const floatingX = useMotionValue(0);
  const floatingY = useMotionValue(0);
  const rotateX = useTransform(floatingY, [-50, 50], [5, -5]);
  const rotateY = useTransform(floatingX, [-50, 50], [-5, 5]);

  const { showToast } = useToast();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleHover = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    floatingX.set((x - rect.width / 2) / 6);
    floatingY.set((y - rect.height / 2) / 6);
  };

  const handleHoverEnd = () => {
    floatingX.set(0);
    floatingY.set(0);
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateMobile = (mobile: string) => {
    const re = /^[6-9]\d{9}$/;
    return re.test(mobile);
  };

  const handleSendOtp = async () => {
    setIsLoading(true);
    setErrors({ email: "", mobile: "", otp: "" });

    if (loginMethod === "email" && !validateEmail(email)) {
      setErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address",
      }));
      setIsLoading(false);
      return;
    }

    if (loginMethod === "mobile" && !validateMobile(mobile)) {
      setErrors((prev) => ({
        ...prev,
        mobile: "Please enter a valid 10-digit Indian mobile number",
      }));
      setIsLoading(false);
      return;
    }
    const payload =
      loginMethod === "email" ? { email_id: email } : { mobile_number: mobile };
    try {
      const response = await api.post("doctor/login/", payload);
      if (response.status === 200) {
        setIsLoading(false);
        setStep("otp");
        startCountdown();
      }
    } catch (error) {
      console.log("Error occurs in handleSendOtp", error);
      setIsLoading(false);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          showToast(`${error.response.data}`, "error");
        } else {
          showToast("Login failed. Please try again.", "error");
        }
      }
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      setErrors((prev) => ({
        ...prev,
        otp: "Please enter complete 6-digit OTP",
      }));
      setIsLoading(false);
      return;
    }

    const payload =
      loginMethod === "email"
        ? { email_id: email, otp: enteredOtp }
        : { mobile_number: mobile, otp: enteredOtp };

    try {
      const response = await api.post("doctor/verify_login/", payload);
      if (response.status === 200) {
        if (
          response.data.status === "rejected" ||
          response.data.status === "pending"
        ) {
          navigate(`/profile-status/${response.data.did}`);
        } else {
          login(
            response.data.sessionid,
            response.data.refresh_token,
            response.data.doctor_flag
          );
          navigate("/");
        }
      }
    } catch (error) {
      console.log("Error occurs in handleVerifyOtp", error);
      setIsLoading(false);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          showToast(`${error.response.data}`, "error");
        } else {
          showToast("Verification failed. Please try again.", "error");
        }
      }
    }
  };

  const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value.replace(/\D/g, "");

    if (value && index < 5) {
      setActiveOtpIndex(index + 1);
    } else if (!value && index > 0) {
      setActiveOtpIndex(index - 1);
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      setActiveOtpIndex(index - 1);
    }
  };

  const startCountdown = () => {
    setCountdown(60);
    setCanResend(false);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    handleSendOtp();
    startCountdown();
  };

  useEffect(() => {
    if (otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [activeOtpIndex]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        className="w-full max-w-md"
      >
        <motion.div
          onMouseMove={handleHover}
          onMouseLeave={handleHoverEnd}
          style={{
            rotateX,
            rotateY,
          }}
          className="relative bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
        >
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute -top-20 -left-20 w-40 h-40 bg-[#f3e8ff] rounded-full filter blur-3xl opacity-70"
              animate={{
                x: [0, 20, 0],
                y: [0, 15, 0],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#e9d5ff] rounded-full filter blur-3xl opacity-70"
              animate={{
                x: [0, -15, 0],
                y: [0, -10, 0],
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          </div>

          {step === "input" && (
            <div className="relative z-10 p-8 pb-6">
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                className="flex items-center justify-center mb-4"
              >
                <motion.div
                  className="p-3 bg-[#592668] rounded-full shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <User className="h-6 w-6 text-white" />
                </motion.div>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                className="text-2xl font-bold text-center text-gray-900 mb-1"
              >
                Doctor Portal
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
                className="text-sm text-center text-gray-600"
              >
                {step === "input"
                  ? "Enter your credentials"
                  : "Verify your identity"}
              </motion.p>
            </div>
          )}

          <div className="relative z-10 px-8 pb-8">
            <AnimatePresence mode="wait">
              {step === "input" ? (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex mb-6 bg-gray-100 rounded-xl p-1"
                  >
                    <button
                      onClick={() => setLoginMethod("mobile")}
                      className={`flex-1 py-3 rounded-lg transition-all ${
                        loginMethod === "mobile"
                          ? "bg-[#592668] text-white shadow-md"
                          : "text-gray-700 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Smartphone className="h-4 w-4" />
                        <span>Mobile</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setLoginMethod("email")}
                      className={`flex-1 py-3 rounded-lg transition-all ${
                        loginMethod === "email"
                          ? "bg-[#592668] text-white shadow-md"
                          : "text-gray-700 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>Email</span>
                      </div>
                    </button>
                  </motion.div>

                  {loginMethod === "email" ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="mb-4"
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#592668] focus:border-transparent placeholder-gray-400"
                          placeholder="your@email.com"
                        />
                      </div>
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3 }}
                          className="mt-1 text-sm text-red-500"
                        >
                          {errors.email}
                        </motion.p>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="mb-4"
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mobile Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-400">+91</span>
                        </div>
                        <input
                          type="tel"
                          value={mobile}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            if (value.length <= 10) setMobile(value);
                          }}
                          className="w-full pl-14 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-[#592668] focus:border-transparent placeholder-gray-400"
                          placeholder="9876543210"
                          maxLength={10}
                        />
                      </div>
                      {errors.mobile && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3 }}
                          className="mt-1 text-sm text-red-500"
                        >
                          {errors.mobile}
                        </motion.p>
                      )}
                    </motion.div>
                  )}

                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    onClick={handleSendOtp}
                    disabled={
                      isLoading || (loginMethod === "email" ? !email : !mobile)
                    }
                    className={`relative overflow-hidden cursor-pointer w-full py-4 rounded-xl font-medium mt-6 flex items-center justify-center transition-all ${
                      isLoading || (loginMethod === "email" ? !email : !mobile)
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-[#592668] text-white hover:shadow-lg hover:shadow-[#592668]/30"
                    }`}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <span>Send OTP</span>
                        <motion.div
                          initial={{ x: -5, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="ml-2"
                        >
                          <ArrowRight className="h-5 w-5" />
                        </motion.div>
                      </>
                    )}
                    <motion.span
                      className="absolute inset-0 bg-[#7d3a8a] opacity-0 hover:opacity-100 transition-opacity duration-300"
                      initial={{ opacity: 0 }}
                    />
                  </motion.button>

                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                      Don't have an account?{" "}
                      <a
                        href="/register"
                        className="text-[#592668] font-medium hover:underline"
                      >
                        Register here
                      </a>
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center mb-8 mt-5"
                  >
                    <motion.div
                      className="mx-auto bg-[#592668] rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4 shadow-lg"
                      animate={{
                        rotate: [0, 5, -5, 0],
                        y: [0, -3, 0],
                      }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                      }}
                    >
                      <Lock className="h-8 w-8 text-white" />
                    </motion.div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">
                      Verification Code
                    </h2>
                    <p className="text-gray-600">
                      Sent to{" "}
                      <span className="font-medium text-gray-900">
                        {loginMethod === "email" ? email : `+91 ${mobile}`}
                      </span>
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-6"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Enter 6-digit code
                    </label>
                    <div className="flex justify-center space-x-3">
                      {otp.map((_, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="relative"
                        >
                          <input
                            ref={index === activeOtpIndex ? otpInputRef : null}
                            type="tel"
                            value={otp[index]}
                            onChange={(e) => handleOtpChange(e, index)}
                            onKeyDown={(e) => handleOtpKeyDown(e, index)}
                            onClick={() => setActiveOtpIndex(index)}
                            className="w-12 h-14 bg-white border border-gray-200 rounded-lg text-gray-900 text-2xl text-center focus:outline-none focus:ring-2 focus:ring-[#592668] caret-transparent"
                            maxLength={1}
                          />
                          {index === activeOtpIndex && (
                            <motion.div
                              layoutId="otpCursor"
                              className="absolute bottom-2 left-1/2 w-1 h-1 bg-[#592668] rounded-full -translate-x-1/2"
                              animate={{ opacity: [0, 1, 0] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                            />
                          )}
                        </motion.div>
                      ))}
                    </div>
                    {errors.otp && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                        className="mt-2 text-sm text-red-500 text-center"
                      >
                        {errors.otp}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center justify-between mb-6"
                  >
                    <button
                      onClick={handleResendOtp}
                      disabled={!canResend}
                      className={`text-sm flex cursor-pointer items-center transition-colors ${
                        canResend
                          ? "text-[#592668] hover:text-[#7d3a8a]"
                          : "text-gray-500"
                      }`}
                    >
                      <motion.div
                        animate={{ rotate: canResend ? 360 : 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <RotateCw className="h-4 w-4 mr-1" />
                      </motion.div>
                      Resend {!canResend && `in ${countdown}s`}
                    </button>
                    <button
                      onClick={() => setStep("input")}
                      className="text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition-colors"
                    >
                      Change {loginMethod === "email" ? "Email" : "Number"}
                    </button>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    onClick={handleVerifyOtp}
                    disabled={isLoading || otp.join("").length !== 6}
                    className={`relative overflow-hidden w-full py-4 cursor-pointer rounded-xl font-medium flex items-center justify-center transition-all ${
                      isLoading || otp.join("").length !== 6
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-[#592668] text-white hover:shadow-lg hover:shadow-[#592668]/30"
                    }`}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        <span>Verify & Login</span>
                        <motion.div
                          initial={{ x: -5, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="ml-2"
                        >
                          <ArrowRight className="h-5 w-5" />
                        </motion.div>
                      </>
                    )}
                    <motion.span
                      className="absolute inset-0 bg-[#7d3a8a] opacity-0 hover:opacity-100 transition-opacity duration-300"
                      initial={{ opacity: 0 }}
                    />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="relative z-10 px-8 py-4 text-center border-t border-gray-100"
          >
            <motion.div
              className="flex items-center justify-center text-xs text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <Shield className="h-3 w-3 mr-1" />
              <span>Your information is encrypted and secure</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
