import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Success! User registered.");
      alert("Please log in now.");
      navigate("/adminLogin");
    } catch (error) {
      console.log(error);
      alert("Server error.");
    }
  };

  return (
    <div className="bg-[#126d71] h-[100vh] w-[100vw] flex justify-center items-center">
      <div
        className="bg-[#f0f0f0] rounded-[15px] p-10 px-20 grid w-[550px]"
        style={{ boxShadow: "0 0 100px rgba(0,0,0,0.3)" }}
      >
        <p className="text-black inter-bold text-[25px] text-center mt-3 mb-5">
          LENDIFY
        </p>

        <p className="inter-reg text-[30px] text-center">Create Account</p>
        <p className="inter-reg text-[#00000075] text-center mb-5">
          Sign up to get started.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-y-4 mt-5">
            <div className="LoginInput flex flex-col">
              <label htmlFor="" className="inter-bold opacity-65 text-sm">
                Full Name
              </label>
              <input
                type="text"
                name=""
                id=""
                className="border border-[#aaaaaa3a] text-sm p-3 rounded-sm"
                placeholder="Enter your Full Name."
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="LoginInput flex flex-col">
              <label htmlFor="" className="inter-bold opacity-65  text-sm">
                Username
              </label>
              <input
                type="text"
                name=""
                id=""
                className="border border-[#aaaaaa3a] text-sm p-3 rounded-sm"
                placeholder="Enter your Preferred Username."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="LoginInput flex flex-col">
              <label htmlFor="" className="inter-bold opacity-65 text-sm">
                Password
              </label>
              <input
                type="password"
                name=""
                id=""
                className="border border-[#aaaaaa3a] text-sm p-3 rounded-sm"
                placeholder="Enter your Password."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="LoginInput flex flex-col">
              <label htmlFor="" className="inter-bold opacity-65 text-sm">
                Re-enter Password
              </label>
              <input
                type="password"
                name=""
                id=""
                className="border border-[#aaaaaa3a] text-sm p-3 rounded-sm"
                placeholder="Enter your Password."
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
                onClick={() => navigate("/adminLogin")}
              >
                Sign in.
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}