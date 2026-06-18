// import { useState } from "react";
// import {
//   CheckCircle2,
//   XCircle,
//   RefreshCw,
//   Plus,
//   Trash2,
//   Send
// } from "lucide-react";
// import { useNavigate } from "react-router";

// const initialProposals = [
//   { 
//     id: "DMRR/2025/MUM/001", 
//     projectName: "Flood Protection Wall", 
//     district: "Mumbai", 
//     requested: 450, 
//     cumulativeAllocation: 1200, 
//     status: "Pending" 
//   },
//   { 
//     id: "DMRR/2025/PUN/034", 
//     projectName: "River Deepening Project", 
//     district: "Pune", 
//     requested: 680, 
//     cumulativeAllocation: 2500, 
//     status: "Pending" 
//   },
//   { 
//     id: "DMRR/2025/NAG/015", 
//     projectName: "Storm Water Drainage", 
//     district: "Nagpur", 
//     requested: 520, 
//     cumulativeAllocation: 1900, 
//     status: "Revised",
//     lastMeetingDate: "2025-10-12",
//     lastComments: "Please revise the cumulative allocation numbers and provide proper flood estimation documents.",
//     lastMembers: [
//         { srNo: 1, name: "Rahul Deshmukh", designation: "Chief Engineer" },
//         { srNo: 2, name: "Anita Patil", designation: "District Collector" }
//     ]
//   },
//   { 
//     id: "DMRR/2025/KOL/022", 
//     projectName: "Landslide Mitigation Works", 
//     district: "Kolhapur", 
//     requested: 350, 
//     cumulativeAllocation: 1450, 
//     status: "Revised",
//     lastMeetingDate: "2025-09-28",
//     lastComments: "Soil testing report missing. Please re-submit with the updated report.",
//     lastMembers: [
//         { srNo: 1, name: "Vikram Pawar", designation: "Superintending Engineer" }
//     ]
//   },
// ];

// interface Member {
//   srNo: number;
//   name: string;
//   designation: string;
// }

// export function PACEvaluation() {
//   const navigate = useNavigate();

// const pendingProposalsData = [
// {
// id:"DMRR/2025/MUM/001",
// projectName:"Flood Protection Wall",
// district:"Mumbai",
// requested:450,
// cumulativeAllocation:1200,
// status:"Pending"
// },
// {
// id:"DMRR/2025/PUN/034",
// projectName:"River Deepening Project",
// district:"Pune",
// requested:680,
// cumulativeAllocation:2500,
// status:"Pending"
// },
// {
// id:"DMRR/2025/NAS/021",
// projectName:"Dam Strengthening",
// district:"Nashik",
// requested:530,
// cumulativeAllocation:1900,
// status:"Pending"
// },
// {
// id:"DMRR/2025/THA/015",
// projectName:"Storm Water Drainage",
// district:"Thane",
// requested:350,
// cumulativeAllocation:1400,
// status:"Pending"
// }
// ];

// const revisedProposalsData = [
// {
// id:"DMRR/2025/NAG/015",
// projectName:"Storm Water Drainage",
// district:"Nagpur",
// requested:520,
// cumulativeAllocation:1900,
// status:"Revised",
// lastMeetingDate:"2025-10-12",
// lastComments:"Please revise cumulative allocation numbers.",
// lastMembers:[
// {
// srNo:1,
// name:"Rahul Deshmukh",
// designation:"Chief Engineer"
// },
// {
// srNo:2,
// name:"Anita Patil",
// designation:"District Collector"
// }
// ]
// },

// {
// id:"DMRR/2025/KOL/022",
// projectName:"Landslide Mitigation Works",
// district:"Kolhapur",
// requested:350,
// cumulativeAllocation:1450,
// status:"Revised",
// lastMeetingDate:"2025-09-28",
// lastComments:"Updated soil report required.",
// lastMembers:[
// {
// srNo:1,
// name:"Vikram Pawar",
// designation:"Superintending Engineer"
// }
// ]
// },

// {
// id:"DMRR/2025/AUR/018",
// projectName:"River Embankment",
// district:"Aurangabad",
// requested:410,
// cumulativeAllocation:1600,
// status:"Revised",
// lastMeetingDate:"2025-09-10",
// lastComments:"Need revised flood estimation.",
// lastMembers:[
// {
// srNo:1,
// name:"Sachin More",
// designation:"Executive Engineer"
// }
// ]
// },

// {
// id:"DMRR/2025/SAT/012",
// projectName:"Canal Strengthening",
// district:"Satara",
// requested:390,
// cumulativeAllocation:1350,
// status:"Revised",
// lastMeetingDate:"2025-08-30",
// lastComments:"Attach hydraulic analysis.",
// lastMembers:[
// {
// srNo:1,
// name:"Amit Kulkarni",
// designation:"Chief Engineer"
// }
// ]
// }
// ];

