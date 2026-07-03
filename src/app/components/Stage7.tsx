import { Upload, Plus, Trash2, Eye, Download, FileText } from "lucide-react";

export function Stage7({ data, setData }: { data: any, setData: (data: any) => void }) {
  return (
    <div className="space-y-8">
      <div>
        <h4 className="font-bold text-lg border-b pb-2 mb-4">Tender Publication Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
<<<<<<< HEAD
            <label htmlFor="stage7-tender-date" className="block text-sm font-medium mb-1">Tender Publication Date</label>
            <input id="stage7-tender-date" type="date" value={data.tenderDate} onChange={e => setData({...data, tenderDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
          </div>
          <div>
            <label htmlFor="stage7-tender-ref" className="block text-sm font-medium mb-1">Tender Reference Number</label>
            <input id="stage7-tender-ref" type="text" value={data.tenderRef} onChange={e => setData({...data, tenderRef: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="stage7-tender-url" className="block text-sm font-medium mb-1">Tender URL</label>
            <input id="stage7-tender-url" type="url" value={data.tenderUrl} onChange={e => setData({...data, tenderUrl: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
=======
            <label className="block text-sm font-medium mb-1">Tender Publication Date</label>
            <input type="date" value={data.tenderDate} onChange={e => setData({...data, tenderDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tender Reference Number</label>
            <input type="text" value={data.tenderRef} onChange={e => setData({...data, tenderRef: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Tender URL</label>
            <input type="url" value={data.tenderUrl} onChange={e => setData({...data, tenderUrl: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-bold text-lg border-b pb-2 mb-4">L1 Vendor Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
<<<<<<< HEAD
            <label htmlFor="stage7-vendor-name" className="block text-sm font-medium mb-1">Vendor Name</label>
            <input id="stage7-vendor-name" type="text" value={data.vendorName} onChange={e => setData({...data, vendorName: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
          </div>
          <div>
            <label htmlFor="stage7-vendor-reg-no" className="block text-sm font-medium mb-1">Vendor Registration Number</label>
            <input id="stage7-vendor-reg-no" type="text" value={data.vendorRegNo} onChange={e => setData({...data, vendorRegNo: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
          </div>
          <div>
            <label htmlFor="stage7-vendor-contact-person" className="block text-sm font-medium mb-1">Vendor Contact Person</label>
            <input id="stage7-vendor-contact-person" type="text" value={data.vendorContactPerson} onChange={e => setData({...data, vendorContactPerson: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
          </div>
          <div>
            <label htmlFor="stage7-vendor-contact-no" className="block text-sm font-medium mb-1">Vendor Contact Number</label>
            <input id="stage7-vendor-contact-no" type="text" value={data.vendorContactNo} onChange={e => setData({...data, vendorContactNo: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
=======
            <label className="block text-sm font-medium mb-1">Vendor Name</label>
            <input type="text" value={data.vendorName} onChange={e => setData({...data, vendorName: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Vendor Registration Number</label>
            <input type="text" value={data.vendorRegNo} onChange={e => setData({...data, vendorRegNo: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Vendor Contact Person</label>
            <input type="text" value={data.vendorContactPerson} onChange={e => setData({...data, vendorContactPerson: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Vendor Contact Number</label>
            <input type="text" value={data.vendorContactNo} onChange={e => setData({...data, vendorContactNo: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-bold text-lg border-b pb-2 mb-4">Work Order Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
<<<<<<< HEAD
            <label htmlFor="stage7-work-order-init-date" className="block text-sm font-medium mb-1">Initiation Date</label>
            <input id="stage7-work-order-init-date" type="date" value={data.workOrderInitDate} onChange={e => setData({...data, workOrderInitDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
          </div>
          <div>
            <label htmlFor="stage7-work-order-no" className="block text-sm font-medium mb-1">Work Order Number</label>
            <input id="stage7-work-order-no" type="text" value={data.workOrderNo} onChange={e => setData({...data, workOrderNo: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
          </div>
          <div>
            <label htmlFor="stage7-total-tender-cost" className="block text-sm font-medium mb-1">Total Tender Cost</label>
            <input id="stage7-total-tender-cost" type="number" value={data.totalTenderCost} onChange={e => setData({...data, totalTenderCost: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
=======
            <label className="block text-sm font-medium mb-1">Initiation Date</label>
            <input type="date" value={data.workOrderInitDate} onChange={e => setData({...data, workOrderInitDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Work Order Number</label>
            <input type="text" value={data.workOrderNo} onChange={e => setData({...data, workOrderNo: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Total Tender Cost</label>
            <input type="number" value={data.totalTenderCost} onChange={e => setData({...data, totalTenderCost: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h4 className="font-bold text-lg">Installment Capture</h4>
<<<<<<< HEAD
          <button onClick={() => setData({...data, installments: [...data.installments, {no: "", date: "", amount: "", remarks: ""}]})} className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm flex items-center gap-1"><Plus aria-hidden="true" className="size-4"/> Add</button>
=======
          <button onClick={() => setData({...data, installments: [...data.installments, {no: "", date: "", amount: "", remarks: ""}]})} className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm flex items-center gap-1"><Plus className="size-4"/> Add</button>
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
        </div>
        <div className="space-y-2">
          {data.installments.map((inst: any, idx: number) => (
            <div key={idx} className="flex gap-2 items-center bg-muted/20 p-2 rounded">
<<<<<<< HEAD
              <input aria-label="Installment number" type="text" placeholder="No." value={inst.no} onChange={e => { const newInst = [...data.installments]; newInst[idx].no = e.target.value; setData({...data, installments: newInst}); }} className="w-16 px-2 py-1 border rounded text-sm bg-background" />
              <input aria-label="Installment date" type="date" value={inst.date} onChange={e => { const newInst = [...data.installments]; newInst[idx].date = e.target.value; setData({...data, installments: newInst}); }} className="w-32 px-2 py-1 border rounded text-sm bg-background" />
              <input aria-label="Installment amount" type="number" placeholder="Amount" value={inst.amount} onChange={e => { const newInst = [...data.installments]; newInst[idx].amount = e.target.value; setData({...data, installments: newInst}); }} className="w-24 px-2 py-1 border rounded text-sm bg-background" />
              <input aria-label="Installment remarks" type="text" placeholder="Remarks" value={inst.remarks} onChange={e => { const newInst = [...data.installments]; newInst[idx].remarks = e.target.value; setData({...data, installments: newInst}); }} className="flex-1 px-2 py-1 border rounded text-sm bg-background" />
              <button aria-label="Delete installment row" onClick={() => { const newInst = [...data.installments]; newInst.splice(idx, 1); setData({...data, installments: newInst}); }} className="p-1 text-red-500 hover:bg-red-100 rounded"><Trash2 aria-hidden="true" className="size-4"/></button>
=======
              <input type="text" placeholder="No." value={inst.no} onChange={e => { const newInst = [...data.installments]; newInst[idx].no = e.target.value; setData({...data, installments: newInst}); }} className="w-16 px-2 py-1 border rounded text-sm bg-background" />
              <input type="date" value={inst.date} onChange={e => { const newInst = [...data.installments]; newInst[idx].date = e.target.value; setData({...data, installments: newInst}); }} className="w-32 px-2 py-1 border rounded text-sm bg-background" />
              <input type="number" placeholder="Amount" value={inst.amount} onChange={e => { const newInst = [...data.installments]; newInst[idx].amount = e.target.value; setData({...data, installments: newInst}); }} className="w-24 px-2 py-1 border rounded text-sm bg-background" />
              <input type="text" placeholder="Remarks" value={inst.remarks} onChange={e => { const newInst = [...data.installments]; newInst[idx].remarks = e.target.value; setData({...data, installments: newInst}); }} className="flex-1 px-2 py-1 border rounded text-sm bg-background" />
              <button onClick={() => { const newInst = [...data.installments]; newInst.splice(idx, 1); setData({...data, installments: newInst}); }} className="p-1 text-red-500 hover:bg-red-100 rounded"><Trash2 className="size-4"/></button>
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-bold text-lg border-b pb-2 mb-4">Supporting Documents</h4>
        <div className="flex gap-2 mb-4">
<<<<<<< HEAD
          <select aria-label="Supporting document type" value={data.docType} onChange={e => setData({...data, docType: e.target.value})} className="px-3 py-2 border rounded-lg bg-background">
=======
          <select value={data.docType} onChange={e => setData({...data, docType: e.target.value})} className="px-3 py-2 border rounded-lg bg-background">
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
            <option>Bid Evaluation Report</option>
            <option>Tender Notice</option>
            <option>Work Order</option>
            <option>Vendor Selection Report</option>
            <option>Financial Evaluation Report</option>
          </select>
          <label className="px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer flex items-center gap-2">
<<<<<<< HEAD
            <Upload aria-hidden="true" className="size-4"/> Upload
=======
            <Upload className="size-4"/> Upload
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
            <input type="file" multiple className="hidden" onChange={e => { if(e.target.files) setData({...data, supportingDocs: [...data.supportingDocs, ...Array.from(e.target.files)]}) }} />
          </label>
        </div>
        <div className="space-y-2">
          {data.supportingDocs.map((doc: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center p-3 border rounded">
              <div className="flex flex-col gap-1">
<<<<<<< HEAD
                <div className="flex items-center gap-2"><FileText aria-hidden="true" className="size-4 text-primary"/> <span className="text-sm font-medium">{doc.name}</span> <span className="text-xs bg-muted px-2 py-0.5 rounded">{data.docType}</span></div>
=======
                <div className="flex items-center gap-2"><FileText className="size-4 text-primary"/> <span className="text-sm font-medium">{doc.name}</span> <span className="text-xs bg-muted px-2 py-0.5 rounded">{data.docType}</span></div>
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
                <div className="flex items-center gap-3 text-xs text-muted-foreground ml-6">
                  <span>Uploaded: Today</span>
                  <span>By: Current User</span>
                  <span>v1.0</span>
                  <span className="text-green-600 font-medium">OCR: Pending</span>
                </div>
              </div>
              <div className="flex gap-2">
<<<<<<< HEAD
                <button aria-label="View document" className="p-1.5 text-primary hover:bg-muted rounded" title="View"><Eye aria-hidden="true" className="size-4"/></button>
                <button aria-label="Download document" className="p-1.5 text-green-600 hover:bg-muted rounded" title="Download"><Download aria-hidden="true" className="size-4"/></button>
                <button aria-label="Replace document version" className="p-1.5 text-blue-600 hover:bg-muted rounded" title="Replace Version"><Upload aria-hidden="true" className="size-4"/></button>
                <button aria-label="Delete document" onClick={() => { const docs = [...data.supportingDocs]; docs.splice(idx, 1); setData({...data, supportingDocs: docs}) }} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Delete Draft"><Trash2 aria-hidden="true" className="size-4"/></button>
=======
                <button className="p-1.5 text-primary hover:bg-muted rounded" title="View"><Eye className="size-4"/></button>
                <button className="p-1.5 text-green-600 hover:bg-muted rounded" title="Download"><Download className="size-4"/></button>
                <button className="p-1.5 text-blue-600 hover:bg-muted rounded" title="Replace Version"><Upload className="size-4"/></button>
                <button onClick={() => { const docs = [...data.supportingDocs]; docs.splice(idx, 1); setData({...data, supportingDocs: docs}) }} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Delete Draft"><Trash2 className="size-4"/></button>
>>>>>>> 771174a6c232478d1902ccf947dd94cb1e8cb2ac
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
