import { PlusCircle, Save } from "lucide-react";
import { useState } from "react";

const initialProjects = [
  {
    id: "PRJ/2025/001",
    proposalId: "DMRR/2025/MUM/001",
    district: "Mumbai",
    contractor: "ABC Construction Pvt Ltd",
    status: "Work Started",
  },
  {
    id: "PRJ/2025/002",
    proposalId: "DMRR/2025/PUN/034",
    district: "Pune",
    contractor: "XYZ Infrastructure",
    status: "Pending Update",
  },
];

export function ProjectExecution() {
  const [projects] = useState(initialProjects);

  const [selectedProject, setSelectedProject] =
    useState<any>(null);

  const [photos, setPhotos] = useState([
    {
      latitude: "",
      longitude: "",
      date: "",
      description: "",
    },
  ]);

  const addPhotoRow = () => {
    setPhotos([
      ...photos,
      {
        latitude: "",
        longitude: "",
        date: "",
        description: "",
      },
    ]);
  };

  const handleSave = () => {
    console.log({
      selectedProject,
      photos,
    });

    alert("Project Execution Details Saved");

    setSelectedProject(null);
  };

  const handleAction = (action: string, item = "") => {
    alert(
      `Action '${action}' executed successfully ${
        item ? "for " + item : ""
      }`,
    );
  };
  return (
    <div className="space-y-6">
      <div>
        <h1>Project Execution & Monitoring</h1>
        <p className="text-sm text-muted-foreground">
          Manage project progress and monitoring
        </p>
      </div>

      {/* PROJECT LIST */}

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-4 text-left">
                Project ID
              </th>
              <th className="px-6 py-4 text-left">
                Proposal ID
              </th>
              <th className="px-6 py-4 text-left">District</th>
              <th className="px-6 py-4 text-left">
                Contractor
              </th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {projects.map((project) => (
              <tr
                key={project.id}
                className="border-t border-border"
              >
                <td className="px-6 py-4">{project.id}</td>
                <td className="px-6 py-4">
                  {project.proposalId}
                </td>
                <td className="px-6 py-4">
                  {project.district}
                </td>
                <td className="px-6 py-4">
                  {project.contractor}
                </td>
                <td className="px-6 py-4">{project.status}</td>

                <td className="px-6 py-4">
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                  >
                    Add Data
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EXECUTION FORM */}

      {selectedProject && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-6">
            Project Execution & Monitoring
          </h3>

          {/* ENTRY DETAILS */}

          <h4 className="font-semibold mb-4">Entry Details</h4>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label>Date of Entry into System</label>
              <input
                type="date"
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label>Project Start Date</label>
              <input
                type="date"
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label>Expected Completion Date</label>
              <input
                type="date"
                className="w-full border rounded-lg p-2"
              />
            </div>
          </div>

          {/* MPR */}

          <h4 className="font-semibold mb-4">
            Monthly Progress Reports (MPR)
          </h4>

          <div className="grid md:grid-cols-5 gap-3 mb-5">
            <input
              type="month"
              className="border rounded-lg p-2"
            />

            <input
              type="date"
              className="border rounded-lg p-2"
            />

            <input
              placeholder="Progress %"
              className="border rounded-lg p-2"
            />

            <input
              placeholder="Remarks"
              className="border rounded-lg p-2"
            />

            <input type="file" 
             className="border rounded-lg p-2" />
          </div>

          

          {/* GEO TAGGED PHOTOS */}

          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold">Geo Tagged Photos</h4>

            <button
              onClick={addPhotoRow}
              className="px-3 py-1 bg-primary text-white rounded"
            >
              + Add Photo
            </button>
          </div>

          {photos.map((photo, index) => (
            <div
              key={index}
              className="grid grid-cols-5 gap-2 mb-3"
         
            >
              <input type="file"
                 className="border rounded p-2"/>

              <input
                placeholder="Latitude"
                className="border rounded p-2"
              />

              <input
                placeholder="Longitude"
                className="border rounded p-2"
              />

              <input
                type="date"
                className="border rounded p-2"
              />

              <input
                placeholder="Site Description"
                className="border rounded p-2"
              />
            </div>
          ))}

          {/* MONITORING */}

          {/* <div className="bg-blue-50 border rounded-xl p-6 mt-6 mb-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5>Physical Progress</h5>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <h5>Financial Progress</h5>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full border rounded-lg p-2"
                />
              </div>
            </div>
          </div> */}

          {/* DOCUMENTS */}

          <h4 className="font-semibold mb-4">
            Supporting Documents
          </h4>

          <div className="flex gap-3 mb-6">
            <select className="border rounded-lg p-2">
              <option>Site Inspection Report</option>

              <option>TPQA Report</option>

              <option>Utilization Certificate</option>

              <option>Completion Certificate</option>
            </select>

            <input type="file"
              className="border rounded-lg p-2"/>
          </div>

          {/* SAVE */}

          <button
            onClick={handleSave}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );

  // export function ProjectExecution() {
  //   const [auditPoints, setAuditPoints] = useState(initialAuditPoints);
  //   const [delayReason, setDelayReason] = useState("");

  //   const handleAction = (action, item = '') => {
  //     alert(`Action '${action}' executed successfully ${item ? 'for ' + item : ''}`);
  //   };

  // return (
  //   <div className="space-y-6">
  //     <div className="flex items-center justify-between">
  //       <div>
  //         <h1>Project Execution & Monitoring</h1>
  //         <p className="text-sm text-muted-foreground">Track project implementation and progress</p>
  //       </div>
  //       <div className="flex gap-2">
  //         <button onClick={() => handleAction('Edit')} className="px-4 py-2 border border-border rounded-lg flex items-center gap-2 hover:bg-muted text-sm"><Edit className="size-4"/> Edit Project Details</button>
  //       </div>
  //     </div>

  //     <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  //       <div className="bg-card border border-border rounded-xl p-5">
  //         <div className="text-sm text-muted-foreground mb-1">Physical Progress</div>
  //         <div className="text-2xl font-bold">71%</div>
  //       </div>
  //       <div className="bg-card border border-border rounded-xl p-5">
  //         <div className="text-sm text-muted-foreground mb-1">Financial Progress</div>
  //         <div className="text-2xl font-bold">67%</div>
  //       </div>
  //       <div className="bg-card border border-border rounded-xl p-5">
  //         <div className="text-sm text-muted-foreground mb-1">Schedule Variance</div>
  //         <div className="text-2xl font-bold text-secondary">-4 days</div>
  //       </div>
  //       <div className="bg-card border border-border rounded-xl p-5">
  //         <div className="text-sm text-muted-foreground mb-1">Cost Variance</div>
  //         <div className="text-2xl font-bold text-accent">+₹12 L</div>
  //       </div>
  //     </div>

  //     <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
  //       <h3 className="mb-4 text-[#0B1F4D] font-bold">Progress Tracking</h3>
  //       <ResponsiveContainer width="100%" height={300}>
  //         <LineChart data={progressData}>
  //           <CartesianGrid strokeDasharray="3 3" vertical={false} />
  //           <XAxis dataKey="month" axisLine={false} tickLine={false} />
  //           <YAxis axisLine={false} tickLine={false} />
  //           <Tooltip contentStyle={{ borderRadius: '8px' }} />
  //           <Legend />
  //           <Line type="monotone" dataKey="physical" stroke="#0B1F4D" strokeWidth={3} name="Physical Progress %" />
  //           <Line type="monotone" dataKey="financial" stroke="#FBAC1B" strokeWidth={3} name="Financial Progress %" />
  //         </LineChart>
  //       </ResponsiveContainer>
  //     </div>

  //     <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
  //       <div className="flex justify-between items-center mb-4">
  //         <h3 className="text-[#0B1F4D] font-bold">Work Order Management</h3>
  //         <div className="flex gap-2">
  //           <button onClick={() => handleAction('View', 'Work Order')} className="p-2 bg-secondary/10 text-secondary rounded hover:bg-secondary/20" title="View"><Eye className="size-4"/></button>
  //           <button onClick={() => handleAction('Download', 'Work Order')} className="p-2 bg-accent/10 text-accent rounded hover:bg-accent/20" title="Download"><Download className="size-4"/></button>
  //         </div>
  //       </div>
  //       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  //         <div>
  //           <label className="block text-sm text-muted-foreground mb-1">Work Order No.</label>
  //           <p className="font-medium">WO/DMRR/2025/001</p>
  //         </div>
  //         <div>
  //           <label className="block text-sm text-muted-foreground mb-1">Contractor</label>
  //           <p className="font-medium">ABC Construction Pvt Ltd</p>
  //         </div>
  //         <div>
  //           <label className="block text-sm text-muted-foreground mb-1">Start Date</label>
  //           <p className="font-medium">01-Jan-2025</p>
  //         </div>
  //         <div>
  //           <label className="block text-sm text-muted-foreground mb-1">Expected Completion</label>
  //           <p className="font-medium">30-Jun-2025</p>
  //         </div>
  //       </div>
  //     </div>

  //     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  //       <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
  //         <div className="flex justify-between items-center mb-4">
  //           <h3 className="text-[#0B1F4D] font-bold">Monthly Progress Report (MPR)</h3>
  //           <div className="flex gap-2">
  //             <button onClick={() => handleAction('View', 'MPR')} className="p-1.5 hover:bg-muted rounded"><Eye className="size-4"/></button>
  //             <button onClick={() => handleAction('Download', 'MPR')} className="p-1.5 hover:bg-muted rounded"><Download className="size-4"/></button>
  //           </div>
  //         </div>
  //         <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center bg-muted/20">
  //           <Upload className="size-8 text-muted-foreground mb-3" />
  //           <button onClick={() => handleAction('Upload', 'MPR')} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center gap-2">
  //             <Upload className="size-4" /> Upload Latest MPR
  //           </button>
  //         </div>
  //       </div>

  //       <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
  //         <div className="flex justify-between items-center mb-4">
  //           <h3 className="text-[#0B1F4D] font-bold">TPQA Monitoring</h3>
  //           <div className="flex gap-2">
  //             <button onClick={() => handleAction('View', 'TPQA')} className="p-1.5 hover:bg-muted rounded"><Eye className="size-4"/></button>
  //             <button onClick={() => handleAction('Download', 'TPQA')} className="p-1.5 hover:bg-muted rounded"><Download className="size-4"/></button>
  //           </div>
  //         </div>
  //         <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center bg-muted/20">
  //           <Upload className="size-8 text-muted-foreground mb-3" />
  //           <button onClick={() => handleAction('Upload', 'TPQA Report')} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 flex items-center gap-2">
  //             <Upload className="size-4" /> Upload TPQA Report
  //           </button>
  //         </div>
  //       </div>
  //     </div>

  //     <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
  //       <h3 className="mb-4 text-[#0B1F4D] font-bold flex items-center justify-between">
  //         <span>Delay Reason Capture</span>
  //         <button onClick={() => handleAction('Save', 'Delay Reasons')} className="px-3 py-1.5 bg-primary/10 text-primary rounded flex items-center gap-2 text-sm hover:bg-primary/20"><Save className="size-4" /> Save Reason</button>
  //       </h3>
  //       <textarea
  //         value={delayReason}
  //         onChange={(e) => setDelayReason(e.target.value)}
  //         className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
  //         rows={3}
  //         placeholder="Enter detailed reasons for any project delays or lagging..."
  //       />
  //     </div>

  //     <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
  //       <div className="flex justify-between items-center mb-4">
  //         <h3 className="flex items-center gap-2 text-[#0B1F4D] font-bold"><MapPin className="size-5" /> Geo-tagged Site Images</h3>
  //         <button onClick={() => handleAction('Upload', 'Geo-tagged Images')} className="px-3 py-1.5 bg-accent text-accent-foreground rounded flex items-center gap-2 text-sm hover:opacity-90"><PlusCircle className="size-4" /> Add Images</button>
  //       </div>
  //       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  //         {[1, 2, 3].map((i) => (
  //           <div key={i} className="border border-border rounded-lg overflow-hidden group relative">
  //             <div className="h-32 bg-muted flex items-center justify-center">
  //               <MapPin className="size-8 text-muted-foreground opacity-20" />
  //             </div>
  //             <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
  //               <button onClick={() => handleAction('View', `Image ${i}`)} className="p-2 bg-white rounded-full text-black"><Eye className="size-4"/></button>
  //               <button onClick={() => handleAction('Download', `Image ${i}`)} className="p-2 bg-white rounded-full text-black"><Download className="size-4"/></button>
  //             </div>
  //           </div>
  //         ))}
  //         <div className="border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleAction('Upload', 'New Geo Image')}>
  //           <Upload className="size-6 text-muted-foreground mb-2" />
  //           <span className="text-xs font-medium">Upload More</span>
  //         </div>
  //       </div>
  //     </div>

  //     <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
  //       <div className="flex justify-between items-center mb-4">
  //         <h3 className="text-[#0B1F4D] font-bold">13-Point Audit Compliance Tracker</h3>
  //         <button onClick={() => handleAction('Download', 'Audit Compliance Report')} className="px-3 py-1.5 border border-border rounded flex items-center gap-2 text-sm hover:bg-muted"><Download className="size-4" /> Export Tracker</button>
  //       </div>
  //       <div className="space-y-2">
  //         {auditPoints.map((item, index) => (
  //           <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
  //             <span className="text-sm font-medium">{index + 1}. {item.point}</span>
  //             <div className="flex items-center gap-3">
  //               <span className={`px-2 py-1 rounded-full text-xs font-bold ${
  //                 item.status === 'Complete' ? 'bg-accent/20 text-accent' :
  //                 item.status === 'Pending' ? 'bg-secondary/20 text-secondary' :
  //                 'bg-muted-foreground/20 text-muted-foreground'
  //               }`}>
  //                 {item.status}
  //               </span>
  //               <button onClick={() => handleAction('Edit', `Status for ${item.point}`)} className="p-1 text-muted-foreground hover:text-primary"><Edit className="size-3" /></button>
  //             </div>
  //           </div>
  //         ))}
  //       </div>
  //     </div>

  //     <div className="flex gap-4">
  //       <button onClick={() => handleAction('Update Progress')} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center gap-2">
  //         <TrendingUp className="size-5" /> Update Progress
  //       </button>
  //       <button onClick={() => handleAction('Submit')} className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90 flex items-center gap-2">
  //         <Save className="size-5" /> Submit Audit Data
  //       </button>
  //     </div>
  //   </div>
  // );
}