import logo from '../assets/logo.png'
import { useNavigate } from "react-router-dom";

export default function navbar({ setPage }){

const navigate = useNavigate();

    return(
    
    <div className="NavBar h-[70px] flex justify-between items-center px-30 bg-[#126d71]">
        <div className="logo flex flex-col">
            <a href="#">
            
            <button className='text-white inter-bold text-[20px]' onClick={()=>navigate("/")}>LENDIFY</button>
            </a>
        </div>

        <div className="pages space-x-10 inter-reg">
           <button className='text-white text-[15px]' onClick={()=>navigate("/")} >Home</button>
           <button className='text-white text-[15px]'  onClick={()=>navigate("/details")}>My Loan Details</button>
           <button className='bg-white px-3 rounded-2xl text-[#126d71] font-bold p-1 text-[15px]' onClick={()=>navigate("/loan")}>Loan Now</button>
        </div>
    </div>
    )
}



