import { useEffect, useState } from "react";

export default function LoanTypes() {
  const [loanTypes, setLoanTypes] = useState([]);
  const [formData, setFormData] = useState({
    loanTypeName: "",
    interestRate: "",
  });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const fetchLoanTypes = async () => {
    const res = await fetch("http://localhost:5000/api/loan-types");
    const data = await res.json();
    setLoanTypes(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchLoanTypes();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    try {
      const res = await fetch("http://localhost:5000/api/loan-types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loanTypeName: formData.loanTypeName,
          interestRate: Number(formData.interestRate),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to add loan type.");
      }

      setMessage("Loan type added successfully.");
      setFormData({
        loanTypeName: "",
        interestRate: "",
      });
      fetchLoanTypes();
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Loan Types</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          name="loanTypeName"
          value={formData.loanTypeName}
          onChange={handleChange}
          placeholder="Loan Type Name"
          required
          className="border p-3 rounded"
        />

        <input
          type="number"
          name="interestRate"
          value={formData.interestRate}
          onChange={handleChange}
          placeholder="Interest Rate %"
          min="0.01"
          step="0.01"
          required
          className="border p-3 rounded"
        />

        <button className="bg-[#126d71] text-white p-3 rounded font-bold">
          Add Loan Type
        </button>

        {message && (
          <p className={`${isError ? "text-red-600" : "text-green-600"}`}>
            {message}
          </p>
        )}
      </form>

      <table className="w-full bg-white rounded-xl overflow-hidden">
        <thead className="bg-slate-900 text-white">
          <tr>
            <th className="p-4 text-left">ID</th>
            <th className="p-4 text-left">Loan Type</th>
            <th className="p-4 text-left">Interest Rate</th>
          </tr>
        </thead>

        <tbody>
          {loanTypes.map((type) => (
            <tr key={type.Loan_Type_ID} className="border-b">
              <td className="p-4">{type.Loan_Type_ID}</td>
              <td className="p-4">{type.Loan_Type_Name}</td>
              <td className="p-4">{(Number(type.Interest_Rate))}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}