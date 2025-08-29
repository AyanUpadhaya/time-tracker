import { useAuth } from "@/context/AuthProvider";
import { supabase } from "@/supabase/supabaseClient";
import type { Session } from "@/types";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";


export default function SessionsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    if (!user?.id) return;

    const fetchSessions = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("sessions")
        .select("*, tasks(*)") // join tasks table
        .eq("user_id", user.id)
        .order("start_time", { ascending: false });

      if (error) {
        console.error("Error fetching sessions:", error);
      } else {
        setSessions(data as Session[]);
      }

      setLoading(false);
    };

    fetchSessions();
  }, [user]);

  const totalPages = Math.ceil(sessions.length / recordsPerPage);
  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentSessions = sessions.slice(indexOfFirst, indexOfLast);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };


  // Aggregate durations per task (convert sec → hr)
  const taskDurations = sessions.reduce<Record<string, number>>((acc, s) => {
    const taskName = s.tasks?.name ?? "Unknown";
    acc[taskName] = (acc[taskName] || 0) + (s.duration ?? 0);
    return acc;
  }, {});

  const chartData = Object.entries(taskDurations).map(([task, duration]) => ({
    task,
    hours: Math.round((duration / 3600) * 100) / 100, // hours with 2 decimals
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-gray-500">Loading sessions...</span>
      </div>
    );
  }

  if (!sessions.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-gray-500">No sessions found</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
      {/* chart */}
      <div className="p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">⏱ Sessions Overview</h1>

        {loading && <p>Loading sessions...</p>}

        {!loading && sessions.length === 0 && (
          <p className="text-gray-500">No sessions recorded yet.</p>
        )}

        {!loading && sessions.length > 0 && (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="task" />
                <YAxis
                  label={{ value: "Hours", angle: -90, position: "insideLeft" }}
                />
                <Tooltip formatter={(value) => `${value} hrs`} />
                <Legend />
                <Bar dataKey="hours" fill="#4f46e5" name="Time Spent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      {/* table */}
      <div>
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          My Sessions
        </h1>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 text-left">
                <th className="py-3 px-4 border-b dark:border-gray-600">
                  Task
                </th>
                <th className="py-3 px-4 border-b dark:border-gray-600">
                  Type
                </th>
                <th className="py-3 px-4 border-b dark:border-gray-600">
                  Start
                </th>
                <th className="py-3 px-4 border-b dark:border-gray-600">End</th>
                <th className="py-3 px-4 border-b dark:border-gray-600">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody>
              {currentSessions.map((session) => (
                <tr
                  key={session.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="py-3 px-4 border-b dark:border-gray-600">
                    {session?.tasks?.name || "No task"}
                  </td>
                  <td className="py-3 px-4 border-b dark:border-gray-600">
                    {session.type}
                  </td>
                  <td className="py-3 px-4 border-b dark:border-gray-600">
                    {new Date(session.start_time ?? "").toLocaleString()}
                  </td>
                  <td className="py-3 px-4 border-b dark:border-gray-600">
                    {new Date(session.end_time ?? "").toLocaleString()}
                  </td>
                  <td className="py-3 px-4 border-b dark:border-gray-600">
                    {Math.floor((session?.duration ?? 0) / 60)}m{" "}
                    {(session?.duration ?? 0) % 60}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50"
        >
          Prev
        </button>

        <span className="text-gray-700 dark:text-gray-300">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
