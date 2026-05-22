import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function OutstandingLoans() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);

  const authUser = JSON.parse(localStorage.getItem("authUser"));
  const clientId = authUser?.Client_ID || authUser?.client_id || authUser?.id;

  useEffect(() => {
    if (!clientId) return;

    fetch(`http://localhost:5000/api/client-loans/${clientId}`)
      .then((res) => res.json())
      .then((data) => setLoans(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  }, [clientId]);

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-PH", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getPaidCount = (payments = []) => {
    return payments.length;
  };

  const getAmortizationAmount = (loan) => {
    if (loan.schedules?.length > 0) {
      return Number(loan.schedules[0].amount).toFixed(2);
    }

    const totalAmount =
      Number(loan.Principal_Amount || 0) + Number(loan.Interest_Amount || 0);

    const tenure = Number(loan.Loan_Tenure || 1);

    return (totalAmount / tenure).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      <div className="sticky top-0 z-20 flex h-[70px] items-center justify-center bg-white shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-5 text-red-500"
        >
          <ChevronLeft size={34} />
        </button>

        <h1 className="text-[24px] font-semibold text-[#222]">
          Outstanding Loans
        </h1>
      </div>

      {loans.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center px-5 text-center text-gray-500">
          No outstanding loans found.
        </div>
      ) : (
        <div>
          {loans.map((loan) => {
            const totalPayments = Number(loan.Loan_Tenure || 0);
            const paidPayments = getPaidCount(loan.payments || []);
            const unpaidPayments = totalPayments - paidPayments;

            const firstDueDate =
              loan.First_Due_Date || loan.schedules?.[0]?.dueDate || null;

            return (
              <button
                key={loan.Loan_ID}
                onClick={() => navigate(`/loanDetails/${loan.Loan_ID}`)}
                className="w-full bg-white text-left"
              >
                <div className="border-b border-gray-100 px-5 py-5 text-[16px] text-gray-500">
                  Withdraw Date: {formatDate(loan.Disbursement_Date)}
                </div>

                <div className="mb-3 flex items-center justify-between border-b border-gray-100 px-5 py-5">
                  <div>
                    <h2 className="text-[25px] font-bold text-[#222]">
                      ₱{Number(loan.Principal_Amount || 0).toLocaleString()}
                    </h2>

                    <p className="mt-1 text-[16px] text-gray-500">
                      ₱{getAmortizationAmount(loan)} due every{" "}
                      {loan.Payment_Frequency || "schedule"}
                    </p>

                    <p className="mt-1 text-[15px] text-gray-400">
                      First Due Date: {formatDate(firstDueDate)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-[18px] text-gray-500">
                    <span>
                     
                    </span>
                    <ChevronRight size={24} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}