// const [activeTab,setActiveTab] = useState("new");

// const [pendingProposals,setPendingProposals] =
// useState(pendingProposalsData);

// const [revisionList,setRevisionList] =
// useState(revisedProposalsData);
  
//   const [selectedProposal, setSelectedProposal] = useState<any>(null);

//   const [meetingDate, setMeetingDate] = useState("");
//   const [meetingTime, setMeetingTime] = useState("");
  
//   const [members, setMembers] = useState<Member[]>([
//     { srNo: 1, name: "", designation: "" }
//   ]);
  
//   const [attendanceSheet, setAttendanceSheet] = useState<File | null>(null);

//   const [decision, setDecision] = useState("");

//   const [momFile, setMomFile] = useState<File | null>(null);
//   const [comments, setComments] = useState("");

//   const addRow = () => {
//     setMembers([
//       ...members,
//       {
//         srNo: members.length + 1,
//         name: "",
//         designation: "",
//       },
//     ]);
//   };

//   const removeRow = (index: number) => {
//     setMembers(
//       members
//         .filter((_, i) => i !== index)
//         .map((m, idx) => ({
//           ...m,
//           srNo: idx + 1,
//         }))
//     );
//   };

//   const handleForwardToTAC = () => {
//     if (!meetingDate || !meetingTime || !attendanceSheet || !momFile || members.some(m => !m.name || !m.designation)) {
//         alert("Please complete all mandatory fields and upload required files.");
//         return;
//     }
    
//     if(activeTab==="new"){
// setPendingProposals(
// pendingProposals.filter(
// p=>p.id!==selectedProposal.id
// )
// );
// }
// else{
// setRevisionList(
// revisionList.filter(
// p=>p.id!==selectedProposal.id
// )
// );
// }

// setSelectedProposal(null);

// alert(
// `${selectedProposal.id} forwarded successfully to TAC`
// );

// navigate("/tac-appraisal");
//   };

//   const handleReject = () => {
//      if (!meetingDate || !meetingTime || !attendanceSheet || members.some(m => !m.name || !m.designation) || !comments.trim()) {
//         alert("Please complete all mandatory fields, upload required files and enter rejection reasons.");
//         return;
//     }
//     alert("Proposal Rejected.");
//     resetForm();
//   };

//   const handleRevision = () => {
//      if (!meetingDate || !meetingTime || !attendanceSheet || members.some(m => !m.name || !m.designation) || !comments.trim()) {
//         alert("Please complete all mandatory fields, upload required files and enter observation notes.");
//         return;
//     }
//     alert("Proposal sent for revision.");
//     resetForm();
//   };

//   const resetForm = () => {
//     setSelectedProposal(null);
//     setDecision("");
//     setMomFile(null);
//     setAttendanceSheet(null);
//     setComments("");
//     setMeetingDate("");
//     setMeetingTime("");
//     setMembers([{ srNo: 1, name: "", designation: "" }]);
//   };

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1>PAC Evaluation</h1>
//         <p className="text-sm text-muted-foreground">High-Powered Committee Review and Allocation Validation</p>
//       </div>

//       <div className="flex gap-4">

// <button
// onClick={()=>{
// setActiveTab("new");
// setSelectedProposal(null);
// }}
// className={`px-5 py-2 rounded-lg font-medium ${
// activeTab==="new"
// ?"bg-primary text-white"
// :"bg-muted"
// }`}
// >
// New Proposals
// </button>

// <button
// onClick={()=>{
// setActiveTab("revised");
// setSelectedProposal(null);
// }}
// className={`px-5 py-2 rounded-lg font-medium ${
// activeTab==="revised"
// ?"bg-primary text-white"
// :"bg-muted"
// }`}
// >
// Revised Proposals
// </button>

// </div>

//       <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
//         <table className="w-full">
//           <thead className="bg-muted">
//             <tr>
//               <th className="px-6 py-4 text-left text-sm font-medium">Proposal ID</th>
//               <th className="px-6 py-4 text-left text-sm font-medium">Project Name</th>
//               <th className="px-6 py-4 text-left text-sm font-medium">District</th>
//               <th className="px-6 py-4 text-left text-sm font-medium">Requested (₹ Lakhs)</th>
//               <th className="px-6 py-4 text-left text-sm font-medium">Cumulative District Allocation</th>
//               <th className="px-6 py-4 text-left text-sm font-medium">Status</th>
//             </tr>
//           </thead>
//           <tbody>
//          {
// (activeTab==="new"
// ? pendingProposals
// : revisionList
// ).map((proposal)=>(
//               <tr 
//                 key={proposal.id} 
//                 className={`border-t border-border hover:bg-muted/50 cursor-pointer transition-colors ${selectedProposal?.id === proposal.id ? 'bg-primary/5' : ''}`}
//               onClick={() => {
//   setSelectedProposal(proposal);

