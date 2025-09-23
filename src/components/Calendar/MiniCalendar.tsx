import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isBefore,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  subMonths,
} from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";

type Range = { start: Date; end: Date };

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

const MiniCalendar: React.FC<{
  currentMonth: Date;
  setCurrentMonth: (d: Date) => void;
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  setCurrentWeek: (d: Date) => void;
  workingDays: string[];
  onRangeSelect: (range: Range) => void;
}> = ({
  currentMonth,
  setCurrentMonth,
  selectedDate,
  setSelectedDate,
  setCurrentWeek,
  workingDays,
  onRangeSelect,
}) => {
  const monthStart = useMemo(() => startOfMonth(currentMonth), [currentMonth]);
  const monthEnd = useMemo(() => endOfMonth(currentMonth), [currentMonth]);
  const monthDays = useMemo(
    () => eachDayOfInterval({ start: monthStart, end: monthEnd }),
    [monthStart, monthEnd]
  );
  const leadingEmptyDays = useMemo(() => {
    const dayOfWeek = getDay(monthStart);
    return Array.from({ length: dayOfWeek });
  }, [monthStart]);

  const [dragging, setDragging] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });

  const isPast = (d: Date) => isBefore(d, startOfDay(new Date()));
  const isWorking = (d: Date) => workingDays.includes(format(d, "yyyy-MM-dd"));

  const handleMouseDown = (d: Date) => {
    if (isPast(d)) return;
    setDragging({ start: d, end: d });
  };

  const handleMouseEnter = (d: Date) => {
    if (!dragging.start) return;
    if (isBefore(d, dragging.start)) {
      setDragging({ start: d, end: dragging.start });
    } else {
      setDragging({ start: dragging.start, end: d });
    }
  };

  const cn = (...arr: (string | false | undefined)[]) =>
    arr.filter(Boolean).join(" ");

  const handleMouseUp = () => {
    if (dragging.start && dragging.end) {
      const start = startOfDay(dragging.start);
      const end = startOfDay(dragging.end);
      onRangeSelect({ start, end });
    }
    setDragging({ start: null, end: null });
  };

  const inDragRange = (d: Date) => {
    if (!dragging.start || !dragging.end) return false;
    const start = startOfDay(dragging.start);
    const end = startOfDay(dragging.end);
    const target = startOfDay(d);
    return target >= start && target <= end;
  };

  console.log("monthStart:", monthStart, "monthEnd:", monthEnd);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="select-none "
      onMouseLeave={handleMouseUp}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleMouseUp}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: COLORS.lightBg }}
          >
            <CalendarIcon
              className="h-4 w-4"
              style={{ color: COLORS.primary }}
            />
          </div>
          <h3 className="text-lg font-semibold" style={{ color: COLORS.dark }}>
            {format(currentMonth, "MMMM yyyy")}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
            aria-label="Previous month"
            style={{ color: COLORS.dark }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
            aria-label="Next month"
            style={{ color: COLORS.dark }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div
        className="grid grid-cols-7 text-sm font-medium mb-3"
        style={{ color: COLORS.dark }}
      >
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, index) => (
          <div key={index} className="text-center py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {leadingEmptyDays.map((_, index) => (
          <div key={`empty-${index}`} />
        ))}

        {monthDays.map((day, index) => {
          const disabled = isPast(day);
          const selected = isSameDay(day, selectedDate);
          const outOfMonth = !isSameMonth(day, monthStart);
          const work = isWorking(day);
          const inRange = inDragRange(day);

          return (
            <motion.button
              key={index}
              whileHover={!disabled ? { scale: 1.05 } : {}}
              whileTap={!disabled ? { scale: 0.95 } : {}}
              disabled={disabled}
              onClick={() => {
                if (disabled) return;
                setSelectedDate(day);
                setCurrentWeek(day);
              }}
              onMouseDown={() => handleMouseDown(day)}
              onMouseEnter={() => handleMouseEnter(day)}
              onTouchStart={() => handleMouseDown(day)}
              onTouchMove={(e) => {
                const touch = e.touches[0];
                const el = document.elementFromPoint(
                  touch.clientX,
                  touch.clientY
                );
                if (!el) return;
                const attr = el.getAttribute?.("data-date");
                if (attr) {
                  const dt = parseISO(attr);
                  handleMouseEnter(dt);
                }
              }}
              data-date={format(day, "yyyy-MM-dd")}
              className={cn(
                "relative mx-auto w-9 h-9 flex items-center justify-center rounded-full text-sm transition-all font-medium",
                outOfMonth && "text-gray-300",
                disabled && "opacity-40 cursor-not-allowed",
                !disabled && !outOfMonth && "hover:bg-gray-100"
              )}
              style={{
                backgroundColor: selected
                  ? COLORS.primary
                  : inRange
                  ? `${COLORS.primary}22`
                  : "transparent",
                color: selected
                  ? "white"
                  : outOfMonth
                  ? "#D1D5DB"
                  : COLORS.dark,
                boxShadow: selected
                  ? `0 4px 12px ${COLORS.primary}40`
                  : undefined,
              }}
              aria-pressed={selected}
            >
              {format(day, "d")}

              {/* Working day indicator */}
              {!selected && work && !disabled && (
                <span
                  className="absolute bottom-1 h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: COLORS.secondary }}
                />
              )}

              {/* Subtle highlight for working days */}
              {work && !selected && !disabled && !outOfMonth && (
                <span
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    boxShadow: `0 0 0 1px ${COLORS.secondary}33`,
                    backgroundColor: `${COLORS.secondary}08`,
                  }}
                  aria-hidden
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-center items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: COLORS.secondary }}
          ></div>
          <span style={{ color: COLORS.dark }}>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <span style={{ color: COLORS.dark }}>Unavailable</span>
        </div>
      </div>
    </motion.div>
  );
};

export default MiniCalendar;
