import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import ClientNav from "../components/clientNav.jsx";

const frequencyOptions = [
  { value: "Daily", label: "Daily", unit: "day" },
  { value: "Weekly", label: "Weekly", unit: "week" },
  { value: "Semi-monthly", label: "Semi-monthly", unit: "half-month" },
  { value: "Monthly", label: "Monthly", unit: "month" },
];

export default function LoanNow() {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("authUser");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [loanTypes, setLoanTypes] = useState([]);
  const [eligibility, setEligibility] = useState(null);

  const [formData, setFormData] = useState({
    amount: "",
    loanTypeId: "",
    paymentFrequency: "Monthly",
    loanTenure: "1",
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const clientId = user?.id || user?.Client_ID;

  useEffect(() => {
    if (!clientId) {
      navigate("/login");
      return;
    }

    fetch("http://localhost:5000/api/loan-types")
      .then((res) => res.json())
      .then((data) => setLoanTypes(Array.isArray(data) ? data : []))
      .catch(() => setLoanTypes([]));

    fetch(`http://localhost:5000/api/client-loan-eligibility/${clientId}`)
      .then((res) => res.json())
      .then((data) => {
        setEligibility(data);

        if (data.isReloan) {
          setFormData((prev) => ({
            ...prev,
            loanTypeId: data.loanTypeId || "",
            paymentFrequency: data.paymentFrequency || "Monthly",
            loanTenure: data.loanTenure || "1",
          }));
        }
      })
      .catch(() => setEligibility(null));
  }, [clientId, navigate]);

  const selectedLoanType = useMemo(() => {
    return loanTypes.find(
      (type) => String(type.Loan_Type_ID) === String(formData.loanTypeId)
    );
  }, [loanTypes, formData.loanTypeId]);

  const selectedFrequency = frequencyOptions.find(
    (item) => item.value === formData.paymentFrequency
  );

  const peso = (value) =>
    Number(value || 0).toLocaleString("en-PH", {
      style: "currency",
      currency: "PHP",
    });

  const preview = useMemo(() => {
    const amount = Number(formData.amount);
    const term = Number(formData.loanTenure);
    const rate = Number(selectedLoanType?.Interest_Rate || 0);

    if (!amount || !term || !rate) return null;

    const interest = amount * (rate / 100) * term;
    const total = amount + interest;
    const payment = total / term;

    return { interest, total, payment };
  }, [formData.amount, formData.loanTenure, selectedLoanType]);

  const maxAmount = eligibility?.isReloan
    ? Number(eligibility.maxReloanAmount || 0)
    : 100000;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "amount" && Number(value) > maxAmount) return;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setLoading(true);

    try {
      const payload = eligibility?.isReloan
        ? {
            clientId,
            amount: Number(formData.amount),
          }
        : {
            clientId,
            amount: Number(formData.amount),
            loanTypeId: Number(formData.loanTypeId),
            paymentFrequency: formData.paymentFrequency,
            loanTenure: Number(formData.loanTenure),
          };

      const url = eligibility?.isReloan
        ? "http://localhost:5000/api/loans/reloan"
        : "http://localhost:5000/api/loans/apply";

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit request.");
      }

      setMessage(
        eligibility?.isReloan
          ? "Reloan request submitted successfully."
          : `Loan submitted successfully. Loan ID: ${data.data.loanId}`
      );

      setFormData((prev) => ({
        ...prev,
        amount: "",
      }));
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#00b386] focus:ring-4 focus:ring-[#00b386]/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

  const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

  return (
    <>
      <ClientNav />

      <div className="min-h-screen bg-gradient-to-br from-[#e9fff7] via-white to-[#edf7ff] px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 rounded-[32px] bg-[#126d71] p-8 text-white shadow-2xl">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                <WalletCards size={26} />
              </div>

              <div>
                <p className="text-sm text-white/80">Welcome, {user?.name}</p>
                <h1 className="text-3xl font-black">
                  {eligibility?.isReloan ? "Apply for Reloan" : "Apply for a Loan"}
                </h1>
              </div>
            </div>

            <h2 className="mb-4 max-w-2xl text-4xl font-black leading-tight md:text-5xl">
              {eligibility?.isReloan
                ? `Reloan up to ${peso(eligibility.maxReloanAmount)}`
                : "Get funds up to ₱100,000"}
            </h2>

            <p className="mb-8 max-w-xl text-white/90">
              {eligibility?.isReloan
                ? "Your loan type, payment frequency, and tenure will stay the same."
                : "Choose your loan type, payment schedule, and term. Review the estimate before sending."}
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-white/15 p-5 backdrop-blur">
                <ShieldCheck className="mb-3" />
                <p className="font-bold">Safe Process</p>
                <p className="text-sm text-white/80">Admin approval required</p>
              </div>

              <div className="rounded-3xl bg-white/15 p-5 backdrop-blur">
                <CalendarDays className="mb-3" />
                <p className="font-bold">Fixed Terms</p>
                <p className="text-sm text-white/80">
                  {eligibility?.isReloan
                    ? "Same loan settings"
                    : "Daily to monthly"}
                </p>
              </div>

              <div className="rounded-3xl bg-white/15 p-5 backdrop-blur">
                <CheckCircle className="mb-3" />
                <p className="font-bold">Easy Apply</p>
                <p className="text-sm text-white/80">Loan details only</p>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
            <form
              onSubmit={handleSubmit}
              className="rounded-[32px] bg-white p-6 shadow-2xl md:p-8"
            >
              <h2 className="mb-6 text-2xl font-black text-slate-900">
                {eligibility?.isReloan ? "Reloan Details" : "Loan Details"}
              </h2>

              {eligibility && !eligibility.canLoan && (
                <div className="mb-5 rounded-2xl bg-red-50 p-4 font-semibold text-red-600">
                  {eligibility.reason}
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    min="1"
                    max={maxAmount}
                    required
                    className={inputClass}
                    placeholder={
                      eligibility?.isReloan
                        ? `Maximum ${peso(eligibility.maxReloanAmount)}`
                        : "Maximum ₱100,000"
                    }
                  />

                  {eligibility?.isReloan && (
                    <p className="mt-2 text-sm font-semibold text-[#126d71]">
                      Maximum reloan amount: {peso(eligibility.maxReloanAmount)}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Loan Type</label>
                  <select
                    name="loanTypeId"
                    value={formData.loanTypeId}
                    onChange={handleChange}
                    required
                    disabled={eligibility?.isReloan}
                    className={inputClass}
                  >
                    <option value="">Select Loan Type</option>
                    {loanTypes.map((type) => (
                      <option key={type.Loan_Type_ID} value={type.Loan_Type_ID}>
                        {type.Loan_Type_Name} - {Number(type.Interest_Rate)}%
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Payment Frequency</label>
                  <select
                    name="paymentFrequency"
                    value={formData.paymentFrequency}
                    onChange={handleChange}
                    required
                    disabled={eligibility?.isReloan}
                    className={inputClass}
                  >
                    {frequencyOptions.map((frequency) => (
                      <option key={frequency.value} value={frequency.value}>
                        {frequency.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Term in {selectedFrequency?.unit || "period"}s
                  </label>
                  <input
                    type="number"
                    name="loanTenure"
                    value={formData.loanTenure}
                    onChange={handleChange}
                    min="1"
                    max="120"
                    required
                    disabled={eligibility?.isReloan}
                    className={inputClass}
                    placeholder="Example: 6"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || (eligibility && !eligibility.canLoan)}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ff6f61] px-6 py-4 text-lg font-black text-white shadow-lg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Submitting..."
                  : eligibility?.isReloan
                    ? "Submit Reloan Request"
                    : "Submit Loan Application"}
                {!loading && <ArrowRight size={20} />}
              </button>

              {message && (
                <p
                  className={`mt-5 rounded-2xl p-4 text-center font-semibold ${
                    isError
                      ? "bg-red-50 text-red-600"
                      : "bg-green-50 text-green-700"
                  }`}
                >
                  {message}
                </p>
              )}
            </form>

            <div className="rounded-[32px] bg-white p-6 shadow-2xl">
              <p className="mb-2 text-sm font-bold text-[#00b386]">
                {eligibility?.isReloan ? "Reloan Summary" : "Loan Summary"}
              </p>

              <h3 className="mb-6 text-2xl font-black text-slate-900">
                Your Estimate
              </h3>

              <div className="mb-5 rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">
                  {eligibility?.isReloan ? "Reloan Amount" : "Loan Amount"}
                </p>
                <p className="text-4xl font-black text-slate-900">
                  {peso(formData.amount)}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Maximum amount: {peso(maxAmount)}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between rounded-2xl bg-slate-50 p-4">
                  <span className="text-slate-500">Loan Type</span>
                  <span className="font-bold text-slate-800">
                    {selectedLoanType?.Loan_Type_Name || "Not selected"}
                  </span>
                </div>

                <div className="flex justify-between rounded-2xl bg-slate-50 p-4">
                  <span className="text-slate-500">Interest Rate</span>
                  <span className="font-bold text-slate-800">
                    {selectedLoanType
                      ? `${Number(selectedLoanType.Interest_Rate)}%`
                      : "0%"}
                  </span>
                </div>

                <div className="flex justify-between rounded-2xl bg-slate-50 p-4">
                  <span className="text-slate-500">Payment</span>
                  <span className="font-bold text-slate-800">
                    {preview ? peso(preview.payment) : peso(0)}
                  </span>
                </div>

                <div className="flex justify-between rounded-2xl bg-[#e8fff6] p-4">
                  <span className="font-bold text-[#007a5e]">Total Payable</span>
                  <span className="font-black text-[#007a5e]">
                    {preview ? peso(preview.total) : peso(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}