// Remove local Project type and import from types/index

import Timer from "@/components/Timer";

// import { useProjects } from "@/api/querysApi";
import { useAuth } from "@/context/AuthProvider";
import { useSession } from "@/context/SessionContext";
import { addOrUpdateTask } from "@/services/trackingService";
import { supabase } from "@/supabase/supabaseClient";
import type { Subtask, Task } from "@/types";
import { useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

const Home = () => {
  const { user, loading } = useAuth();
  const {
    userId,
    taskName,
    setTaskName,
    tasks,
    setSelectedTask,
    setTasks,
    sessionIsRunning,
  } = useSession();

  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTaskSelection = (task: Task) => {
    setSelectedTask(task);
    setTaskName(task.name);
    setSubtasks(task.subtasks || []);
  };

  const addSubtaskField = () => {
    if (!newSubtask.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      { id: uuidv4(), task: newSubtask, isCompleted: false },
    ]);
    setNewSubtask("");
  };

  const toggleSubtaskCompletion = async (subtaskId: string) => {
    if (!userId || !taskName) return;

    const updatedSubtasks = subtasks.map((s) =>
      s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s
    );
    setSubtasks(updatedSubtasks);

    // Update subtasks in database for the selected task
    const selectedTask = tasks.find((t) => t.name === taskName);
    if (!selectedTask) return;

    const { error } = await supabase
      .from("tasks")
      .update({ subtasks: updatedSubtasks })
      .eq("id", selectedTask.id);

    if (error) toast.error("Failed to update subtask");
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const form = e.target as HTMLFormElement;
      const description = form.description.value || "";
      const name = (form.name as unknown as HTMLInputElement).value || "";

      const result: Task | null = await addOrUpdateTask(
        user.id,
        name,
        description,
        subtasks
      );

      if (!result) return;

      toast.success("Task created");
      setTasks([...tasks, result]);
      setTaskName("");
      setSubtasks([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="w-full p-4 flex justify-center gap-3">
      <div className="flex-1 bg-gray-900 p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4 text-white">⏲ Task</h2>
        {!sessionIsRunning && (
          <select
            className="border px-2 py-1 rounded w-full mb-4 text-white bg-gray-800 mb-6"
            value={tasks.find((t) => t.name === taskName)?.id || ""}
            onChange={(e) => {
              const selectedTask = tasks.find(
                (task) => task.id === e.target.value
              );
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
        )}

        <form onSubmit={onSubmit}>
          <input
            type="text"
            placeholder="Task name"
            name="name"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className="border px-2 py-1 rounded w-full mb-4 text-white"
          />

          <textarea
            name="description"
            placeholder="Task description"
            className="border px-2 py-1 rounded w-full mb-4 text-white"
          ></textarea>

          {/* Subtasks input */}
           <div className="mb-4">
              <h3 className="text-white font-bold mb-2">Subtasks</h3>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Add subtask"
                  className="border px-2 py-1 rounded w-full text-white"
                />
                <button
                  type="button"
                  onClick={addSubtaskField}
                  className="bg-green-500 px-4 py-1 rounded text-white"
                >
                  Add
                </button>
              </div>

              <ul>
                {subtasks.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center gap-2 text-white mb-1"
                  >
                    <input
                      type="checkbox"
                      checked={s.isCompleted}
                      onChange={() => {
                        if (typeof s.id === "string") {
                          toggleSubtaskCompletion(s.id);
                        }
                      }}
                    />
                    <span className={s.isCompleted ? "line-through" : ""}>
                      {s.task}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          <button
            disabled={isLoading || sessionIsRunning}
            className="mt-4 w-full bg-yellow-500 py-2 rounded text-white cursor-pointer"
          >
            {isLoading ? "Saving..." : "Create Task"}
          </button>
        </form>
      </div>

      <div className="flex-1">
        <Timer />
      </div>
    </div>
  );
};

export default Home;
