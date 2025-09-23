// DoctorCalendarGrid.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  addDays,
  format,
  isAfter,
  isBefore,
  isSameDay,
  setHours,
  startOfDay,
  startOfMonth,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfHour,
} from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import EventModal from "../components/Calendar/EventModal";
import MiniCalendar from "../components/Calendar/MiniCalendar";
import { useMutation, useQuery } from "@tanstack/react-query";
import { token_api } from "../lib/api";
import { useAuthStore } from "../features/Auth/authSlice";
import { useToast } from "../context/ToastProvider";
import axios from "axios";
import EditWorkHoursModal from "../components/Calendar/EditWorkHoursModal";

type TimeSlotApi = {
  date: string;
  start_time: string;
  end_time: string;
  start_date_time?: string;
};

type DraftSlot = {
  start: Date;
  end: Date;
};

interface DoctorSchedule {
  dates: string[];
  start_time: string;
  end_time: string;
}

const COLORS = {
  primary: "#6A1B78",
  secondary: "#D41060",
  dark: "#3A3A3B",
  black: "#000000",
  accent1: "#C2D510",
  accent2: "#2C1879",
  accent3: "#29791B",
  lightBg: "#F0E8F2",
  lightSecondary: "#FCE4EC",
  white: "#FFFFFF",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
};

type Range = {
  start: Date;
  end: Date;
  date?: string;
  start_date_time?: string;
};

const hours = Array.from({ length: 23 }, (_, i) => i);

