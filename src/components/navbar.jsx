import logo from '../assets/logo.png'

export default function navbar({ setPage }){


    return(
    
    <div className="NavBar h-[70px] flex justify-between items-center px-30 bg-[#126d71]">
        <div className="logo flex flex-col">
            <a href="#">
            
            <p className='text-white inter-bold text-[20px]'>LENDIFY</p>
            </a>
        </div>

        <div className="pages space-x-10 inter-reg">
           <button className='text-white text-[15px]' onClick={()=>setPage("landing")} >Home</button>
           <button className='text-white text-[15px]'  onClick={()=>setPage("details")}>My Loan Details</button>
           <button className='bg-white px-3 rounded-2xl text-[#126d71] font-bold p-1 text-[15px]' onClick={()=>setPage("loan")}>Loan Now</button>
        </div>
    </div>
    )
}



