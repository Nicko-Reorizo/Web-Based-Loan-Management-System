import ClientNav from "../components/clientNav.jsx";
import { ChevronLeft, ReceiptText } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentHistory() {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("authUser");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const clientId = user?.id || user?.Client_ID;

  const [payments, setPayments] = useState([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatMoney = (amount) =>
    `PHP ${Number(amount || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    const loadPayments = async () => {
      if (!clientId) {
        setError("Please log in to view your payment history.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `http://localhost:5000/api/client-payment-history/${clientId}`
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load payment history.");
        }

        setPayments(Array.isArray(data.payments) ? data.payments : []);
        setTotalPaid(Number(data.totalPaid || 0));
      } catch (err) {
        setError(err.message || "Failed to load payment history.");
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, [clientId]);

  return (
    <>
      <ClientNav />

      <div className="min-h-screen bg-gray-100 px-5 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="rounded-full bg-white p-3 text-[#126d71] shadow"
            >
              <ChevronLeft size={26} />
            </button>

            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Payment History
              </h1>
              <p className="text-sm text-gray-500">
                View all payments recorded for your loan.
              </p>
            </div>
          </div>

          <div className="mb-6 rounded-3xl bg-[#126d71] p-6 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/20 p-3">
                <ReceiptText size={28} />
              </div>

              <div>
                <p className="text-sm text-white/80">Total Paid</p>
                <h2 className="text-3xl font-black">
                  {formatMoney(totalPaid)}
                </h2>
              </div>
            </div>
          </div>

          {loading && (
            <div className="rounded-3xl bg-white p-10 text-center shadow-md">
              <p className="font-bold text-gray-600">
                Loading payment history...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-3xl bg-white p-10 text-center shadow-md">
              <h2 className="text-2xl font-bold text-red-600">
                Unable to Load Payment History
              </h2>
              <p className="mt-3 text-gray-500">{error}</p>
            </div>
          )}

          {!loading && !error && payments.length === 0 && (
            <div className="rounded-3xl bg-white p-10 text-center shadow-md">
              <h2 className="text-2xl font-bold text-gray-800">
                No Payments Yet
              </h2>
              <p className="mt-3 text-gray-500">
                You have not made any recorded payments yet.
              </p>
            </div>
          )}

          {!loading && !error && payments.length > 0 && (
            <div className="overflow-hidden rounded-3xl bg-white shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px] text-left">
                  <thead className="bg-slate-900 text-white">
                    <tr>
                      <th className="px-5 py-4">Payment ID</th>
                      <th className="px-5 py-4">Loan ID</th>
                      <th className="px-5 py-4">Payment Date</th>
                      <th className="px-5 py-4">Amount Paid</th>
                      <th className="px-5 py-4">Remaining Balance</th>
                      <th className="px-5 py-4">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {payments.map((payment) => (
                      <tr key={payment.Payment_ID} className="hover:bg-gray-50">
                        <td className="px-5 py-4 font-semibold text-gray-800">
                          {payment.Payment_ID}
                        </td>
                        <td className="px-5 py-4">{payment.Loan_ID}</td>
                        <td className="px-5 py-4">
                          {formatDate(payment.Payment_Date)}
                        </td>
                        <td className="px-5 py-4 font-bold text-[#126d71]">
                          {formatMoney(payment.Amortization_Amount)}
                        </td>
                        <td className="px-5 py-4">
                          {formatMoney(payment.Remaining_Balance)}
                        </td>
                        <td className="px-5 py-4 text-green-600 font-bold">
                          Paid
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}