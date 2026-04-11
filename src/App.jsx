import { useState } from "react";
import "./App.css";

import Navbar from "./components/navbar.jsx";
import LandingPage from "./ClientPages/LandingPage.jsx";
import LoanNow from "./ClientPages/LoanNow.jsx";
import Details from "./ClientPages/LoanDetails.jsx";
function App() {
  const [page, setPage] = useState("landing");

  return (
    <>
     
      <Navbar setPage={setPage}/>
      {page === "landing" && <LandingPage setPage={setPage} />}
      {page === "loan" && <LoanNow setPage={setPage} />}
      {page === "details" && <Details setPage={setPage} />}
    </>
  );
}

export default App;