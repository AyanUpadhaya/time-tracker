// src/services/trackingService.tsx

import { supabase } from "@/supabase/supabaseClient";
import type { Subtask } from "@/types";

export async function fetchUsers() {
  const { data, error } = await supabase.from("users").select("*");
  if (error) throw error;
  return data;
}
export async function addOrUpdateTask(
  userId: string,
  name: string,
  description?: string,
  subtasks?: Subtask[]
) {
  // 1️⃣ Check if task with same name exists
  const { data: existingTasks, error: fetchError } = await supabase
    .from("tasks")
    .select("*") // fetch full row so we can update
    .eq("user_id", userId)
    .eq("name", name)
    .limit(1);

  if (fetchError) throw fetchError;

  // 2️⃣ If exists → update
  if (existingTasks && existingTasks.length > 0) {
    const taskId = existingTasks[0].id;

    const { data, error } = await supabase
      .from("tasks")
      .update({
        description,
        subtasks, // overwrite or merge depending on requirement
      })
      .eq("id", taskId)
      .select();

    if (error) throw error;
    return data[0];
  }

  // 3️⃣ If not exists → create new task
  const { data, error } = await supabase
    .from("tasks")
    .insert([
      {
        user_id: userId,
        name,
        description,
        subtasks,
      },
    ])
    .select();

  if (error) throw error;
  return data[0];
}


export async function fetchTasks(userId: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function startSession(
  userId: string,
  taskId: string,
  type: "timer" | "stopwatch"
) {
  const { data, error } = await supabase
    .from("sessions")
    .insert([
      {
        user_id: userId,
        task_id: taskId,
        type,
        start_time: new Date().toISOString(),
      },
    ])
    .select();

  if (error) throw error;
  return data[0];
}

export async function stopSession(sessionId: string) {
  const endTime = new Date().toISOString();
  const { data, error } = await supabase
    .from("sessions")
    .update({
      end_time: endTime,
      duration: 3600, // example, calculate difference in frontend
    })
    .eq("id", sessionId)
    .select();

  if (error) throw error;
  return data[0];
}

export const saveSession = async (
  userId: string | null,
  customMinutes: number,
  time: number, // either seconds or milliseconds (we try to detect)
  taskId: string | null = null,
  endTime: number | string | Date | null,
  type: "timer" | "stopwatch"
) => {
  // 1) Normalize end timestamp (ms since epoch)
  const endTs = (() => {
    if (!endTime) return Date.now();
    if (endTime instanceof Date) return endTime.getTime();
    const n = Number(endTime);
    if (!Number.isNaN(n)) return n;
    const parsed = Date.parse(endTime as string);
    return Number.isNaN(parsed) ? Date.now() : parsed;
  })();

  // 2) Normalize incoming `time` to seconds
  let t = Number(time) || 0;
  // Heuristic: if time looks very large (>> typical seconds), assume milliseconds
  // (e.g. > 100000 -> 1.1 days in seconds; very unlikely as stopwatch seconds)
  if (t > 100000) {
    t = Math.round(t / 1000);
  } else if (t > 1000 && type === "stopwatch") {
    // another heuristic: if >1000 and caller uses ms-based stopwatch, convert
    // (you can lower the threshold if you often expect >1000s sessions)
    t = Math.round(t / 1000);
  }
  // Now `t` is elapsed seconds (for stopwatch) or remaining seconds (for timer)

  // 3) Compute durationSeconds and startTs
  let durationSeconds: number;
  if (type === "timer") {
    // For timers we expect `time` = remaining seconds, and customMinutes>0
    const totalSeconds = Math.max(0, Math.floor(customMinutes * 60));
    durationSeconds = totalSeconds - Math.floor(t);
  } else {
    // Stopwatch: `t` is elapsed seconds
    durationSeconds = Math.floor(t);
  }

  // 4) Safety: clamp negatives
  if (durationSeconds < 0) durationSeconds = 0;

  // 5) Compute start timestamp using endTs and duration
  const startTs = Math.max(0, endTs - durationSeconds * 1000);

  // 6) Prepare ISO strings to insert
  const startISO = new Date(startTs).toISOString();
  const endISO = new Date(endTs).toISOString();

  // 7) Insert to DB (supabase as in your code)
  const { data, error } = await supabase.from("sessions").insert([
    {
      user_id: userId,
      task_id: taskId,
      type,
      start_time: startISO,
      end_time: endISO,
      duration: durationSeconds, // store seconds
    },
  ]);

  if (error) throw error;
  return { data, error };
};
