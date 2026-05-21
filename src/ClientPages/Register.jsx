import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    if (password !== confirmPassword) {
      setMessage("Password and confirm password must match.");
      setIsError(true);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/client-register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          phoneNumber,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        setIsError(true);
        return;
      }

      setMessage(data.message);
      setIsError(false);
      setFullName("");
      setEmail("");
      setPhoneNumber("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.log(error);
      setMessage("Server error.");
      setIsError(true);
    }
  };

  return (
    <div className="bg-[#126d71] min-h-screen w-[100vw] flex justify-center items-center py-10">
      <div
        className="bg-[#f0f0f0] rounded-[15px] p-10 px-20 grid w-[550px]"
        style={{ boxShadow: "0 0 100px rgba(0,0,0,0.3)" }}
      >
        <p className="text-black inter-bold text-[25px] text-center mt-3 mb-5">
          LENDIFY
        </p>

        <p className="inter-reg text-[30px] text-center">Create Borrower Account</p>
        <p className="inter-reg text-[#00000075] text-center mb-5">
          Sign up before completing your borrower information.
        </p>

        {message && (
          <p
            className={`rounded-lg p-3 text-center text-sm ${
              isError ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
            }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-y-4 mt-5">
            <div className="LoginInput flex flex-col">
              <label htmlFor="" className="inter-bold opacity-65 text-sm">
                Full Name
              </label>
              <input
                type="text"
                className="border border-[#aaaaaa3a] text-sm p-3 rounded-sm"
                placeholder="Enter your Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="LoginInput flex flex-col">
              <label htmlFor="" className="inter-bold opacity-65 text-sm">
                Email
              </label>
              <input
                type="email"
                className="border border-[#aaaaaa3a] text-sm p-3 rounded-sm"
                placeholder="Enter your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="LoginInput flex flex-col">
              <label htmlFor="" className="inter-bold opacity-65 text-sm">
                Phone Number
              </label>
              <input
                type="tel"
                className="border border-[#aaaaaa3a] text-sm p-3 rounded-sm"
                placeholder="Enter your Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>

            <div className="LoginInput flex flex-col">
              <label htmlFor="" className="inter-bold opacity-65 text-sm">
                Password
              </label>
              <input
                type="password"
                className="border border-[#aaaaaa3a] text-sm p-3 rounded-sm"
                placeholder="Enter your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="LoginInput flex flex-col">
              <label htmlFor="" className="inter-bold opacity-65 text-sm">
                Confirm Password
              </label>
              <input
                type="password"
                className="border border-[#aaaaaa3a] text-sm p-3 rounded-sm"
                placeholder="Confirm your Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <input
              type="submit"
              value="Register"
              className="bg-[#ff6f61] text-white h-[50px] rounded-[10px] cursor-pointer mt-3"
            />

            <div className="flex flex-row gap-x-1 col-span-2 justify-center pb-5">
              <p>Already have an account? </p>
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
    </div>
  );
}
