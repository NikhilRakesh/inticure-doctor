import { type JSX } from "react";
import { Calendar, CheckCircle, RefreshCw, XCircle } from "lucide-react";
import { Tab } from "@headlessui/react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../features/Auth/authSlice";
import { token_api } from "../lib/api";
import AppointmentCard from "../components/Appointment/AppointmentCard";
import { useNavigate, useSearchParams } from "react-router-dom";

interface Appointment {
  appointment_id: number;
  name: string;
  type: string;
  time: string;
  duration: string;
  specialization: string;
  specialization_id: number;
  followup: boolean;
  meeting_link: string;
  date: string;
  rescheduled_by?: string;
}

interface AppointmentsResponse {
  upcoming_appointments: Appointment[];
  previous_appointments: Appointment[];
  rescheduled_appointments: Appointment[];
  missed_appointments: Appointment[];
}

const AppointmentsPage = () => {
  const [searchParams] = useSearchParams();
  const selectedTab = searchParams.get("tab");
  const accessToken = useAuthStore((state) => state.accessToken);
  const navigate = useNavigate();

  const { data: appointmentData, isLoading } = useQuery({
    queryKey: ["available-hours"],
    queryFn: () => {
      return token_api(accessToken)
        .get<AppointmentsResponse>(`doctor/appointments/`)
        .then((res) => res.data);
    },
  });

  const getEmptyState = (tab: string | null) => {
    if (!tab) return;
    const messages: Record<
      string,
      { icon: JSX.Element; title: string; subtitle: string }
    > = {
      upcoming: {
        icon: <Calendar className="h-10 w-10 text-indigo-500" />,
        title: "No Upcoming Appointments",
        subtitle: "You don't have any appointments scheduled yet.",
      },
      previous: {
        icon: <CheckCircle className="h-10 w-10 text-emerald-500" />,
        title: "No Past Appointments",
        subtitle: "Your completed appointments will appear here.",
      },
      rescheduled: {
        icon: <RefreshCw className="h-10 w-10 text-amber-500" />,
        title: "No Rescheduled Appointments",
        subtitle: "Rescheduled appointments will appear here.",
      },
      missed: {
        icon: <XCircle className="h-10 w-10 text-rose-500" />,
        title: "No Missed Appointments",
        subtitle: "Missed appointments will show up in this section.",
      },
    };

    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 p-4 bg-indigo-50 rounded-full">
          {messages[tab].icon}
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          {messages[tab].title}
        </h3>
        <p className="text-sm text-gray-500 max-w-md">
          {messages[tab].subtitle}
        </p>
      </div>
    );
  };

  const getAppointmentsForTab = () => {
    switch (selectedTab) {
      case "upcoming":
        return appointmentData?.upcoming_appointments || [];
      case "previous":
        return appointmentData?.previous_appointments || [];
      case "rescheduled":
        return appointmentData?.rescheduled_appointments || [];
      case "missed":
        return appointmentData?.missed_appointments || [];
      default:
        return [];
    }
  };
  return (
    <div className="w-full h-full rounded-tl-3xl rounded-bl-3xl p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500">Manage your patient appointments</p>
        </div>
      </div>
      <Tab.Group>
        <Tab.List className="flex space-x-2 rounded-xl  p-1 w-fit mb-8 shadow-sm bg-white border border-gray-200">
          {[
            {
              key: "upcoming",
              label: "Upcoming",
              icon: <Calendar className="h-4 w-4" />,
            },
            {
              key: "previous",
              label: "Previous",
              icon: <CheckCircle className="h-4 w-4" />,
            },
            {
              key: "rescheduled",
              label: "Rescheduled",
              icon: <RefreshCw className="h-4 w-4" />,
            },
            // {
            //   key: "missed",
            //   label: "Missed",
            //   icon: <XCircle className="h-4 w-4" />,
            // },
          ].map((tab) => (
            <Tab
              key={tab.key}
              className={() => `
                flex items-center space-x-2 w-full py-2.5 cursor-pointer px-4 text-sm font-medium leading-5 rounded-lg transition-all outline-none
                ${
                  selectedTab === tab.key
                    ? "bg-indigo-100 text-indigo-700 shadow-sm"
                    : "text-gray-500 hover:bg-gray-50"
                }
              `}
              onClick={() => navigate(`?tab=${tab.key as any}`)}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {appointmentData && (
                <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                  {tab.key === "upcoming"
                    ? appointmentData?.upcoming_appointments?.length
                    : tab.key === "previous"
                    ? appointmentData?.previous_appointments?.length
                    : tab.key === "rescheduled"
                    ? appointmentData?.rescheduled_appointments?.length
                    // : tab.key === "missed"
                    // ? appointmentData?.missed_appointments?.length
                    : 0}
                </span>
              )}
            </Tab>
          ))}
        </Tab.List>
      </Tab.Group>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            {getAppointmentsForTab().length === 0 ? (
              getEmptyState(selectedTab)
            ) : (
              <div className="space-y-4">
                {getAppointmentsForTab().map((appointment) => (
                  <AppointmentCard
                    key={appointment.appointment_id}
                    appointment={appointment}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;
