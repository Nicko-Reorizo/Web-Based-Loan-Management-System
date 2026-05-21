import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";


import Navbar from "./components/navbar.jsx";
import LandingPage from "./ClientPages/LandingPage.jsx";
import LoanNow from "./ClientPages/LoanNow.jsx";
import Details from "./ClientPages/LoanDetails.jsx";
import BorrowerInfo from "./ClientPages/BorrowerInfo.jsx";
<<<<<<< HEAD
import ClientLogin from "./ClientPages/Login.jsx";
import ClientRegister from "./ClientPages/Register.jsx";
=======
import ClientDashboard from "./ClientPages/ClientDashboard.jsx";
>>>>>>> 596e165b2e52abb98f164e371b7ecdd601b27519

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
          <Route path="/borrower-info" element={<BorrowerInfo/>}/>
          <Route path="/loan" element={<LoanNow/>}/>
          <Route path="/details" element={<Details/>} />
          <Route path="/clientDashboard" element={<ClientDashboard />} />


          {/* Admin Side */}
          <Route path="/adminLogin" element={<AdminLogin/>}/>
          <Route path="/adminRegister" element={<AdminRegister/>}/>
          <Route path="/adminMainPage" element={<MainPage/>}/>
        </Routes>
      



      </BrowserRouter>
    </>
  );
}

export default App;
