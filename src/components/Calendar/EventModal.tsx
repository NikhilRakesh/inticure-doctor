import {
  addDays,
  format,
  parseISO,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = {
  primary: "#6A1B78",
  secondary: "#D41060",
  dark: "#3A3A3B",
  black: "#000000",
  accent1: "#C2D510",
  accent2: "#2C1879",
  accent3: "#29791B",
  lightBg: "#F0E8F2",
  white: "#FFFFFF",
};

type Range = { start: Date; end: Date };

type TimeSlotApi = {
  date: string;
  start_time: string;
  end_time: string;
};

const EventModal: React.FC<{
  initialRange: Range | null;
  selectedSlots: TimeSlotApi[];
  onClose: () => void;
  onSave: (payload: {
    dates: string[];
    start_time: string;
    end_time: string;
  }) => void;
}> = ({ initialRange,selectedSlots, onClose, onSave }) => {
  const start = initialRange?.start ?? new Date();
  const end = initialRange?.end ?? addDays(start, 0);

  const [startDate, setStartDate] = useState<Date>(start);
  const [startTime, setStartTime] = useState<string>(formatTo12Hour(start));
  const [endTime, setEndTime] = useState<string>(formatTo12Hour(end));
  const [endDate, setEndDate] = useState<Date | "">(() =>
    initialRange ? end : ""
  );
  const [description, setDescription] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);

  useEffect(() => {
    setStartDate(start);
    setStartTime(formatTo12Hour(start));
    setEndTime(formatTo12Hour(end));
    setEndDate(initialRange ? end : "");
    setDescription("");
    setIsRecurring(initialRange ? !isSameDay(start, end) : false);
  }, []);

  console.log(selectedSlots);
  

  function generate15MinTimes12Hour(): string[] {
    const times: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hour12 = h % 12 === 0 ? 12 : h % 12;
        const minute = m < 10 ? `0${m}` : m;
        const ampm = h < 12 ? "AM" : "PM";
        times.push(`${hour12}:${minute} ${ampm}`);
      }
    }
    return times;
  }

  const TIME_OPTIONS = generate15MinTimes12Hour();

  function formatTo12Hour(date: Date): string {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes.toString().padStart(2, "0");
    return `${hours}:${minutesStr} ${ampm}`;
  }

  function convert12to24(time12h: string): string {
    const [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":");

    if (hours === "12") {
      hours = "00";
    }

    if (modifier === "PM") {
      hours = String(parseInt(hours, 10) + 12);
    }

    return `${hours.padStart(2, "0")}:${minutes}`;
  }

  const handleSave = () => {
    let dates: string[] = [];

    if (isRecurring && endDate) {
      dates = eachDayOfInterval({
        start: startDate,
        end: endDate as Date,
      }).map((date) => format(date, "yyyy-MM-dd"));
    } else {
      dates = [format(startDate, "yyyy-MM-dd")];
    }

    const startTime24 = convert12to24(startTime);
    const endTime24 = convert12to24(endTime);

    onSave({
      dates,
      start_time: startTime24,
      end_time: endTime24,
    });

    onClose();
  };

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="bg-white max-w-md w-full rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="p-6 text-white flex justify-between items-center"
            style={{ backgroundColor: COLORS.primary }}
          >
            <div>
              <h3 className="text-xl font-semibold">Schedule Availability</h3>
              <p className="text-sm opacity-90 mt-1">Set your working hours</p>
            </div>
            <button
              aria-label="Close"
              onClick={onClose}
              className="text-white hover:text-gray-200 text-lg cursor-pointer rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Recurring Toggle */}
            <div className="flex items-center justify-between mb-6 p-3 rounded-lg bg-gray-50">
              <div>
                <label className="font-medium text-gray-800">
                  Multiple Days
                </label>
                <p className="text-sm text-gray-600">
                  Set availability for a date range
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-purple-600 relative transition-colors duration-300">
                  <span
                    className={`absolute ${
                      isRecurring ? "right-[2px]" : "left-[2px]"
                    }  top-[2px] h-5 w-5 bg-white border border-gray-300 rounded-full transition-transform duration-300 transform peer-checked:translate-x-5`}
                  />
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-5 mb-5">
              <div
                className={`grid ${
                  isRecurring ? "grid-cols-2 " : "grid-cols-1"
                }gap-2`}
              >
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-xl px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-colors"
                    value={format(startDate, "yyyy-MM-dd")}
                    onChange={(e) =>
                      setStartDate(parseISO(`${e.target.value}T00:00:00`))
                    }
                  />
                </div>

                {isRecurring && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-xl px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-colors"
                      value={
                        endDate ? format(endDate as Date, "yyyy-MM-dd") : ""
                      }
                      onChange={(e) => {
                        setEndDate(
                          e.target.value
                            ? parseISO(`${e.target.value}T00:00:00`)
                            : ""
                        );
                      }}
                      min={format(startDate, "yyyy-MM-dd")}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Start Time
                  </label>
                  <select
                    className="w-full rounded-xl px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-colors"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  >
                    {TIME_OPTIONS.map((time, index) => (
                      <option key={index} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    End Time
                  </label>
                  <select
                    className="w-full rounded-xl px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-colors"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  >
                    {TIME_OPTIONS.map((time, index) => (
                      <option key={index} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Summary Preview */}
            <div className="mb-6 p-4 rounded-lg bg-purple-50 border border-purple-100">
              <h4 className="font-medium text-purple-900 mb-2">
                Schedule Summary
              </h4>
              <p className="text-sm text-purple-700">
                {isRecurring && endDate
                  ? `${format(startDate, "MMM d")} - ${format(
                      endDate as Date,
                      "MMM d, yyyy"
                    )}`
                  : format(startDate, "EEEE, MMM d, yyyy")}{" "}
                • {startTime} - {endTime}
              </p>
              {description && (
                <p className="text-sm text-purple-600 mt-2">
                  Note: {description}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl border cursor-pointer border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 rounded-xl cursor-pointer text-white font-medium transition-colors hover:opacity-90 shadow-md"
                style={{ backgroundColor: COLORS.primary }}
                aria-label="Save Availability"
              >
                Save Availability
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EventModal;
