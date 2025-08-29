/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";

import { useSession } from "../context/SessionContext";
// import { useAuth } from "@/context/AuthProvider";
import type { Task } from "@/types";
import { saveSession } from "@/services/trackingService";
import { toast } from "sonner";
import { useAudio } from "@/utils/useAudio";
export default function Stopwatch() {
  // const { user, loading } = useAuth();
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [customMinutes] = useState(0);
  const [endTime, setEndTime] = useState<number | string | Date>(0);
  const playSavedTone = useAudio("/sounds/session-saved.mp3");
  const [isLoading, setIsLoading] = useState(false);

  const {
    userId,
    taskName,
    setTaskName,
    tasks,
    setSelectedTask,
    selectedTask,
  } = useSession();
  const handleTaskSelection = (task: Task) => {
    setSelectedTask(task);
    setTaskName(task.name);
  };

  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => setTime((t) => t + 100), 100); // update every 0.1s
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleSaveSession = async () => {
    try {
      setIsLoading(true);
      await saveSession(
        userId,
        customMinutes,
        time,
        selectedTask?.id,
        endTime,
        "stopwatch"
      );
      toast.success("Session saved!");
      playSavedTone();
    } catch (err) {
      console.error(err);
      toast.error("Error saving session");
    } finally {
      setIsLoading(false);
    }
  };

  const start = () => {
    if (!selectedTask) {
      toast.error("No task selected");
      return;
    }

    // If no time set, use customMinutes as fallback
    if (time === 0 && customMinutes > 0) {
      setTime(customMinutes * 60);
    }

    setIsRunning(true); // <-- start the stopwatch
  };

  const stop = () => {
    setEndTime(new Date());
    setIsRunning(false);
  };

  return (
    <div className="max-w-md mx-auto bg-gray-900 p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4 text-white">⏱ Stopwatch</h2>

      <div className="text-5xl font-mono text-center mb-4 text-white">
        {Math.floor(time / 60000)}:
        {String(Math.floor((time % 60000) / 1000)).padStart(2, "0")}:
        {String(Math.floor((time % 1000) / 100)).padStart(1, "0")}
      </div>
      <select
        className="border px-2 py-1 rounded w-full mb-4 text-white bg-gray-800 mb-6"
        value={tasks.find((t) => t.name === taskName)?.id || ""}
        onChange={(e) => {
          const selectedTask = tasks.find((task) => task.id === e.target.value);
          if (selectedTask) handleTaskSelection(selectedTask);
        }}
      >
        <option value="">Select a task</option>
        {tasks.map((task) => (
          <option key={task.id} value={task.id}>
            {task.name}
          </option>
        ))}
      </select>
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
          onClick={() => setTime(0)}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Reset
        </button>
      </div>
      <button
        onClick={handleSaveSession}
        disabled={isLoading}
        className="mt-4 w-full bg-yellow-500 py-2 rounded text-white"
      >
        {isLoading ? "Saving..." : "Save Session"}
      </button>
    </div>
  );
}
