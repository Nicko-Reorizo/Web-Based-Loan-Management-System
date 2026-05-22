import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";


import Navbar from "./components/navbar.jsx";
import LandingPage from "./ClientPages/LandingPage.jsx";
import LoanNow from "./ClientPages/LoanNow.jsx";
import Details from "./ClientPages/LoanDetails.jsx";

import ClientLogin from "./ClientPages/Login.jsx";
import ClientRegister from "./ClientPages/Register.jsx";
import ClientDashboard from "./ClientPages/ClientDashboard.jsx";
import OutstandingLoans from "./ClientPages/OutstandingLoans";
import LoanDetails from "./ClientPages/LoanDetails";
import PaymentHistory from "./ClientPages/PaymentHistory.jsx";

import AdminLogin from "./AdminPages/Login.jsx";
import AdminRegister from "./AdminPages/Register.jsx";
import MainPage from "./AdminPages/MainPage.jsx";
function App() {
  

  return (
    <>
    
     <BrowserRouter>
        
        <Routes>
          
          {/* Client Side */}
          <Route path="/"  element={<LandingPage/>}/>
          <Route path="/login" element={<ClientLogin/>}/>
          <Route path="/signup" element={<ClientRegister/>}/>
          
          <Route path="/loan" element={<LoanNow/>}/>
          <Route path="/details" element={<Details/>} />
          <Route path="/clientDashboard" element={<ClientDashboard />} />
          <Route path="/loan" element={<LoanNow />} />
          <Route path="/paymentHistory" element={<PaymentHistory />} />
          {/* Admin Side */}
          <Route path="/outstandingLoans" element={<OutstandingLoans />} />
          <Route path="/loanDetails/:loanId" element={<LoanDetails />} />
          <Route path="/adminLogin" element={<AdminLogin/>}/>
          <Route path="/adminRegister" element={<AdminRegister/>}/>
          <Route path="/adminMainPage" element={<MainPage/>}/>
        </Routes>
      



      </BrowserRouter>
    </>
  );
}

export default App;