//   setDecision("");
//   setMomFile(null);
//   setAttendanceSheet(null);
//   setComments("");
//   setMeetingDate("");
//   setMeetingTime("");

//   setMembers([
//     {
//       srNo: 1,
//       name: "",
//       designation: "",
//     },
//   ]);
// }}
//               >
//                 <td className="px-6 py-4 text-sm font-medium">{proposal.id}</td>
//                 <td className="px-6 py-4 text-sm">{proposal.projectName}</td>
//                 <td className="px-6 py-4 text-sm">{proposal.district}</td>
//                 <td className="px-6 py-4 text-sm font-bold text-accent">₹{proposal.requested}</td>
//                 <td className="px-6 py-4 text-sm">₹{proposal.cumulativeAllocation}</td>
//                 <td className="px-6 py-4">
//                   <span className={`px-3 py-1 rounded-full text-xs font-medium ${proposal.status === 'Pending' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
//                     {proposal.status}
//                   </span>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//      {selectedProposal && (
//   <div className="space-y-6">
//      {activeTab === "revised" && (
//       <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
//               <h3 className="mb-4 text-lg font-bold border-b pb-2">
//                 Last Meeting Details
//               </h3>
              
//               <div className="space-y-6">
//                  <div>
//                     <label className="block text-sm font-medium mb-2">Last Meeting Date</label>
//                     <input
//                         type="date"
//                         value={selectedProposal.lastMeetingDate}
//                         disabled
//                         className="w-full px-4 py-3 bg-muted border border-border rounded-lg"
//                     />
//                 </div>
                
//                 {/* <div className="space-y-3">
//                   <h4 className="font-semibold text-sm">Last Members Present</h4>
//                   <table className="w-full border border-border rounded-lg overflow-hidden">
//                     <thead className="bg-muted">
//                       <tr>
//                         <th className="p-3 border text-left text-sm font-medium">Sr No</th>
//                         <th className="p-3 border text-left text-sm font-medium">Name</th>
//                         <th className="p-3 border text-left text-sm font-medium">Designation</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {selectedProposal.lastMembers.map((member: any, index: number) => (
//                         <tr key={index}>
//                           <td className="border p-3 text-sm">{member.srNo}</td>
//                           <td className="border p-3 text-sm">{member.name}</td>
//                           <td className="border p-3 text-sm">{member.designation}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div> */}
                
//                  <div>
//                     <label className="block text-sm font-medium mb-2">Reason for Revision</label>
//                     <textarea
//                         value={selectedProposal.lastComments}
//                         disabled
//                         rows={3}
//                         className="w-full px-4 py-3 bg-muted border border-border rounded-lg"
//                     />
//                 </div>
//               </div>
//             </div>
//           )}
// {/* Section 2 */}
// {activeTab === "revised" ? (
//   <div className="bg-card border border-border rounded-xl p-6 shadow-sm mt-6">
//     <h3 className="mb-4 text-lg font-bold border-b pb-2">
//       Revised PAC Evaluation
//     </h3>
//     <div className="space-y-6">
//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-medium mb-2">Approval Date</label>
//           <input
//             type="date"
//             className="w-full px-4 py-3 border border-border rounded-lg bg-background"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-2">Committee Decision</label>
//           <input
//             type="text"
//             value="Approved"
//             readOnly
//             className="w-full px-4 py-3 border border-border rounded-lg bg-muted text-green-700 font-semibold"
//           />
//         </div>
//       </div>
//       <div>
//         <label className="block text-sm font-medium mb-2">Upload Document</label>
//         <input
//           type="file"
//           accept=".pdf,.doc,.docx"
//           className="w-full px-4 py-3 border border-border rounded-lg bg-background"
//         />
//       </div>
//       <div className="flex justify-end mt-6">
//         <button
//           onClick={() => {
//             alert("Proposal forwarded successfully to TAC");
//             navigate("/tac-appraisal");
//           }}
//           className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors font-medium text-sm"
//         >
//           <Send className="size-5" />
//           Forward to TAC
//         </button>
//       </div>
//     </div>
//   </div>
// ) : (
//   <>
//     <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
//            <h3 className="mb-4 text-lg font-bold border-b pb-2">
//   {activeTab === "new"
//     ? `PAC Committee Evaluation : ${selectedProposal.id}`
//     : `Revised PAC Evaluation : ${selectedProposal.id}`}
// </h3>
//             <div className="space-y-6">
//             {activeTab === "new" && (
//                 <div>
//                   <label className="block text-sm mb-2 font-medium">
//                     Proposal ID
//                   </label>
//                   <input
//                     type="text"
//                     value={selectedProposal.id}
//                     disabled
//                     className="w-full px-4 py-3 bg-muted border border-border rounded-lg"
//                   />
//                 </div>
//               )}

