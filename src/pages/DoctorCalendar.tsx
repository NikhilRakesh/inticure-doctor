import { useState, Fragment, useEffect } from "react";
import DatePicker from "react-datepicker";
import { Dialog, Transition } from "@headlessui/react";
import { Calendar, Clock, X, AlertCircle, Info, CalendarCheck } from "lucide-react";
import {
  addDays,
  format,
  differenceInMinutes,
  parse,
  isWithinInterval,
  isAfter,
  eachDayOfInterval,
} from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import { useAuthStore } from "../features/Auth/authSlice";
import { useMutation, useQuery } from "@tanstack/react-query";
import { token_api } from "../lib/api";
import { useToast } from "../context/ToastProvider";

interface DoctorSchedule {
  dates: string[];
  start_time: string;
  end_time: string;
}

interface TimeSlot {
  date: string;
  start_time: string;
  end_time: string;
}

const DoctorCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    addDays(new Date(), 1)
  );
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [tillDate, setTillDate] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const doctor_flag = useAuthStore((state) => state.doctorLevel);
  const accessToken = useAuthStore((state) => state.accessToken);
  const formattedDate = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : null;
  const { showToast } = useToast();

  useEffect(() => {
    refetch();
  }, [formattedDate]);

  const { data: selectedSlots = [], refetch } = useQuery<TimeSlot[]>({
    queryKey: ["available-hours", formattedDate],
    queryFn: () => {
      if (!formattedDate) {
        throw new Error("Invalid date selection");
      }
      const date = format(formattedDate, "yyyy-MM-dd");
      return token_api(accessToken)
        .get(`doctor/available_hours/?date=${date}`)
        .then((res) => res.data);
    },
    enabled: !!formattedDate,
  });

  const isTimeSlotOverlapping = (newStart: Date, newEnd: Date) => {
    return selectedSlots.some((slot) => {
      const existingStart = parse(slot.start_time, "HH:mm", new Date());
      const existingEnd = parse(slot.end_time, "HH:mm", new Date());

      return (
        isWithinInterval(newStart, {
          start: existingStart,
          end: existingEnd,
        }) ||
        isWithinInterval(newEnd, { start: existingStart, end: existingEnd }) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });
  };

  const handleTimeSelection = () => {
    if (!startTime || !endTime) {
      setError("Please select both start and end times");
      return;
    }

    if (!selectedDate) {
      setError("Please select a date");
      return;
    }

    if (startTime >= endTime) {
      setError("End time must be after start time");
      return;
    }

    if (isTimeSlotOverlapping(startTime, endTime)) {
      setError("This time slot overlaps with an existing slot");
      return;
    }

    const duration = differenceInMinutes(endTime, startTime);

    if (doctor_flag === "senior") {
      if (duration < 60) {
        setError("Senior doctors must select at least 60 minutes");
        return;
      }
    } else {
      if (duration < 15) {
        setError("Junior doctors must select at least 15 minutes");
        return;
      }
    }

    let dates: string[] = [];

    if (selectedDate) {
      if (tillDate && isAfter(tillDate, selectedDate)) {
        dates = eachDayOfInterval({
          start: selectedDate,
          end: tillDate,
        }).map((d) => format(d, "yyyy-MM-dd"));
      } else {
        dates = [format(selectedDate, "yyyy-MM-dd")];
      }
    }
    const start_time = format(startTime, "HH:mm");
    const end_time = format(endTime, "HH:mm");

    addJunDocSlot.mutate({ dates, start_time, end_time });
  };

  const addJunDocSlot = useMutation({
    mutationKey: ["doc_availability"],
    mutationFn: (slot: DoctorSchedule) =>
      token_api(accessToken)
        .post("doctor/available_hours/", slot)
        .then((res) => res.data),
    onSuccess: () => {
      showToast("Slot added successfully!", "success");
      setStartTime(null);
      setEndTime(null);
      setError(null);
      refetch();
      setIsSlotModalOpen(false);
    },
    onError: () => {
      showToast("Failed to add time slot", "error");
    },
  });

  return (
    <div className="w-full min-h-screen p-6 bg-gradient-to-br from-[#f9f5ff] to-[#f0e5ff]">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#2c1e4a] mb-2">
                Doctor Availability
              </h1>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    doctor_flag === "senior"
                      ? "bg-[#582768]/10 text-[#582768]"
                      : "bg-[#d6769f]/10 text-[#d6769f]"
                  }`}
                >
                  {doctor_flag === "senior" ? "Senior Doctor" : "Junior Doctor"}
                </span>
                <span className="text-gray-500 text-sm">
                  {doctor_flag === "senior"
                    ? "Minimum 1 hour slots (2 hours recommended for couple appointments)"
                    : "Minimum 15 minute slots"}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsSlotModalOpen(true)}
              className="px-6 py-3 rounded-xl cursor-pointer text-white font-medium shadow-lg bg-gradient-to-r from-[#582768] to-[#8a4c7d] hover:from-[#6a3270] hover:to-[#7d3c6e] transition-all transform hover:scale-[1.02]"
            >
              Add Availability
            </button>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-8">
            <div className="mb-4 flex items-center">
              <Calendar className="h-5 w-5 text-[#582768] mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">
                Selected Date
              </h2>
            </div>
            <DatePicker
              selected={selectedDate}
              onChange={setSelectedDate}
              minDate={addDays(new Date(), 1)}
              dateFormat="MMMM d, yyyy"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#582768]/50"
              calendarClassName="rounded-xl shadow-lg border border-gray-200"
            />
          </div>

          {selectedSlots.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-[#582768]/10 rounded-lg mr-3">
                  <Clock className="h-6 w-6 text-[#582768]" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Your Availability
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({selectedSlots.length} time blocks)
                  </span>
                </h2>
              </div>

              <div className="space-y-3">
                {selectedSlots.map((slot, index) => {
                  const start = slot.start_time;
                  const end = slot.end_time;
                  const startDate = parse(start, "HH:mm", new Date());
                  const endDate = parse(end, "HH:mm", new Date());
                  const duration = differenceInMinutes(endDate, startDate);

                  return (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-[#f9f0ff] p-4 rounded-xl border border-[#e9d4ff]"
                    >
                      <div>
                        <span className="font-medium text-[#582768]">
                          {format(startDate, "h:mm a")} -{" "}
                          {format(endDate, "h:mm a")}
                        </span>
                        <span className="ml-3 text-sm text-gray-500">
                          ({duration} minutes)
                        </span>
                        {doctor_flag === "senior" && duration < 120 && (
                          <div className="mt-1 text-xs text-amber-600">
                            Note: 2 hour slots recommended for couple
                            appointments
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {doctor_flag === "senior" && (
                <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-sm text-amber-800">
                    For couple appointments, please ensure you have at least one
                    2-hour time slot available in your schedule. Patients will
                    only be able to book couple appointments in these extended
                    slots.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-[#f9f0ff] rounded-full flex items-center justify-center mb-4">
                <Info className="h-8 w-8 text-[#582768]" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                No availability set
              </h3>
              <p className="text-gray-500 mb-4">
                Add your available time slots for{" "}
                {selectedDate && format(selectedDate, "MMMM d, yyyy")}
              </p>
              {doctor_flag === "senior" && (
                <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-sm text-amber-800">
                    Remember to include some 2-hour slots if you want to accept
                    couple appointments.
                  </p>
                </div>
              )}
              <button
                onClick={() => setIsSlotModalOpen(true)}
                className="px-6 py-2 bg-[#582768] cursor-pointer text-white rounded-lg hover:bg-[#6a3270] transition-colors"
              >
                Add Availability
              </button>
            </div>
          )}
        </div>
      </div>

      <Transition appear show={isSlotModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsSlotModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-md" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] transition-all border border-gray-100">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-[#582768] to-[#8a3ab9] p-6">
                    <div className="flex justify-between items-center">
                      <Dialog.Title
                        as="h3"
                        className="text-xl font-semibold text-white"
                      >
                        Schedule Availability
                      </Dialog.Title>
                      <button
                        onClick={() => setIsSlotModalOpen(false)}
                        className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                        aria-label="Close"
                      >
                        <X className="h-5 w-5 text-white" />
                      </button>
                    </div>
                    <p className="text-white/90 mt-1 text-sm">
                      Add your available time slots for patient appointments
                    </p>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-5">
                    {/* Date Range Section */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-[#582768]" />
                          Start Date
                        </label>
                        <DatePicker
                          selected={selectedDate}
                          onChange={setSelectedDate}
                          minDate={addDays(new Date(), 1)}
                          dateFormat="MMMM d, yyyy"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#582768]/50 focus:border-[#582768]/30 transition-all"
                          calendarClassName="shadow-lg border border-gray-200 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <CalendarCheck className="h-4 w-4 mr-2 text-[#582768]" />
                          End Date (Optional)
                        </label>
                        <DatePicker
                          selected={tillDate}
                          onChange={setTillDate}
                          minDate={selectedDate ?? new Date()}
                          dateFormat="MMMM d, yyyy"
                          placeholderText="No end date"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#582768]/50 focus:border-[#582768]/30 transition-all"
                          calendarClassName="shadow-lg border border-gray-200 rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Time Range Section */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-[#582768]" />
                          Start Time
                        </label>
                        <DatePicker
                          selected={startTime}
                          onChange={setStartTime}
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={15}
                          timeCaption="Time"
                          dateFormat="h:mm aa"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#582768]/50 focus:border-[#582768]/30 transition-all"
                        />
                      </div>

                      <div>
                        <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-[#582768]" />
                          End Time
                        </label>
                        <DatePicker
                          selected={endTime}
                          onChange={setEndTime}
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={15}
                          timeCaption="Time"
                          dateFormat="h:mm aa"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#582768]/50 focus:border-[#582768]/30 transition-all"
                        />
                      </div>
                    </div>

                    {/* Doctor Guidance */}
                    <div className="bg-[#f8f5ff] p-4 rounded-lg border border-[#e9d8ff]">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-[#582768] mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-[#582768] mb-1">
                            {doctor_flag === "senior"
                              ? "Senior Doctor Guidelines"
                              : "Junior Doctor Guidelines"}
                          </p>
                          <p className="text-sm text-[#582768]/90">
                            {doctor_flag === "senior" ? (
                              <>
                                Minimum 1-hour slots required. For couple
                                appointments, we recommend 2-hour slots to
                                ensure quality care.
                              </>
                            ) : (
                              <>
                                Minimum 15-minute slots required. Consider
                                30-minute slots for comprehensive consultations.
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-50 p-3 rounded-lg border border-red-100 flex items-start">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 rounded-b-2xl flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsSlotModalOpen(false)}
                      className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleTimeSelection}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#582768] to-[#8a3ab9] text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:from-[#4a1f5a] hover:to-[#6a3270]"
                    >
                      Confirm Availability
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default DoctorCalendar;
