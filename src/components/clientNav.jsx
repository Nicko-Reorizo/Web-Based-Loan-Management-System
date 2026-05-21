import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ClientNav() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const goTo = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <nav className="relative z-50 flex min-h-[70px] items-center justify-between bg-[#126d71] px-5 sm:px-8 lg:px-20">
      <button
        className="inter-bold text-[20px] text-white"
        onClick={() => goTo("/clientDashboard")}
      >
        LENDIFY
      </button>

      <div className="hidden items-center gap-8 md:flex">
        <button
          className="inter-reg text-[15px] text-white"
          onClick={() => goTo("/clientDashboard")}
        >
          Dashboard
        </button>

        <button
          className="inter-bold rounded-2xl bg-white px-4 py-2 text-[15px] text-[#126d71]"
          onClick={() => goTo("/loan")}
        >
          Loan Now
        </button>
      </div>

      <button
        className="flex flex-col gap-1.5 md:hidden"
        onClick={() => setOpen(!open)}
        aria-label="Toggle client menu"
      >
        <span className="h-0.5 w-6 bg-white"></span>
        <span className="h-0.5 w-6 bg-white"></span>
        <span className="h-0.5 w-6 bg-white"></span>
      </button>

      {open && (
        <div className="absolute left-0 top-[70px] flex w-full flex-col gap-4 bg-[#126d71] px-5 py-5 shadow-lg md:hidden">
          <button
            className="inter-reg text-left text-[15px] text-white"
            onClick={() => goTo("/clientDashboard")}
          >
            Dashboard
          </button>

          <button
            className="inter-bold w-fit rounded-2xl bg-white px-4 py-2 text-[15px] text-[#126d71]"
            onClick={() => goTo("/loan")}
          >
            Loan Now
          </button>
        </div>
      )}
    </nav>
  );
}