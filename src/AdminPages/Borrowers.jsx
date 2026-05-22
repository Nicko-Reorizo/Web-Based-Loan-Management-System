import { useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, Trash2, X } from "lucide-react";

const emptyForm = {
  Client_FullName: "",
  Email: "",
  Password: "",
  ConfirmPassword: "",
  Phone_Number: "",
  Birth_Date: "",
  Gender: "",
  Civil_Status: "",
  Valid_ID_Type: "",
  Valid_ID_Number: "",
  House_Number: "",
  Street: "",
  Barangay: "",
  City: "",
  Province: "",
  ZIP: "",
  Occupation: "",
  Employment_Status: "",
  Monthly_Salary: "",
  Source_Of_Income: "",
  Employer_Name: "",
  Emergency_Contact_Name: "",
  Emergency_Contact_Number: "",
  Relationship_To_Borrower: "",
};

const toApiAddPayload = (form) => ({
  Client_FullName: form.Client_FullName,
  Email: form.Email,
  Phone_Number: form.Phone_Number,
  Password: form.Password,
  ConfirmPassword: form.ConfirmPassword,
  Birth_Date: form.Birth_Date,
  Gender: form.Gender,
  Civil_Status: form.Civil_Status,
  Valid_ID_Type: form.Valid_ID_Type,
  Valid_ID_Number: form.Valid_ID_Number,
  House_Number: form.House_Number,
  Street: form.Street,
  Barangay: form.Barangay,
  City: form.City,
  Province: form.Province,
  ZIP: form.ZIP,
  Occupation: form.Occupation,
  Employment_Status: form.Employment_Status,
  Monthly_Salary: form.Monthly_Salary,
  Source_Of_Income: form.Source_Of_Income,
  Employer_Name: form.Employer_Name,
  Emergency_Contact_Name: form.Emergency_Contact_Name,
  Emergency_Contact_Number: form.Emergency_Contact_Number,
  Relationship_To_Borrower: form.Relationship_To_Borrower,
});

