import { motion } from "framer-motion";
import {
  FiClock,
  FiMail,
  FiPhone,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { FaHandshake, FaUserMd } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { type JSX } from "react";
import Loading from "./Loading";

interface UserProfile {
  first_name: string;
  last_name: string;
  email_id: string;
  joined_date: string;
  status: string;
  phone: string;
}

type ApplicationStatus = "pending" | "accepted" | "rejected";

interface StatusTimeline {
  current: string;
  next: string;
}

interface StatusConfigEntry {
  icon: JSX.Element;
  title: string;
  message: string;
  color: string;
  timeline: StatusTimeline;
}

type StatusConfig = Record<ApplicationStatus, StatusConfigEntry>;

const ApplicationStatusBanner = () => {
  const statusConfig: StatusConfig = {
    pending: {
      icon: <FiClock className="w-5 h-5 text-[#d6769f]" />,
      title: "Your application is under review",
      message: "Our credentialing team is carefully reviewing your documents",
      color: "bg-[#f8e9f0] text-[#592769]",
      timeline: {
        current: "Review in Progress",
        next: "Approval Decision",
      },
    },
    accepted: {
      icon: <FiCheckCircle className="w-5 h-5 text-emerald-500" />,
      title: "Congratulations! You're approved",
      message: "Welcome to the IntiCure Medical Network",
      color: "bg-emerald-100 text-emerald-800",
      timeline: {
        current: "Approval Complete",
        next: "Onboarding Process",
      },
    },
    rejected: {
      icon: <FiXCircle className="w-5 h-5 text-rose-500" />,
      title: "Application Rejected",
      message:
        "Unfortunately, your application was not approved. Please check your email for more details about the decision.",
      color: "bg-rose-100 text-rose-800",
      timeline: {
        current: "Review Completed",
        next: "Check Your Email",
      },
    },
  };

  const { did } = useParams();
  const navigate = useNavigate();

  const { data, isPending } = useQuery({
    queryKey: ["details_with_id", did],
    queryFn: () =>
      api.get<UserProfile>(`doctor/details_with_id/?did=${did}`).then((res) => {
        return res.data;
      }),
  });

  const currentStatus: StatusConfigEntry | undefined =
    statusConfig[data?.status as ApplicationStatus];

  return isPending ? (
    <Loading />
  ) : (
    <div className="min-h-screen relative flex justify-center items-center p-4 md:p-10 bg-white">
      <button
        onClick={() => navigate("/")}
        className="text-sm absolute top-5 left-5  text-gray-700 cursor-pointer hover:underline"
      >
        ← Back to Home
      </button>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-3xl"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#f8e9f0] blur-xl"
        ></motion.div>

        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-[#f8e9f0] blur-xl"
        ></motion.div>

        <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#592769] to-[#d6769f] origin-left"
          ></motion.div>

          <div className="bg-[#592769] px-8 py-6 flex items-center justify-between">
            <div className="flex items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mr-4 flex items-center justify-center bg-white p-2 rounded-lg shadow-sm"
              >
                <FaUserMd className="w-6 h-6 text-[#592769]" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-white">inticFure</h2>
                <p className="text-sm text-[#d6769f]">Medical Network</p>
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="px-3 py-1 bg-white/10 rounded-full text-xs text-white border border-white/20"
            >
              Doctor Portal
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <h1 className="text-2xl font-bold text-gray-800">
                Hi {data?.first_name} {data?.last_name},{" "}
                <span className="text-[#d6769f]">welcome!</span>
              </h1>
              <p className="text-gray-500 mt-1">
                Here's the current status of your application
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`p-5 rounded-xl ${currentStatus.color} mb-8 flex items-start border border-[#f0d0e0]`}
            >
              <div className="mr-4 mt-0.5">{currentStatus.icon}</div>
              <div>
                <h3 className="text-lg font-semibold">{currentStatus.title}</h3>
                <p className="mt-1">{currentStatus.message}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="relative pl-10 mb-8"
            >
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>

              <div className="relative pb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7 }}
                  className="absolute left-0 top-0 w-4 h-4 rounded-full bg-[#592769] border-4 border-[#f0d0e0] transform -translate-x-1/2"
                ></motion.div>
                <div className="ml-8">
                  <p className="text-sm font-medium text-gray-800">
                    {currentStatus.timeline.current}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Started on{" "}
                    {data?.joined_date &&
                      new Date(data.joined_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-gray-300 border-4 border-gray-50 transform -translate-x-1/2"></div>
                <div className="ml-8">
                  <p className="text-sm font-medium text-gray-500">
                    {currentStatus.timeline.next}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {data?.status === "approved"
                      ? "Starting soon"
                      : data?.status === "rejected"
                      ? "Waiting for your response"
                      : "Pending"}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-[#f8e9f0] rounded-xl p-5 border border-[#e0c0d0] mb-8"
            >
              <h4 className="text-sm font-medium text-[#592769] mb-4 flex items-center">
                <FiMail className="mr-2 text-[#d6769f]" />
                You'll be notified at:
              </h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-white text-[#592769] shadow-sm mr-3 border border-[#e0c0d0]">
                    <FiMail className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    {data?.email_id}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-white text-[#592769] shadow-sm mr-3 border border-[#e0c0d0]">
                    <FiPhone className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    {data?.phone}
                  </span>
                </div>
              </div>
            </motion.div>

            {data?.status === "rejected" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-rose-50 rounded-xl p-5 border border-rose-100 mb-8"
              >
                <h4 className="text-sm font-medium text-rose-700 mb-3 flex items-center">
                  <FiAlertCircle className="mr-2" />
                  Application Rejected
                </h4>
                <p className="text-sm text-rose-600">
                  Unfortunately, your application was not approved. Please check
                  your email for more details regarding the reason for
                  rejection.
                </p>
              </motion.div>
            )}

            {data?.status === "approved" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-emerald-50 rounded-xl p-5 border border-emerald-100 mb-8"
              >
                <h4 className="text-sm font-medium text-emerald-700 mb-3 flex items-center">
                  <FaHandshake className="mr-2" />
                  Next Steps
                </h4>
                <p className="text-sm text-emerald-600 mb-4">
                  Our onboarding team will contact you within 2 business days to
                  complete your profile setup.
                </p>
                <button className="px-4 py-2 bg-[#592769] hover:bg-[#4a1f5a] text-white rounded-lg text-sm font-medium transition-colors">
                  Preview Your Profile
                </button>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center pt-4 border-t border-gray-100"
            >
              <p className="text-sm text-gray-500">
                Need help? Contact our support team at{" "}
                <a
                  href="mailto:support@inticure.com"
                  className="text-[#592769] hover:underline font-medium"
                >
                  wecare@inticure.com
                </a>{" "}
              </p>
            </motion.div>
          </div>

          <motion.div
            animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-12 right-8 opacity-20"
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d6769f"
            >
              <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path>
              <path d="M8.5 8.5v.01"></path>
              <path d="M16 15.5v.01"></path>
              <path d="M12 12v.01"></path>
              <path d="M11 17v.01"></path>
              <path d="M7 14v.01"></path>
            </svg>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ApplicationStatusBanner;
