
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import Navbar from "./components/navbar.jsx";
import LandingPage from "./ClientPages/LandingPage.jsx";
import LoanNow from "./ClientPages/LoanNow.jsx";
import Details from "./ClientPages/LoanDetails.jsx";

import Login from "./AdminPages/Login.jsx";
import Register from "./AdminPages/Register.jsx";
import Dashboard from "./AdminPages/Dashboard.jsx";
function App() {
  

  return (
    <>
    
     <BrowserRouter>
        
        <Routes>
          
          {/* Client Side */}
          <Route path="/"  element={<LandingPage/>}/>
          <Route path="/loan" element={<LoanNow/>}/>
          <Route path="/details" element={<Details/>} />



          

          {/* Admin Side */}
          <Route path="/adminLogin" element={<Login/>}/>
          <Route path="/adminRegister" element={<Register/>}/>
          <Route path="/adminDashboard" element={<Dashboard/>}/>
        </Routes>
      



      </BrowserRouter>
    </>
  );
}

export default App;