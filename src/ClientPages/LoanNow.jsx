import { useState } from "react";
import Navbar from "../components/navbar.jsx";

export default function LoanNow() {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    street: "",
    city: "",
    province: "",
    zip: "",
    amount: "",
    loanTenure: "1",
    loanType: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch("http://localhost:5000/api/loans/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          street: formData.street.trim(),
          city: formData.city.trim(),
          province: formData.province.trim(),
          zip: formData.zip.trim(),
          amount: Number(formData.amount),
          loanTenure: Number(formData.loanTenure),
          loanType: Number(formData.loanType),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to submit application.");
      }

      setMessage(data.message || "Loan application submitted successfully.");
      setIsError(false);

      setFormData({
        fullName: "",
        phoneNumber: "",
        street: "",
        city: "",
        province: "",
        zip: "",
        amount: "",
        loanTenure: "1",
        loanType: "",
      });
    } catch (error) {
      console.error("FRONTEND ERROR:", error);
      setMessage(error.message || "Something went wrong.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="LandingPage bg-[white] min-h-screen flex justify-center items-center py-10">
        <form onSubmit={handleSubmit}>
          <div
            className="bg-[#f0f0f0] rounded-[15px] p-10 grid grid-cols-2 gap-4"
            style={{ boxShadow: "0 0 100px rgba(0,0,0,0.3)" }}
          >
            <p className="text-center col-span-2 inter-bold mb-10 text-[25px]">
              LENDING FORM
            </p>

            <p className="col-span-2 ml-3 inter-bold">Personal Details</p>

            <div className="input-group">
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
              <label>Full Name</label>
            </div>

            <div className="input-group">
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
              <label>Phone Number</label>
            </div>

            <div className="input-group">
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                required
              />
              <label>Street</label>
            </div>

            <div className="input-group">
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
              <label>City</label>
            </div>

            <div className="input-group">
              <input
                type="text"
                name="province"
                value={formData.province}
                onChange={handleChange}
                required
              />
              <label>Province</label>
            </div>

            <div className="input-group">
              <input
                type="text"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                required
              />
              <label>ZIP</label>
            </div>

            <p className="col-span-2 ml-3 mt-10 inter-bold">Loan Details</p>

            <div className="input-group">
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="1"
                required
              />
              <label>Amount</label>
            </div>

            <div className="input-group">
              <select
                name="loanTenure"
                value={formData.loanTenure}
                onChange={handleChange}
                required
              >
                <option value="1">1 Month</option>
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
              </select>
              <label>Loan Tenure</label>
            </div>

            <div className="input-group-1 col-span-2">
              <select
                name="loanType"
                value={formData.loanType}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Select Type
                </option>
                <option value="3">Personal Loan (3%/mo)</option>
                <option value="5">Emergency Loan (5%/mo)</option>
              </select>
              <label>Loan Type</label>
            </div>

            <input
              type="submit"
              value={loading ? "Submitting..." : "Submit Application"}
              disabled={loading}
              className="bg-[#ff6f61] text-white col-span-2 h-[50px] inter-semibold rounded-[10px] cursor-pointer mt-5 disabled:opacity-60"
            />

            {message && (
              <p
                className={`col-span-2 text-center mt-4 text-sm ${
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