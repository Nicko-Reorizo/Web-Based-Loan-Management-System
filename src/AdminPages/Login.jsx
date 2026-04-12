import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Login successful.");
      navigate("/adminMainPage");
    } catch (error) {
      console.log(error);
      alert("Server error.");
    }
  };

  return (
    <>
      <div className="Login bg-[#126d71] h-[100vh] w-[100vw]">
        <div className="flex justify-center items-center min-h-full ">
          <div
            className=" bg-[#f0f0f0] rounded-[15px] p-10 px-20 grid w-[550px] grid-cols-2 justify-center"
            style={{
              boxShadow: "0 0 100px rgba(0,0,0,0.3)",
            }}
          >
            <p className="text-black inter-bold text-[25px] col-span-2 text-center mt-3 mb-5">
              LENDIFY
            </p>
            <p className="inter-reg text-[30px] col-span-2 text-center">
              Welcome back!
            </p>
            <p className="inter-reg text-[#00000075] col-span-2 text-center">
              Please log in to your account.
            </p>

            <div className="flex flex-col col-span-2 ">
              <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
                <div className="LoginInput flex flex-col mt-10">
                  <label htmlFor="" className="inter-bold opacity-65 text-sm">
                    Username
                  </label>
                  <input
                    type="text"
                    name=""
                    id=""
                    className="border border-[#aaaaaa3a] text-sm p-3 rounded-sm"
                    placeholder="Enter your Username."
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

                <input
                  type="submit"
                  value="Sign in."
                  className="bg-[#ff6f61] text-white col-span-2 h-[50px]  w-full inter-semibold rounded-[10px] cursor-pointer mt-5"
                />
              </form>

              <div className="flex flex-row gap-x-1 col-span-2 justify-center pb-5 mt-5">
                <p>Don't have an account? </p>
                <button
                  type="button"
                  className="underline text-blue-800"
                  onClick={() => navigate("/adminRegister")}
                >
                  Sign up.
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}