//                <div className="grid grid-cols-2 gap-4">
//                 <div>
//                     <label className="block text-sm font-medium mb-2">Meeting Date</label>
//                     <input
//                         type="date"
//                         value={meetingDate}
//                         onChange={(e) => setMeetingDate(e.target.value)}
//                         className="w-full px-4 py-3 border border-border rounded-lg"
//                     />
//                 </div>
//                 <div>
//                     <label className="block text-sm font-medium mb-2">Meeting Time</label>
//                     <input
//                         type="time"
//                         value={meetingTime}
//                         onChange={(e) => setMeetingTime(e.target.value)}
//                         className="w-full px-4 py-3 border border-border rounded-lg"
//                     />
//                 </div>
//               </div>

//               <div className="space-y-3">
//                 <div className="flex justify-between items-center">
//                   <h4 className="font-semibold text-sm">
//                     Members Present
//                   </h4>

//                   <button
//                     type="button"
//                     onClick={addRow}
//                     className="px-3 py-2 bg-primary text-white text-sm rounded-lg flex items-center gap-2"
//                   >
//                     <Plus className="size-4" />
//                     Add Member
//                   </button>
//                 </div>

//                 <table className="w-full border border-border rounded-lg overflow-hidden">
//                   <thead className="bg-muted">
//                     <tr>
//                       <th className="p-3 border text-left text-sm font-medium">Sr No</th>
//                       <th className="p-3 border text-left text-sm font-medium">Name</th>
//                       <th className="p-3 border text-left text-sm font-medium">Designation</th>
//                       <th className="p-3 border text-center text-sm font-medium">Action</th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {members.map((member, index) => (
//                       <tr key={index}>
//                         <td className="border p-2 text-center text-sm">
//                           {member.srNo}
//                         </td>

//                         <td className="border p-2">
//                           <input
//                             type="text"
//                             value={member.name}
//                             onChange={(e) => {
//                               const updated = [...members];
//                               updated[index].name = e.target.value;
//                               setMembers(updated);
//                             }}
//                             className="w-full px-3 py-2 border rounded"
//                           />
//                         </td>

//                         <td className="border p-2">
//                           <input
//                             type="text"
//                             value={member.designation}
//                             onChange={(e) => {
//                               const updated = [...members];
//                               updated[index].designation = e.target.value;
//                               setMembers(updated);
//                             }}
//                             className="w-full px-3 py-2 border rounded"
//                           />
//                         </td>

//                         <td className="border p-2 text-center">
//                           {members.length > 1 && (
//                             <button
//                               onClick={() => removeRow(index)}
//                               className="text-red-600 hover:text-red-700 transition-colors"
//                             >
//                               <Trash2 className="size-5 mx-auto" />
//                             </button>
//                           )}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               <div>
//                   <label className="block text-sm font-medium mb-2">Upload Attendance Sheet</label>
//                   <input
//                       type="file"
//                       accept=".pdf,.doc,.docx"
//                       onChange={(e) => {
//                          setAttendanceSheet(e.target.files?.[0] || null)
//                       }}
//                       className="w-full px-4 py-3 border border-border rounded-lg bg-background"
//                   />
//                    {attendanceSheet && (
//                         <p className="text-sm text-green-600 mt-2">
//                           ✓ File uploaded successfully
//                         </p>
//                   )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-2">
//                     PAC Committee Decision
//                 </label>
//                 <div className="flex gap-4">
//                   <button
//                   onClick={() => setDecision("approve")}
//                   className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-all ${
//                     decision === "approve"
//                       ? "bg-green-100 border-green-600 text-green-700"
//                       : "border-border hover:bg-muted"
//                   }`}
//                   >
//                   <CheckCircle2 className="size-5 mx-auto mb-1" />
//                   Approve
//                   </button>

//                   <button
//                   onClick={() => setDecision("reject")}
//                   className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-all ${
//                     decision === "reject"
//                       ? "bg-red-100 border-red-600 text-red-700"
//                       : "border-border hover:bg-muted"
//                   }`}
//                   >
//                   <XCircle className="size-5 mx-auto mb-1" />
//                   Reject
//                   </button>

