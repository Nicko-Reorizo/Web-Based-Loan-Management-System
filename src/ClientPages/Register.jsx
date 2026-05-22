import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const steps = ["Account", "Personal", "Address", "Employment", "Emergency"];
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
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
    sourceOfIncome: "",
    employerName: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
    relationshipToBorrower: "",
  });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const stepFields = [
    ["fullName", "email", "phoneNumber", "password", "confirmPassword"],
    ["birthDate", "gender", "civilStatus", "validIdType", "validIdNumber"],
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

  const validateAccount = () => {
    if (formData.password !== formData.confirmPassword) {
      return "Password and confirm password must match.";
    }

    return "";
  };

  const handleNext = () => {
    setMessage("");
    setIsError(false);

    if (!isCurrentStepComplete()) {
      setMessage("Please complete all required fields in this step.");
      setIsError(true);
      return;
    }

    if (currentStep === 0) {
      const accountError = validateAccount();

      if (accountError) {
        setMessage(accountError);
        setIsError(true);
        return;
      }
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
    setMessage("");
    setIsError(false);

    if (!isCurrentStepComplete()) {
      setMessage("Please complete all required fields in this step.");
      setIsError(true);
      return;
    }

    const accountError = validateAccount();

    if (accountError) {
      setMessage(accountError);
      setIsError(true);
      setCurrentStep(0);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        validIdNumber: formData.validIdNumber.trim(),
        houseNumber: formData.houseNumber.trim(),
        street: formData.street.trim(),
        barangay: formData.barangay.trim(),
        city: formData.city.trim(),
        province: formData.province.trim(),
        zip: formData.zip.trim(),
        occupation: formData.occupation.trim(),
        monthlySalary: Number(formData.monthlySalary),
        sourceOfIncome: formData.sourceOfIncome.trim(),
        employerName: formData.employerName.trim(),
        emergencyContactName: formData.emergencyContactName.trim(),
        emergencyContactNumber: formData.emergencyContactNumber.trim(),
        relationshipToBorrower: formData.relationshipToBorrower.trim(),
      };

      const response = await fetch("http://localhost:5000/client-register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to register.");
      }

      localStorage.removeItem("borrowerInfo");

      setMessage("Registration successful. Please log in.");
      setIsError(false);

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      setMessage(error.message || "Server error.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#126d71] min-h-screen w-[100vw] flex justify-center items-center py-10 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-5xl">
        <div
          className="bg-[#f0f0f0] rounded-[15px] p-10"
          style={{ boxShadow: "0 0 100px rgba(0,0,0,0.3)" }}
        >
          <p className="text-black inter-bold text-[25px] text-center mt-3 mb-3">
            LENDIFY
          </p>
          <p className="inter-reg text-[30px] text-center">
            Create Borrower Account
          </p>
          <p className="inter-reg text-[#00000075] text-center mb-8">
            Complete your account and borrower information to register.
          </p>

          <div className="mx-auto mb-10 max-w-3xl">
            <div className="flex items-start justify-between">
              {steps.map((step, index) => (
                <div key={step} className="relative flex flex-1 flex-col items-center">
                  {index < steps.length - 1 && (
                    <div className="absolute left-1/2 top-5 h-[3px] w-full bg-white">
                      <div
                        className={`h-full rounded-full transition ${index < currentStep ? "bg-[#126d71]" : "bg-white"
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
                    className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold shadow-sm transition ${index <= currentStep
                        ? "bg-[#126d71] text-white"
                        : "bg-white text-slate-400"
                      }`}
                  >
                    {index + 1}
                  </button>

                  <span
                    className={`mt-3 text-center text-xs font-semibold ${index === currentStep ? "text-[#126d71]" : "text-slate-500"
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
              <SectionTitle>Account Credentials</SectionTitle>
              <TextField label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} />
              <TextField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
              <TextField label="Phone Number" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} />
              <TextField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} />
              <TextField label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} />
            </div>
          )}

          {currentStep === 1 && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <SectionTitle>Personal Details</SectionTitle>
              <TextField label="Birth Date" name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} />
              <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={["Female", "Male", "Prefer not to say"]} />
              <SelectField label="Civil Status" name="civilStatus" value={formData.civilStatus} onChange={handleChange} options={["Single", "Married", "Separated", "Widowed"]} />
              <SelectField label="Valid ID Type" name="validIdType" value={formData.validIdType} onChange={handleChange} options={["National ID", "Driver's License", "Passport", "Voter's ID", "SSS", "PhilHealth", "TIN"]} />
              <TextField label="Valid ID Number" name="validIdNumber" value={formData.validIdNumber} onChange={handleChange} />
            </div>
          )}

          {currentStep === 2 && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <SectionTitle>Client Address</SectionTitle>
              <TextField label="House / Unit No." name="houseNumber" value={formData.houseNumber} onChange={handleChange} />
              <TextField label="Street" name="street" value={formData.street} onChange={handleChange} />
              <TextField label="Barangay" name="barangay" value={formData.barangay} onChange={handleChange} />
              <TextField label="City / Municipality" name="city" value={formData.city} onChange={handleChange} />
              <TextField label="Province" name="province" value={formData.province} onChange={handleChange} />
              <TextField label="ZIP Code" name="zip" value={formData.zip} onChange={handleChange} />
            </div>
          )}

          {currentStep === 3 && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <SectionTitle>Employment and Income</SectionTitle>
              <TextField label="Occupation" name="occupation" value={formData.occupation} onChange={handleChange} />
              <SelectField label="Employment Status" name="employmentStatus" value={formData.employmentStatus} onChange={handleChange} options={["Employed", "Self-employed", "Business Owner", "Contractual", "Unemployed"]} />
              <TextField label="Monthly Salary / Income" name="monthlySalary" type="number" value={formData.monthlySalary} onChange={handleChange} />
              <TextField label="Source of Income" name="sourceOfIncome" value={formData.sourceOfIncome} onChange={handleChange} />
              <TextField label="Employer / Business Name" name="employerName" value={formData.employerName} onChange={handleChange} required={false} />
            </div>
          )}

          {currentStep === 4 && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <SectionTitle>Emergency Contact</SectionTitle>
              <TextField label="Contact Name" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} />
              <TextField label="Contact Number" name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleChange} />
              <TextField label="Relationship to Borrower" name="relationshipToBorrower" value={formData.relationshipToBorrower} onChange={handleChange} />
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
                {loading ? "Registering..." : "Register"}
              </button>
            )}
          </div>

          {message && (
            <p
              className={`text-center mt-4 text-sm ${isError ? "text-red-600" : "text-green-600"
                }`}
            >
              {message}
            </p>
          )}

          <div className="mt-5 flex justify-center gap-1">
            <p>Already have an account?</p>
            <button
              type="button"
              className="underline text-blue-800"
              onClick={() => navigate("/login")}
            >
              Log in
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function SectionTitle({ children }) {
  return <p className="md:col-span-2 inter-bold">{children}</p>;
}

function TextField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = true,
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="inter-bold text-sm text-slate-600">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        min={type === "number" ? "1" : undefined}
        className="rounded-md border border-[#aaaaaa3a] bg-white p-3 outline-none focus:border-[#126d71]"
        required={required}
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="inter-bold text-sm text-slate-600">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="rounded-md border border-[#aaaaaa3a] bg-white p-3 outline-none focus:border-[#126d71]"
        required
      >
        <option value="" disabled>
          Select {label}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
