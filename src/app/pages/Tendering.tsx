// import { ExternalLink, CheckCircle2, XCircle, FileText } from "lucide-react";

// const tenders = [
//   { id: "DMRR/TENDER/2025/001", proposal: "DMRR/2025/MUM/001", l1Bidder: "ABC Construction Pvt Ltd", amount: "₹398 Lakhs", status: "L1 Pending Approval" },
//   { id: "DMRR/TENDER/2025/002", proposal: "DMRR/2025/PUN/034", l1Bidder: "XYZ Infrastructure", amount: "₹615 Lakhs", status: "Evaluation Complete" },
// ];

// export function Tendering() {
//   return (
//     <div className="space-y-6">
//       <div>
//         <h1>Tendering & Procurement</h1>
//         <p className="text-sm text-muted-foreground">Manage tenders and bid evaluation</p>
//       </div>

//       <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-muted">
//               <tr>
//                 <th className="px-6 py-4 text-left text-sm">Tender ID</th>
//                 <th className="px-6 py-4 text-left text-sm">Proposal ID</th>
//                 <th className="px-6 py-4 text-left text-sm">L1 Bidder</th>
//                 <th className="px-6 py-4 text-left text-sm">L1 Amount</th>
//                 <th className="px-6 py-4 text-left text-sm">Status</th>
//                 <th className="px-6 py-4 text-left text-sm">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {tenders.map((tender, index) => (
//                 <tr key={index} className="border-t border-border hover:bg-muted/50">
//                   <td className="px-6 py-4 font-medium">{tender.id}</td>
//                   <td className="px-6 py-4">{tender.proposal}</td>
//                   <td className="px-6 py-4">{tender.l1Bidder}</td>
//                   <td className="px-6 py-4">{tender.amount}</td>
//                   <td className="px-6 py-4">
//                     <span className="px-2 py-1 bg-secondary/20 text-secondary rounded-full text-xs">
//                       {tender.status}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="flex gap-2">
//                       <button className="px-3 py-1 bg-accent text-accent-foreground rounded text-sm hover:opacity-90">
//                         Approve L1
//                       </button>
//                       <button className="px-3 py-1 bg-destructive text-destructive-foreground rounded text-sm hover:opacity-90">
//                         Reject
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
//         <h3 className="mb-4">Tender Details</h3>
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm mb-2">Tender Reference URL</label>
//             <div className="flex gap-2">
//               <input
//                 type="text"
//                 value="https://mahatenders.gov.in/tender/DMRR-2025-001"
//                 className="flex-1 px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
//               />
//               <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center gap-2">
//                 <ExternalLink className="size-5" />
//                 Open
//               </button>
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm mb-2">L1 Bidder Information</label>
//             <input
//               type="text"
//               placeholder="Enter L1 bidder company name"
//               className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
//             />
//           </div>

//           <div>
//             <label className="block text-sm mb-2">L1 Bid Amount (₹ Lakhs)</label>
//             <input
//               type="number"
//               placeholder="Enter L1 bid amount"
//               className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
//             />
//           </div>

//           <div>
//             <label className="block text-sm mb-2">DMU Concurrence Required</label>
//             <select className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
//               <option>Yes - Forward to DMU</option>
//               <option>No - Proceed Directly</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       <div className="flex gap-4">
//         <button className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90 flex items-center gap-2">
//           <CheckCircle2 className="size-5" />
//           Approve L1 Bidder
//         </button>
//         <button className="px-6 py-3 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 flex items-center gap-2">
//           <XCircle className="size-5" />
//           Reject L1 Bidder
//         </button>
//         <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center gap-2">
//           <FileText className="size-5" />
//           Generate Work Order
//         </button>
//       </div>
//     </div>
//   );
// }


// import { useState } from "react";
// import { Upload, Save, Plus, Trash2 } from "lucide-react";

