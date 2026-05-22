import ClientNav from "../components/clientNav.jsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("authUser");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const [dashboardData, setDashboardData] = useState({
    borrower: null,
    loan: null,
    activities: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user?.id) {
        setError("Please log in to view your dashboard.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:5000/api/client-dashboard/${user.id}`,
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load dashboard.");
        }

        setDashboardData(data);
      } catch (err) {
        setError(err.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user?.id]);

  const loan = dashboardData.loan;
  const borrowerName =
    dashboardData.borrower?.Client_FullName || user?.name || "Client";
  const hasLoan = loan !== null;
  const isPending = loan?.status === "Pending";
  const isApproved = loan?.status === "Approved";

  const formatMoney = (amount) =>
    `PHP ${Number(amount || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (date) => {
    if (!date) {
      return "Not yet generated";
    }

    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <ClientNav />

      <div className="min-h-screen bg-gray-100 px-5 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 rounded-3xl bg-[#126d71] p-8 text-white shadow-lg">
            <p className="inter-reg text-sm opacity-80">Welcome back,</p>
            <h1 className="poppins-extrabold text-3xl md:text-5xl">
              {borrowerName}
            </h1>
            <p className="inter-reg mt-2 text-white/80">
              Manage your loan application and account status here.
            </p>
          </div>

          {loading && (
            <div className="rounded-3xl bg-white p-10 text-center shadow-md">
              <p className="inter-bold text-gray-600">Loading dashboard...</p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-3xl bg-white p-10 text-center shadow-md">
              <h2 className="inter-bold text-2xl text-red-600">
                Unable to Load Dashboard
              </h2>
              <p className="inter-reg mt-3 text-gray-500">{error}</p>
              <button
                onClick={() => navigate("/login")}
                className="inter-bold mt-8 rounded-full bg-[#ff6f61] px-10 py-4 text-white"
              >
                Go to Login
              </button>
            </div>
          )}

          {!loading && !error && !hasLoan && (
            <div className="rounded-3xl bg-white p-10 text-center shadow-md">
              <h2 className="inter-bold text-3xl text-gray-800">
                No Loan Application Yet
              </h2>
              <p className="inter-reg mx-auto mt-3 max-w-xl text-gray-500">
                You currently have no active loan application. Start a new loan
                request to see your loan status here.
              </p>

              <button
                onClick={() => navigate("/loan")}
                className="inter-bold mt-8 rounded-full bg-[#ff6f61] px-10 py-4 text-white"
              >
                Apply for Loan
              </button>
            </div>
          )}

          {!loading && !error && hasLoan && isPending && (
            <div className="rounded-3xl bg-white p-10 text-center shadow-md">
              <div className="mx-auto mb-5 w-fit rounded-full bg-yellow-100 px-6 py-3 text-yellow-700">
                <p className="inter-bold">Pending Approval</p>
              </div>

              <h2 className="inter-bold text-3xl text-gray-800">
                Your Loan Application is Pending
              </h2>

              <p className="inter-reg mx-auto mt-3 max-w-xl text-gray-500">
                Your request has been submitted and is waiting for admin review.
                Loan details, due date, and payment history will become available
                once your loan is approved.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <InfoCard label="Loan ID" value={loan.loanId} />
                <InfoCard
                  label="Requested Amount"
                  value={formatMoney(loan.principalAmount)}
                />
                <InfoCard label="Status" value={loan.status} />
              </div>

              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  disabled
                  className="inter-bold cursor-not-allowed rounded-xl bg-gray-300 px-8 py-4 text-gray-500"
                >
                  View Loan Details
                </button>

                <button
                  disabled
                  className="inter-bold cursor-not-allowed rounded-xl bg-gray-300 px-8 py-4 text-gray-500"
                >
                  View Payment History
                </button>
              </div>
            </div>
          )}

          {!loading && !error && hasLoan && isApproved && (
            <>
              <div className="grid gap-5 md:grid-cols-4">
                <InfoCard
                  label="Loan Balance"
                  value={formatMoney(loan.balance)}
                />
                <InfoCard
                  label="Monthly Payment"
                  value={formatMoney(loan.monthlyAmortization)}
                />
                <InfoCard
                  label="Total Paid"
                  value={formatMoney(loan.totalPaid)}
                />
                <InfoCard label="Loan Status" value={loan.status} />
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-3">
                <div className="rounded-2xl bg-white p-6 shadow-md lg:col-span-2">
                  <h2 className="inter-bold mb-5 text-2xl">Loan Details</h2>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Detail label="Loan ID" value={loan.loanId} />
                    <Detail
                      label="Principal Amount"
                      value={formatMoney(loan.principalAmount)}
                    />
                    <Detail label="Interest Rate" value={loan.interestRate} />
                    <Detail label="Loan Tenure" value={loan.term} />
                    <Detail
                      label="Remaining Balance"
                      value={formatMoney(loan.balance)}
                    />
                    <Detail
                      label="Next Due Date"
                      value={formatDate(loan.nextDueDate)}
                    />
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-md">
                  <h2 className="inter-bold mb-5 text-2xl">Quick Actions</h2>

                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() => navigate("/loan")}
                      className="inter-bold rounded-xl bg-[#126d71] px-5 py-4 text-white"
                    >
                      Request New Loan
                    </button>

                    <button
  onClick={() => navigate("/outstandingLoans")}
  className="rounded-2xl bg-[#126d71] px-5 py-3 font-bold text-white"
>
  View Outstanding Loans
</button>

                    <button
  onClick={() => navigate("/paymentHistory")}
  className="inter-bold rounded-xl border-2 border-[#ff6f61] px-5 py-4 text-[#ff6f61]"
>
  View Payment History
</button>
                  </div>
                </div>
              </div>

              <ActivityTable
                activities={dashboardData.activities}
                formatDate={formatDate}
                formatMoney={formatMoney}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}

function ActivityTable({ activities, formatDate, formatMoney }) {
  return (
    <div className="mt-8 rounded-2xl bg-white p-6 shadow-md">
      <h2 className="inter-bold mb-5 text-2xl">Recent Loan Activity</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Activity</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <tr key={`${activity.activity}-${index}`}>
                  <td className="px-4 py-3">{formatDate(activity.date)}</td>
                  <td className="px-4 py-3">{activity.activity}</td>
                  <td className="px-4 py-3">
                    {formatMoney(activity.amount)}
                  </td>
                  <td className="px-4 py-3 text-blue-600">
                    {activity.status}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  No recent activity found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">
      <p className="inter-reg text-gray-500">{label}</p>
      <h2 className="inter-bold mt-2 text-2xl text-[#126d71]">{value}</h2>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 p-5">
      <p className="inter-reg text-sm text-gray-500">{label}</p>
      <p className="inter-bold mt-1 text-xl text-gray-800">{value}</p>
    </div>
  );
}
