import { useState } from "react";
import { BarChart3, Users, CheckCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminNav({ setPage }) {
  const [active, setActive] = useState("dashboard");
  const navigate = useNavigate();

  const btnClass = (name) =>
    `flex text-[17.5px] p-3 px-5 inter-bold gap-x-4 items-center rounded-[50px] transition-all
     ${
       active === name
         ? "bg-[#126d71] text-white shadow-[0_0_12px_rgba(18,109,113,0.6)]"
         : "text-[#0406067e] hover:bg-gray-100"
     }`;

  return (
    <div className="flex w-[15vw] h-[100vh] p-5">
      <div className="navPages flex flex-col space-y-3 w-full h-full">
        <p className="inter-bold text-[35px]  p-5">LENDIFY</p>

        <button
          onClick={() => {
            setActive("dashboard");
            setPage("dashboard");
          }}
          className={btnClass("dashboard")}
        >
          <BarChart3 size={20} />
          Dashboard
        </button>

        <button
          onClick={() => {
            setActive("borrowers");
            setPage("borrowers");
          }}
          className={btnClass("borrowers")}
        >
          <Users size={20} />
          Borrowers
        </button>

        <button
          onClick={() => {
            setActive("approval");
            setPage("approval");
          }}
          className={btnClass("approval")}
        >
          <CheckCircle size={20} />
          Approval
        </button>

        <button
          className="flex text-[17.5px] p-3 px-5 inter-bold gap-x-4 items-center rounded-[50px] transition-all text-red-500 hover:bg-red-50 mt-auto"
          onClick={() => navigate("/adminLogin")}
        >
          <LogOut size={20} />
          Log Out
        </button>
      </div>
    </div>
  );
}
