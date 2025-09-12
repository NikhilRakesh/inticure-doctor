import {
  Activity,
  Calendar,
  DollarSign,
  User,
  Bell,
  ChevronRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { token_api } from "../lib/api";
import { useAuthStore } from "../features/Auth/authSlice";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLoading from "../components/Skelton/DashboardLoading";
import AppointmentCard from "../components/Appointment/AppointmentCard";

interface DashboardData {
  earnings_today: number;
  earnings_change: number;
  appointments_today: {
    total: number;
    completed: number;
    pending: number;
  };
  doctor_info: {
    name: string;
    specialization: string;
    experience: string;
    rating: number;
  };
  upcoming_appointments: Appointment[];
}

interface Appointment {
  name: string;
  type: string;
  time: string;
  duration: string;
  specialization: string;
  specialization_id: number;
  appointment_id: number;
  meeting_link: string;
  followup: boolean;
  date: string;
}

const Dashboard = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const navigate = useNavigate();

  const { data: dashBoardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["available-hours"],
    queryFn: () => {
      return token_api(accessToken)
        .get(`doctor/dashboard/`)
        .then((res) => res.data);
    },
  });

  return isLoading ? (
    <DashboardLoading />
  ) : (
    <div className="w-full h-full rounded-tl-3xl rounded-bl-3xl p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">
            Welcome back, {dashBoardData?.doctor_info?.name}
          </p>
        </div>
        <button className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Today's Earnings
              </p>
              <p className="text-2xl font-bold mt-1">
                ₹{dashBoardData?.earnings_today}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
          {dashBoardData && dashBoardData?.earnings_change > 0 && (
            <div
              className={`mt-4 flex items-center text-sm ${
                dashBoardData.earnings_change > 0
                  ? "text-green-600"
                  : dashBoardData.earnings_change < 0
                  ? "text-red-600"
                  : "text-gray-500"
              }`}
            >
              <Activity className="h-4 w-4 mr-1" />
              <span>
                {Math.abs(Number(dashBoardData.earnings_change)).toFixed(0)}%{" "}
                {dashBoardData.earnings_change > 0
                  ? "increase"
                  : dashBoardData.earnings_change < 0
                  ? "decrease"
                  : "no change"}{" "}
                from yesterday
              </span>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Today's Appointments
              </p>
              <p className="text-2xl font-bold mt-1">
                {dashBoardData?.appointments_today?.total}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <Calendar className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">
                {dashBoardData?.appointments_today?.completed}
              </span>{" "}
              completed
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">
                {dashBoardData?.appointments_today?.pending}
              </span>{" "}
              pending
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
              <User className="h-6 w-6" />
            </div>
            <div>
              <p className="font-medium">{dashBoardData?.doctor_info?.name}</p>
              <p className="text-sm text-gray-500">
                {dashBoardData?.doctor_info?.specialization}
              </p>
              <div className="mt-1 flex items-center text-sm text-gray-600">
                <span>
                  experience: {dashBoardData?.doctor_info?.experience}{" "}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
          <button
            onClick={() => navigate("/appointments?tab=upcoming")}
            className="text-sm text-purple-600 hover:text-purple-800 cursor-pointer flex items-center"
          >
            View all <ChevronRight className="h-4 w-4 ml-1 " />
          </button>
        </div>

        <div className="space-y-4">
          {dashBoardData && dashBoardData?.upcoming_appointments?.length > 0 ? (
            dashBoardData.upcoming_appointments.map((appointment, index) => (
              <AppointmentCard appointment={appointment} key={index} />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="bg-[#f8f5ff] p-5 rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-[#592769]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No Upcoming Appointments
              </h3>
              <p className="text-gray-600 max-w-md mb-6">
                You currently don't have any scheduled appointments.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
