"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Clock, Stethoscope, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { token_api } from "../../lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../features/Auth/authSlice";
import { useToast } from "../../context/ToastProvider";
import { useLocation, useNavigate } from "react-router-dom";
import { DoctorBookingLoading } from "../Common/DoctorBookingLoading";
import CalendarDatePicker from "./CalendarDatePicker";

interface Doctor {
  id: number;
  name: string;
  gender: string;
  flag: string;
  profile_pic: string;
  specializations: string[];
  languages: string[];
}

interface Slot {
  start: string;
  end: string;
  available_doctors: number[];
}

interface SlotsData {
  slots: Slot[];
  available_dates: string[];
}

interface LanguageInfo {
  value: string;
  priority: number;
}

interface GenderInfo {
  value: string;
  priority: number;
}

interface SessionPreferences {
  specialization_id: number;
  language_info: LanguageInfo;
  gender_info: GenderInfo;
  date: string;
  is_couple: boolean;
  appointment_id: string | null;
}

export const DoctorActionModal = ({
  isOpen,
  onClose,
  doctor,
  appointment_id,
  sessionPreferences,
  selectedSpecialization,
  is_couple,
}: {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor;
  appointment_id: string | null;
  sessionPreferences: SessionPreferences;
  selectedSpecialization: number;
  is_couple: boolean;
}) => {
  const [selectedAction, setSelectedAction] = useState<"refer" | "book" | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState(getTomorrowDate());
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [referralNote, setReferralNote] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [patientIds, setPatientIds] = useState<number[]>([]);
  const accessToken = useAuthStore((state) => state.accessToken);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const idsParam = params.get("patient_ids"); // "70,71"

    if (idsParam) {
      const ids = idsParam.split(",").map((id) => parseInt(id.trim(), 10));
      setPatientIds(ids);
    }
  }, [location.search]);

  const handleRefer = () => {
    RefferDoctor.mutate();
  };

  const handleBook = () => {
    setLoading(true);
    RefferDoctorFirst.mutate();
  };

  const { data: timeSlots, refetch } = useQuery<SlotsData>({
    queryKey: ["slots", doctor.id, selectedDate],
    queryFn: () => {
      return token_api(accessToken)
        .post(`doctor/doctor_slots/`, {
          doctor_id: doctor.id,
          date: selectedDate,
          appointment_id,
        })
        .then((res) => res.data.slots);
    },
  });

  function getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  }

  function formatTime(isoString: string): string {
    const timePart = isoString.split("T")[1].slice(0, 5);
    const [hourStr, minuteStr] = timePart.split(":");
    let hour = parseInt(hourStr, 10);
    const minute = minuteStr;

    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;

    return `${hour}:${minute} ${ampm}`;
  }

  const RefferDoctor = useMutation({
    mutationKey: ["doc_reffer"],
    mutationFn: () =>
      token_api(accessToken)
        .post("doctor/refer/", {
          appointment_id,
          referred_doctor: doctor.id,
          referred_date: selectedDate,
          referral_notes: referralNote,
          specialization: selectedSpecialization,
          is_couple: is_couple,
          customers: patientIds,
        })
        .then((res) => res.data),
    onSuccess: () => {
      showToast(`Referred to Dr ${doctor.name} successfully`, "success");
      onClose();
      navigate(-1);
    },
    onError: () => {
      showToast("Failed to refer patient", "error");
    },
  });

  const RefferDoctorFirst = useMutation({
    mutationKey: ["doc_reffer"],
    mutationFn: () =>
      token_api(accessToken)
        .post("doctor/refer/", {
          appointment_id,
          referred_doctor: doctor.id,
          referred_date: selectedDate,
          referral_notes: referralNote,
          specialization: selectedSpecialization,
          customers: patientIds,
          is_couple: is_couple,
        })
        .then((res) => res.data),
    onSuccess: (res) => {
      BookSlot.mutate(res.data.id);
    },
    onError: () => {
      setLoading(false);
      showToast("Failed to refer patient", "error");
    },
  });

  const BookSlot = useMutation({
    mutationKey: ["doc_reffer_create_appointment"],
    mutationFn: (reffer_id: number) =>
      token_api(accessToken)
        .post("doctor/create_appointment/", {
          appointment_id,
          appointment_date: selectedDate,
          slot: selectedSlot,
          doctor: doctor.id,
          referal_id: reffer_id,
          customers: patientIds,
          language_pref: sessionPreferences.language_info,
          gender_pref: sessionPreferences.gender_info,
          is_couple: sessionPreferences.is_couple,
          specialization: sessionPreferences.specialization_id,
        })
        .then((res) => res.data),
    onSuccess: () => {
      showToast(`Booked with Dr ${doctor.name} successfully`, "success");
      onClose();
      navigate(-1);
      setLoading(false);
    },
    onError: () => {
      setLoading(false);
      showToast("Failed to book appointment", "error");
    },
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`bg-white rounded-xl shadow-xl ${
              selectedAction === "book" ? " w-6/12" : "w-full max-w-md"
            }  overflow-hidden`}
          >
            <div className="relative p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {doctor.name}
                </h3>
                <p className="text-[#6d2b8a] text-sm font-medium">
                  {doctor?.specializations.join(", ")}
                </p>
              </div>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="px-6 pb-6 space-y-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Select Action
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedAction("refer")}
                  className={`p-4 border rounded-lg transition-colors text-left ${
                    selectedAction === "refer"
                      ? "border-[#6d2b8a] bg-[#f3e8ff]"
                      : "border-gray-200 hover:border-[#6d2b8a]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#f3e8ff] rounded-full text-[#6d2b8a]">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Refer Patient
                      </h4>
                      <p className="text-xs text-gray-500">Without booking</p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedAction("book")}
                  className={`p-4 border rounded-lg transition-colors text-left ${
                    selectedAction === "book"
                      ? "border-[#6d2b8a] bg-[#f3e8ff]"
                      : "border-gray-200 hover:border-[#6d2b8a]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#f3e8ff] rounded-full text-[#6d2b8a]">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Book Slot</h4>
                      <p className="text-xs text-gray-500">Select time now</p>
                    </div>
                  </div>
                </motion.button>
              </div>
            </div>

            {selectedAction === "refer" && (
              <div className="px-6 pb-6">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Referral Note
                  </h3>
                  <div className="relative">
                    <div className="absolute top-3 left-3 text-gray-400">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <textarea
                      value={referralNote}
                      onChange={(e) => setReferralNote(e.target.value)}
                      placeholder="Enter referral notes for the doctor..."
                      className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:border-[#6d2b8a] focus:ring-1 focus:ring-[#6d2b8a] min-h-[100px]"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedAction === "book" && (
              <div className="p-6 flex w-full gap-4">
                <div className="relative w-full">
                  <CalendarDatePicker
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    setSelectedSlot={setSelectedSlot}
                    timeSlots={timeSlots}
                    refetch={refetch}
                  />
                </div>

                {selectedDate && (
                  <div className="w-full">
                    <h3 className="text-sm font-medium w-full text-gray-500 uppercase tracking-wider ">
                      Available Time Slots
                    </h3>
                    <div className="h-[300px] overflow-y-auto custom-scrollbar pr-2">
                      {timeSlots &&
                        timeSlots?.slots?.length !== 0 &&
                        timeSlots?.slots?.map((slot, index) => (
                          <motion.button
                            key={index}
                            whileHover={{ scale: 1.01 }}
                            onClick={() => setSelectedSlot(slot)}
                            className={`w-full p-3 mb-2 rounded-lg border transition-colors flex items-center justify-between ${
                              selectedSlot?.start === slot.start &&
                              selectedSlot?.end === slot.end
                                ? "border-[#6d2b8a] bg-[#f3e8ff]"
                                : "border-gray-200 hover:border-[#6d2b8a] cursor-pointer"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium">
                                {formatTime(slot.start)} -{" "}
                                {formatTime(slot.end)}
                              </span>
                            </div>
                          </motion.button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedAction && (
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 cursor-pointer text-gray-700 hover:text-gray-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={
                    selectedAction === "refer" ? handleRefer : handleBook
                  }
                  disabled={selectedAction === "book" && !selectedSlot}
                  className={`px-4 py-2 text-white cursor-pointer rounded-lg font-medium ml-2 ${
                    (selectedAction === "book" && !selectedSlot) ||
                    !selectedAction
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-[#6d2b8a] hover:bg-[#5a1e6b]"
                  }`}
                >
                  {selectedAction === "refer"
                    ? "Refer Patient"
                    : "Confirm Booking"}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
      {loading && <DoctorBookingLoading />}
    </AnimatePresence>
  );
};