// const initialTenders = [
//   {
//     id: "DMRR/TENDER/2025/001",
//     proposal: "DMRR/2025/MUM/001",
//     projectName: "Flood Protection Wall",
//     l1Bidder: "ABC Construction Pvt Ltd",
//     amount: "₹398 Lakhs",
//     status: "L1 Pending Approval",
//   },
//   {
//     id: "DMRR/TENDER/2025/002",
//     proposal: "DMRR/2025/PUN/034",
//     projectName: "Check Dam Rehabilitation",
//     l1Bidder: "XYZ Infrastructure",
//     amount: "₹615 Lakhs",
//     status: "Evaluation Complete",
//   },
// ];

// export function Tendering() {
//   const [tenders, setTenders] = useState(initialTenders);
//   const [selectedTender, setSelectedTender] = useState<any>(null);

//   const [formData, setFormData] = useState({
//     publicationDate: "",
//     tenderRefNo: "",
//     tenderUrl: "",

//     vendorName: "",
//     vendorRegNo: "",
//     vendorContactPerson: "",
//     vendorContactNo: "",

//     initiationDate: "",
//     workOrderNo: "",
//     totalTenderCost: "",
//   });

//   const [installments, setInstallments] = useState([
//     {
//       no: 1,
//       date: "",
//       amount: "",
//       remarks: "",
//     },
//   ]);

//   const [documents, setDocuments] = useState({
//     bidEvaluation: null,
//     workOrder: null,
//     tenderNotice: null,
//     others: null,
//   });

//   const handleSave = () => {
//     const updated = tenders.map((tender) =>
//       tender.id === selectedTender.id
//         ? {
//             ...tender,
//             status: "Tender Details Completed",
//           }
//         : tender
//     );

//     setTenders(updated);

//     console.log({
//       tender: selectedTender,
//       formData,
//       installments,
//       documents,
//     });

//     alert("Tender details saved successfully");

//     setSelectedTender(null);
//   };

//   const addInstallment = () => {
//     setInstallments([
//       ...installments,
//       {
//         no: installments.length + 1,
//         date: "",
//         amount: "",
//         remarks: "",
//       },
//     ]);
//   };

//   const removeInstallment = (index: number) => {
//     const updated = [...installments];
//     updated.splice(index, 1);
//     setInstallments(updated);
//   };

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1>Tendering </h1>
//         <p className="text-sm text-muted-foreground">
//           Manage tender activities
//         </p>
//       </div>

//       {/* Tender List */}

//       <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
//         <table className="w-full">
//           <thead className="bg-muted">
//             <tr>
//               <th className="px-6 py-4 text-left">Tender ID</th>
//               <th className="px-6 py-4 text-left">Proposal ID</th>
//               <th className="px-6 py-4 text-left">Project Name</th>
//               <th className="px-6 py-4 text-left">L1 Bidder</th>
//               <th className="px-6 py-4 text-left">L1 Amount</th>
//               <th className="px-6 py-4 text-left">Status</th>
//             </tr>
//           </thead>

//           <tbody>
//             {tenders.map((tender) => (
//               <tr
//                 key={tender.id}
//                 className="border-t border-border"
//               >
//                 <td className="px-6 py-4">{tender.id}</td>
//                 <td className="px-6 py-4">{tender.proposal}</td>
//                 <td className="px-6 py-4 max-w-xs truncate" title={tender.projectName}>{tender.projectName}</td>
//                 <td className="px-6 py-4">{tender.l1Bidder}</td>
//                 <td className="px-6 py-4">{tender.amount}</td>

//                 <td className="px-6 py-4">
//                   <button
//                     onClick={() => {
//                       if (
//                         tender.status ===
//                         "L1 Pending Approval"
//                       ) {
//                         setSelectedTender(tender);
//                       }
//                     }}
//                     className="px-3 py-1 bg-secondary/20 text-secondary rounded-full text-xs"
//                   >
//                     {tender.status}
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Tender Form */}

//       {selectedTender && (
//         <div className="bg-card border border-border rounded-xl p-6 shadow-sm">

//           <h3 className="font-bold text-lg mb-6">
//             Tendering : {selectedTender.proposal} - {selectedTender.projectName}
//           </h3>

