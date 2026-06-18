import { useState } from "react";
import { Forward, Upload, Save, FileText } from "lucide-react";

const pendingProposalsData = [
{
id:"DMRR/2025/MUM/001",
projectName:"Flood Protection Wall",
disasterType:"Flood",
district:"Mumbai",
status:"Pending"
},
{
id:"DMRR/2025/PUN/021",
projectName:"River Deepening Project",
disasterType:"Flood",
district:"Pune",
status:"Pending"
},
{
id:"DMRR/2025/NAG/015",
projectName:"Storm Water Drainage",
disasterType:"Urban Flooding",
district:"Nagpur",
status:"Pending"
},
{
id:"DMRR/2025/THA/009",
projectName:"Dam Strengthening",
disasterType:"Flood",
district:"Thane",
status:"Pending"
},
{
id:"DMRR/2025/KOL/018",
projectName:"Landslide Mitigation Works",
disasterType:"Landslide",
district:"Kolhapur",
status:"Pending"
}
];

const revisedProposalsData = [
{
id:"DMRR/2025/AUR/011",
projectName:"River Embankment",
disasterType:"Flood",
district:"Aurangabad",
status:"Revised",
revisedStage:"PAC Evaluation",
revisionDate:"2025-10-12",
revisionReason:"Cost estimation requires revision"
},
{
id:"DMRR/2025/SAT/012",
projectName:"Canal Strengthening",
disasterType:"Flood",
district:"Satara",
status:"Revised",
revisedStage:"PAC Evaluation",
revisionDate:"2025-10-10",
revisionReason:"Supporting documents missing"
},
{
id:"DMRR/2025/NAS/013",
projectName:"Slope Stabilization Project",
disasterType:"Landslide",
district:"Nashik",
status:"Revised",
revisedStage:"PAC Evaluation",
revisionDate:"2025-10-08",
revisionReason:"Technical sanction incomplete"
},
{
id:"DMRR/2025/RAI/014",
projectName:"Retaining Wall Construction",
disasterType:"Landslide",
district:"Raigad",
status:"Revised",
revisedStage:"PAC Evaluation",
revisionDate:"2025-10-05",
revisionReason:"Revised estimates required"
},
{
id:"DMRR/2025/SIN/015",
projectName:"Check Dam Rehabilitation",
disasterType:"Drought",
district:"Sindhudurg",
status:"Revised",
revisedStage:"PAC Evaluation",
revisionDate:"2025-10-01",
revisionReason:"Need updated DPR"
}
];

export function DDMAWorkflow() {

const [activeTab,setActiveTab] = useState("new");

const [pendingProposals,setPendingProposals] =
useState(pendingProposalsData);

const [revisionList,setRevisionList] =
useState(revisedProposalsData);

const [selectedProposal,setSelectedProposal] =
useState<any>(null);
  
  return (
    <div className="space-y-6">
      <div>
        <h1>DDMA & Line Department Workflow</h1>
        <p className="text-sm text-muted-foreground">Proposal routing and department assignment</p>
<div className="flex gap-4 mt-4">

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
        
      </div>

<div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">

<table className="w-full">

<thead className="bg-muted">
<tr>
<th className="px-6 py-4 text-left text-sm">
Proposal ID
</th>

<th className="px-6 py-4 text-left text-sm">
Project Name
</th>

<th className="px-6 py-4 text-left text-sm">
Disaster Type
</th>

<th className="px-6 py-4 text-left text-sm">
District
</th>

<th className="px-6 py-4 text-left text-sm">
Status
</th>

</tr>
</thead>

<tbody>

{(
activeTab==="new"
? pendingProposals
: revisionList
).map((proposal)=>(

<tr
key={proposal.id}
className={`border-t border-border hover:bg-muted/50 cursor-pointer ${
selectedProposal?.id===proposal.id
? "bg-primary/5"
: ""
}`}
onClick={()=>{
setSelectedProposal(proposal);
}}
>

<td className="px-6 py-4 text-sm font-medium">
{proposal.id}
</td>

<td className="px-6 py-4 text-sm">
{proposal.projectName}
</td>

<td className="px-6 py-4 text-sm">
{proposal.disasterType}
</td>

<td className="px-6 py-4 text-sm">
{proposal.district}
</td>

<td className="px-6 py-4">

<span
className={`px-3 py-1 rounded-full text-xs font-medium ${
proposal.status==="Pending"
? "bg-blue-100 text-blue-700"
: "bg-orange-100 text-orange-700"
}`}
>
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

{activeTab==="revised" && (

<div className="mb-8 border rounded-xl p-6 shadow-sm">

<h3 className="font-bold mb-5">
Revision Details
</h3>

<div className="grid md:grid-cols-3 gap-4">

<div>
<label className="block text-sm mb-2">
Revised At Stage
</label>

<input
value={selectedProposal.revisedStage}
readOnly
className="w-full px-4 py-2 border rounded-lg bg-muted"
/>
</div>

<div>
<label className="block text-sm mb-2">
Date of Revision
</label>

<input
value={selectedProposal.revisionDate}
readOnly
className="w-full px-4 py-2 border rounded-lg bg-muted"
/>
</div>

<div>
<label className="block text-sm mb-2">
Reason For Revision
</label>

<textarea
rows={3}
value={selectedProposal.revisionReason}
readOnly
className="w-full px-4 py-2 border rounded-lg bg-muted"
/>
</div>

</div>

</div>

)}

<div className="bg-card border border-border rounded-xl p-6 shadow-sm">

<h3 className="mb-4">
  Proposal Routing
</h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm mb-2">Proposal ID</label>
            <input
              type="text"
             value={selectedProposal.id}
              disabled
              className="w-full px-4 py-2 bg-muted border border-border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Collector Forward To</label>
            <select className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Select Department</option>
              <option value="pwd">Public Works Department (PWD)</option>
              <option value="wrd">Water Resources Department (WRD)</option>
              <option value="swcd">Soil & Water Conservation (SWCD)</option>
              <option value="forest">Forest Department</option>
              <option value="urban">Urban Development</option>
              <option value="local">Local Bodies</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2">Cost Estimation (₹ Lakhs)</label>
            <input
              type="number"
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter cost estimation"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Upload Resolution</label>
            <div className="border-2 border-dashed border-border rounded-lg p-6">
              <div className="text-center">
                <Upload className="size-8 text-muted-foreground mx-auto mb-3" />
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90">
                  Upload DDMA Resolution
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">Upload Technical Sanction</label>
            <div className="border-2 border-dashed border-border rounded-lg p-6">
              <div className="text-center">
                <Upload className="size-8 text-muted-foreground mx-auto mb-3" />
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90">
                  Upload Technical Sanction
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            {/* <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center gap-2">
              <Forward className="size-5" />
              Forward to Department
            </button>
            <button className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 flex items-center gap-2">
              <FileText className="size-5" />
              Revise Proposal
            </button> */}
            <button className="px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 flex items-center gap-2">
              <Save className="size-5" />
              Save
            </button>
          </div>
        </div>
      </div>

  </div>
)}
    </div>
  
  );
}
