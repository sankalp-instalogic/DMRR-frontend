import { Upload, Plus, Trash2, Eye, Download, FileText } from "lucide-react";

export function Stage8({ data, setData }: { data: any, setData: (data: any) => void }) {
  return (
    <div className="space-y-8">
      <div>
        <h4 className="font-bold text-lg border-b pb-2 mb-4">Entry Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date of Entry into System</label>
            <input type="date" value={data.entryDate} onChange={e => setData({...data, entryDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Project Start Date</label>
            <input type="date" value={data.startDate} onChange={e => setData({...data, startDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Expected Completion Date</label>
            <input type="date" value={data.expectedCompletion} onChange={e => setData({...data, expectedCompletion: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-bold text-lg border-b pb-2 mb-4">Monthly Progress Reports (MPR)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">MPR Month</label>
            <input type="month" value={data.mprMonth} onChange={e => setData({...data, mprMonth: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">MPR Date</label>
            <input type="date" value={data.mprDate} onChange={e => setData({...data, mprDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Progress %</label>
            <input type="number" value={data.progressPercent} onChange={e => setData({...data, progressPercent: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Remarks</label>
            <input type="text" value={data.mprRemarks} onChange={e => setData({...data, mprRemarks: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
          </div>
        </div>
        <div className="flex gap-2">
          <label className="px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer flex items-center gap-2">
            <Upload className="size-4"/> Upload MPR Docs
            <input type="file" multiple className="hidden" onChange={e => { if(e.target.files) setData({...data, mprDocs: [...data.mprDocs, ...Array.from(e.target.files)]}) }} />
          </label>
        </div>
        <div className="mt-4 space-y-2">
          {data.mprDocs.map((doc: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center p-3 border rounded">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2"><FileText className="size-4 text-primary"/> <span className="text-sm font-medium">{doc.name}</span> <span className="text-xs bg-muted px-2 py-0.5 rounded">MPR</span></div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground ml-6">
                  <span>Uploaded: Today</span>
                  <span>By: Current User</span>
                  <span>v1.0</span>
                  <span className="text-green-600 font-medium">OCR: Pending</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-1.5 text-primary hover:bg-muted rounded" title="View"><Eye className="size-4"/></button>
                <button className="p-1.5 text-green-600 hover:bg-muted rounded" title="Download"><Download className="size-4"/></button>
                <button className="p-1.5 text-blue-600 hover:bg-muted rounded" title="Replace Version"><Upload className="size-4"/></button>
                <button onClick={() => { const docs = [...data.mprDocs]; docs.splice(idx, 1); setData({...data, mprDocs: docs}) }} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Delete Draft"><Trash2 className="size-4"/></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h4 className="font-bold text-lg">Geo Tagged Photos</h4>
          <button onClick={() => setData({...data, geoPhotos: [...data.geoPhotos, {file: new File([""], "placeholder"), lat: "", lng: "", date: "", desc: ""}]})} className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm flex items-center gap-1"><Plus className="size-4"/> Add Photo</button>
        </div>
        <div className="space-y-4">
          {data.geoPhotos.map((photo: any, idx: number) => (
            <div key={idx} className="flex flex-wrap gap-2 items-center bg-muted/20 p-2 rounded">
              <input type="file" onChange={e => { if(e.target.files) { const newP = [...data.geoPhotos]; newP[idx].file = e.target.files[0]; setData({...data, geoPhotos: newP}); } }} className="text-sm w-48" />
              <input type="text" placeholder="Latitude" value={photo.lat} onChange={e => { const newP = [...data.geoPhotos]; newP[idx].lat = e.target.value; setData({...data, geoPhotos: newP}); }} className="w-24 px-2 py-1 border rounded text-sm bg-background" />
              <input type="text" placeholder="Longitude" value={photo.lng} onChange={e => { const newP = [...data.geoPhotos]; newP[idx].lng = e.target.value; setData({...data, geoPhotos: newP}); }} className="w-24 px-2 py-1 border rounded text-sm bg-background" />
              <input type="date" value={photo.date} onChange={e => { const newP = [...data.geoPhotos]; newP[idx].date = e.target.value; setData({...data, geoPhotos: newP}); }} className="w-32 px-2 py-1 border rounded text-sm bg-background" />
              <input type="text" placeholder="Site Description" value={photo.desc} onChange={e => { const newP = [...data.geoPhotos]; newP[idx].desc = e.target.value; setData({...data, geoPhotos: newP}); }} className="flex-1 px-2 py-1 border rounded text-sm bg-background" />
              <button onClick={() => { const newP = [...data.geoPhotos]; newP.splice(idx, 1); setData({...data, geoPhotos: newP}); }} className="p-1 text-red-500 hover:bg-red-100 rounded"><Trash2 className="size-4"/></button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-4">
        <div className="flex-1">
          <p className="text-xs text-blue-700 font-semibold mb-1 uppercase tracking-wide">Monitoring Dashboard</p>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm font-medium text-blue-900">Physical Progress</p>
              <p className="text-2xl font-bold text-blue-900">{data.progressPercent || "0"}%</p>
            </div>
            <div className="w-2/3 bg-blue-200 h-3 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full" style={{width: `${data.progressPercent || 0}%`}}></div>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-xs text-blue-700 font-semibold mb-1 uppercase tracking-wide">Financial Progress</p>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm font-medium text-blue-900">Amount Spent</p>
              <p className="text-2xl font-bold text-blue-900">0%</p>
            </div>
            <div className="w-2/3 bg-blue-200 h-3 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full" style={{width: '0%'}}></div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-bold text-lg border-b pb-2 mb-4">Supporting Documents</h4>
        <div className="flex gap-2 mb-4">
          <select value={data.docType} onChange={e => setData({...data, docType: e.target.value})} className="px-3 py-2 border rounded-lg bg-background">
            <option>Site Inspection Report</option>
            <option>TPQA Report</option>
            <option>Monitoring Report</option>
            <option>Audit Compliance Report</option>
          </select>
          <label className="px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer flex items-center gap-2">
            <Upload className="size-4"/> Upload
            <input type="file" multiple className="hidden" onChange={e => { if(e.target.files) setData({...data, supportingDocs: [...data.supportingDocs, ...Array.from(e.target.files)]}) }} />
          </label>
        </div>
        <div className="space-y-2">
          {data.supportingDocs.map((doc: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center p-3 border rounded">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2"><FileText className="size-4 text-primary"/> <span className="text-sm font-medium">{doc.name}</span> <span className="text-xs bg-muted px-2 py-0.5 rounded">{data.docType}</span></div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground ml-6">
                  <span>Uploaded: Today</span>
                  <span>By: Current User</span>
                  <span>v1.0</span>
                  <span className="text-green-600 font-medium">OCR: Pending</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-1.5 text-primary hover:bg-muted rounded" title="View"><Eye className="size-4"/></button>
                <button className="p-1.5 text-green-600 hover:bg-muted rounded" title="Download"><Download className="size-4"/></button>
                <button className="p-1.5 text-blue-600 hover:bg-muted rounded" title="Replace Version"><Upload className="size-4"/></button>
                <button onClick={() => { const docs = [...data.supportingDocs]; docs.splice(idx, 1); setData({...data, supportingDocs: docs}) }} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Delete Draft"><Trash2 className="size-4"/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
