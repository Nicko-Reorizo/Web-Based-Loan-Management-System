import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

export default function Borrowers() {
  const [borrowers, setBorrowers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    
    fetch("http://localhost:5000/api/borrowers")
      .then((res) => res.json())
      .then((data) => setBorrowers(data))
      .catch((err) => console.error("Failed to fetch borrowers:", err));
  }, []);

  const filteredBorrowers = useMemo(() => {
    return borrowers.filter((b) => {
      const q = search.toLowerCase();

      return (
        String(b.Client_ID).toLowerCase().includes(q) ||
        String(b.Client_FullName).toLowerCase().includes(q) ||
        String(b.Street).toLowerCase().includes(q) ||
        String(b.City).toLowerCase().includes(q) ||
        String(b.Province).toLowerCase().includes(q) ||
        String(b.ZIP).toLowerCase().includes(q) ||
        String(b.Phone_Number).toLowerCase().includes(q)
      );
    });
  }, [borrowers, search]);

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">
              Borrowers
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {filteredBorrowers.length} borrower(s) found
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search borrowers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <div className="max-h-[75vh] overflow-y-auto">
              <table className="min-w-full text-left">
                <thead className="sticky top-0 z-10 bg-slate-900 text-sm text-white">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Client ID</th>
                    <th className="px-6 py-4 font-semibold">Client FullName</th>
                    <th className="px-6 py-4 font-semibold">Street</th>
                    <th className="px-6 py-4 font-semibold">City</th>
                    <th className="px-6 py-4 font-semibold">Province</th>
                    <th className="px-6 py-4 font-semibold">ZIP</th>
                    <th className="px-6 py-4 font-semibold">Phone Number</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {filteredBorrowers.length > 0 ? (
                    filteredBorrowers.map((borrower) => (
                      <tr
                        key={borrower.Client_ID}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {borrower.Client_ID}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                              {String(borrower.Client_FullName || "")
                                .split(" ")
                                .map((word) => word[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()}
                            </div>
                            <span className="font-medium text-slate-800">
                              {borrower.Client_FullName}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">{borrower.Street}</td>
                        <td className="px-6 py-4">{borrower.City}</td>
                        <td className="px-6 py-4">{borrower.Province}</td>
                        <td className="px-6 py-4">{borrower.ZIP}</td>
                        <td className="px-6 py-4">{borrower.Phone_Number}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <div className="mx-auto max-w-sm">
                          <div className="mb-3 text-lg font-semibold text-slate-700">
                            No borrowers found
                          </div>
                          <p className="text-sm text-slate-500">
                            Try a different search or check your database
                            connection.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}