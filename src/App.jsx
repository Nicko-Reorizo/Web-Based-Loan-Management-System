import { useState } from "react";

import "./App.css";
import Navbar from "./components/navbar.jsx";
function App() {
  return (
    <>
      <div className="LandingPage bg-[#126d71] h-[100vh] " style={{
    background: "linear-gradient(180deg, #126d71 0%, #0b3d40 100%)",
    boxShadow: "inset 0 -20px 40px -10px rgba(0, 0, 0, 0.6)",
  }}>
        <Navbar />
        <div className="Hero flex flex-col items-center h-[90vh]">
         
          <div className="flex flex-col items-center justify-center gap-y-6 flex-1">
            <p className="poppins-extrabold 2xl:text-[80px] leading-24 text-white text-center">
              Financial Help When <br /> You Need It Most.
            </p>

            <p className="inter-reg text-white 2xl:text-[30px] leading-8 text-center">
              When unexpected expenses arise, we’re here to help. <br />
              Fast, Easy, and Reliable!
            </p>

            <div className="ActionButtons space-x-10">
              <button className="text-white bg-[#ff6f61] inter-bold p-3 py-6 rounded-full text-[20px] w-[300px]">
                Loan Now  
              </button>
              <button className="text-white border-4 border-[#ff6f61] inter-bold p-3 py-6 rounded-full   text-[20px] w-[300px]">
                My Loan Details
              </button>
            </div>
          </div>

         
          <div className="Data flex flex-row justify-center pb-10  text-center">
            <div className="AL px-10 border-r-2 border-[#ffffff69]">
              <p className="text-[#ff6f61] inter-bold text-[40px]">100k+</p>
              <p className="text-white inter-reg">Amount Loanable</p>
            </div>
            <div className="MA px-10 border-r-2 border-[#ffffff69]">
              <p className="text-[#ff6f61] inter-bold text-[40px]">10k+</p>
              <p className="text-white inter-reg">Minimum Amount</p>
            </div>
            <div className="APL px-10">
              <p className="text-[#ff6f61] inter-bold text-[40px]">100+</p>
              <p className="text-white inter-reg">Approved Loans</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
