import {
  Activity,
  Calendar,
  Clock,
  DollarSign,
  Stethoscope,
  User,
  Bell,
  ChevronRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { token_api } from "../lib/api";
import { useAuthStore } from "../features/Auth/authSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLoading from "../components/Skelton/DashboardLoading";

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
  const [isOpen, setIsOpen] = useState<number | null>(null);
  const accessToken = useAuthStore((state) => state.accessToken);
  const navigate = useNavigate();

  const recentEarnings = [
    { date: "Today", amount: 12500, appointments: 5 },
    { date: "Yesterday", amount: 9800, appointments: 4 },
    { date: "Jan 12", amount: 11200, appointments: 6 },
  ];

  const handleReferral = (appointmentId: number) => {
    console.log(`Refer appointment ${appointmentId}`);
    navigate(`/reffer-doctor?appointment_id=${appointmentId}`)
  };

  const handleReschedule = (appointmentId: number) => {
    console.log(`Reschedule appointment ${appointmentId}`);
  };

  const { data: dashBoardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["available-hours"],
    queryFn: () => {
      return token_api(accessToken)
        .get(`doctor/dashboard/`)
        .then((res) => res.data);
    },
  });

  function getDayLabel(dateString: string): string {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointmentDate = new Date(dateString);

    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);

    if (appointmentDate.getTime() === today.getTime()) {
      return "Today";
    } else if (appointmentDate.getTime() === tomorrow.getTime()) {
      return "Tomorrow";
    } else {
      return appointmentDate.toLocaleDateString("en-US", { weekday: "short" });
    }
  }

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
            onClick={() => navigate("/appointments")}
            className="text-sm text-purple-600 hover:text-purple-800 cursor-pointer flex items-center"
          >
            View all <ChevronRight className="h-4 w-4 ml-1 " />
          </button>
        </div>

        <div className="space-y-4">
          {dashBoardData && dashBoardData?.upcoming_appointments?.length > 0 ? (
            dashBoardData.upcoming_appointments.map((appointment, index) => {
              const [hoursStr, minutesPart] = appointment.time.split(":");
              const minutesStr = minutesPart.slice(0, 2);
              const meridian = minutesPart.slice(3);

              let hours = parseInt(hoursStr, 10);
              const minutes = parseInt(minutesStr, 10);

              if (meridian === "PM" && hours !== 12) {
                hours += 12;
              }
              if (meridian === "AM" && hours === 12) {
                hours = 0;
              }

              const currentTime = new Date();
              const appointmentTime = new Date(currentTime);
              appointmentTime.setHours(hours, minutes, 0, 0);

              const timeDiff =
                (appointmentTime.getTime() - currentTime.getTime()) /
                (1000 * 60);

              const showJoinButton = timeDiff <= 30 && timeDiff >= 0;

              return (
                <div
                  key={index}
                  className="group relative flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-gray-50/50 rounded-xl transition-all duration-300 shadow-md border border-gray-200"
                >
                  {/* Left Section - Doctor Info and Date */}
                  <div className="flex items-start md:items-center space-x-5 w-full md:w-auto">
                    {/* Date Indicator */}
                    <div className="flex flex-col items-center min-w-[60px]">
                      <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                        {getDayLabel(appointment.date)}
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mt-1">
                        {new Date(appointment.date).getDate()}
                      </div>
                      <div className="text-xs font-medium text-gray-500">
                        {new Date(appointment.date).toLocaleString("default", {
                          month: "short",
                        })}
                      </div>
                    </div>

                    {/* Doctor Info */}
                    <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 shadow-inner">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-lg truncate">
                        {appointment.name}
                      </p>
                      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-2">
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-500 mr-1.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            />
                          </svg>
                          <span className="text-sm text-gray-600">
                            {appointment.type}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-500 mr-1.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          <span className="text-sm text-gray-600">
                            {appointment.specialization}
                          </span>
                        </div>
                        {appointment.followup && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100/80 text-purple-800 border border-purple-200">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Follow-up
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end mt-4 md:mt-0 space-x-5">
                    <div className="text-right min-w-[130px]">
                      <div className="flex items-center justify-end">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-gray-500 mr-1.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="font-medium text-gray-900">
                          {appointment.time}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {appointment.duration}
                      </p>
                    </div>

                    {showJoinButton && appointment.meeting_link && (
                      <a
                        href={appointment.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center hover:from-indigo-700 hover:to-purple-700"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        Join Meeting
                      </a>
                    )}

                    <div className="relative">
                      <button
                        onClick={() =>
                          isOpen === appointment.appointment_id
                            ? setIsOpen(null)
                            : setIsOpen(appointment.appointment_id)
                        }
                        className="p-2 rounded-full cursor-pointer hover:bg-gray-100 transition-all duration-300 group"
                        aria-label="Appointment actions"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-500 group-hover:text-gray-700 transition-colors"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                          />
                        </svg>
                      </button>

                      {isOpen === appointment.appointment_id && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-xl z-20 border border-gray-100/80 overflow-happointment_idden"
                        >
                          <div className="p-1.5 space-y-1">
                            <button
                              onClick={() => {
                                handleReferral(appointment.appointment_id);
                                setIsOpen(null);
                              }}
                              className="w-full flex cursor-pointer items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-900 rounded-lg transition-all duration-200"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-3 text-indigo-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                />
                              </svg>
                              Refer 
                            </button>

                            <button
                              onClick={() => {
                                handleReschedule(appointment.appointment_id);
                              }}
                              className="w-full flex cursor-pointer items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900 rounded-lg transition-all duration-200"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-3 text-blue-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              Reschedule
                            </button>

                            <button
                              onClick={() => setIsOpen(null)}
                              className="w-full flex cursor-pointer items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-3 text-gray-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                              Close Menu
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-6">Recent Earnings</h2>
          <div className="space-y-4">
            {recentEarnings.map((earning, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-green-50 text-green-600">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{earning.date}</p>
                    <p className="text-sm text-gray-500">
                      {earning.appointments} appointments
                    </p>
                  </div>
                </div>
                <p className="font-bold">₹{earning.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 flex flex-col items-center transition-colors">
              <Clock className="h-6 w-6 text-purple-600 mb-2" />
              <span className="text-sm font-medium">Schedule</span>
            </button>
            <button className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 flex flex-col items-center transition-colors">
              <User className="h-6 w-6 text-blue-600 mb-2" />
              <span className="text-sm font-medium">Patients</span>
            </button>
            <button className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 flex flex-col items-center transition-colors">
              <DollarSign className="h-6 w-6 text-green-600 mb-2" />
              <span className="text-sm font-medium">Earnings</span>
            </button>
            <button className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 flex flex-col items-center transition-colors">
              <Stethoscope className="h-6 w-6 text-amber-600 mb-2" />
              <span className="text-sm font-medium">Services</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
