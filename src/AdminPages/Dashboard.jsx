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

  const cards = [
    {
      label: "Total Active Loans",
      value: stats.activeLoans,
      icon: <CreditCard className="text-cyan-700" size={26} />,
      iconBg: "bg-cyan-100",
    },
    {
      label: "Total Disbursed",
      value: `₱${Number(stats.disbursed).toLocaleString()}`,
      icon: <DollarSign className="text-green-700" size={26} />,
      iconBg: "bg-green-100",
    },
    {
      label: "Pending Applications",
      value: stats.pending,
      icon: <Clock className="text-yellow-600" size={26} />,
      iconBg: "bg-yellow-100",
    },
    {
      label: "Total Collected",
      value: `₱${Number(stats.collected).toLocaleString()}`,
      icon: <Wallet className="text-purple-700" size={26} />,
      iconBg: "bg-purple-100",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f6f8] p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl lg:text-4xl">
          Dashboard Overview
        </h1>
        <p className="mt-1 text-sm text-gray-500 sm:text-base">
          Summarized financial report.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-md transition hover:shadow-xl sm:p-6 lg:p-8"
          >
            <div className="min-w-0">
              <p className="text-sm text-gray-500">{card.label}</p>
              <h2 className="mt-2 break-words text-2xl font-bold text-gray-800 sm:text-3xl">
                {card.value}
              </h2>
            </div>
            <div className={`${card.iconBg} ml-4 shrink-0 rounded-full p-3 sm:p-4`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}