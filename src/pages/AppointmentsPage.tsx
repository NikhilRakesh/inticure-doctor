import { useState } from "react";
import {
  Calendar,
  User,
  FileText,
  Plus,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Video,
} from "lucide-react";
import { Tab } from "@headlessui/react";
import { Dialog } from "@headlessui/react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../features/Auth/authSlice";
import { token_api } from "../lib/api";

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
}

interface AppointmentsResponse {
  upcoming_appointments: Appointment[];
  previous_appointments: Appointment[];
}

const AppointmentsPage = () => {
  const [selectedTab, setSelectedTab] = useState("upcoming");
  const [expandedAppointment, setExpandedAppointment] = useState<number | null>(
    null
  );
  const [isMedicalHistoryOpen, setIsMedicalHistoryOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const accessToken = useAuthStore((state) => state.accessToken);

  const handleReferral = (appointmentId: number) => {
    console.log(`Refer appointment ${appointmentId}`);
  };

  const handleJoinMeeting = (appointmentId: number) => {
    console.log(`Join meeting for appointment ${appointmentId}`);
  };

  const toggleExpand = (appointmentId: number) => {
    setExpandedAppointment(
      expandedAppointment === appointmentId ? null : appointmentId
    );
  };

  const openMedicalHistory = (patient: any) => {
    setSelectedPatient(patient);
    setIsMedicalHistoryOpen(true);
  };

  const { data: appointmentData , isLoading } = useQuery({
    queryKey: ["available-hours"],
    queryFn: () => {
      return token_api(accessToken)
        .get<AppointmentsResponse>(`doctor/appointments/`)
        .then((res) => res.data);
    },
  });

  return !appointmentData && isLoading ? null : (
    <div className="w-full h-full rounded-tl-3xl rounded-bl-3xl p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500">Manage your patient appointments</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#582768] to-[#d6769f] text-white rounded-lg shadow-sm hover:shadow-md transition-all">
          <Plus className="h-5 w-5" />
          <span>New Appointment</span>
        </button>
      </div>

      <Tab.Group
        selectedIndex={selectedTab === "upcoming" ? 0 : 1}
        onChange={(index) =>
          setSelectedTab(index === 0 ? "upcoming" : "previous")
        }
      >
        <Tab.List className="flex space-x-1 rounded-xl bg-white p-1 max-w-md mb-8">
          <Tab
            className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg transition-all outline-0 cursor-pointer ${
              selectedTab === "upcoming"
                ? "bg-[#d6779e] shadow text-white"
                : "text-gray-500 hover:bg-white/[0.12]"
            }`}
          >
            Upcoming
          </Tab>
          <Tab
            className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg transition-all outline-0 cursor-pointer ${
              selectedTab === "previous"
                ? "bg-[#d6779e] shadow text-white"
                : "text-[#582768] hover:bg-white/[0.12]"
            }`}
          >
            Previous
          </Tab>
        </Tab.List>
      </Tab.Group>

      <div className="space-y-6">
        {appointmentData &&
          (selectedTab === "upcoming"
            ? appointmentData.upcoming_appointments
            : appointmentData.previous_appointments
          )?.map((appointment) => (
            <div
              key={appointment.appointment_id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div
                className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleExpand(appointment.appointment_id)}
              >
                <div className="flex items-center space-x-4 ">
                  <div className="p-3 rounded-lg bg-purple-50">
                    <User className="h-5 w-5 text-[#d6779e]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {appointment.name}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-500 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {appointment.date} at {appointment.time}
                      </span>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {appointment.type}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    {appointment.type}
                  </span>
                  {expandedAppointment === appointment.appointment_id ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              {expandedAppointment === appointment.appointment_id && (
                <div className="p-6 pt-0 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">
                        Patient Details
                      </h4>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">
                        Appointment Details
                      </h4>
                      <div className="space-y-2">
                        <p className="text-sm">Type: {appointment.type}</p>
                        <p className="text-sm">
                          Duration: {appointment.duration}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Recent Prescription
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {/* <p className="text-sm text-gray-700">
                        {appointment.prescription}
                      </p> */}
                    </div>
                  </div>

                  {/* {appointment.files.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">
                        Files
                      </h4>
                      <div className="space-y-2">
                        {appointment.files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <FileText className="h-5 w-5 text-gray-400" />
                              <span className="text-sm">{file}</span>
                            </div>
                            <button className="text-sm text-[#582768] hover:text-[#d6769f]">
                              View
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )} */}

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => openMedicalHistory(appointment)}
                      className="flex items-center space-x-2 px-4 py-2 bg-white border border-[#582768] text-[#582768] rounded-lg hover:bg-[#582768]/10 transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Medical History</span>
                    </button>

                    {selectedTab === "upcoming" && (
                      <>
                        <button
                          onClick={() =>
                            handleReferral(appointment.appointment_id)
                          }
                          className="flex items-center space-x-2 px-4 py-2 bg-white border border-[#582768] text-[#582768] rounded-lg hover:bg-[#582768]/10 transition-colors"
                        >
                          <Stethoscope className="h-4 w-4" />
                          <span>Refer to Specialist</span>
                        </button>
                        <button
                          onClick={() =>
                            handleJoinMeeting(appointment.appointment_id)
                          }
                          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#582768] to-[#d6769f] text-white rounded-lg shadow-sm hover:shadow-md transition-all"
                        >
                          <Video className="h-4 w-4" />
                          <span>Join Meeting</span>
                        </button>
                      </>
                    )}
                    <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#582768] to-[#d6769f] text-white rounded-lg shadow-sm hover:shadow-md transition-all">
                      <ArrowRight className="h-4 w-4" />
                      <span>View Full Details</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>

      <Dialog
        open={isMedicalHistoryOpen}
        onClose={() => setIsMedicalHistoryOpen(false)}
        className="relative z-50"
      >
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          aria-hidden="true"
        />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg">
            <Dialog.Title className="text-2xl font-bold text-gray-900 mb-2">
              Medical History - {selectedPatient?.patient}
            </Dialog.Title>
            <Dialog.Description className="text-gray-500 mb-6">
              Complete medical records and history
            </Dialog.Description>

            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Age</p>
                  <p className="text-gray-900">{selectedPatient?.age}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p className="text-gray-900">
                    {selectedPatient?.gender === "male" ? "Male" : "Female"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Date of Birth
                  </p>
                  <p className="text-gray-900">{selectedPatient?.dob}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Medical Records</h3>
                <div className="space-y-4">
                  {selectedPatient?.medicalHistory?.map(
                    (record: any, index: number) => (
                      <div
                        key={index}
                        className="p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{record.diagnosis}</p>
                            <p className="text-sm text-gray-500">
                              {record.date}
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Active
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-500">
                            Treatment
                          </p>
                          <p className="text-gray-700">{record.treatment}</p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsMedicalHistoryOpen(false)}
                className="px-4 py-2 bg-[#582768] text-white rounded-lg hover:bg-[#582768]/90 transition-colors"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default AppointmentsPage;
