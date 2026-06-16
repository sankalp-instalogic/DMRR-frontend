import { useState } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, Send, RotateCcw, Eye, Download, RefreshCw, Trash2, Save, Edit } from "lucide-react";
import { useNavigate } from "react-router";

export function ProposalInitiation() {
  const navigate = useNavigate();
  
const [formData, setFormData] = useState({
  disasterType: "",
  district: "",
  taluka: "",
  lineDepartment: "",

  proposalReceivedFrom: "",
  sourceName: "",
  proposalReceivedDate: "",

  requirement: "",
  estimatedCost: "",
  priority: "",
  dateOfDemand: "",

  receivingAuthority: "",
  receivingAuthorityDate: "",

  officerInCharge: "",
  ndmaReference: "",

  projectCost: "", // optional field before document upload
});
  
  const [validationError, setValidationError] = useState("");


  const validateForm = () => {
    if (Number(formData.estimatedCost) < 0) return "Cost cannot be negative.";
    if (formData.dateOfDemand) {
      const demandDate = new Date(formData.dateOfDemand);
      const today = new Date();
      const threeYearsAgo = new Date();
      threeYearsAgo.setFullYear(today.getFullYear() - 3);

      if (demandDate > today) return "Demand Date cannot be in the future.";
      if (demandDate < threeYearsAgo) return "Demand Date cannot be older than 3 years.";
    }
    return "";
  };

  const handleAction = (action) => {
    const error = validateForm();
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError("");
    alert(`Action '${action}' completed successfully!`);
    if (action === 'Submit') navigate("/pmu-scrutiny");
  };

  const handleFileUpload = (type) => {
    alert(`Uploaded 1 file for ${type} (simulated 25MB check, PDF/DOCX/PNG)`);
  };

  const docRow = (title, type, isMandatory) => (
    <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card mb-3">
      <div>
        <h4 className="font-medium text-sm flex items-center gap-2">
          <FileText className="size-4 text-muted-foreground" />
          {title} {isMandatory && <span className="text-destructive">*</span>}
        </h4>
        <p className="text-xs text-muted-foreground mt-1">Format: PDF, DOCX, DOC, JPG, PNG | Max: 25MB</p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => handleFileUpload(type)} className="p-2 bg-primary/10 text-primary rounded hover:bg-primary/20" title="Upload"><Upload className="size-4" /></button>
        <button onClick={() => alert('Viewing document')} className="p-2 bg-secondary/10 text-secondary rounded hover:bg-secondary/20" title="View"><Eye className="size-4" /></button>
        <button onClick={() => alert('Downloading document')} className="p-2 bg-accent/10 text-accent rounded hover:bg-accent/20" title="Download"><Download className="size-4" /></button>
        <button onClick={() => alert('Replacing document version')} className="p-2 bg-muted text-muted-foreground rounded hover:bg-muted/80" title="Replace Version"><RefreshCw className="size-4" /></button>
        <button onClick={() => alert('Deleting draft')} className="p-2 bg-destructive/10 text-destructive rounded hover:bg-destructive/20" title="Delete Draft"><Trash2 className="size-4" /></button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Proposal Initiation</h1>
          <p className="text-sm text-muted-foreground">Create new disaster mitigation proposal</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleAction('Create')} className="px-4 py-2 border border-border rounded-lg flex items-center gap-2 hover:bg-muted text-sm"><Edit className="size-4"/> Create</button>
          <button onClick={() => handleAction('Save')} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg flex items-center gap-2 hover:opacity-90 text-sm"><Save className="size-4"/> Save Draft</button>
        </div>
      </div>

      <div className="bg-primary/10 border border-primary rounded-xl p-5">
        <div className="flex items-center gap-2"> 
          <CheckCircle2 className="size-5" />
          <span className="font-medium">Proposal Reference ID: DMRR/2025/MUM/001 (Auto-generated)</span>
        </div>
      </div>

      {validationError && (
        <div className="bg-destructive/10 border border-destructive text-destructive rounded-xl p-4 flex items-center gap-2">
          <AlertCircle className="size-5" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Proposal Form */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="mb-6">Proposal Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm mb-2">Disaster Type *</label>
            <select
              value={formData.disasterType}
              onChange={(e) => setFormData({ ...formData, disasterType: e.target.value })}
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Disaster Type</option>
              <option value="flood">Flood Mitigation</option>
              <option value="drought">Drought Management</option>
              <option value="earthquake">Earthquake Preparedness</option>
              <option value="cyclone">Cyclone Protection</option>
              <option value="landslide">Landslide Prevention</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2">District *</label>
            <select
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select District</option>
              <option value="mumbai">Mumbai</option>
              <option value="pune">Pune</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2">Line Department *</label>
            <select
              value={formData.lineDepartment}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  lineDepartment: e.target.value,
                })
              }
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Line Department</option>
              <option value="pwd">PWD</option>
              <option value="water_resources">Water Resources Department</option>
              <option value="health">Health & Family Welfare</option>
              <option value="forest">Forest Department</option>
              <option value="urban">Urban Development</option>
              <option value="rural">Rural Development</option>
              <option value="psu">PSU</option>
            </select>
          </div>

          <div>
              {/* <label className="block text-sm mb-2">
                Received Proposal From *
              </label>
            
              <select
                value={formData.proposalReceivedFrom}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    proposalReceivedFrom: e.target.value,
                  })
                }
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Source</option>
                <option value="mla">MLA</option>
                <option value="citizen">Citizen</option>
                <option value="others">Others</option>
              </select>
            </div> */}

            <div>
  <label className="block text-sm mb-2">
    Received Proposal From *
  </label>

  <select
    value={formData.proposalReceivedFrom}
    onChange={(e) =>
      setFormData({
        ...formData,
        proposalReceivedFrom: e.target.value,
      })
    }
    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg"
  >
    <option value="">Select Source</option>
    <option value="mla">MLA</option>
    <option value="citizen">Citizen</option>
    <option value="mp">MP</option>
    <option value="ngo">NGO</option>
    <option value="others">Others</option>
  </select>
