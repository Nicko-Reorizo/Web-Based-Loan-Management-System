import { Search } from "lucide-react";
import { useState } from "react";
import Navbar from "../components/navbar.jsx";

export default function LoanDetails() {
  const [loanId, setLoanId] = useState("");
  const [loans, setLoans] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
  if (!loanId.trim()) {
    setError("Please enter a Loan ID.");
    setLoans([]);
    return;
  }

  try {
    setLoading(true);
    setError("");
    setLoans([]);

    const response = await fetch(
      `http://localhost:5000/api/loan-details/loan/${loanId}`
    );

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Failed to fetch loan details.");
      return;
    }

    setLoans(data);
  } catch (error) {
    console.error("Fetch loan details error:", error);
    setError("Server error.");
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <Navbar />
      <div className="flex flex-col justify-center items-center w-full min-h-[80vh] px-4">
        <p className="inter-bold mt-10 text-[50px]">Check My Loan</p>

        <div className="flex items-center bg-gray-200 rounded-full p-3 w-[700px] shadow-md mt-6 max-w-full">
          <div className="flex items-center flex-1 px-4 gap-2">
            <Search size={25} className="text-gray-500" />
            <input
              type="text"
              placeholder="Enter Loan ID"
              className="bg-transparent outline-none w-full text-lg"
              value={loanId}
              onChange={(e) => setLoanId(e.target.value)}
            />
          </div>

          <button
            onClick={handleSearch}
            className="bg-[#ff6f61] text-white px-8 py-4 rounded-full font-semibold text-lg"
          >
            Search
          </button>
        </div>

        {loading && (
          <p className="mt-6 text-gray-600">Loading loan details...</p>
        )}

        {error && <p className="mt-6 text-red-600 font-medium">{error}</p>}

        {loans.length > 0 && (
          <div className="mt-8 bg-white shadow-lg rounded-2xl p-8 w-[900px] max-w-full overflow-x-auto">
            <h2 className="text-2xl font-bold mb-6">Loan Details</h2>

            <table className="min-w-full border border-gray-200 text-left">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-4 py-3">Client ID</th>
                  <th className="px-4 py-3">Borrower Name</th>
                  <th className="px-4 py-3">Loan ID</th>
                  <th className="px-4 py-3">Loan Status</th>
                  <th className="px-4 py-3">Balance</th>
                  <th className="px-4 py-3">Principal Amount</th>
                  <th className="px-4 py-3">Monthly Amortization</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.Loan_ID} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{loan.Client_ID}</td>
                    <td className="px-4 py-3">{loan.Client_FullName}</td>
                    <td className="px-4 py-3">{loan.Loan_ID}</td>
                    <td className="px-4 py-3">{loan.Loan_Status}</td>
                    <td className="px-4 py-3">{loan.Balance}</td>
                    <td className="px-4 py-3">{loan.Principal_Amount}</td>
                    <td className="px-4 py-3">
                      {loan.Total_Monthly_Amortization}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
