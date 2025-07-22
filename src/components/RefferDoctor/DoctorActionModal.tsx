"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Calendar,
  Clock,
  Stethoscope,
  ChevronDown,
  MessageSquare,
  Mail,
  Phone,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";
import { baseurl, token_api } from "../../lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../features/Auth/authSlice";
import { format, isToday, isTomorrow, parse, parseISO } from "date-fns";
import { useToast } from "../../context/ToastProvider";
import { useNavigate } from "react-router-dom";

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

const methods = [
  { id: "SMS", label: "SMS", icon: <MessageCircle className="h-4 w-4" /> },
  { id: "Email", label: "Email", icon: <Mail className="h-4 w-4" /> },
  { id: "WhatsApp", label: "WhatsApp", icon: <Phone className="h-4 w-4" /> },
];

export const DoctorActionModal = ({
  isOpen,
  onClose,
  doctor,
  appointment_id,
  sessionPreferences,
}: {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor;
  appointment_id: string | null;
  sessionPreferences: SessionPreferences;
}) => {
  const [selectedAction, setSelectedAction] = useState<"refer" | "book" | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState(getTomorrowDate());
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [referralNote, setReferralNote] = useState("");
  const [confirmationMethod, setConfirmationMethod] = useState("");
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [confirmationPhone, setConfirmationPhone] = useState("");
  const [showConfirmationForm, setShowConfirmationForm] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    method: "",
  });
  const accessToken = useAuthStore((state) => state.accessToken);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleRefer = () => {
    RefferDoctor.mutate();
  };

  const handleBook = () => {
    if (selectedSlot && !showConfirmationForm) {
      setShowConfirmationForm(true);
      return;
    }

    if (showConfirmationForm) {
      if (!confirmationMethod) {
        setErrors({
          ...errors,
          method: "Please select a confirmation method",
        });
        return;
      }

      if (confirmationMethod === "Email" && !validateEmail(confirmationEmail)) {
        setErrors({
          ...errors,
          email: "Please enter a valid email address",
        });
        return;
      }

      if (
        (confirmationMethod === "SMS" || confirmationMethod === "WhatsApp") &&
        !validatePhone(confirmationPhone)
      ) {
        setErrors({
          ...errors,
          phone: "Please enter a valid phone number",
        });
        return;
      }

      BookSlot.mutate();
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone: string) => {
    const re = /^[0-9]{10,15}$/;
    return re.test(phone);
  };

  const { data: timeSlots, refetch } = useQuery<SlotsData>({
    queryKey: ["slots", doctor.id, selectedDate],
    queryFn: () => {
      return token_api(accessToken)
        .post(`doctor/doctor_slots/`, {
          doctor_id: doctor.id,
          date: selectedDate,
        })
        .then((res) => res.data.slots);
    },
  });

  function getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  }

  const formatTime = (timeString: string) => {
    const parsed = parse(timeString, "HH:mm:ss", new Date());
    return format(parsed, "hh:mm a");
  };

  const formatDateLabel = (dateString: string) => {
    const date = parseISO(dateString);

    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";

    return format(date, "MMMM d yyyy");
  };

  const RefferDoctor = useMutation({
    mutationKey: ["doc_reffer"],
    mutationFn: () =>
      token_api(accessToken)
        .post("doctor/refer/", {
          appointment_id,
          doctor: doctor.id,
          referred_date: selectedDate,
          referral_note: referralNote,
        })
        .then((res) => res.data),
    onSuccess: () => {
      showToast(`Referred to Dr ${doctor.name} successfully`, "success");
      onClose();
      navigate("/");
    },
    onError: () => {
      showToast("Failed to refer patient", "error");
    },
  });

  const BookSlot = useMutation({
    mutationKey: ["doc_reffer_create_appointment"],
    mutationFn: () =>
      token_api(accessToken)
        .post("doctor/create_appointment/", {
          appointment_id,
          appointment_date: selectedDate,
          slot: selectedSlot,
          doctor: doctor.id,
          language_pref: sessionPreferences.language_info,
          gender_pref: sessionPreferences.gender_info,
          is_couple: sessionPreferences.is_couple,
          specialization: sessionPreferences.specialization_id,
          confirmation_method: confirmationMethod,
          confirmation_email:
            confirmationMethod === "Email" ? confirmationEmail : "",
          confirmation_phone_number:
            confirmationMethod === "SMS" || confirmationMethod === "WhatsApp"
              ? confirmationPhone
              : "",
        })
        .then((res) => res.data),
    onSuccess: () => {
      showToast(`Booked with Dr ${doctor.name} successfully`, "success");
      onClose();
      navigate("/");
    },
    onError: () => {
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
            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="relative p-6 border-b border-gray-100">
              <h2 className="text-2xl font-medium text-gray-900 text-center">
                Doctor Actions
              </h2>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 flex items-center gap-4">
              <div className="relative h-16 w-16 min-w-[64px] rounded-full overflow-hidden border-2 border-[#6d2b8a]">
                <img
                  src={baseurl + doctor.profile_pic}
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {doctor.name}
                </h3>
                <p className="text-[#6d2b8a] text-sm font-medium">
                  {doctor?.specializations.join(", ")}
                </p>
              </div>
            </div>

            {!showConfirmationForm ? (
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
            ) : null}

            {selectedAction === "refer" && !showConfirmationForm && (
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

            {selectedAction === "book" && !showConfirmationForm && (
              <div className="px-6 pb-6">
                <div className="mb-4 relative">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Select Date
                  </h3>
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="w-full p-3 border border-gray-200 rounded-lg flex items-center justify-between hover:border-[#6d2b8a] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{formatDateLabel(selectedDate)}</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-500 transition-transform ${
                        showDatePicker ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {showDatePicker && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
                      >
                        {timeSlots?.available_dates?.map((date, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedDate(date);
                              setShowDatePicker(false);
                              setSelectedSlot(null);
                              refetch();
                            }}
                            className={`w-full p-3 text-left 
                              hover:bg-gray-50 cursor-pointer
                                 ${
                                   date === selectedDate ? "bg-[#f3e8ff]" : ""
                                 }`}
                          >
                            <div className="flex items-center gap-2">
                              <span> {formatDateLabel(date)}</span>
                              {!date && (
                                <span className="text-xs ml-auto">
                                  No slots
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {selectedDate && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Available Time Slots
                    </h3>
                    <div className="max-h-40 overflow-y-auto pr-2">
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

            {showConfirmationForm && (
              <div className="px-6 pb-6 space-y-4">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Confirmation Method
                </h3>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Method *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {methods.map((method) => (
                      <motion.button
                        key={method.id}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setConfirmationMethod(method.id);
                          setErrors({ ...errors, method: "" });
                        }}
                        className={`p-3 border rounded-lg transition-colors flex flex-col items-center justify-center ${
                          confirmationMethod === method.id
                            ? "border-[#6d2b8a] bg-[#f3e8ff]"
                            : "border-gray-200 hover:border-[#6d2b8a]"
                        }`}
                      >
                        <div className="text-[#6d2b8a] mb-1">{method.icon}</div>
                        <span className="text-xs font-medium">
                          {method.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                  {errors.method && (
                    <p className="mt-1 text-xs text-red-500">{errors.method}</p>
                  )}
                </div>

                {confirmationMethod === "Email" && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={confirmationEmail}
                      onChange={(e) => {
                        setConfirmationEmail(e.target.value);
                        setErrors({ ...errors, email: "" });
                      }}
                      placeholder="Enter email for confirmation"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:border-[#6d2b8a] focus:ring-1 focus:ring-[#6d2b8a]"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.email}
                      </p>
                    )}
                  </div>
                )}

                {(confirmationMethod === "SMS" ||
                  confirmationMethod === "WhatsApp") && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={confirmationPhone}
                      onChange={(e) => {
                        setConfirmationPhone(e.target.value);
                        setErrors({ ...errors, phone: "" });
                      }}
                      placeholder="Enter phone number for confirmation"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:border-[#6d2b8a] focus:ring-1 focus:ring-[#6d2b8a]"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              {showConfirmationForm ? (
                <button
                  onClick={() => setShowConfirmationForm(false)}
                  className="px-4 py-2 cursor-pointer text-gray-700 hover:text-gray-900 font-medium"
                >
                  Back
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-4 py-2 cursor-pointer text-gray-700 hover:text-gray-900 font-medium"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={selectedAction === "refer" ? handleRefer : handleBook}
                disabled={
                  (selectedAction === "book" &&
                    !selectedSlot &&
                    !showConfirmationForm) ||
                  (selectedAction === "refer" && !referralNote)
                }
                className={`px-4 py-2 text-white cursor-pointer rounded-lg font-medium ml-2 ${
                  (selectedAction === "book" &&
                    !selectedSlot &&
                    !showConfirmationForm) ||
                  (selectedAction === "refer" && !referralNote)
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-[#6d2b8a] hover:bg-[#5a1e6b]"
                }`}
              >
                {selectedAction === "refer"
                  ? "Refer Patient"
                  : showConfirmationForm
                  ? "Confirm Booking"
                  : "Continue"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