//           {/* Tender Publication */}

//           <h4 className="font-semibold mb-4">
//             Tender Publication Details
//           </h4>

//           <div className="grid md:grid-cols-2 gap-4 mb-4">
//             <input
//               type="date"
//               className="border rounded-lg p-2"
//               value={formData.publicationDate}
//               onChange={(e) =>
//                 setFormData({
//                   ...formData,
//                   publicationDate: e.target.value,
//                 })
//               }
//             />

//             <input
//               placeholder="Tender Reference Number"
//               className="border rounded-lg p-2"
//               value={formData.tenderRefNo}
//               onChange={(e) =>
//                 setFormData({
//                   ...formData,
//                   tenderRefNo: e.target.value,
//                 })
//               }
//             />
//           </div>

//           <input
//             placeholder="Tender URL"
//             className="border rounded-lg p-2 w-full mb-6"
//             value={formData.tenderUrl}
//             onChange={(e) =>
//               setFormData({
//                 ...formData,
//                 tenderUrl: e.target.value,
//               })
//             }
//           />

//           {/* Vendor */}

//           <h4 className="font-semibold mb-4">
//             L1 Vendor Information
//           </h4>

//           <div className="grid md:grid-cols-2 gap-4 mb-6">

//             <input
//               placeholder="Vendor Name"
//               className="border rounded-lg p-2"
//             />

//             <input
//               placeholder="Vendor Registration Number"
//               className="border rounded-lg p-2"
//             />

//             <input
//               placeholder="Vendor Contact Person"
//               className="border rounded-lg p-2"
//             />

//             <input
//               placeholder="Vendor Contact Number"
//               className="border rounded-lg p-2"
//             />
//           </div>

//           {/* Work Order */}

//           <h4 className="font-semibold mb-4">
//             Work Order Details
//           </h4>

//           <div className="grid md:grid-cols-3 gap-4 mb-6">

//             <input type="date" className="border rounded-lg p-2" />

//             <input
//               placeholder="Work Order Number"
//               className="border rounded-lg p-2"
//             />

//             <input
//               placeholder="Total Tender Cost"
//               className="border rounded-lg p-2"
//             />
//           </div>

//           {/* Installments */}

//           <div className="flex justify-between items-center mb-4">
//             <h4 className="font-semibold">
//               Running Account Bills
//             </h4>

//             <button
//               onClick={addInstallment}
//               className="px-3 py-1 bg-primary text-white rounded flex items-center gap-2"
//             >
//               <Plus size={16} />
//               Add
//             </button>
//           </div>

//           {installments.map((item, index) => (
//             <div
//               key={index}
//               className="grid grid-cols-12 gap-2 mb-3"
//             >
//               <input
//                 value={item.no}
//                 disabled
//                 className="col-span-1 border rounded p-2"
//               />

//               <input
//                 type="date"
//                 className="col-span-2 border rounded p-2"
//               />

//               <input
//                 placeholder="Amount"
//                 className="col-span-3 border rounded p-2"
//               />

//               <input
//                 placeholder="Remarks"
//                 className="col-span-5 border rounded p-2"
//               />

//               <button
//                 onClick={() => removeInstallment(index)}
//                 className="text-red-500"
//               >
//                 <Trash2 size={16} />
//               </button>
//             </div>
//           ))}

//           {/* Supporting Docs */}

//           <h4 className="font-semibold mt-6 mb-4">
//             Supporting Documents
//           </h4>

//           <div className="flex gap-3 items-center mb-6">
//             <select className="border rounded-lg p-2">
//               <option>Bid Evaluation Report</option>
//               <option>Work Order Copy</option>
//               <option>Tender Notice</option>
//               <option>Other Documents</option>
//             </select>

//             <input
//               type="file"
//               onChange={(e) =>
//                 setDocuments({
//                   ...documents,
//                   bidEvaluation:
//                     e.target.files?.[0] || null,
//                 })
//               }
//             />
//           </div>

