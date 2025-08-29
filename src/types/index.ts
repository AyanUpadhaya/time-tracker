export type ProjectStatus = "pending" | "in_progress" | "finished";
export type PriorityLevel = "high" | "medium" | "low";

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  notes: string;
  created_at: string;
  progress: number;
  user_id: string;
  estimation_date?: string;
  status?: ProjectStatus;
}

export interface Todo {
  id?: string;
  title?: string;
  priority?: PriorityLevel;
  completed?: boolean;
  created_at?: string;
  project_id?: string;
  user_id?: string;
}

export type UpdateProjectInput = Partial<Omit<Project, "created_at">> & {
  id: string | undefined;
};
export type UpdateTodoInput = Partial<Omit<Todo, "created_at">> & {
  id: string | undefined;
};

export interface UserProfile {
  id: string;
  auth_id: string;
  name: string | null;
  email: string;
  password_hash: string;
  role: "user" | "admin";
  daily_goal_minutes: number;
  theme: "light" | "dark";
  created_at: string;
  updated_at: string;
}

export interface Subtask {
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: "active" | "completed";
  subtasks: Subtask[];
  total_duration: number;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id?: string;
  user_id: string;
  task_id: string;
  type: "timer" | "stopwatch";
  start_time?: string | null;
  end_time?: string | null;
  duration?: number | null;
  created_at?: string;
  updated_at?: string;
  tasks?: Task | null;
}

