import { useState } from "react";
import {
  addMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slot {
  start: string;
  end: string;
  available_doctors: number[];
}

interface CalendarDatePickerProps {
  selectedDate: string | null;
  setSelectedDate: (date: string) => void;
  addNewHours?: (date: string) => void;
  setSelectedSlot: (slot: Slot | null) => void;
  refetch: () => void;
  timeSlots: { available_dates?: string[] } | undefined;
}

export default function CalendarDatePicker({
  selectedDate,
  setSelectedDate,
  setSelectedSlot,
  refetch,
  timeSlots,
  addNewHours,
}: CalendarDatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const availableDates = timeSlots?.available_dates || [];

  // Month helpers
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const handleDateClick = (day: Date) => {
    const isoDate = day.toLocaleDateString("en-CA");

    if (availableDates.includes(isoDate)) {
      setSelectedDate(isoDate);
      setSelectedSlot(null);
      refetch();
    } else if (addNewHours) {
      console.log("here");

      addNewHours(isoDate);
    }
  };

  return (
    <div className="mb-4 relative w-full">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
        Select Date
      </h3>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-base font-semibold text-gray-800">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-medium text-gray-500">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {days.map((day) => {
            const isoDate = day.toLocaleDateString("en-CA");
            const isAvailable = availableDates.includes(isoDate);
            const isSelected =
              selectedDate && isSameDay(new Date(selectedDate), day);
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <button
                key={isoDate}
                onClick={() => handleDateClick(day)}
                disabled={!isAvailable && !addNewHours}
                className={`
                  w-10 h-10 flex items-center justify-center rounded-full text-sm
                  ${isCurrentMonth ? "text-gray-800" : "text-gray-300"}
                  ${
                    isAvailable
                      ? "hover:bg-purple-100 cursor-pointer"
                      : addNewHours
                      ? "cursor-pointer hover:bg-purple-100"
                      : "opacity-40 cursor-not-allowed"
                  }
                  ${
                    isSelected
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : ""
                  }
                `}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