//                   <button
//                     onClick={() => setDecision("revision")}
//                     className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-all ${
//                       decision === "revision"
//                         ? "bg-orange-100 border-orange-500 text-orange-700"
//                         : "border-border hover:bg-muted"
//                     }`}
//                   >
//                     <RefreshCw className="size-5 mx-auto mb-1" />
//                     Revision
//                   </button>
//                 </div>
//               </div>

//               {/* APPROVED */}
//               {decision === "approve" && (
//                 <div className="animate-in fade-in slide-in-from-top-4 duration-300">
//                    <label className="block text-sm font-medium mb-2">
//                         Upload PAC Minutes of Meeting (MOM)
//                     </label>
//                     <input
//                         type="file"
//                         accept=".pdf,.doc,.docx"
//                         onChange={(e) => setMomFile(e.target.files?.[0] || null)}
//                         className="w-full px-4 py-3 border border-border rounded-lg bg-background"
//                     />
//                     {momFile && (
//                         <p className="text-sm text-green-600 mt-2">
//                            ✓ File uploaded successfully
//                         </p>
//                     )}
//                 </div>
//               )}

//               {/* REJECT */}
//               {decision === "reject" && (
//                 <div className="animate-in fade-in slide-in-from-top-4 duration-300">
//                   <label className="block text-sm font-medium mb-2">
//                     Reason for Rejection
//                   </label>
//                   <textarea
//                     rows={4}
//                     placeholder="Enter reason for rejection"
//                     value={comments}
//                     onChange={(e) => setComments(e.target.value)}
//                     className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
//                   />
//                 </div>
//               )}

//               {/* REVISE */}
//               {decision === "revision" && (
//                 <div className="animate-in fade-in slide-in-from-top-4 duration-300">
//                   <label className="block text-sm font-medium mb-2">
//                     Observation / Comments
//                   </label>
//                   <textarea
//                     rows={4}
//                     placeholder="Provide observation notes"
//                     value={comments}
//                     onChange={(e) => setComments(e.target.value)}
//                     className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
//                   />
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex justify-between items-center mt-6">
//             <button
//                onClick={resetForm}
//                className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium text-sm text-foreground"
//             >
//                 Cancel
//             </button>

//             {decision === "approve" && momFile && (
//                 <button
//                   onClick={handleForwardToTAC}
//                   className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors font-medium text-sm animate-in fade-in zoom-in duration-300"
//                 >
//                   <Send className="size-5" />
//                   Forward to TAC
//                 </button>
//             )}

//             {decision === "reject" && (
//               <button
//                 onClick={handleReject}
//                 className="px-6 py-3 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors font-medium text-sm animate-in fade-in zoom-in duration-300"
//               >
//                 <XCircle className="size-5" />
//                 Reject Proposal
//               </button>
//             )}

