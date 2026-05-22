import { useEffect, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";

export default function LoanTypes() {
  const [loanTypes, setLoanTypes] = useState([]);
  const [formData, setFormData] = useState({
    loanTypeName: "",
    interestRate: "",
  });

  const [editingLoanType, setEditingLoanType] = useState(null);
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

  const resetForm = () => {
    setFormData({
      loanTypeName: "",
      interestRate: "",
    });
    setEditingLoanType(null);
  };

  const showMessage = (text, error = false) => {
    setMessage(text);
    setIsError(error);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const startEdit = (type) => {
    setEditingLoanType(type);
    setFormData({
      loanTypeName: type.Loan_Type_Name,
      interestRate: type.Interest_Rate,
    });
    setMessage("");
    setIsError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    try {
      const url = editingLoanType
        ? `http://localhost:5000/api/loan-types/${editingLoanType.Loan_Type_ID}`
        : "http://localhost:5000/api/loan-types";

      const method = editingLoanType ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
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
        throw new Error(data.message || "Failed to save loan type.");
      }

      showMessage(
        editingLoanType
          ? "Loan type updated successfully."
          : "Loan type added successfully.",
        false
      );

      resetForm();
      fetchLoanTypes();
    } catch (error) {
      showMessage(error.message, true);
    }
  };

  const deleteLoanType = async (type) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${type.Loan_Type_Name}"?`
    );

    if (!confirmed) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/loan-types/${type.Loan_Type_ID}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete loan type.");
      }

      showMessage("Loan type deleted successfully.", false);
      fetchLoanTypes();
    } catch (error) {
      showMessage(error.message, true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Loan Types
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Add, edit, or delete loan types and interest rates.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mb-6 grid grid-cols-1 gap-4 rounded-xl bg-white p-5 shadow-sm md:grid-cols-4"
        >
          <input
            type="text"
            name="loanTypeName"
            value={formData.loanTypeName}
            onChange={handleChange}
            placeholder="Loan Type Name"
            required
            className="rounded-xl border border-slate-200 p-3 outline-none focus:border-[#126d71] focus:ring-2 focus:ring-[#126d71]/20 md:col-span-2"
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
            className="rounded-xl border border-slate-200 p-3 outline-none focus:border-[#126d71] focus:ring-2 focus:ring-[#126d71]/20"
          />

          <div className="flex gap-2">
            <button className="flex-1 rounded-xl bg-[#126d71] p-3 font-bold text-white hover:bg-[#0f5b5f]">
              {editingLoanType ? "Update" : "Add"}
            </button>

            {editingLoanType && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-300 px-4 text-slate-700 hover:bg-slate-100"
                title="Cancel edit"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {message && (
            <p
              className={`md:col-span-4 rounded-xl p-3 text-sm font-semibold ${
                isError ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
              }`}
            >
              {message}
            </p>
          )}
        </form>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="p-4 text-left">ID</th>
                  <th className="p-4 text-left">Loan Type</th>
                  <th className="p-4 text-left">Interest Rate</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loanTypes.length > 0 ? (
                  loanTypes.map((type) => (
                    <tr key={type.Loan_Type_ID} className="border-b">
                      <td className="p-4">{type.Loan_Type_ID}</td>
                      <td className="p-4 font-semibold text-slate-800">
                        {type.Loan_Type_Name}
                      </td>
                      <td className="p-4">{Number(type.Interest_Rate)}%</td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => startEdit(type)}
                            className="rounded-lg bg-[#126d71] px-3 py-2 text-white hover:bg-[#0f5b5f]"
                            title="Edit loan type"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => deleteLoanType(type)}
                            className="rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                            title="Delete loan type"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      No loan types found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}