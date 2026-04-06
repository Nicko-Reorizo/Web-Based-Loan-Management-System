import logo from '../assets/logo.png'

function navbar(){


    return(
    
    <div className="NavBar h-[70px] flex justify-between items-center px-30">
        <div className="logo">
            <img src={logo} alt="" class="w-[60px]"/>
        </div>

        <div className="pages space-x-10 inter-reg">
           <button className='text-white text-[15px]'>Home</button>
           <button className='text-white text-[15px]'>My Loan Details</button>
           <button className='bg-white px-3 rounded-2xl text-[#126d71] font-bold p-1 text-[15px]'>Loan Now</button>
        </div>
    </div>
    )
}



export default navbar