//             {decision === "revision" && (
//               <button
//                 onClick={handleRevision}
//                 className="px-6 py-3 bg-orange-500 text-white rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-colors font-medium text-sm animate-in fade-in zoom-in duration-300"
//               >
//                 <RefreshCw className="size-5" />
//                 Send for Revision
//               </button>
//             )}
//           </div>
//         </div>
//   </>
// )}
//       )}
//     </div>
//   );
// }

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
  Trash2,
  Send
} from "lucide-react";
import { useNavigate } from "react-router";
const initialProposals = [
  { 
    id: "DMRR/2025/MUM/001", 
    projectName: "Flood Protection Wall", 
    district: "Mumbai", 
    requested: 450, 
    cumulativeAllocation: 1200, 
    status: "Pending" 
  },
  { 
    id: "DMRR/2025/PUN/034", 
    projectName: "River Deepening Project", 
    district: "Pune", 
    requested: 680, 
    cumulativeAllocation: 2500, 
    status: "Pending" 
  },
  { 
    id: "DMRR/2025/NAG/015", 
    projectName: "Storm Water Drainage", 
    district: "Nagpur", 
    requested: 520, 
    cumulativeAllocation: 1900, 
    status: "Revised",
    lastMeetingDate: "2025-10-12",
    lastComments: "Please revise the cumulative allocation numbers and provide proper flood estimation documents.",
    lastMembers: [
        { srNo: 1, name: "Rahul Deshmukh", designation: "Chief Engineer" },
        { srNo: 2, name: "Anita Patil", designation: "District Collector" }
    ]
  },
  { 
    id: "DMRR/2025/KOL/022", 
    projectName: "Landslide Mitigation Works", 
    district: "Kolhapur", 
    requested: 350, 
    cumulativeAllocation: 1450, 
    status: "Revised",
    lastMeetingDate: "2025-09-28",
    lastComments: "Soil testing report missing. Please re-submit with the updated report.",
    lastMembers: [
        { srNo: 1, name: "Vikram Pawar", designation: "Superintending Engineer" }
    ]
  },
];
interface Member {
  srNo: number;
  name: string;
  designation: string;
}
export function PACEvaluation() {
  const navigate = useNavigate();
const pendingProposalsData = [
{
id:"DMRR/2025/MUM/001",
projectName:"Flood Protection Wall",
district:"Mumbai",
requested:450,
cumulativeAllocation:1200,
status:"Pending"
},
{
id:"DMRR/2025/PUN/034",
projectName:"River Deepening Project",
district:"Pune",
requested:680,
cumulativeAllocation:2500,
status:"Pending"
},
{
id:"DMRR/2025/NAS/021",
projectName:"Dam Strengthening",
district:"Nashik",
requested:530,
cumulativeAllocation:1900,
status:"Pending"
},
{
id:"DMRR/2025/THA/015",
projectName:"Storm Water Drainage",
district:"Thane",
requested:350,
cumulativeAllocation:1400,
status:"Pending"
}
];
const revisedProposalsData = [
{
id:"DMRR/2025/NAG/015",
projectName:"Storm Water Drainage",
district:"Nagpur",
requested:520,
cumulativeAllocation:1900,
status:"Revised",
lastMeetingDate:"2025-10-12",
lastComments:"Please revise cumulative allocation numbers.",
lastMembers:[
{
srNo:1,
name:"Rahul Deshmukh",
designation:"Chief Engineer"
},
{
srNo:2,
name:"Anita Patil",
designation:"District Collector"
}
]
},
{
id:"DMRR/2025/KOL/022",
projectName:"Landslide Mitigation Works",
district:"Kolhapur",
requested:350,
cumulativeAllocation:1450,
status:"Revised",
lastMeetingDate:"2025-09-28",
lastComments:"Updated soil report required.",
lastMembers:[
{
srNo:1,
name:"Vikram Pawar",
designation:"Superintending Engineer"
}
]
},
{
id:"DMRR/2025/AUR/018",
projectName:"River Embankment",
district:"Aurangabad",
requested:410,
cumulativeAllocation:1600,
status:"Revised",
lastMeetingDate:"2025-09-10",
lastComments:"Need revised flood estimation.",
lastMembers:[
{
srNo:1,
name:"Sachin More",
designation:"Executive Engineer"
}
]
},
{
id:"DMRR/2025/SAT/012",
projectName:"Canal Strengthening",
district:"Satara",
requested:390,
cumulativeAllocation:1350,
status:"Revised",
lastMeetingDate:"2025-08-30",
lastComments:"Attach hydraulic analysis.",
lastMembers:[
{
srNo:1,
name:"Amit Kulkarni",
designation:"Chief Engineer"
}
]
}
];
const [activeTab,setActiveTab] = useState("new");
const [pendingProposals,setPendingProposals] =
useState(pendingProposalsData);
const [revisionList,setRevisionList] =
useState(revisedProposalsData);
  
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  
  const [members, setMembers] = useState<Member[]>([
    { srNo: 1, name: "", designation: "" }
  ]);
  
  const [attendanceSheet, setAttendanceSheet] = useState<File | null>(null);
  const [decision, setDecision] = useState("");
  const [momFile, setMomFile] = useState<File | null>(null);
  const [comments, setComments] = useState("");
  const addRow = () => {
    setMembers([
      ...members,
      {
        srNo: members.length + 1,
        name: "",
        designation: "",
      },
    ]);
  };
  const removeRow = (index: number) => {
    setMembers(
      members
        .filter((_, i) => i !== index)
        .map((m, idx) => ({
          ...m,
          srNo: idx + 1,
        }))
    );
  };
  const handleForwardToTAC = () => {
    if (!meetingDate || !meetingTime || !attendanceSheet || !momFile || members.some(m => !m.name || !m.designation)) {
        alert("Please complete all mandatory fields and upload required files.");
        return;
    }
    
    if(activeTab==="new"){
setPendingProposals(
pendingProposals.filter(
p=>p.id!==selectedProposal.id
)
);
}
else{
setRevisionList(
revisionList.filter(
p=>p.id!==selectedProposal.id
)
);
}
setSelectedProposal(null);
alert(
`${selectedProposal.id} forwarded successfully to TAC`
);
navigate("/tac-appraisal");
  };
  const handleReject = () => {
     if (!meetingDate || !meetingTime || !attendanceSheet || members.some(m => !m.name || !m.designation) || !comments.trim()) {
        alert("Please complete all mandatory fields, upload required files and enter rejection reasons.");
        return;
    }
    alert("Proposal Rejected.");
    resetForm();
  };
  const handleRevision = () => {
     if (!meetingDate || !meetingTime || !attendanceSheet || members.some(m => !m.name || !m.designation) || !comments.trim()) {
        alert("Please complete all mandatory fields, upload required files and enter observation notes.");
        return;
    }
    alert("Proposal sent for revision.");
    resetForm();
  };
  const resetForm = () => {
    setSelectedProposal(null);
    setDecision("");
    setMomFile(null);
    setAttendanceSheet(null);
    setComments("");
    setMeetingDate("");
    setMeetingTime("");
    setMembers([{ srNo: 1, name: "", designation: "" }]);
  };
  return (
    <div className="space-y-6">
      <div>
        <h1>PAC Evaluation</h1>
        <p className="text-sm text-muted-foreground">High-Powered Committee Review and Allocation Validation</p>
      </div>
      <div className="flex gap-4">
<button
onClick={()=>{
setActiveTab("new");
setSelectedProposal(null);
}}
className={`px-5 py-2 rounded-lg font-medium ${
activeTab==="new"
?"bg-primary text-white"
:"bg-muted"
}`}
>
New Proposals
</button>
<button
onClick={()=>{
setActiveTab("revised");
setSelectedProposal(null);
}}
className={`px-5 py-2 rounded-lg font-medium ${
activeTab==="revised"
?"bg-primary text-white"
:"bg-muted"
}`}
>
Revised Proposals
</button>
</div>
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium">Proposal ID</th>
              <th className="px-6 py-4 text-left text-sm font-medium">Project Name</th>
              <th className="px-6 py-4 text-left text-sm font-medium">District</th>
              <th className="px-6 py-4 text-left text-sm font-medium">Requested (₹ Lakhs)</th>
              <th className="px-6 py-4 text-left text-sm font-medium">Cumulative District Allocation</th>
              <th className="px-6 py-4 text-left text-sm font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
         {
(activeTab==="new"
? pendingProposals
: revisionList
).map((proposal)=>(
              <tr 
                key={proposal.id} 
                className={`border-t border-border hover:bg-muted/50 cursor-pointer transition-colors ${selectedProposal?.id === proposal.id ? 'bg-primary/5' : ''}`}
              onClick={() => {
  setSelectedProposal(proposal);
  setDecision("");
  setMomFile(null);
  setAttendanceSheet(null);
  setComments("");
  setMeetingDate("");
  setMeetingTime("");
  setMembers([
    {
      srNo: 1,
      name: "",
      designation: "",
    },
  ]);
}}
              >
                <td className="px-6 py-4 text-sm font-medium">{proposal.id}</td>
                <td className="px-6 py-4 text-sm">{proposal.projectName}</td>
                <td className="px-6 py-4 text-sm">{proposal.district}</td>
                <td className="px-6 py-4 text-sm font-bold text-accent">₹{proposal.requested}</td>
                <td className="px-6 py-4 text-sm">₹{proposal.cumulativeAllocation}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${proposal.status === 'Pending' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                    {proposal.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedProposal && (
        <div className="space-y-6">
          {activeTab === "revised" && (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold border-b pb-2">
                Last Meeting Details
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Last Meeting Date</label>
                  <input
                    type="date"
                    value={selectedProposal.lastMeetingDate}
                    disabled
                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Reason for Revision</label>
                  <textarea
                    value={selectedProposal.lastComments}
                    disabled
                    rows={3}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}
          {activeTab === "revised" ? (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm mt-6">
              <h3 className="mb-4 text-lg font-bold border-b pb-2">
                Revised PAC Evaluation
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Approval Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Committee Decision</label>
                    <input
                      type="text"
                      value="Approved"
                      readOnly
                      className="w-full px-4 py-3 border border-border rounded-lg bg-muted text-green-700 font-semibold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Upload Document</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background"
                  />
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => {
                      alert("Proposal forwarded successfully to TAC");
                      navigate("/tac-appraisal");
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    <Send className="size-5" />
                    Forward to TAC
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-bold border-b pb-2">
                  {activeTab === "new"
                    ? `PAC Committee Evaluation : ${selectedProposal.id}`
                    : `Revised PAC Evaluation : ${selectedProposal.id}`}
                </h3>
                <div className="space-y-6">
                  {activeTab === "new" && (
                    <div>
                      <label className="block text-sm mb-2 font-medium">
                        Proposal ID
                      </label>
                      <input
                        type="text"
                        value={selectedProposal.id}
                        disabled
                        className="w-full px-4 py-3 bg-muted border border-border rounded-lg"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Meeting Date</label>
                      <input
                        type="date"
                        value={meetingDate}
                        onChange={(e) => setMeetingDate(e.target.value)}
                        className="w-full px-4 py-3 border border-border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Meeting Time</label>
                      <input
                        type="time"
                        value={meetingTime}
                        onChange={(e) => setMeetingTime(e.target.value)}
                        className="w-full px-4 py-3 border border-border rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-sm">
                        Members Present
                      </h4>
                      <button
                        type="button"
                        onClick={addRow}
                        className="px-3 py-2 bg-primary text-white text-sm rounded-lg flex items-center gap-2"
                      >
                        <Plus className="size-4" />
                        Add Member
                      </button>
                    </div>
                    <table className="w-full border border-border rounded-lg overflow-hidden">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-3 border text-left text-sm font-medium">Sr No</th>
                          <th className="p-3 border text-left text-sm font-medium">Name</th>
                          <th className="p-3 border text-left text-sm font-medium">Designation</th>
                          <th className="p-3 border text-center text-sm font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((member, index) => (
                          <tr key={index}>
                            <td className="border p-2 text-center text-sm">
                              {member.srNo}
                            </td>
                            <td className="border p-2">
                              <input
                                type="text"
                                value={member.name}
                                onChange={(e) => {
                                  const updated = [...members];
                                  updated[index].name = e.target.value;
                                  setMembers(updated);
                                }}
                                className="w-full px-3 py-2 border rounded"
                              />
                            </td>
                            <td className="border p-2">
                              <input
                                type="text"
                                value={member.designation}
                                onChange={(e) => {
                                  const updated = [...members];
                                  updated[index].designation = e.target.value;
                                  setMembers(updated);
                                }}
                                className="w-full px-3 py-2 border rounded"
                              />
                            </td>
                            <td className="border p-2 text-center">
                              {members.length > 1 && (
                                <button
                                  onClick={() => removeRow(index)}
                                  className="text-red-600 hover:text-red-700 transition-colors"
                                >
                                  <Trash2 className="size-5 mx-auto" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Upload Attendance Sheet</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        setAttendanceSheet(e.target.files?.[0] || null);
                      }}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background"
                    />
                    {attendanceSheet && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ File uploaded successfully
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      PAC Committee Decision
                    </label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setDecision("approve")}
                        className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-all ${
                          decision === "approve"
                            ? "bg-green-100 border-green-600 text-green-700"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        <CheckCircle2 className="size-5 mx-auto mb-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => setDecision("reject")}
                        className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-all ${
                          decision === "reject"
                            ? "bg-red-100 border-red-600 text-red-700"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        <XCircle className="size-5 mx-auto mb-1" />
                        Reject
                      </button>
                      <button
                        onClick={() => setDecision("revision")}
                        className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-all ${
                          decision === "revision"
                            ? "bg-orange-100 border-orange-500 text-orange-700"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        <RefreshCw className="size-5 mx-auto mb-1" />
                        Revision
                      </button>
                    </div>
                  </div>
                  {/* APPROVED */}
                  {decision === "approve" && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                      <label className="block text-sm font-medium mb-2">
                        Upload PAC Minutes of Meeting (MOM)
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setMomFile(e.target.files?.[0] || null)}
                        className="w-full px-4 py-3 border border-border rounded-lg bg-background"
                      />
                      {momFile && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ File uploaded successfully
                        </p>
                      )}
                    </div>
                  )}
                  {/* REJECT */}
                  {decision === "reject" && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                      <label className="block text-sm font-medium mb-2">
                        Reason for Rejection
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Enter reason for rejection"
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                      />
                    </div>
                  )}
                  {/* REVISE */}
                  {decision === "revision" && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                      <label className="block text-sm font-medium mb-2">
                        Observation / Comments
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Provide observation notes"
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                      />
                    </div>
                  )}
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={resetForm}
                  className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium text-sm text-foreground"
                >
                  Cancel
                </button>
                {decision === "approve" && momFile && (
                  <button
                    onClick={handleForwardToTAC}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors font-medium text-sm animate-in fade-in zoom-in duration-300"
                  >
                    <Send className="size-5" />
                    Forward to TAC
                  </button>
                )}
                {decision === "reject" && (
                  <button
                    onClick={handleReject}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors font-medium text-sm animate-in fade-in zoom-in duration-300"
                  >
                    <XCircle className="size-5" />
                    Reject Proposal
                  </button>
                )}
                {decision === "revision" && (
                  <button
                    onClick={handleRevision}
                    className="px-6 py-3 bg-orange-500 text-white rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-colors font-medium text-sm animate-in fade-in zoom-in duration-300"
                  >
                    <RefreshCw className="size-5" />
                    Send for Revision
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
