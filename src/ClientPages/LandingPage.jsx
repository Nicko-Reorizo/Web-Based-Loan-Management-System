import "../App.css";
import Navbar from "../components/navbar.jsx";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      <div
        className="LandingPage min-h-screen bg-[#126d71]"
        style={{
          background: "linear-gradient(180deg, #126d71 0%, #0b3d40 100%)",
          boxShadow: "inset 0 -20px 40px -10px rgba(0, 0, 0, 0.6)",
        }}
      >
        <div className="Hero flex min-h-[90vh] flex-col items-center px-5 sm:px-8">
          <div className="flex flex-1 flex-col items-center justify-center gap-y-5 text-center sm:gap-y-6">
            <p className="poppins-extrabold text-[38px] leading-tight text-white sm:text-[52px] md:text-[64px] lg:text-[72px] 2xl:text-[80px]">
              Financial Help When <br className="hidden sm:block" />
              You Need It Most.
            </p>

            <p className="inter-reg text-[17px] leading-7 text-white sm:text-[22px] md:text-[26px] 2xl:text-[30px]">
              When unexpected expenses arise, we’re here to help. <br className="hidden sm:block" />
              Fast, Easy, and Reliable!
            </p>

            <div className="ActionButtons flex w-full flex-col gap-4 pt-2 sm:w-auto sm:flex-row sm:gap-10">
              <button
                className="inter-bold w-full rounded-full bg-[#ff6f61] p-3 py-4 text-[18px] text-white sm:w-[260px] md:w-[300px] md:py-6 md:text-[20px]"
                onClick={() => navigate("/signup")}
              >
                Loan Now
              </button>

              <button
                className="inter-bold w-full rounded-full border-4 border-[#ff6f61] p-3 py-4 text-[18px] text-white sm:w-[260px] md:w-[300px] md:py-6 md:text-[20px]"
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>
            </div>
          </div>

          <div className="Data flex w-full flex-col justify-center gap-y-5 pb-8 text-center sm:w-auto sm:flex-row sm:gap-y-0 sm:pb-10">
            <div className="AL border-b-2 border-[#ffffff69] px-10 pb-5 sm:border-b-0 sm:border-r-2 sm:pb-0">
              <p className="inter-bold text-[34px] text-[#ff6f61] sm:text-[40px]">
                100k+
              </p>
              <p className="inter-reg text-white">Amount Loanable</p>
            </div>

            <div className="MA border-b-2 border-[#ffffff69] px-10 pb-5 sm:border-b-0 sm:border-r-2 sm:pb-0">
              <p className="inter-bold text-[34px] text-[#ff6f61] sm:text-[40px]">
                100+
              </p>
              <p className="inter-reg text-white">Minimum Amount</p>
            </div>

            <div className="APL px-10">
              <p className="inter-bold text-[34px] text-[#ff6f61] sm:text-[40px]">
                100+
              </p>
              <p className="inter-reg text-white">Approved Loans</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
