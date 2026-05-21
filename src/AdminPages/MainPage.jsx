import AdminNav from "../components/adminNav.jsx";
import Dashboard from "./Dashboard.jsx";
import Borrowers from "./Borrowers.jsx";
import Approval from "./Approval.jsx";
import Loans from "./Loans.jsx";
import LoanTypes from "./LoanTypes.jsx";
import { useState } from "react";

export default function MainPage() {
  const [page, setPage] = useState("dashboard");

  return (
    <div className="min-h-screen bg-slate-100">
      <AdminNav setPage={setPage} />

      <main className="min-h-screen pt-[70px] lg:ml-[260px] lg:pt-0">
        {page === "dashboard" && <Dashboard />}
        {page === "borrowers" && <Borrowers />}
        {page === "loans" && <Loans />}
        {page === "approval" && <Approval />}
        {page === "loanTypes" && <LoanTypes />}
      </main>
    </div>
  );
}