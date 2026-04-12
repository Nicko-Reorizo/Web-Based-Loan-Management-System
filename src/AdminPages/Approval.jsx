import { useEffect, useState } from "react";

export default function Approval() {
  const [pendingLoans, setPendingLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingLoans = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/pending-loans");

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data = await res.json();
    setPendingLoans(data);
  } catch (error) {
    console.error("Failed to fetch pending loans:", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchPendingLoans();
  }, []);

const handleApprove = async (loanId) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("User not logged in");
    return;
  }

  try {
    const res = await fetch(`http://localhost:5000/api/loans/${loanId}/approve`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        officerId: user.Officer_ID, 
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    console.log(data.message);

    // remove from pending list
    setPendingLoans((prev) =>
      prev.filter((loan) => loan.Loan_ID !== loanId)
    );

  } catch (error) {
    console.error("Failed to approve loan:", error);
  }
};

  const handleReject = async (loanId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/loans/${loanId}/reject`, {
        method: "PUT",
      });

      const data = await res.json();
      console.log(data.message);

      setPendingLoans((prev) => prev.filter((loan) => loan.Loan_ID !== loanId));
    } catch (error) {
      console.error("Failed to reject loan:", error);
    }
  };

  return (
    <div className="p-8 bg-[#f5f6f8] min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Approval Page</h1>
        <p className="text-gray-500 mt-1">
          {pendingLoans.length} pending loan application(s).
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6 h-[80vh] overflow-auto">
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : pendingLoans.length === 0 ? (
          <p className="text-gray-500">No pending loan applications.</p>
        ) : (
          <table className="min-w-full text-left border border-gray-200">
            <thead className="bg-slate-900 text-white sticky top-0">
              <tr>
                <th className="px-4 py-3">Loan ID</th>
                <th className="px-4 py-3">Client Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Principal</th>
                <th className="px-4 py-3">Monthly</th>
                <th className="px-4 py-3">Balance</th>
                <th className="px-4 py-3">Tenure</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {pendingLoans.map((loan) => (
                <tr key={loan.Loan_ID} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{loan.Loan_ID}</td>
                  <td className="px-4 py-3 font-medium">{loan.Client_FullName}</td>
                  <td className="px-4 py-3">{loan.Phone_Number}</td>
                  <td className="px-4 py-3">
                    {loan.Street}, {loan.City}, {loan.Province}, {loan.ZIP}
                  </td>
                  <td className="px-4 py-3">{loan.Principal_Amount}</td>
                  <td className="px-4 py-3">{loan.Total_Monthly_Amortization}</td>
                  <td className="px-4 py-3">{loan.Balance}</td>
                  <td className="px-4 py-3">{loan.Loan_Tenure}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
                      {loan.Loan_Status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleApprove(loan.Loan_ID)}
                        className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(loan.Loan_ID)}
                        className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}