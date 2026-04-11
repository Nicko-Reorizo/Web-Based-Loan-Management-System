import Navbar from "../components/navbar.jsx"
export default function LoanNow({setPage}) {
  return (
    <>
    
      <div
        className="LandingPage bg-[white] h-[100vh] flex justify-center items-center"
        style={{}}
      >
        <form action="">
        <div
          className=" bg-[#f0f0f0] rounded-[15px] p-10 grid grid-cols-2"
          style={{
            boxShadow: "0 0 100px rgba(0,0,0,0.3)",
          }}
        >
          <p className="text-center col-span-2 inter-bold mb-10 text-[25px]">
            LENDING FORM
          </p>

          
          <p className="col-span-2 ml-3  inter-bold">Personal Details</p>

          <div class="input-group">
            <input type="text" required />
            <label>Full Name</label>
          </div>

          <div class="input-group">
            <input type="text" required />
            <label>Phone Number</label>
          </div>

          <div class="input-group">
            <input type="text" required />
            <label>Street</label>
          </div>

          <div class="input-group">
            <input type="text" required />
            <label>City</label>
          </div>

          <div class="input-group">
            <input type="text" required />
            <label>Province</label>
          </div>

          <div class="input-group">
            <input type="text" required />
            <label>ZIP</label>
          </div>

          <p className="col-span-2 ml-3 mt-10 inter-bold">Loan Details</p>

          <div class="input-group">
            <input type="number" required />
            <label>Amount</label>
          </div>

          <div className="input-group">
            <select required defaultValue="1">
              <option value="" disabled hidden></option>
              <option value="1">1 Month</option>
              <option value="3">3 Months</option>
              <option value="6">6 Months</option>
              <option value="12">12 Months</option>
            </select>
            <label>Loan Tenure</label>
          </div>

          <div className="input-group-1 col-span-2">
            <select required defaultValue="">
              <option value="" disabled>
                Select Type
              </option>
              <option value="3">Personal Loan (3%/mo)</option>
              <option value="5">Emergency Loan (5%/mo)</option>
            </select>
            <label>Loan type</label>
          </div>

          <input
            type="submit"
            value="Submit Application"
            className="bg-[#ff6f61] text-white col-span-2 h-[50px] inter-semibold rounded-[10px] cursor-pointer mt-5"
          />
        </div>
        </form>
      </div>
    </>
  );
}

