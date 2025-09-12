import { useMutation, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Check, Package } from "lucide-react";
import { useState } from "react";
import { token_api } from "../../lib/api";
import { useAuthStore } from "../../features/Auth/authSlice";
import { useToast } from "../../context/ToastProvider";
import CalendarDatePicker from "../RefferDoctor/CalendarDatePicker";
import EventModal from "../Calendar/EventModal";
import axios from "axios";

interface Slot {
  start: string;
  end: string;
  available_doctors: number[];
  date?: string;
}

interface SlotsData {
  slots: Slot[];
  available_dates: string[];
}

interface Pricing {
  single: number;
  couple: number;
}

interface Session {
  id: number;
  pricing: Pricing;
  session_count: number;
  country: string;
  specialization: string;
}

type TimeSlotApi = {
  date: string;
  start_time: string;
  end_time: string;
};

type Range = { start: Date; end: Date; date?: string };

interface DoctorSchedule {
  dates: string[];
  start_time: string;
  end_time: string;
}

interface FollowUpTimeSlotsProbs {
  did: string | null;
  aid: string | null;
  pid: string | null;
  selectedSlot: Slot | null;
  setSelectedSlot: React.Dispatch<React.SetStateAction<Slot | null>>;
  selectedDate: string;
  setSelectedDate: React.Dispatch<React.SetStateAction<string>>;
  nextStep: (include_package: boolean, package_id?: number | null) => void;
  is_couple: boolean;
}

