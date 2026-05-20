import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="NavBar relative z-50 flex min-h-[70px] items-center justify-between bg-[#126d71] px-5 sm:px-8 lg:px-20 xl:px-30">
      <button
        className="inter-bold text-[20px] text-white"
        onClick={() => navigate("/")}
      >
        LENDIFY
      </button>

      <div className="hidden items-center space-x-10 inter-reg md:flex">
        <button className="text-[15px] text-white" onClick={() => navigate("/")}>
          Home
        </button>

        <button
          className="text-[15px] text-white"
          onClick={() => navigate("/details")}
        >
          My Loan Details
        </button>

        <button
          className="rounded-2xl bg-white px-3 py-1 text-[15px] font-bold text-[#126d71]"
          onClick={() => navigate("/loan")}
        >
          Loan Now
        </button>
      </div>

      <button
        className="flex flex-col gap-1.5 md:hidden"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <span className="h-0.5 w-6 bg-white"></span>
        <span className="h-0.5 w-6 bg-white"></span>
        <span className="h-0.5 w-6 bg-white"></span>
      </button>

      {open && (
        <div className="absolute left-0 top-[70px] flex w-full flex-col gap-4 bg-[#126d71] px-5 py-5 text-left shadow-lg md:hidden">
          <button
            className="text-left text-[15px] text-white"
            onClick={() => {
              navigate("/");
              setOpen(false);
            }}
          >
            Home
          </button>

          <button
            className="text-left text-[15px] text-white"
            onClick={() => {
              navigate("/details");
              setOpen(false);
            }}
          >
            My Loan Details
          </button>

          <button
            className="w-fit rounded-2xl bg-white px-3 py-1 text-[15px] font-bold text-[#126d71]"
            onClick={() => {
              navigate("/loan");
              setOpen(false);
            }}
          >
            Loan Now
          </button>
        </div>
      )}
    </div>
  );
}