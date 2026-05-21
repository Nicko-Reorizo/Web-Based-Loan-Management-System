import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar.jsx";

export default function BorrowerInfo() {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("authUser");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const steps = [
    "Personal",
    "Address",
    "Employment",
    "Emergency",
  ];
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    phoneNumber: user?.phoneNumber || "",
    email: user?.email || "",
    birthDate: "",
    gender: "",
    civilStatus: "",
    validIdType: "",
    validIdNumber: "",
    houseNumber: "",
    street: "",
    barangay: "",
    city: "",
    province: "",
    zip: "",
    occupation: "",
    employmentStatus: "",
    monthlySalary: "",
    employerName: "",
    sourceOfIncome: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
    relationshipToBorrower: "",
  });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const stepFields = [
    [
      "fullName",
      "phoneNumber",
      "email",
      "birthDate",
      "gender",
      "civilStatus",
      "validIdType",
      "validIdNumber",
    ],
    ["houseNumber", "street", "barangay", "city", "province", "zip"],
    ["occupation", "employmentStatus", "monthlySalary", "sourceOfIncome"],
    [
      "emergencyContactName",
      "emergencyContactNumber",
      "relationshipToBorrower",
    ],
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isCurrentStepComplete = () => {
    return stepFields[currentStep].every((field) => {
      const value = formData[field];

      if (field === "monthlySalary") {
        return Number(value) > 0;
      }

      return String(value || "").trim() !== "";
    });
  };

  const handleNext = () => {
    setMessage("");
    setIsError(false);

    if (!isCurrentStepComplete()) {
      setMessage("Please complete all required fields in this step.");
      setIsError(true);
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setMessage("");
    setIsError(false);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isCurrentStepComplete()) {
      setMessage("Please complete all required fields in this step.");
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim(),
        birthDate: formData.birthDate,
        gender: formData.gender,
        civilStatus: formData.civilStatus,
        validIdType: formData.validIdType,
        validIdNumber: formData.validIdNumber.trim(),
        houseNumber: formData.houseNumber.trim(),
        street: formData.street.trim(),
        barangay: formData.barangay.trim(),
        city: formData.city.trim(),
        province: formData.province.trim(),
        zip: formData.zip.trim(),
        occupation: formData.occupation.trim(),
        employmentStatus: formData.employmentStatus,
        monthlySalary: Number(formData.monthlySalary),
        employerName: formData.employerName.trim(),
        sourceOfIncome: formData.sourceOfIncome.trim(),
        emergencyContactName: formData.emergencyContactName.trim(),
        emergencyContactNumber: formData.emergencyContactNumber.trim(),
        relationshipToBorrower: formData.relationshipToBorrower.trim(),
      };

      const response = await fetch("http://localhost:5000/api/borrower-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text || "Server returned an invalid response.");
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to save borrower information.");
      }

      localStorage.setItem(
        "borrowerInfo",
        JSON.stringify({
          ...payload,
          clientId: data.clientId,
        }),
      );

      navigate("/loan");
    } catch (error) {
      setMessage(error.message || "Server error.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white flex justify-center items-center py-10 px-4">
        <form onSubmit={handleSubmit} className="w-full max-w-5xl">
          <div
            className="bg-[#f0f0f0] rounded-[15px] p-10"
            style={{ boxShadow: "0 0 100px rgba(0,0,0,0.3)" }}
          >
            <p className="text-center inter-bold text-[25px]">
              BORROWER INFORMATION
            </p>
            <p className="text-center text-[#00000075] mb-8">
              Complete your borrower profile before applying for a loan.
            </p>

            <div className="mx-auto mb-10 max-w-2xl">
              <div className="flex items-start justify-between">
                {steps.map((step, index) => (
                  <div key={step} className="relative flex flex-1 flex-col items-center">
                    {index < steps.length - 1 && (
                      <div className="absolute left-1/2 top-5 h-[3px] w-full bg-white">
                        <div
                          className={`h-full rounded-full transition ${
                            index < currentStep ? "bg-[#126d71]" : "bg-white"
                          }`}
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (index <= currentStep) {
                          setCurrentStep(index);
                        }
                      }}
                      className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold shadow-sm transition ${
                        index <= currentStep
                          ? "bg-[#126d71] text-white"
                          : "bg-white text-slate-400"
                      }`}
                    >
                      {index + 1}
                    </button>

                    <span
                      className={`mt-3 text-center text-xs font-semibold ${
                        index === currentStep ? "text-[#126d71]" : "text-slate-500"
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {currentStep === 0 && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <p className="md:col-span-2 inter-bold">Personal Details</p>

            <div className="flex flex-col gap-2">
              <label className="inter-bold text-sm text-slate-600">Client Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="rounded-md border border-[#aaaaaa3a] bg-white p-3 outline-none focus:border-[#126d71]"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="inter-bold text-sm text-slate-600">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="rounded-md border border-[#aaaaaa3a] bg-white p-3 outline-none focus:border-[#126d71]"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="inter-bold text-sm text-slate-600">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="rounded-md border border-[#aaaaaa3a] bg-white p-3 outline-none focus:border-[#126d71]"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="inter-bold text-sm text-slate-600">Birth Date</label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="rounded-md border border-[#aaaaaa3a] bg-white p-3 outline-none focus:border-[#126d71]"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="inter-bold text-sm text-slate-600">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="rounded-md border border-[#aaaaaa3a] bg-white p-3 outline-none focus:border-[#126d71]"
                required
              >
                <option value="" disabled>Select Gender</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="inter-bold text-sm text-slate-600">Civil Status</label>
              <select
                name="civilStatus"
                value={formData.civilStatus}
                onChange={handleChange}
                className="rounded-md border border-[#aaaaaa3a] bg-white p-3 outline-none focus:border-[#126d71]"
                required
              >
                <option value="" disabled>Select Civil Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Separated">Separated</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="inter-bold text-sm text-slate-600">Valid ID Type</label>
              <select
                name="validIdType"
                value={formData.validIdType}
                onChange={handleChange}
                className="rounded-md border border-[#aaaaaa3a] bg-white p-3 outline-none focus:border-[#126d71]"
                required
              >
                <option value="" disabled>Select ID Type</option>
                <option value="National ID">National ID</option>
                <option value="Driver's License">Driver's License</option>
                <option value="Passport">Passport</option>
                <option value="Voter's ID">Voter's ID</option>
                <option value="SSS">SSS</option>
                <option value="PhilHealth">PhilHealth</option>
                <option value="TIN">TIN</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="inter-bold text-sm text-slate-600">Valid ID Number</label>
              <input
                type="text"
                name="validIdNumber"
                value={formData.validIdNumber}
                onChange={handleChange}
                className="rounded-md border border-[#aaaaaa3a] bg-white p-3 outline-none focus:border-[#126d71]"
                required
              />
            </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <p className="md:col-span-2 inter-bold">Client Address</p>

            <div className="flex flex-col gap-2">
              <label className="inter-bold text-sm text-slate-600">House / Unit No.</label>
              <input
                type="text"
                name="houseNumber"
                value={formData.houseNumber}
                onChange={handleChange}
                className="rounded-md border border-[#aaaaaa3a] bg-white p-3 outline-none focus:border-[#126d71]"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="inter-bold text-sm text-slate-600">Street</label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                className="rounded-md border border-[#aaaaaa3a] bg-white p-3 outline-none focus:border-[#126d71]"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="inter-bold text-sm text-slate-600">Barangay</label>
              <input
                type="text"
                name="barangay"
                value={formData.barangay}
                onChange={handleChange}
                className="rounded-md border border-[#aaaaaa3a] bg-white p-3 outline-none focus:border-[#126d71]"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="inter-bold text-sm text-slate-600">City / Municipality</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="rounded-md border border-[#aaaaaa3a] bg-white p-3 outline-none focus:border-[#126d71]"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="inter-bold text-sm text-slate-600">Province</label>
              <input
                type="text"
                name="province"
                value={formData.province}
                onChange={handleChange}
                className="rounded-md border border-[#aaaaaa3a] bg-white p-3 outline-none focus:border-[#126d71]"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="inter-bold text-sm text-slate-600">ZIP Code</label>
              <input
                type="text"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                className="rounded-md border border-[#aaaaaa3a] bg-white p-3 outline-none focus:border-[#126d71]"
                required
              />
            </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <p className="md:col-span-2 inter-bold">Employment and Income</p>

            <div className="flex flex-col gap-2">
              <label className="inter-bold text-sm text-slate-600">Occupation</label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className="rounded-md border border-[#aaaaaa3a] bg-white p-3 outline-none focus:border-[#126d71]"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="inter-bold text-sm text-slate-600">Employment Status</label>
              <select
                name="employmentStatus"
                value={formData.employmentStatus}
                onChange={handleChange}
                className="rounded-md border border-[#aaaaaa3a] bg-white p-3 outline-none focus:border-[#126d71]"
                required
              >
                <option value="" disabled>
                  Select Status
                </option>
                <option value="Employed">Employed</option>
                <option value="Self-employed">Self-employed</option>
                <option value="Business Owner">Business Owner</option>
                <option value="Contractual">Contractual</option>
                <option value="Unemployed">Unemployed</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="inter-bold text-sm text-slate-600">Monthly Salary / Income</label>
              <input
                type="number"
                name="monthlySalary"
                value={formData.monthlySalary}
                onChange={handleChange}
                className="rounded-md border border-[#aaaaaa3a] bg-white p-3 outline-none focus:border-[#126d71]"
                min="1"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="inter-bold text-sm text-slate-600">Source of Income</label>
              <input
                type="text"
                name="sourceOfIncome"
                value={formData.sourceOfIncome}
                onChange={handleChange}
                className="rounded-md border border-[#aaaaaa3a] bg-white p-3 outline-none focus:border-[#126d71]"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="inter-bold text-sm text-slate-600">Employer / Business Name</label>
              <input
                type="text"
                name="employerName"
                value={formData.employerName}
                onChange={handleChange}
                className="rounded-md border border-[#aaaaaa3a] bg-white p-3 outline-none focus:border-[#126d71]"
              />
            </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <p className="md:col-span-2 inter-bold">Emergency Contact</p>

            <div className="flex flex-col gap-2">
              <label className="inter-bold text-sm text-slate-600">Contact Name</label>
              <input
                type="text"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
                className="rounded-md border border-[#aaaaaa3a] bg-white p-3 outline-none focus:border-[#126d71]"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="inter-bold text-sm text-slate-600">Contact Number</label>
              <input
                type="text"
                name="emergencyContactNumber"
                value={formData.emergencyContactNumber}
                onChange={handleChange}
                className="rounded-md border border-[#aaaaaa3a] bg-white p-3 outline-none focus:border-[#126d71]"
                required
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="inter-bold text-sm text-slate-600">Relationship to Borrower</label>
              <input
                type="text"
                name="relationshipToBorrower"
                value={formData.relationshipToBorrower}
                onChange={handleChange}
                className="rounded-md border border-[#aaaaaa3a] bg-white p-3 outline-none focus:border-[#126d71]"
                required
              />
            </div>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="h-[50px] flex-1 rounded-[10px] border border-[#126d71] bg-white inter-semibold text-[#126d71]"
                >
                  Back
                </button>
              )}

              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="h-[50px] flex-1 rounded-[10px] bg-[#ff6f61] inter-semibold text-white"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="h-[50px] flex-1 rounded-[10px] bg-[#ff6f61] inter-semibold text-white disabled:opacity-60"
                >
                  {loading ? "Saving..." : "Continue"}
                </button>
              )}
            </div>

            {message && (
              <p
                className={`text-center mt-4 text-sm ${
                  isError ? "text-red-600" : "text-green-600"
                }`}
              >
                {message}
              </p>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
