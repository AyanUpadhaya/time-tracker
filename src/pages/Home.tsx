// Remove local Project type and import from types/index

import Timer from "@/components/Timer";

// import { useProjects } from "@/api/querysApi";
import { useAuth } from "@/context/AuthProvider";
import { useSession } from "@/context/SessionContext";
import { addTask } from "@/services/trackingService";
import type { Task } from "@/types";
import { toast } from "sonner";

const Home = () => {
  const { user, loading } = useAuth();
  const { userId, taskName, setTaskName, tasks, setSelectedTask, setTasks } =
    useSession();
  console.log(userId);
  const handleTaskSelection = (task: Task) => {
    setSelectedTask(task);
    setTaskName(task.name);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    // const description = (form.elements.namedItem("description") as HTMLTextAreaElement)?.value || "";
    const description = form.description.value || "";
    const name =
      (form.elements.namedItem("name") as HTMLInputElement)?.value || "";

    const result:Task = await addTask(user?.id, name, description, []);
    setTasks([...tasks, result]);
    toast.success("Task created");
  };

  if (loading) return <p>Loading...</p>;
  return (
    <div className="w-full p-4 flex justify-center  gap-3">
      <div className="flex-1 bg-gray-900 p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4 text-white">⏲ Task</h2>
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
        <form onSubmit={onSubmit}>
          {/* Task Name */}
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
            id=""
            className="border px-2 py-1 rounded w-full mb-4 text-white"
            placeholder="Task description"
          ></textarea>

          {/* Save */}
          <button
            // onClick={saveSession}
            className="mt-4 w-full bg-yellow-500 py-2 rounded text-white"
          >
            Create Task
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
