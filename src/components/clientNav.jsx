
import { UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ClientNav() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [canLoan, setCanLoan] = useState(true);
const [loanMessage, setLoanMessage] = useState("");

  const authUser = JSON.parse(localStorage.getItem("authUser"));
  const clientId = authUser?.Client_ID || authUser?.client_id || authUser?.id;
  const profileName =
    authUser?.name || authUser?.fullname || authUser?.username || "Client";

  const goTo = (path) => {
    navigate(path);
    setOpen(false);
    setProfileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("authUser");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  useEffect(() => {
  if (!clientId) return;

  fetch(`http://localhost:5000/api/client-loan-eligibility/${clientId}`)
    .then((res) => res.json())
    .then((data) => {
      setCanLoan(data.canLoan);
      setLoanMessage(data.reason);
    })
    .catch((err) => console.error(err));
}, [clientId]);

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
  className={`inter-bold rounded-2xl px-4 py-2 text-[15px] ${
    canLoan
      ? "bg-white text-[#126d71]"
      : "cursor-not-allowed bg-gray-300 text-gray-500"
  }`}
  onClick={() => {
    if (canLoan) {
      goTo("/loan");
    } else {
      alert(loanMessage);
    }
  }}
>
  Loan Now
</button>

        <div className="relative">
          <button
            className="text-white"
            onClick={() => setProfileOpen(!profileOpen)}
            aria-label="Open user menu"
          >
            <UserCircle size={34} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-3 w-48 rounded-xl bg-white py-3 shadow-lg">
              <p className="inter-bold  px-4 pb-3 text-[15px] text-[#126d71]">
                {profileName}
              </p>

              <button
                className="inter-reg w-full rounded-2xl  px-4 py-3 text-center  text-[15px] bg-red-700 text-white hover:bg-red-800"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
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
  className={`inter-bold w-fit rounded-2xl px-4 py-2 text-[15px] ${
    canLoan
      ? "bg-white text-[#126d71]"
      : "cursor-not-allowed bg-gray-300 text-gray-500"
  }`}
  onClick={() => {
    if (canLoan) {
      goTo("/loan");
    } else {
      alert(loanMessage);
    }
  }}
>
  Loan Now
</button>

          <button
            className="flex w-fit items-center gap-2 rounded-2xl bg-white px-4 py-2 text-[#126d71]"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <UserCircle size={24} />
            <span className="inter-bold text-[15px]">Profile</span>
          </button>

          {profileOpen && (
            <div className="w-fit rounded-xl bg-white py-3 shadow-lg">
              <p className="inter-bold  px-4 pb-3 text-[15px] text-[#126d71]">
                {profileName}
              </p>

              <button
                className="inter-reg w-full px-4 py-3 text-left text-[15px] bg-red-700 text-white"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}