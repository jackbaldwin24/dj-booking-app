import React, { useState, useEffect } from "react";

const daysOfWeek = [
  "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday"
];

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AvailabilitySelector({ value, onChange }) {
  console.log("AvailabilitySelector re-rendered");
  const today = new Date();
  const [view, setView] = useState("weekly");
  const [weeklyAvailability, setWeeklyAvailability] = useState({});
  const [availabilityOverrides, setAvailabilityOverrides] = useState({});
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  useEffect(() => {
    if (!value) return;
    console.log("Applying value prop:", value);
    const filled = {};
    daysOfWeek.forEach(day => {
      filled[day] = value?.weeklyAvailability?.[day] ?? false;
    });
    console.log("Set weeklyAvailability:", filled);
    setWeeklyAvailability(filled);
    console.log("Set availabilityOverrides:", value?.availabilityOverrides || {});
    setAvailabilityOverrides(value?.availabilityOverrides || {});
    console.log("Override value set:", value?.availabilityOverrides || {});
  }, [value]);

  useEffect(() => {
    console.log("Loaded availability props:", value);
  }, [value]);

  useEffect(() => {
    if (!onChange || !value || typeof value !== "object") return;

    const payload = { weeklyAvailability, availabilityOverrides };
    const alreadySynced =
      JSON.stringify(payload) === JSON.stringify(value);

    if (!alreadySynced) {
      console.log("Saving availability:", payload);
      onChange(payload);
    }
  }, [weeklyAvailability, availabilityOverrides]);

  const toggleDay = (day) => {
    const updated = {
      ...weeklyAvailability,
      [day]: !weeklyAvailability[day]
    };
    console.log("Toggled weekly day:", day, "New state:", updated);
    setWeeklyAvailability(updated);
  };

  const getDaysInMonth = (year, month) => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      const dateStr = date.toISOString().split("T")[0];
      days.push({
        date: new Date(date),
        dateStr,
        day: date.getDay()
      });
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const isAvailable = (dateStr, dateObj) => {
    if (availabilityOverrides[dateStr] !== undefined) {
      return availabilityOverrides[dateStr];
    }
    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });
    return weeklyAvailability[dayName] || false;
  };

  const toggleDate = (dateStr, dateObj) => {
    const currentOverride = availabilityOverrides[dateStr];
    const defaultAvailable = isAvailable(dateStr, dateObj);
    const next =
      currentOverride === undefined
        ? !defaultAvailable
        : currentOverride === true
        ? false
        : undefined;

    const updatedOverrides = { ...availabilityOverrides };
    if (next === undefined) {
      delete updatedOverrides[dateStr];
    } else {
      updatedOverrides[dateStr] = next;
    }
    console.log("Toggled custom date:", dateStr, "Updated overrides:", updatedOverrides);
    setAvailabilityOverrides(updatedOverrides);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" });
  const firstDayOffset = new Date(currentYear, currentMonth, 1).getDay();
  const days = getDaysInMonth(currentYear, currentMonth);
  const paddedDays = Array(firstDayOffset).fill(null).concat(days);

  return (
    <div className="bg-gray-900 text-white p-6 rounded space-y-6">
      <h2 className="text-2xl font-bold">Set Your Availability</h2>
      <div className="flex space-x-4">
        <button
          onClick={() => setView("weekly")}
          className={`px-4 py-2 rounded ${view === "weekly" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
        >
          Weekly Availability
        </button>
        <button
          onClick={() => setView("custom")}
          className={`px-4 py-2 rounded ${view === "custom" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
        >
          Custom Dates
        </button>
      </div>

      {view === "weekly" && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Weekly Availability</h2>
          <div className="grid grid-cols-2 gap-2">
            {daysOfWeek.map((day) => (
              <label key={day} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={weeklyAvailability[day] || false}
                  onChange={() => toggleDay(day)}
                />
                {day}
              </label>
            ))}
          </div>
        </div>
      )}

      {view === "custom" && (
        <div className="p-4 bg-white text-black rounded">
          <div className="flex justify-between items-center mb-2">
            <button onClick={handlePrevMonth}>←</button>
            <h2 className="text-xl font-semibold">{monthName} {currentYear}</h2>
            <button onClick={handleNextMonth}>→</button>
          </div>

          <div className="grid grid-cols-7 text-center font-bold mb-2">
            {dayLabels.map((label) => (
              <div key={label}>{label}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 text-center">
            {paddedDays.map((dayObj, idx) => {
              if (!dayObj) return <div key={idx}></div>;
              const { date, dateStr } = dayObj;
              const available = isAvailable(dateStr, date);
              const bgColor = available ? "bg-green-500" : "bg-red-500";

              return (
                <div
                  key={dateStr}
                  className={`${bgColor} p-2 rounded cursor-pointer hover:opacity-80`}
                  onClick={() => toggleDate(dateStr, date)}
                  title={dateStr}
                >
                  {date.getDate()}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}