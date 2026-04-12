import AdminNav from '../components/adminNav.jsx'
import Dashboard from './Dashboard.jsx';
import Borrowers from './Borrowers.jsx';
import Approval from './Approval.jsx'
import Loans from './Loans.jsx'
import { useState } from "react";


export default function MainPage(){

    const [page, setPage] = useState("dashboard");
    


    return(<>
    <div className="flex flex-row">

    <AdminNav setPage={setPage}/>

    <div className="bg-[#dbdbdbf8] w-full" >
        
        {page === "dashboard" && <Dashboard/>}
        {page === "borrowers" && <Borrowers/>}
        {page === "loans" && <Loans/>}
        {page === "approval" && <Approval/>}
    </div>


    </div>
    </>);
}

