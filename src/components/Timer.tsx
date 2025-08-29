/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
// import axiosClient from "../api/axiosClient";
import { useSession } from "../context/SessionContext";
import { saveSession } from "@/services/trackingService";

export default function Timer() {
  const { userId, selectedTask } = useSession();

  const [time, setTime] = useState(0);
  const [endTime, setEndTime] = useState<number | string | Date>(0);
  const [customMinutes, setCustomMinutes] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // countdown
  useEffect(() => {
    let interval: any;
    if (isRunning && time > 0) {
      interval = setInterval(() => setTime((t) => t - 1), 1000);
    }
    if (time === 0) setIsRunning(false);
    return () => clearInterval(interval);
  }, [isRunning, time]);

  const start = () => {
    if (!selectedTask) {
      alert("No task selected");
      return;
    }
    if (time > 0) setIsRunning(true);
  };

  const stop = () => {
    setEndTime(new Date());
    setIsRunning(false);
  };

  const reset = () => {
    setIsRunning(false);
    setTime(customMinutes * 60);
  };

  const handleSaveSession = async () => {
    try {
      await saveSession(
        userId,
        customMinutes,
        time,
        selectedTask?.id,
        endTime,
        "timer"
      );
      alert("Timer session saved!");
    } catch (err) {
      console.error(err);
      alert("Error saving session");
    }
  };

  return (
    <div className=" bg-gray-900 p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4 text-white">⏲ Timer</h2>
      <div className="text-xl font-bold mb-4 text-white py-3 text-center">
        {selectedTask?.name || null}
      </div>

      {/* Display */}
      <div className="text-5xl text-white font-mono text-center mb-4">
        {Math.floor(time / 60)}:{String(time % 60).padStart(2, "0")}
      </div>

      {/* Presets */}
      <div className="flex gap-2 mb-4">
        {[5, 15, 30].map((m) => (
          <button
            key={m}
            onClick={() => {
              setCustomMinutes(m);
              setTime(m * 60);
            }}
            className="bg-gray-200 px-3 py-1 rounded"
          >
            {m}m
          </button>
        ))}
      </div>

      {/* Custom Input */}
      <input
        type="number"
        value={customMinutes}
        onChange={(e) => setCustomMinutes(Number(e.target.value))}
        placeholder="Minutes"
        className="border px-2 py-1 rounded w-full mb-2 text-white"
      />
      <button
        onClick={() => setTime(customMinutes * 60)}
        className="w-full bg-green-500 text-white py-2 rounded mb-4 "
      >
        Set Timer
      </button>

      {/* Task Name */}

      {/* Controls */}
      <div className="flex gap-2 justify-center">
        {!isRunning ? (
          <button
            onClick={start}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Start
          </button>
        ) : (
          <button
            onClick={stop}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Stop
          </button>
        )}
        <button
          onClick={reset}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Reset
        </button>
      </div>

      {/* Save */}
      <button
        onClick={handleSaveSession}
        className="mt-4 w-full bg-yellow-500 py-2 rounded text-white"
      >
        Save Session
      </button>
    </div>
  );
}
