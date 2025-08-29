/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type SetStateAction } from "react";
import { useAuth } from "./AuthProvider";
import { fetchTasks } from "@/services/trackingService";
import type { Task } from "@/types";

type SessionContextType = {
  userId: string | null;
  taskName: string;
  setTaskName: (name: string) => void;
  tasks: Task[];
  setTasks: (item: Task[]) => void;
  selectedTask: Task | null;
  setSelectedTask: (item: Task) => void;
  sessionIsRunning: boolean;
  setSessionIsRunning: React.Dispatch<SetStateAction<boolean>>;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth(); // pull user from AuthContext
  const [taskName, setTaskName] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sessionIsRunning,setSessionIsRunning] = useState(false)


  const getAllTasks = async (userId: string) => {
    return await fetchTasks(userId);
  };

  useEffect(() => {
    if (user && user.id) {
      getAllTasks(user.id).then((data: Task[]) => {
        setTasks(data);
      });
    }
  }, [user, user?.id]);

  return (
    <SessionContext.Provider
      value={{
        userId: user?.id ?? null,
        taskName,
        setTaskName,
        tasks,
        setTasks,
        selectedTask,
        setSelectedTask,
        sessionIsRunning,
        setSessionIsRunning,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
};
