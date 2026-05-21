import { useState } from "react";
import {
  BarChart3,
  Users,
  CheckCircle,
  LogOut,
  FileText,
  Tags,
  Menu,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminNav({ setPage }) {
  const [active, setActive] = useState("dashboard");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const changePage = (name) => {
    setActive(name);
    setPage(name);
    setOpen(false);
  };

  const btnClass = (name) =>
    `flex w-full items-center gap-x-4 rounded-2xl px-4 py-3 text-left text-[15px] font-bold transition-all sm:text-[16px]
     ${
       active === name
         ? "bg-[#126d71] text-white shadow-[0_0_12px_rgba(18,109,113,0.35)] lg:bg-[#126d71] lg:text-[white]"
         : "text-white/90 hover:bg-white/15 lg:text-[#040606a8] lg:hover:bg-gray-100"
     }`;

  return (
    <>
      <header className="fixed left-0 top-0 z-50 flex h-[70px] w-full items-center justify-between bg-[#126d71] px-5 text-white shadow-md lg:hidden">
        <button
          className="inter-bold text-[20px]"
          onClick={() => changePage("dashboard")}
        >
          LENDIFY
        </button>

        <button onClick={() => setOpen(!open)} aria-label="Toggle admin menu">
          {open ? <X size={30} /> : <Menu size={30} />}
        </button>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col bg-[#126d71] p-5 text-white shadow-xl transition-transform duration-300 lg:translate-x-0 lg:bg-white lg:text-slate-900 lg:shadow-none
        ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <p className="inter-bold mb-8 mt-[70px] px-2 text-[28px] lg:mt-0 lg:text-[32px]">
          LENDIFY
        </p>

        <div className="flex flex-1 flex-col gap-3">
          <button onClick={() => changePage("dashboard")} className={btnClass("dashboard")}>
            <BarChart3 size={20} />
            Dashboard
          </button>

          <button onClick={() => changePage("borrowers")} className={btnClass("borrowers")}>
            <Users size={20} />
            Borrowers
          </button>

          <button onClick={() => changePage("loans")} className={btnClass("loans")}>
            <FileText size={20} />
            Loans
          </button>

          <button onClick={() => changePage("approval")} className={btnClass("approval")}>
            <CheckCircle size={20} />
            Approval
          </button>

          <button onClick={() => changePage("loanTypes")} className={btnClass("loanTypes")}>
            <Tags size={20} />
            Loan Types
          </button>

          <button
            className="mt-auto flex w-full items-center gap-x-4 rounded-2xl px-4 py-3 text-left text-[15px] font-bold text-red-100 transition-all hover:bg-red-500/20 sm:text-[16px] lg:text-red-500 lg:hover:bg-red-50"
            onClick={() => navigate("/adminLogin")}
          >
            <LogOut size={20} />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}