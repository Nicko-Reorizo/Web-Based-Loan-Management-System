import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function LoanDetails() {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/client-loan-details/${loanId}`)
      .then((res) => res.json())
      .then((data) => setLoan(data))
      .catch((err) => console.error(err));
  }, [loanId]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-PH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (!loan) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading loan details...
      </div>
    );
  }

  const payments = loan.payments || [];
const interestAmount = Number(loan.Interest_Amount || 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-20 flex h-[70px] items-center justify-center bg-white shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-5 text-red-500"
        >
          <ChevronLeft size={34} />
        </button>

        <h1 className="text-[24px] font-semibold text-[#222]">
          Loan Details
        </h1>
      </div>

      <section className="flex flex-col items-center justify-center px-5 py-12">
        <h2 className="text-[52px] font-bold text-[#222]">
          ₱{Number(loan.Principal_Amount).toLocaleString()}
        </h2>
        <p className="mt-2 text-[20px] text-gray-500">Total loan amount</p>
      </section>

      <div className="bg-[#f4f4f4] px-5 py-4 text-[20px] text-gray-600">
        Loan Details
      </div>

      <section className="space-y-5 px-5 py-6 text-[18px] text-gray-500">
        <div className="flex justify-between gap-5">
          <span>Start Date</span>
          <span>{formatDate(loan.First_Due_Date)}</span>
        </div>

        <div className="flex justify-between gap-5">
          <span>Loan Tenure</span>
          <span>{loan.Loan_Tenure} {loan.Payment_Frequency}</span>
        </div>

        

        <div className="flex justify-between gap-5">
          <span>Interest Amount Per Due</span>
          <span>₱{interestAmount.toFixed(2)}</span>
        </div>

        <div className="flex justify-between gap-5">
          <span>Interest Rate Per Due</span>
          <span>{Number(loan.Interest_Rate || 0).toFixed(2)}%</span>
        </div>

        

        

        <div className="flex justify-between gap-5">
          <span>Loan ID</span>
          <span className="text-right">{loan.Loan_ID}</span>
        </div>
      </section>

      <div className="bg-[#f4f4f4] px-5 py-4 text-[20px] text-gray-600">
        Monthly Repayment Details
      </div>

      <section className="px-5">
        {payments.map((payment, index) => (
          <div
            key={payment.Payment_ID}
            className="flex items-center justify-between border-b border-gray-100 py-5"
          >
            <div>
              <h3 className="text-[20px] font-semibold text-[#222]">
                {index + 1}/{payments.length}, ₱
                {Number(payment.Amortization_Amount).toFixed(2)}
              </h3>

              <p className="mt-1 text-[16px] text-gray-500">
                Due Date: {formatDate(payment.Payment_Date)}
              </p>
            </div>

            <p
              className={`text-[18px] ${
                String(payment.Payment_Date ? "Paid" : "Unpaid").toLowerCase() === "paid"
                  ? "text-green-600"
                  : "text-gray-500"
              }`}
            >
              {payment.Payment_Status}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}