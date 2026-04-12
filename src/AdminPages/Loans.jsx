import { useEffect, useMemo, useState } from "react";
import { Search, Wallet } from "lucide-react";

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [paymentInputs, setPaymentInputs] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchLoans = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/loans");
      const data = await res.json();
      setLoans(data);
    } catch (err) {
      console.error("Failed to fetch loans:", err);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/payments");
      const data = await res.json();
      setPayments(data);
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchLoans(), fetchPayments()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredLoans = useMemo(() => {
    const q = search.toLowerCase();

    return loans.filter((loan) => {
      return (
        String(loan.Loan_ID).toLowerCase().includes(q) ||
        String(loan.Client_FullName).toLowerCase().includes(q) ||
        String(loan.Principal_Amount).toLowerCase().includes(q) ||
        String(loan.Total_Monthly_Amortization).toLowerCase().includes(q) ||
        String(loan.Maturity_Date).toLowerCase().includes(q) ||
        String(loan.Balance).toLowerCase().includes(q) ||
        String(loan.Loan_Tenure).toLowerCase().includes(q) ||
        String(loan.Interest_Amount).toLowerCase().includes(q)
      );
    });
  }, [loans, search]);

  const handleInputChange = (loanId, value) => {
    setPaymentInputs((prev) => ({
      ...prev,
      [loanId]: value,
    }));
  };

  const handlePay = async (loanId) => {
    const amount = paymentInputs[loanId];

    if (!amount || Number(amount) <= 0) {
      alert("Enter a valid payment amount.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loanId,
          amount: Number(amount),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to record payment");
        return;
      }

      setPaymentInputs((prev) => ({
        ...prev,
        [loanId]: "",
      }));

      await loadData();
    } catch (err) {
      console.error("Failed to record payment:", err);
      alert("Failed to record payment.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">
              Loans
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {filteredLoans.length} active loan record(s)
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search loans..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <div className="max-h-[65vh] overflow-y-auto">
              <table className="min-w-full text-left">
                <thead className="sticky top-0 z-10 bg-slate-900 text-sm text-white">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Loan ID</th>
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">Principal Amount</th>
                    <th className="px-6 py-4 font-semibold">Monthly Ammo</th>
                    <th className="px-6 py-4 font-semibold">Maturity Date</th>
                    <th className="px-6 py-4 font-semibold">Balance</th>
                    <th className="px-6 py-4 font-semibold">Loan Tenure</th>
                    <th className="px-6 py-4 font-semibold">Interest Amount</th>
                    <th className="px-6 py-4 font-semibold">Payment</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                        Loading loans...
                      </td>
                    </tr>
                  ) : filteredLoans.length > 0 ? (
                    filteredLoans.map((loan) => (
                      <tr key={loan.Loan_ID} className="transition hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {loan.Loan_ID}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800">
                          {loan.Client_FullName}
                        </td>
                        <td className="px-6 py-4">
                          ₱{Number(loan.Principal_Amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          ₱{Number(loan.Total_Monthly_Amortization).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">{loan.Maturity_Date}</td>
                        <td className="px-6 py-4 font-semibold text-rose-600">
                          ₱{Number(loan.Balance).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">{loan.Loan_Tenure} months</td>
                        <td className="px-6 py-4">
                          ₱{Number(loan.Interest_Amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex min-w-[220px] items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              placeholder="Enter payment"
                              value={paymentInputs[loan.Loan_ID] || ""}
                              onChange={(e) =>
                                handleInputChange(loan.Loan_ID, e.target.value)
                              }
                              className="w-32 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                            />
                            <button
                              onClick={() => handlePay(loan.Loan_ID)}
                              className="rounded-lg bg-[#126d71] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0f5b5f]"
                            >
                              Pay
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-6 py-16 text-center">
                        <div className="mx-auto max-w-sm">
                          <div className="mb-3 text-lg font-semibold text-slate-700">
                            No loans found
                          </div>
                          <p className="text-sm text-slate-500">
                            Try another search term or check your loan records.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-full bg-purple-100 p-3">
              <Wallet className="text-purple-700" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Payment Records History
              </h2>
              <p className="text-sm text-slate-500">
                Latest payment transactions from the payment table
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-100 text-sm text-slate-700">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Payment ID</th>
                    <th className="px-6 py-4 font-semibold">Loan ID</th>
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">Amount</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {payments.length > 0 ? (
                    payments.map((payment) => (
                      <tr key={payment.Payment_ID} className="hover:bg-slate-50">
                        <td className="px-6 py-4">{payment.Payment_ID}</td>
                        <td className="px-6 py-4">{payment.Loan_ID}</td>
                        <td className="px-6 py-4 font-medium text-slate-800">
                          {payment.Client_FullName}
                        </td>
                        <td className="px-6 py-4 text-emerald-600 font-semibold">
                          ₱{Number(payment.Amortization_Amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">{payment.Date}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                        No payment records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}