</div>

<div>
  <label className="block text-sm mb-2">
    Name of Source *
  </label>

  <input
    type="text"
    value={formData.sourceName}
    onChange={(e) =>
      setFormData({
        ...formData,
        sourceName: e.target.value,
      })
    }
    placeholder="Enter Name"
    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg"
  />
</div>

<div>
  <label className="block text-sm mb-2">
    Date Proposal Received *
  </label>

  <input
    type="date"
    value={formData.proposalReceivedDate}
    onChange={(e) =>
      setFormData({
        ...formData,
        proposalReceivedDate: e.target.value,
      })
    }
    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg"
  />
</div>

          
          <div>
            <label className="block text-sm mb-2">Date of Local Demand *</label>
            <input
              type="date"
              value={formData.dateOfDemand}
              onChange={(e) => setFormData({ ...formData, dateOfDemand: e.target.value })}
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Receiving Authority *</label>
            <select
              value={formData.receivingAuthority}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  receivingAuthority: e.target.value,
                })
              }
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Receiving Authority</option>
              <option value="minister">Minister</option>
              <option value="ps">Principal Secretary (PS)</option>
              <option value="director">Director</option>
              <option value="us">Under Secretary (US)</option>
            </select>

            <div>
              <label className="block text-sm mb-2">
                Date Letter Received *
              </label>
            
              <input
                type="date"
                value={formData.receivingAuthorityDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    receivingAuthorityDate: e.target.value,
                  })
                }
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg"
              />
            </div>
            
          </div>

          <div>
            <label className="block text-sm mb-2">Officer in Charge *</label>
            <select
                value={formData.officerInCharge}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    officerInCharge: e.target.value,
                  })
                }
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Officer in Charge</option>
                <option value="under_secretary">Under Secretary</option>
                <option value="aso">ASO</option>
                <option value="do">DO</option>
              </select>
          </div>

          <div>
            <label className="block text-sm mb-2">Estimated Cost (₹ Lakhs) *</label>
            <input
              type="number"
              value={formData.estimatedCost}
              onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">NDMA Guideline Reference</label>
            <input
              type="text"
              value={formData.ndmaReference}
              onChange={(e) => setFormData({ ...formData, ndmaReference: e.target.value })}
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="E.g., NDMA/2019/Flood-01"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-2">Requirement Description *</label>
            <textarea
              value={formData.requirement}
              onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
            />
          </div>
        </div>
      </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <h3 className="mb-4">
        Project Cost Details
      </h3>
    
      <div>
        <label className="block text-sm mb-2">
          Cost of Project (₹ Lakhs)
        </label>
    
        <input
          type="number"
          placeholder="Optional"
          value={formData.projectCost}
          onChange={(e) =>
            setFormData({
              ...formData,
              projectCost: e.target.value,
            })
          }
          className="w-full px-4 py-2 bg-input-background border border-border rounded-lg"
        />
    
        <p className="text-xs text-muted-foreground mt-1">
          This field is optional.
        </p>
      </div>
    </div>
        
      {/* Document Upload */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="mb-4">Document Upload</h3>
        <p className="text-sm text-muted-foreground mb-4">Upload necessary files. Supported: PDF, DOCX, DOC, JPG, PNG (Max: 25MB)</p>
        
        {docRow("Project Proposal Report (PPR)", "ppr", true)}
        {docRow("Detailed Project Report (DPR)", "dpr", true)}
        {docRow("Technical Sanction", "technicalSanction", true)}
        {docRow("Supporting Attachments", "supporting", false)}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => handleAction('Submit')}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Send className="size-5" />
          Submit Proposal
        </button>
        <button onClick={() => setFormData({})} className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2">
          <RotateCcw className="size-5" />
          Reset
        </button>
      </div>
    </div>
  );
}