export default function Borrowers() {
  const [borrowers, setBorrowers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchBorrowers = () => {
    fetch("http://localhost:5000/api/borrowers")
      .then((res) => res.json())
      .then((data) => setBorrowers(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to fetch borrowers:", err));
  };

  useEffect(() => {
    fetchBorrowers();
  }, []);

  const filteredBorrowers = useMemo(() => {
    return borrowers.filter((b) => {
      const q = search.toLowerCase();

      return (
        String(b.Client_ID).toLowerCase().includes(q) ||
        String(b.Client_FullName).toLowerCase().includes(q) ||
        String(b.Email).toLowerCase().includes(q) ||
        String(b.Phone_Number).toLowerCase().includes(q) ||
        String(b.City).toLowerCase().includes(q) ||
        String(b.Province).toLowerCase().includes(q)
      );
    });
  }, [borrowers, search]);

  const formatDateForInput = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const openAdd = () => {
    setFormData(emptyForm);
    setSelectedBorrower(null);
    setAddOpen(true);
  };

  const openView = async (clientId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/borrowers/${clientId}`);
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to load borrower info.");
        return;
      }

      setSelectedBorrower(data);
      setViewOpen(true);
    } catch {
      alert("Failed to load borrower info.");
    }
  };

  const openEdit = async (clientId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/borrowers/${clientId}`);
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to load borrower info.");
        return;
      }

      setSelectedBorrower(data);

      setFormData({
        ...emptyForm,
        Client_FullName: data.Client_FullName || "",
        Email: data.Email || "",
        Phone_Number: data.Phone_Number || "",
        Birth_Date: formatDateForInput(data.Birth_Date),
        Gender: data.Gender || "",
        Civil_Status: data.Civil_Status || "",
        Valid_ID_Type: data.Valid_ID_Type || "",
        Valid_ID_Number: data.Valid_ID_Number || "",
        House_Number: data.House_Number || "",
        Street: data.Street || "",
        Barangay: data.Barangay || "",
        City: data.City || "",
        Province: data.Province || "",
        ZIP: data.ZIP || "",
        Occupation: data.Occupation || "",
        Employment_Status: data.Employment_Status || "",
        Monthly_Salary: data.Monthly_Salary || "",
        Source_Of_Income: data.Source_Of_Income || "",
        Employer_Name: data.Employer_Name || "",
        Emergency_Contact_Name: data.Emergency_Contact_Name || "",
        Emergency_Contact_Number: data.Emergency_Contact_Number || "",
        Relationship_To_Borrower: data.Relationship_To_Borrower || "",
      });

      setEditOpen(true);
    } catch {
      alert("Failed to load borrower info.");
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const addBorrower = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const res = await fetch("http://localhost:5000/api/admin/borrowers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toApiAddPayload(formData)),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to add borrower.");
        return;
      }

      alert(data.message);
      setAddOpen(false);
      setFormData(emptyForm);
      fetchBorrowers();
    } catch {
      alert("Failed to add borrower.");
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async (e) => {
    e.preventDefault();

    if (!selectedBorrower?.Client_ID) return;

    try {
      setSaving(true);

      const res = await fetch(
        `http://localhost:5000/api/borrowers/${selectedBorrower.Client_ID}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to update borrower.");
        return;
      }

      alert(data.message);
      setEditOpen(false);
      setSelectedBorrower(null);
      fetchBorrowers();
    } catch {
      alert("Failed to update borrower.");
    } finally {
      setSaving(false);
    }
  };

  const deleteBorrower = async (borrower) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${borrower.Client_FullName}? This will delete the borrower, loan records, and payment records linked to this borrower.`
    );

    if (!confirmed) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/borrowers/${borrower.Client_ID}`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to delete borrower.");
        return;
      }

      alert(data.message);
      setBorrowers((prev) =>
        prev.filter((b) => b.Client_ID !== borrower.Client_ID)
      );
    } catch {
      alert("Failed to delete borrower.");
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-100 p-4 sm:p-6 md:p-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
              Borrowers
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {filteredBorrowers.length} borrower(s) found
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <button
              onClick={openAdd}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#126d71] px-5 py-3 font-bold text-white hover:bg-[#0f5b5f]"
            >
              <Plus size={18} />
              Add Borrower
            </button>

            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                placeholder="Search borrowers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>
        </div>

        <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="w-full overflow-x-auto">
            <div className="max-h-[75vh] overflow-y-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="sticky top-0 z-10 bg-slate-900 text-sm text-white">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Client ID</th>
                    <th className="px-6 py-4 font-semibold">Full Name</th>
                    <th className="px-6 py-4 font-semibold">Email</th>
                    <th className="px-6 py-4 font-semibold">Phone</th>
                    <th className="px-6 py-4 font-semibold">City</th>
                    <th className="px-6 py-4 font-semibold">Province</th>
                    <th className="px-4 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {filteredBorrowers.length > 0 ? (
                    filteredBorrowers.map((borrower) => (
                      <tr
                        key={borrower.Client_ID}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {borrower.Client_ID}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                              {String(borrower.Client_FullName || "")
                                .split(" ")
                                .map((word) => word[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()}
                            </div>

                            <span className="font-medium text-slate-800">
                              {borrower.Client_FullName}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">{borrower.Email}</td>
                        <td className="px-6 py-4">{borrower.Phone_Number}</td>
                        <td className="px-6 py-4">{borrower.City}</td>
                        <td className="px-6 py-4">{borrower.Province}</td>

                        <td className="px-4 py-4">
                          <div className="flex flex-nowrap justify-end gap-2">
                            <button
                              onClick={() => openView(borrower.Client_ID)}
                              className="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                              title="View full info"
                            >
                              <Eye size={16} />
                            </button>

                            <button
                              onClick={() => openEdit(borrower.Client_ID)}
                              className="rounded-lg bg-[#126d71] px-3 py-2 text-white hover:bg-[#0f5b5f]"
                              title="Edit borrower"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              onClick={() => deleteBorrower(borrower)}
                              className="rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                              title="Delete borrower"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        No borrowers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {viewOpen && selectedBorrower && (
        <ViewModal
          borrower={selectedBorrower}
          onClose={() => {
            setViewOpen(false);
            setSelectedBorrower(null);
          }}
        />
      )}

      {editOpen && selectedBorrower && (
        <BorrowerFormModal
          mode="edit"
          title="Edit Borrower Info"
          submitLabel="Save Changes"
          formData={formData}
          saving={saving}
          onChange={handleChange}
          onSubmit={saveEdit}
          onClose={() => {
            setEditOpen(false);
            setSelectedBorrower(null);
          }}
        />
      )}

      {addOpen && (
        <BorrowerFormModal
          mode="add"
          title="Add Borrower"
          submitLabel="Add Borrower"
          formData={formData}
          saving={saving}
          onChange={handleChange}
          onSubmit={addBorrower}
          onClose={() => {
            setAddOpen(false);
            setFormData(emptyForm);
          }}
        />
      )}
    </div>
  );
}

function ViewModal({ borrower, onClose }) {
  const rows = [
    ["Client ID", borrower.Client_ID],
    ["Full Name", borrower.Client_FullName],
    ["Email", borrower.Email],
    ["Phone Number", borrower.Phone_Number],
    ["Birth Date", formatDate(borrower.Birth_Date)],
    ["Gender", borrower.Gender],
    ["Civil Status", borrower.Civil_Status],
    ["Valid ID Type", borrower.Valid_ID_Type],
    ["Valid ID Number", borrower.Valid_ID_Number],
    ["House Number", borrower.House_Number],
    ["Street", borrower.Street],
    ["Barangay", borrower.Barangay],
    ["City", borrower.City],
    ["Province", borrower.Province],
    ["ZIP", borrower.ZIP],
    ["Occupation", borrower.Occupation],
    ["Employment Status", borrower.Employment_Status],
    ["Monthly Salary", borrower.Monthly_Salary],
    ["Source Of Income", borrower.Source_Of_Income],
    ["Employer Name", borrower.Employer_Name],
    ["Emergency Contact Name", borrower.Emergency_Contact_Name],
    ["Emergency Contact Number", borrower.Emergency_Contact_Number],
    ["Relationship To Borrower", borrower.Relationship_To_Borrower],
    ["Created At", formatDateTime(borrower.Created_At)],
  ];

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">
            Full Borrower Info
          </h2>

          <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
            <X size={22} />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">
                {label}
              </p>
              <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                {value || "N/A"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BorrowerFormModal({
  mode,
  title,
  submitLabel,
  formData,
  saving,
  onChange,
  onSubmit,
  onClose,
}) {
  const isAdd = mode === "add";

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      <form
        onSubmit={onSubmit}
        className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">{title}</h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X size={22} />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Full Name" name="Client_FullName" value={formData.Client_FullName} onChange={onChange} required />
          <Input label="Email" name="Email" type="email" value={formData.Email} onChange={onChange} required />
          <Input label="Phone Number" name="Phone_Number" value={formData.Phone_Number} onChange={onChange} required />

          {isAdd && (
            <>
              <Input label="Password" name="Password" type="password" value={formData.Password} onChange={onChange} required />
              <Input label="Confirm Password" name="ConfirmPassword" type="password" value={formData.ConfirmPassword} onChange={onChange} required />
            </>
          )}

          <Input label="Birth Date" name="Birth_Date" type="date" value={formData.Birth_Date} onChange={onChange} required />
          <Select label="Gender" name="Gender" value={formData.Gender} onChange={onChange} options={["Male", "Female"]} required />
          <Select label="Civil Status" name="Civil_Status" value={formData.Civil_Status} onChange={onChange} options={["Single", "Married", "Widowed", "Separated"]} required />

          <Input label="Valid ID Type" name="Valid_ID_Type" value={formData.Valid_ID_Type} onChange={onChange} required />
          <Input label="Valid ID Number" name="Valid_ID_Number" value={formData.Valid_ID_Number} onChange={onChange} required />
          <Input label="House Number" name="House_Number" value={formData.House_Number} onChange={onChange} required />
          <Input label="Street" name="Street" value={formData.Street} onChange={onChange} required />
          <Input label="Barangay" name="Barangay" value={formData.Barangay} onChange={onChange} required />
          <Input label="City" name="City" value={formData.City} onChange={onChange} required />
          <Input label="Province" name="Province" value={formData.Province} onChange={onChange} required />
          <Input label="ZIP" name="ZIP" value={formData.ZIP} onChange={onChange} required />
          <Input label="Occupation" name="Occupation" value={formData.Occupation} onChange={onChange} required />
          <Input label="Employment Status" name="Employment_Status" value={formData.Employment_Status} onChange={onChange} required />
          <Input label="Monthly Salary" name="Monthly_Salary" type="number" value={formData.Monthly_Salary} onChange={onChange} required />
          <Input label="Source Of Income" name="Source_Of_Income" value={formData.Source_Of_Income} onChange={onChange} required />
          <Input label="Employer Name" name="Employer_Name" value={formData.Employer_Name} onChange={onChange} />
          <Input label="Emergency Contact Name" name="Emergency_Contact_Name" value={formData.Emergency_Contact_Name} onChange={onChange} required />
          <Input label="Emergency Contact Number" name="Emergency_Contact_Number" value={formData.Emergency_Contact_Number} onChange={onChange} required />
          <Input label="Relationship To Borrower" name="Relationship_To_Borrower" value={formData.Relationship_To_Borrower} onChange={onChange} required />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-6 py-3 font-bold text-slate-700"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#126d71] px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {saving ? "Saving..." : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, name, value, onChange, type = "text", required = false }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-600">
        {label}
      </span>

      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#126d71] focus:ring-2 focus:ring-[#126d71]/20"
      />
    </label>
  );
}

function Select({ label, name, value, onChange, options, required = false }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-600">
        {label}
      </span>

      <select
        name={name}
        value={value ?? ""}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#126d71] focus:ring-2 focus:ring-[#126d71]/20"
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function formatDate(date) {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(date) {
  if (!date) return "N/A";

  return new Date(date).toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}