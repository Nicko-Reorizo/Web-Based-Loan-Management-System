export default function Approval(){
    const pending = 1;
    return(
    <>
    <div className="p-8 bg-[#f5f6f8] min-h-screen">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          Approval Page
        </h1>
        <p className="text-gray-500 mt-1">
          {pending} pending loan application.
        </p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-md p-8 flex  h-[80vh]">
          
      </div>
      
      
    </div>   
    </>
    );
}