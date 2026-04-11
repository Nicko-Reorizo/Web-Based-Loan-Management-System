import { Search } from "lucide-react";

export default function LoanDetails({ setPage }) {
  return (
    <div className="flex flex-col justify-center items-center w-full h-[80vh]">
      
      <p className="inter-bold mt-10 text-[50px]">
        Check My Loan
      </p>

      <div className="flex items-center bg-gray-200 rounded-full p-3 w-[700px] shadow-md mt-6">
        
        {/* Input container */}
        <div className="flex items-center flex-1 px-4 gap-2">
          <Search size={25} className="text-gray-500" />

          <input
            type="text"
            placeholder="Enter Loan ID"
            className="bg-transparent outline-none w-full text-lg"
          />
        </div>

        {/* Button */}
        <button className="bg-[#ff6f61] text-white px-8 py-4 rounded-full font-semibold text-lg">
          Search
        </button>
      </div>
    </div>
  );
}