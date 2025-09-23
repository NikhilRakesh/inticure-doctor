import { useNavigate } from "react-router-dom";
import { RefreshCw, User, Calendar, Clock, CheckCircle } from "lucide-react";

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
  rescheduled_by?: string;
}

interface AppointmentCardProbs {
  appointment: Appointment;
}

const AppointmentCard = ({ appointment }: AppointmentCardProbs) => {
  const navigate = useNavigate();

  const { date, time } = appointment;

  let timeMatch = time.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);

  let hours: number;
  let minutes: number;

  if (timeMatch) {
    let [_, hourStr, minuteStr, meridian] = timeMatch;
    hours = parseInt(hourStr, 10);
    minutes = parseInt(minuteStr, 10);

    if (meridian.toUpperCase() === "PM" && hours !== 12) hours += 12;
    if (meridian.toUpperCase() === "AM" && hours === 12) hours = 0;
  } else {
    const parts = time.split(":");
    if (parts.length >= 2) {
      hours = parseInt(parts[0], 10);
      minutes = parseInt(parts[1], 10);
    } else {
      console.error("Invalid time format:", time);
      return;
    }
  }

  const appointmentDateTime = new Date(date);
  appointmentDateTime.setHours(hours, minutes, 0, 0);

  // const currentTime = new Date();
  // const timeDiffMinutes =
  //   (appointmentDateTime.getTime() - currentTime.getTime()) / (1000 * 60);

  // const showJoinButton = timeDiffMinutes <= 30 && timeDiffMinutes >= 0;

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

  const getRescheduledBadge = () => {
    if (!appointment.rescheduled_by) return null;

    const isDoctorReschedule =
      appointment.rescheduled_by === "rescheduled_by_doctor";

    return (
      <div className="flex items-center mt-2">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
            isDoctorReschedule
              ? "bg-amber-100/80 text-amber-800 border border-amber-200"
              : "bg-purple-100/80 text-purple-800 border border-purple-200"
          }`}
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1" />
          {isDoctorReschedule ? "Doctor Rescheduled" : "Patient Rescheduled"}
        </span>
      </div>
    );
  };

  function format24HourTimeTo12Hour(time24: string): string {
   return new Date(time24).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  }

  return (
    <div
      key={appointment.appointment_id}
      className={`group relative flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-gray-50/50 rounded-xl transition-all duration-300 shadow-md border ${
        appointment.rescheduled_by
          ? "border-amber-200 bg-amber-50/30"
          : "border-gray-200"
      }`}
    >
      <div className="flex items-start md:items-center space-x-5 w-full md:w-auto">
        <div className="flex flex-col items-center min-w-[60px]">
          <div
            className={`text-xs font-semibold uppercase tracking-wider ${
              appointment.rescheduled_by ? "text-amber-600" : "text-indigo-600"
            }`}
          >
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
        <div
          className={`p-3 rounded-xl shadow-inner ${
            appointment.rescheduled_by
              ? "bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600"
              : "bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600"
          }`}
        >
          {appointment.rescheduled_by ? (
            <RefreshCw className="h-6 w-6" />
          ) : (
            <User className="h-6 w-6" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <p className="font-semibold text-gray-900 text-lg truncate">
              {appointment.name}
            </p>
            {appointment.followup && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100/80 text-purple-800 border border-purple-200">
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                Follow-up
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-2">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-gray-500 mr-1.5" />
              <span className="text-sm text-gray-600">{format24HourTimeTo12Hour(appointment.time)}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-gray-500 mr-1.5" />
              <span className="text-sm text-gray-600">{appointment.type}</span>
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
          </div>

          {getRescheduledBadge()}
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end mt-4 md:mt-0 space-x-5">
        <div className="text-right min-w-[130px]">
          <div className="flex items-center justify-end">
            <Clock className="h-4 w-4 text-gray-500 mr-1.5" />
            <p className="font-medium text-gray-900">{format24HourTimeTo12Hour(appointment.time)}</p>
          </div>
          <p className="text-sm text-gray-500 mt-1">{appointment.duration}</p>
        </div>

        {/* {showJoinButton && appointment.meeting_link && (
          <a
            href={appointment.meeting_link}
            target="_blank"
            rel="noopener noreferrer"
            className={`px-5 py-2.5 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center ${
              appointment.rescheduled_by
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            }`}
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
        )} */}

        <div className="relative">
          <button
            onClick={() =>
              navigate(`/appointment?aid=${appointment.appointment_id}`)
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;
