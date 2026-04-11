import { useState } from "react";
import "./App.css";

import Navbar from "./components/navbar.jsx";
import LandingPage from "./Client_Pages/LandingPage.jsx";
import LoanNow from "./Client_Pages/LoanNow.jsx";
import Details from "./Client_Pages/LoanDetails.jsx";
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