"use client";
import  { useState, useEffect } from "react";
import axios from "axios";

const TimerStopwatch = () => {
  const [mode, setMode] = useState<"timer" | "stopwatch">("stopwatch");
  const [time, setTime] = useState(0); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Form state
  const [taskName, setTaskName] = useState("");
  const [customMinutes, setCustomMinutes] = useState(0);

  // Timer countdown effect
  useEffect(() => {
    if (isRunning) {
      const id = setInterval(() => {
        setTime((prev) => {
          if (mode === "timer") {
            if (prev <= 1) {
              clearInterval(id);
              setIsRunning(false);
              return 0;
            }
            return prev - 1;
          } else {
            return prev + 1;
          }
        });
      }, 1000);
      setIntervalId(id);
      return () => clearInterval(id);
    }
  }, [isRunning, mode]);

  // Format seconds → MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleStart = () => {
    if (mode === "timer" && time <= 0) return;
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
    if (intervalId) clearInterval(intervalId);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (intervalId) clearInterval(intervalId);
    setTime(mode === "timer" ? customMinutes * 60 : 0);
  };

  const handlePreset = (minutes: number) => {
    setCustomMinutes(minutes);
    setTime(minutes * 60);
    setMode("timer");
  };

  const handleSaveSession = async () => {
    try {
      const res = await axios.post("http://localhost:3000/api/sessions", {
        userId: "USER_ID_PLACEHOLDER", // replace with logged in user
        taskId: null, // you could fetch/create task here
        type: mode,
        startTime: new Date(Date.now() - time * 1000),
        endTime: new Date(),
        duration: mode === "timer" ? customMinutes * 60 - time : time,
      });
      alert("Session saved!");
      console.log(res.data);
    } catch (err) {
      console.error(err);
      alert("Error saving session");
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 max-w-lg mx-auto bg-gray-900 text-white rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold">⏱ Timer & Stopwatch</h1>

      {/* Mode Switch */}
      <div className="flex gap-4">
        <button
          className={`px-4 py-2 rounded-lg ${
            mode === "stopwatch" ? "bg-blue-500" : "bg-gray-700"
          }`}
          onClick={() => {
            setMode("stopwatch");
            setTime(0);
          }}
        >
          Stopwatch
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            mode === "timer" ? "bg-blue-500" : "bg-gray-700"
          }`}
          onClick={() => {
            setMode("timer");
            setTime(customMinutes * 60);
          }}
        >
          Timer
        </button>
      </div>

      {/* Display */}
      <div className="text-5xl font-mono">{formatTime(time)}</div>

      {/* Timer Form */}
      {mode === "timer" && (
        <div className="flex flex-col items-center gap-2">
          <input
            type="number"
            placeholder="Custom Minutes"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(Number(e.target.value))}
            className="px-3 py-2 rounded-md text-black"
          />
          <button
            onClick={() => setTime(customMinutes * 60)}
            className="px-3 py-1 bg-green-500 rounded-lg"
          >
            Set Timer
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => handlePreset(5)}
              className="px-3 py-1 bg-gray-700 rounded-md"
            >
              5m
            </button>
            <button
              onClick={() => handlePreset(15)}
              className="px-3 py-1 bg-gray-700 rounded-md"
            >
              15m
            </button>
            <button
              onClick={() => handlePreset(30)}
              className="px-3 py-1 bg-gray-700 rounded-md"
            >
              30m
            </button>
          </div>
        </div>
      )}

      {/* Task Form */}
      <input
        type="text"
        placeholder="Task Name"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        className="px-3 py-2 rounded-md text-black w-full"
      />

      {/* Controls */}
      <div className="flex gap-4">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="px-4 py-2 bg-green-600 rounded-lg"
          >
            Start
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="px-4 py-2 bg-red-600 rounded-lg"
          >
            Stop
          </button>
        )}
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-500 rounded-lg"
        >
          Reset
        </button>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSaveSession}
        className="px-4 py-2 bg-yellow-500 rounded-lg"
      >
        Save Session
      </button>
    </div>
  );
};

export default TimerStopwatch;
