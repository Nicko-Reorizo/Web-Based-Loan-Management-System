import { CreditCard, DollarSign, Clock, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    activeLoans: 0,
    disbursed: 0,
    pending: 0,
    collected: 0,
  });

  useEffect(() => {
    fetch("http://localhost:5000/api/dashboard-stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Failed to fetch dashboard stats:", err));
  }, []);

  return (
    <div className="p-8 bg-[#f5f6f8] min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          Dashboard Overview
        </h1>
        <p className="text-gray-500 mt-1">
          Summarized financial report.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-md p-8 flex items-center justify-between hover:shadow-xl transition">
          <div>
            <p className="text-gray-500 text-sm">Total Active Loans</p>
            <h2 className="text-3xl font-bold mt-2 text-gray-800">
              {stats.activeLoans}
            </h2>
          </div>
          <div className="bg-cyan-100 p-4 rounded-full">
            <CreditCard className="text-cyan-700" size={28} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8 flex items-center justify-between hover:shadow-xl transition">
          <div>
            <p className="text-gray-500 text-sm">Total Disbursed</p>
            <h2 className="text-3xl font-bold mt-2 text-gray-800">
              ₱{Number(stats.disbursed).toLocaleString()}
            </h2>
          </div>
          <div className="bg-green-100 p-4 rounded-full">
            <DollarSign className="text-green-700" size={28} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8 flex items-center justify-between hover:shadow-xl transition">
          <div>
            <p className="text-gray-500 text-sm">Pending Applications</p>
            <h2 className="text-3xl font-bold mt-2 text-gray-800">
              {stats.pending}
            </h2>
          </div>
          <div className="bg-yellow-100 p-4 rounded-full">
            <Clock className="text-yellow-600" size={28} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8 flex items-center justify-between hover:shadow-xl transition">
          <div>
            <p className="text-gray-500 text-sm">Total Collected</p>
            <h2 className="text-3xl font-bold mt-2 text-gray-800">
              ₱{Number(stats.collected).toLocaleString()}
            </h2>
          </div>
          <div className="bg-purple-100 p-4 rounded-full">
            <Wallet className="text-purple-700" size={28} />
          </div>
        </div>
      </div>
    </div>
  );
}