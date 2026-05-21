import ClientNav from "../components/clientNav.jsx";
import { useNavigate } from "react-router-dom";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("authUser");
  const user = storedUser ? JSON.parse(storedUser) : null;

  // Change this to: null, "Pending", or "Approved"
  const loan = {
    clientName: user?.name || "Client",
    loanId: "LN-1001",
    status: "Pending", // Try: "Approved", "Pending"
    principalAmount: 50000,
    balance: 50000,
    monthlyAmortization: 5250,
    interestRate: "5%",
    term: "12 Months",
    nextDueDate: null,
    totalPaid: 0,
  };

  // Use this to test no loan
  // const loan = null;

  const hasLoan = loan !== null;
  const isPending = loan?.status === "Pending";
  const isApproved = loan?.status === "Approved";

  const formatMoney = (amount) =>
    `₱${amount.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <>
      <ClientNav />

      <div className="min-h-screen bg-gray-100 px-5 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 rounded-3xl bg-[#126d71] p-8 text-white shadow-lg">
            <p className="inter-reg text-sm opacity-80">Welcome back,</p>
            <h1 className="poppins-extrabold text-3xl md:text-5xl">
              {loan?.clientName || "Client"}
            </h1>
            <p className="inter-reg mt-2 text-white/80">
              Manage your loan application and account status here.
            </p>
          </div>

          {!hasLoan && (
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

          {hasLoan && isPending && (
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

          {hasLoan && isApproved && (
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
                    <Detail label="Loan Term" value={loan.term} />
                    <Detail
                      label="Remaining Balance"
                      value={formatMoney(loan.balance)}
                    />
                    <Detail
                      label="Next Due Date"
                      value={loan.nextDueDate || "Not yet generated"}
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
                      onClick={() => navigate("/details")}
                      className="inter-bold rounded-xl border-2 border-[#126d71] px-5 py-4 text-[#126d71]"
                    >
                      Check Loan Details
                    </button>

                    <button className="inter-bold rounded-xl border-2 border-[#ff6f61] px-5 py-4 text-[#ff6f61]">
                      View Payment History
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-2xl bg-white p-6 shadow-md">
                <h2 className="inter-bold mb-5 text-2xl">
                  Recent Loan Activity
                </h2>

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
                      <tr>
                        <td className="px-4 py-3">March 10, 2026</td>
                        <td className="px-4 py-3">Loan Approved</td>
                        <td className="px-4 py-3">
                          {formatMoney(loan.principalAmount)}
                        </td>
                        <td className="px-4 py-3 text-blue-600">Approved</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
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