//           <button
//             onClick={handleSave}
//             className="px-6 py-3 bg-primary text-primary-foreground rounded-lg flex items-center gap-2"
//           >
//             <Save size={18} />
//             Save
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }





import { useState } from "react";
import { Upload, Save, Plus, Trash2 } from "lucide-react";

const initialTenders = [
  {
    id: "DMRR/TENDER/2025/001",
    proposal: "DMRR/2025/MUM/001",
    projectName: "Flood Protection Wall",
    l1Bidder: "ABC Construction Pvt Ltd",
    amount: "₹398 Lakhs",
    status: "L1 Pending Approval",
  },
  {
    id: "DMRR/TENDER/2025/002",
    proposal: "DMRR/2025/PUN/034",
    projectName: "Check Dam Rehabilitation",
    l1Bidder: "XYZ Infrastructure",
    amount: "₹615 Lakhs",
    status: "Evaluation Complete",
  },
];

export function Tendering() {
  const [tenders, setTenders] = useState(initialTenders);
  const [selectedTender, setSelectedTender] = useState<any>(null);

  const [formData, setFormData] = useState({
  tenderRefNo: "",
  l1VendorIdentified: "",
  vendorName: "",
  workOrderIssued: "",
  workOrderIssuedDate: "",
  biddingCost: "",
});

  // const [installments, setInstallments] = useState([
  //   {
  //     no: 1,
  //     date: "",
  //     amount: "",
  //     remarks: "",
  //   },
  // ]);

const [documents, setDocuments] = useState({
  dmrrLetter: null,
  tenderNotice: null,
  bidEvaluationReport: null,
  workOrderCopy: null,
});

  const handleSave = () => {
    const updated = tenders.map((tender) =>
      tender.id === selectedTender.id
        ? {
            ...tender,
            status: "Tender Details Completed",
          }
        : tender
    );

    setTenders(updated);

    console.log({
      tender: selectedTender,
      formData,
      installments,
      documents,
    });

    alert("Tender details saved successfully");

    setSelectedTender(null);
  };

  const addInstallment = () => {
    setInstallments([
      ...installments,
      {
        no: installments.length + 1,
        date: "",
        amount: "",
        remarks: "",
      },
    ]);
  };

  const removeInstallment = (index: number) => {
    const updated = [...installments];
    updated.splice(index, 1);
    setInstallments(updated);
  };

  return (
    <div className="space-y-[24px]">
      <div>
        <h1 className="text-[30px] font-bold text-[#0B1F4D]">Tendering</h1>
        <p className="text-[14px] font-medium text-gray-500 mt-1">
          Manage tender activities
        </p>
      </div>

      {/* Tender List */}

      <div className="bg-white rounded-[12px] shadow-sm border border-gray-200 overflow-hidden mb-[24px]">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left">
            <thead className="bg-[#F5F7FA] text-[#0B1F4D]">
              <tr className="h-[56px]">
                <th className="px-4 font-semibold whitespace-nowrap">Tender ID</th>
                <th className="px-4 font-semibold whitespace-nowrap">Proposal ID</th>
                <th className="px-4 font-semibold whitespace-nowrap">Project Name</th>
                <th className="px-4 font-semibold whitespace-nowrap">L1 Bidder</th>
                <th className="px-4 font-semibold whitespace-nowrap">L1 Amount</th>
                <th className="px-4 font-semibold whitespace-nowrap">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {tenders.map((tender) => (
                <tr
                  key={tender.id}
                  className="hover:bg-blue-50/50 transition-colors h-[56px] even:bg-gray-50/50"
                >
                  <td className="px-4 font-medium text-[#0B1F4D] whitespace-nowrap">{tender.id}</td>
                  <td className="px-4">{tender.proposal}</td>
                  <td className="px-4 max-w-xs truncate" title={tender.projectName}>{tender.projectName}</td>
                  <td className="px-4">{tender.l1Bidder}</td>
                  <td className="px-4">{tender.amount}</td>

                  <td className="px-4">
                    <button
                      onClick={() => {
                        if (
                          tender.status ===
                          "L1 Pending Approval"
                        ) {
                          setSelectedTender(tender);
                        }
                      }}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-100"
                    >
                      {tender.status}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tender Form */}

      {selectedTender && (
        <div className="bg-white border border-gray-200 rounded-[12px] p-[24px] shadow-sm">

          <h3 className="font-semibold text-[20px] text-[#0B1F4D] mb-[24px]">
            Tendering : {selectedTender.proposal} - {selectedTender.projectName}
          </h3>

          {/* Tender Publication */}

<h4 className="font-semibold text-[16px] text-gray-900 mb-[16px]">
  Tender Publication Details
</h4>

<div className="mb-[24px]">
  <input
    placeholder="Tender Reference Number"
    className="w-full px-3 h-[40px] border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20"
    value={formData.tenderRefNo}
    onChange={(e) =>
      setFormData({
        ...formData,
        tenderRefNo: e.target.value,
      })
    }
  />
</div>

          {/* Vendor */}

          {/* <h4 className="font-semibold mb-4">
            L1 Vendor Information
          </h4>

          <div className="grid md:grid-cols-2 gap-4 mb-6">

            <input
              placeholder="Vendor Name"
              className="border rounded-lg p-2"
            />

            <input
              placeholder="Vendor Registration Number"
              className="border rounded-lg p-2"
            />

            <input
              placeholder="Vendor Contact Person"
              className="border rounded-lg p-2"
            />

            <input
              placeholder="Vendor Contact Number"
              className="border rounded-lg p-2"
            />
          </div> */}

          {/* Work Order */}
{/* 
          <h4 className="font-semibold mb-4">
            Work Order Details
          </h4>

          <div className="grid md:grid-cols-3 gap-4 mb-6">

            <input type="date" className="border rounded-lg p-2" />

            <input
              placeholder="Work Order Number"
              className="border rounded-lg p-2"
            />

            <input
              placeholder="Total Tender Cost"
              className="border rounded-lg p-2"
            />
          </div> */}

          {/* Installments */}

          {/* <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold">
              Running Account Bills
            </h4>

            <button
              onClick={addInstallment}
              className="px-3 py-1 bg-primary text-white rounded flex items-center gap-2"
            >
              <Plus size={16} />
              Add
            </button>
          </div>

          {installments.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-2 mb-3"
            >
              <input
                value={item.no}
                disabled
                className="col-span-1 border rounded p-2"
              />

              <input
                type="date"
                className="col-span-2 border rounded p-2"
              />

              <input
                placeholder="Amount"
                className="col-span-3 border rounded p-2"
              />

              <input
                placeholder="Remarks"
                className="col-span-5 border rounded p-2"
              />

              <button
                onClick={() => removeInstallment(index)}
                className="text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))} */}

          {/* Supporting Docs */}

          <h4 className="font-semibold text-[16px] text-gray-900 mt-[24px] mb-[16px]">
            Supporting Documents
          </h4>

          <div className="flex gap-[16px] items-center mb-[24px]">
            <select className="px-3 h-[40px] border border-gray-200 rounded-[10px] bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20">
              <option>Bid Evaluation Report</option>
              <option>Work Order Copy</option>
              <option>Tender Notice</option>
              <option>Other Documents</option>
            </select>

            <input
              type="file"
              className="text-[14px] file:mr-4 file:py-2 file:px-4 file:rounded-[10px] file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              onChange={(e) =>
                setDocuments({
                  ...documents,
                  bidEvaluationReport:
                    e.target.files?.[0] || null,
                })
              }
            />
          </div>

          <div className="flex justify-end border-t border-gray-200 pt-[16px]">
            <button
              onClick={handleSave}
              className="px-[16px] h-[40px] bg-[#0B1F4D] text-white rounded-[10px] flex items-center justify-center gap-2 hover:bg-[#0B1F4D]/90 transition-all text-sm font-medium"
            >
              <Save size={18} />
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}