const FollowUpTimeSlots = ({
  did,
  selectedDate,
  setSelectedDate,
  selectedSlot,
  setSelectedSlot,
  nextStep,
  pid,
  is_couple,
  aid,
}: FollowUpTimeSlotsProbs) => {
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Session | null>(null);
  const { showToast } = useToast();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [modalRange, setModalRange] = useState<Range | null>(null);

  const formatTime = (timeString: string) => {
    const timePart = timeString.split("T")[1].slice(0, 5);
    const [hourStr, minuteStr] = timePart.split(":");
    let hour = parseInt(hourStr, 10);
    const minute = minuteStr;

    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;

    return `${hour}:${minute} ${ampm}`;
  };

  const { data: timeSlots, refetch } = useQuery<SlotsData>({
    queryKey: ["slots", did, selectedDate],
    queryFn: () =>
      token_api(accessToken)
        .post(`doctor/doctor_slots/`, {
          doctor_id: did,
          date: selectedDate,
          appointment_id: aid,
        })
        .then((res) => res.data.slots),
  });

  const { data: packages } = useQuery<Session[]>({
    queryKey: ["available_packages"],
    queryFn: () =>
      token_api(accessToken)
        .get(
          `doctor/available_packages/?appointment=${aid}&customer_id=${pid}&is_couple=${is_couple}`
        )
        .then((res) => res.data),
  });

  const suggest_package = useMutation({
    mutationKey: ["suggest_package"],
    mutationFn: () =>
      token_api(accessToken)
        .post("doctor/suggest_package/", {
          package_id: selectedPackage?.id,
          customer_id: pid,
        })
        .then((res) => res.data),
    onSuccess: () => {
      showToast("Package added successfully ", "error");
      setShowPackageModal(false);
    },
    onError: () => {
      showToast("Failed to assign package", "error");
    },
  });

  const addJunDocSlot = useMutation({
    mutationKey: ["doc_availability"],
    mutationFn: (slot: DoctorSchedule) =>
      token_api(accessToken)
        .post("doctor/available_hours/", slot)
        .then((res) => res.data),
    onSuccess: () => {
      showToast("Slot added successfully!", "success");
      modalRange?.date && setSelectedDate(modalRange?.date);
      setModalRange(null);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        showToast(
          error.response?.data?.error || "Something went wrong",
          "error"
        );
      } else {
        showToast("An unexpected error occurred", "error");
      }
    },
  });

  function addNewHours(date: string) {
    setModalRange(() => {
      const newDate = new Date(date);
      return {
        start: new Date(newDate),
        end: new Date(newDate),
        date: date,
      };
    });
  }

  const handleModalSave = (payload: DoctorSchedule) => {
    addJunDocSlot.mutate(payload);
  };

  const convertSlotToApi = (slot: Slot): TimeSlotApi => ({
    date: slot.date ?? "",
    start_time: slot.start,
    end_time: slot.end,
  });

  return (
    <div className="w-full min-h-screen flex justify-center items-center  p-4">
      <div className="w-6/12 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-[#582768] p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">Schedule Follow-Up</h2>
            <p className="text-indigo-100 mt-1">
              Select your preferred date and time
            </p>
          </div>
          {packages && packages?.length > 0 && (
            <button
              onClick={() => setShowPackageModal(true)}
              className="ml-2 px-3 py-2 bg-white text-[#582768] rounded-xl flex items-center gap-2 shadow-sm hover:bg-indigo-50 transition"
            >
              <Package className="h-4 w-4" />
              <span className="text-sm font-medium">Suggest Package</span>
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          {/* <div className="mb-6 relative">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Select Date
            </h3>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`w-full p-4 rounded-xl flex items-center justify-between transition-all ${
                showDatePicker
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 hover:border-indigo-300 bg-white"
              } border shadow-sm`}
            >
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                </div>
                <span className="font-medium text-gray-800">
                  {formatDateLabel(selectedDate)}
                </span>
              </div>
              <motion.div
                animate={{ rotate: showDatePicker ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-5 w-5 text-gray-500" />
              </motion.div>
            </button>

            <AnimatePresence>
              {showDatePicker && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="absolute z-20 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-y-auto overflow-x-hidden max-h-52"
                >
                  {timeSlots?.available_dates?.map((date, index) => (
                    <motion.button
                      key={index}
                      onClick={() => {
                        setSelectedDate(date);
                        setShowDatePicker(false);
                        setSelectedSlot(null);
                        refetch();
                      }}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center ${
                        date === selectedDate ? "bg-indigo-50" : ""
                      }`}
                      whileHover={{ x: 2 }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            date === selectedDate
                              ? "bg-indigo-600"
                              : "bg-gray-300"
                          }`}
                        />
                        <span className="font-medium text-gray-800">
                          {formatDateLabel(date)}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div> */}
          <div className="flex gap-4 w-full">
            <CalendarDatePicker
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              setSelectedSlot={setSelectedSlot}
              timeSlots={timeSlots}
              refetch={refetch}
              addNewHours={addNewHours}
            />

            {/* Time Slots */}
            {selectedDate && (
              <div className="w-full">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Available Time Slots
                </h3>
                <div className="space-y-2 h-[300px] custom-scrollbar overflow-y-auto pr-2 ">
                  {timeSlots?.slots?.length ? (
                    timeSlots.slots.map((slot, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedSlot(slot)}
                        className={`w-full p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          selectedSlot?.start === slot.start &&
                          selectedSlot?.end === slot.end
                            ? "border-indigo-500 bg-indigo-50 shadow-sm"
                            : "border-gray-200 hover:border-indigo-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              selectedSlot?.start === slot.start &&
                              selectedSlot?.end === slot.end
                                ? "bg-indigo-100 text-indigo-600"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            <Clock className="h-5 w-5" />
                          </div>
                          <span className="font-medium text-gray-800">
                            {formatTime(slot.start)} - {formatTime(slot.end)}
                          </span>
                        </div>
                        {selectedSlot?.start === slot.start &&
                          selectedSlot?.end === slot.end && (
                            <Check className="h-5 w-5 text-indigo-600" />
                          )}
                      </motion.button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500 rounded-xl border border-gray-200 bg-gray-50">
                      No available slots for this date
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Appointment */}
          <AnimatePresence>
            {selectedSlot && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-6"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedSlot({ ...selectedSlot, date: selectedDate });
                    nextStep(
                      selectedPackage ? true : false,
                      selectedPackage?.id ?? null
                    );
                  }}
                  className="w-full py-3.5 bg-[#582768] text-white cursor-pointer font-medium rounded-xl shadow-md transition-all"
                >
                  Confirm {formatTime(selectedSlot.start)} Appointment
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Package Modal */}
      <AnimatePresence>
        {showPackageModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Suggest a Package
                </h2>
                <button
                  onClick={() => setShowPackageModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {packages?.map((pkg) => (
                  <motion.button
                    key={pkg.id}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedPackage?.id === pkg.id
                        ? "border-indigo-500 bg-indigo-50 shadow-sm"
                        : "border-gray-200 hover:border-indigo-300 bg-white"
                    }`}
                  >
                    <h3 className="font-medium text-gray-800">
                      {pkg.session_count} Session Package
                    </h3>

                    <p className="text-xs text-gray-400 mt-1">
                      {pkg.specialization} • {pkg.country}
                    </p>
                  </motion.button>
                ))}
              </div>

              {selectedPackage && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    suggest_package.mutate();
                  }}
                  className="mt-6 w-full py-3.5 bg-[#582768] text-white cursor-pointer font-medium rounded-xl shadow-md transition-all"
                >
                  Confirm {selectedPackage.session_count}-Session Package
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalRange && (
          <EventModal
            initialRange={modalRange}
            selectedSlots={selectedSlot ? [convertSlotToApi(selectedSlot)] : []}
            onClose={() => {
              setModalRange(null);
            }}
            onSave={handleModalSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FollowUpTimeSlots;