const DoctorCalendarGrid: React.FC = () => {
  const now = new Date();
  const [currentWeek, setCurrentWeek] = useState<Date>(now);
  const [selectedDate, setSelectedDate] = useState<Date>(now);
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(now));
  const authToken = useAuthStore((s) => s.accessToken);
  const [modalOpen, setModalOpen] = useState(false);
  const [editWorkHours, setEditWorkHours] = useState(false);
  const [modalRange, setModalRange] = useState<Range | null>(null);
  const [editRange, setEditRange] = useState<Range | null>(null);
  const [draftSlots, setDraftSlots] = useState<DraftSlot[]>([]);
  const [dragStart, setDragStart] = useState<Date | null>(null);
  const [dragEnd, setDragEnd] = useState<Date | null>(null);
  const [minHrInSEc, setMinHrInSEc] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { showToast } = useToast();
  const [currentWeeks, setCurrentWeeks] = useState<Date[]>(() =>
    Array.from({ length: 7 }, (_, i) => addDays(new Date(), i))
  );

  useEffect(() => {
    setCurrentWeeks((prevWeek) => getUpdatedWeekDays(selectedDate, prevWeek));
  }, [selectedDate]);

  const { data: workingDays = [], refetch: refetch2 } = useQuery<string[]>({
    queryKey: ["available_dates"],
    queryFn: () =>
      token_api(authToken)
        .get("doctor/available_dates/")
        .then((r) => {
          setMinHrInSEc(r.data.doctor_max_session_duration);
          return r.data.available_dates;
        }),
  });

  function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const { data: selectedSlots = [], refetch } = useQuery<TimeSlotApi[]>({
    queryKey: ["available-hours", selectedDate],
    queryFn: () =>
      token_api(authToken)
        .get(`doctor/available_hours/?date=${formatDate(selectedDate)}`)
        .then((r) => r.data),
    enabled: !!selectedDate,
  });

  const addJunDocSlot = useMutation({
    mutationKey: ["doc_availability"],
    mutationFn: (slot: DoctorSchedule) =>
      token_api(authToken)
        .post("doctor/available_hours/", slot)
        .then((res) => res.data),
    onSuccess: () => {
      showToast("Slot added successfully!", "success");
      refetch();
      refetch2();
      setModalOpen(false);
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

  const editDrWorkHours = useMutation({
    mutationKey: ["edit_available_hours"],
    mutationFn: (slot: {
      old_start_time?: string;
      start_time: string;
      end_time: string;
      date?: string;
    }) =>
      token_api(authToken)
        .post("doctor/edit_available_hours/", slot)
        .then((res) => res.data),
    onSuccess: () => {
      showToast("Working hours updated successfully.", "success");
      refetch();
      refetch2();
      setEditWorkHours(false);
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

  function getUpdatedWeekDays(selectedDate: Date, currentWeek: Date[]): Date[] {
    const isInCurrentWeek = currentWeek.some((day) =>
      isSameDay(day, selectedDate)
    );

    if (isInCurrentWeek) {
      return currentWeek;
    }

    // Else: selectedDate is outside the currentWeek, create a new one
    return Array.from({ length: 7 }, (_, i) => addDays(selectedDate, i));
  }

  const weekDays = useMemo(() => {
    return getUpdatedWeekDays(selectedDate, currentWeeks);
  }, [selectedDate, currentWeek]);

  const beginDrag = (day: Date, hour?: number) => {
    if (isBefore(day, startOfDay(now))) return;
    const start =
      typeof hour === "number"
        ? setHours(new Date(day), hour)
        : startOfDay(day);
    const rounded = startOfHour(start);

    setDragStart(rounded);
    setDragEnd(rounded);
    setIsDragging(true);
  };

  const extendDrag = (day: Date, hour?: number) => {
    if (!isDragging || !dragStart) return;
    if (isBefore(day, startOfDay(now))) return;
    const end =
      typeof hour === "number"
        ? setHours(new Date(day), hour + 1)
        : startOfDay(day);
    const rounded = startOfHour(end);
    if (isBefore(end, dragStart)) {
      setDragEnd(dragStart);
      setDragStart(end);
    } else {
      setDragEnd(rounded);
    }
  };

  const finishDrag = () => {
    if (dragStart && dragEnd && isAfter(dragEnd, dragStart)) {
      const newSlot = { start: dragStart, end: dragEnd };
      setSelectedDate(dragStart);
      setDraftSlots((p) => [...p, newSlot]);
      setModalRange({ start: dragStart, end: dragEnd });
      setModalOpen(true);
    }
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  const onMiniRangeSelect = (r: Range) => {
    if (isBefore(r.start, startOfDay(now))) return;
    setSelectedDate(r.start);
    setCurrentWeek(r.start);
    setCurrentMonth(startOfMonth(r.start));
    setModalRange({ start: startOfDay(r.start), end: startOfDay(r.end) });
  };

  const handleModalSave = (payload: DoctorSchedule) => {
    addJunDocSlot.mutate(payload);
  };

  const handleEditWorkHour = (
    start: Date,
    end: Date,
    date: string,
    start_date_time?: string
  ) => {
    const timeRange: Range = {
      start,
      end,
      date,
      start_date_time,
    };
    setEditRange(timeRange);
    setEditWorkHours(true);
  };

  const handleSaveEditWorkHours = (payload: {
    old_start_time?: string;
    start_time: string;
    end_time: string;
    date?: string;
  }) => {
    editDrWorkHours.mutate(payload);
  };

  return (
    <div className="w-full min-h-screen p-6 bg-gradient-to-br from-[#faf7ff] to-[#f3ebff] flex gap-6">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-80 bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-6 border border-gray-100"
      >
        <div className="text-center">
          <h2
            className="text-xl font-semibold"
            style={{ color: COLORS.primary }}
          >
            {format(now, "EEEE, MMM d, yyyy")}
          </h2>
        </div>

        <MiniCalendar
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          selectedDate={selectedDate}
          setSelectedDate={(d) => {
            if (isBefore(d, startOfDay(now))) return;
            setSelectedDate(d);
            setCurrentWeek(d);
            setCurrentMonth(startOfMonth(d));
          }}
          setCurrentWeek={setCurrentWeek}
          workingDays={workingDays}
          onRangeSelect={onMiniRangeSelect}
        />
      </motion.aside>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex-1 bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col border border-[#F3F4F6]"
      >
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-[#E5E7EB] bg-[#F9FAFB]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#F0E8F2]">
              <CalendarIcon className="h-5 w-5 text-[#6A1B78]" />
            </div>
            <h1 className="text-2xl font-bold text-[#3A3A3B]">
              Doctor Calendar
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium px-3 py-2 rounded-lg bg-[#F3F4F6]">
              {format(startOfWeek(currentWeek), "MMM d")} -{" "}
              {format(endOfWeek(currentWeek), "MMM d, yyyy")}
            </span>
          </div>
        </div>

        <div
          className="flex-1 grid grid-cols-[80px_1fr] overflow-auto bg-white"
          onMouseUp={finishDrag}
          onTouchEnd={finishDrag}
        >
          <div className="border-r border-[#E5E7EB] bg-[#F9FAFB] py-2">
            {hours.map((h, index) => (
              <div
                key={index}
                className="h-16 text-xs flex justify-end pr-3 items-end pt-1 border-b border-[#E5E7EB] text-[#3A3A3B]"
              >
                {format(setHours(new Date(), h), "ha")}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 border-b border-[#E5E7EB] select-none">
            {weekDays.map((day, index) => (
              <div
                key={index}
                className={`border-l border-[#E5E7EB] cursor-pointer text-center py-3 font-semibold sticky top-0 z-10 transition-colors ${
                  isSameDay(selectedDate, day) ? "bg-[#F0E8F2]" : "bg-[#F9FAFB]"
                } ${
                  isSameDay(selectedDate, day)
                    ? "text-[#6A1B78]"
                    : "text-[#3A3A3B]"
                } border-b border-[#E5E7EB]`}
                onClick={() => setSelectedDate(day)}
              >
                <div className="text-sm">{format(day, "EEE")}</div>
                <div
                  className={`text-lg ${
                    isSameDay(selectedDate, day) ? "font-bold" : "font-medium"
                  }`}
                >
                  {format(day, "d")}
                </div>
              </div>
            ))}

            {hours.map((h, index) =>
              weekDays.map((day) => {
                const cellStart = setHours(startOfDay(day), h);
                const dayStr = format(day, "yyyy-MM-dd");
                const serverBelow = selectedSlots?.filter(
                  (s) =>
                    s.date === dayStr &&
                    parseInt(s.start_time.split(":")[0], 10) === h
                );

                const cellInDrag =
                  dragStart &&
                  dragEnd &&
                  isSameDay(cellStart, dragStart) &&
                  cellStart >= dragStart &&
                  cellStart < dragEnd;

                const inServerSlot = selectedSlots?.some((s) => {
                  if (s.date !== dayStr) return false;
                  const start = parseISO(`${s.date}T${s.start_time}`);
                  const end = parseISO(`${s.date}T${s.end_time}`);
                  return cellStart >= start && cellStart < end;
                });

                const isPast = isBefore(day, startOfDay(now));

                return (
                  <div
                    key={`${format(day, "yyyy-MM-dd")}-h${h}`}
                    className={`h-16 border-l border-b border-gray-300 relative transition-colors ${
                      isPast
                        ? "bg-[#F3F4F6] opacity-50 cursor-not-allowed"
                        : "cursor-pointer hover:bg-[#F9FAFB]"
                    } ${cellInDrag ? "bg-[#F0E8F2]" : ""}  ${
                      inServerSlot ? "bg-[#F0E8F2]" : ""
                    }`}
                    onMouseDown={() =>
                      !(isPast || inServerSlot) && beginDrag(day, h)
                    }
                    onMouseEnter={() =>
                      !(isPast || inServerSlot) && extendDrag(day, h)
                    }
                    onTouchStart={() =>
                      !(isPast || inServerSlot) && beginDrag(day, h)
                    }
                    data-cell-day={dayStr}
                  >
                    {serverBelow.map((slot) => {
                      const s = parseISO(`${slot.date}T${slot.start_time}`);
                      const e = parseISO(`${slot.date}T${slot.end_time}`);
                      return (
                        <motion.div
                          key={index}
                          className="absolute inset-1 rounded-xl text-white text-xs p-3 flex flex-col shadow-md border"
                          style={{
                            backgroundColor: "#6A1B78",
                            borderColor: "rgba(255, 255, 255, 0.12)",
                            boxShadow: "0 4px 14px rgba(106, 27, 120, 0.2)",
                          }}
                          onClick={() =>
                            handleEditWorkHour(
                              s,
                              e,
                              slot.date,
                              slot.start_date_time
                            )
                          }
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <div className="font-medium mb-1 flex items-center">
                            <div className="w-2 h-2 rounded-full bg-white/40 mr-2"></div>
                            Working Hours
                          </div>
                          <div className="text-xs opacity-90 font-light">
                            {format(s, "hh:mm a")} - {format(e, "hh:mm a")}
                          </div>
                        </motion.div>
                      );
                    })}

                    {/* draft slots */}
                    {draftSlots
                      .filter(
                        (s) =>
                          isSameDay(s.start, day) && s.start.getHours() === h
                      )
                      .map((s) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute inset-1 rounded-lg text-xs p-2 flex flex-col border border-dashed text-[#6A1B78] border-[#6A1B7855] bg-[#6A1B7815]"
                        >
                          <div className="font-medium">New Slot</div>
                          <div className="text-xs">
                            {format(s.start, "hh:mm a")} –{" "}
                            {format(s.end, "hh:mm a")}
                          </div>
                        </motion.div>
                      ))}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </motion.section>

      <AnimatePresence>
        {modalOpen && (
          <EventModal
            minHrInSEc={minHrInSEc}
            initialRange={modalRange}
            selectedSlots={selectedSlots}
            onClose={() => {
              setModalOpen(false);
              setDraftSlots([]);
            }}
            onSave={handleModalSave}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {editWorkHours && editRange && (
          <EditWorkHoursModal
            initialRange={editRange}
            onClose={() => {
              setEditWorkHours(false);
              setEditRange(null);
            }}
            onSave={handleSaveEditWorkHours}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorCalendarGrid;
