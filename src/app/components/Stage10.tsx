import { Upload, Eye, Download, FileText, Trash2 } from "lucide-react";

export function Stage10({ data, setData }: { data: any, setData: (data: any) => void }) {
  return (
    <div className="space-y-8">
      {/* Section 1 */}
      <div className="border border-border rounded-xl p-4">
        <h4 className="font-bold text-primary mb-4">SECTION 1: DMRR Received Bill From Line Department</h4>
        <div className="flex items-center gap-4 mb-4" role="radiogroup" aria-labelledby="s10-bill-linedept-q">
          <span id="s10-bill-linedept-q" className="text-sm font-medium">Did DMRR Receive Bill from Line Department?</span>
          <label className="flex items-center gap-1 cursor-pointer text-sm">
            <input type="radio" name="billReceivedLineDept" checked={data.billReceivedLineDept === "yes"} onChange={() => setData({...data, billReceivedLineDept: "yes"})} /> Yes
          </label>
          <label className="flex items-center gap-1 cursor-pointer text-sm">
            <input type="radio" name="billReceivedLineDept" checked={data.billReceivedLineDept === "no"} onChange={() => setData({...data, billReceivedLineDept: "no"})} /> No
          </label>
        </div>
        
        {data.billReceivedLineDept === "yes" && (
          <div className="pl-4 border-l-2 border-primary/20 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Receipt Date</label>
                <input type="date" value={data.lineDeptReceiptDate} onChange={e => setData({...data, lineDeptReceiptDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bill Amount</label>
                <input type="number" value={data.lineDeptBillAmount} onChange={e => setData({...data, lineDeptBillAmount: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
              </div>
            </div>
            <div className="flex gap-2">
              <select value={data.lineDeptDocType} onChange={e => setData({...data, lineDeptDocType: e.target.value})} className="px-3 py-2 border rounded-lg bg-background">
                <option>Invoice</option>
                <option>Bill</option>
                <option>Supporting Documents</option>
                <option>Certification</option>
              </select>
              <label className="px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer flex items-center gap-2">
                <Upload className="size-4" aria-hidden="true"/> Upload
                <input type="file" multiple className="hidden" onChange={e => { if(e.target.files) setData({...data, lineDeptDocs: [...data.lineDeptDocs, ...Array.from(e.target.files)]}) }} />
              </label>
            </div>
            <div className="space-y-2">
              {data.lineDeptDocs.map((doc: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 border rounded bg-background">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2"><FileText className="size-4 text-primary" aria-hidden="true"/> <span className="text-sm font-medium">{doc.name}</span> <span className="text-xs bg-muted px-2 py-0.5 rounded">{data.lineDeptDocType}</span></div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground ml-6">
                      <span>Uploaded: Today</span>
                      <span>By: Current User</span>
                      <span>v1.0</span>
                      <span className="text-green-600 font-medium">OCR: Pending</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-1.5 text-primary hover:bg-muted rounded" title="View" aria-label="View document"><Eye className="size-4" aria-hidden="true"/></button>
                    <button className="p-1.5 text-green-600 hover:bg-muted rounded" title="Download" aria-label="Download document"><Download className="size-4" aria-hidden="true"/></button>
                    <button className="p-1.5 text-blue-600 hover:bg-muted rounded" title="Replace Version" aria-label="Replace document version"><Upload className="size-4" aria-hidden="true"/></button>
                    <button onClick={() => { const docs = [...data.lineDeptDocs]; docs.splice(idx, 1); setData({...data, lineDeptDocs: docs}) }} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Delete Draft" aria-label="Delete document"><Trash2 className="size-4" aria-hidden="true"/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Section 2 */}
      <div className="border border-border rounded-xl p-4">
        <h4 className="font-bold text-primary mb-4">SECTION 2: Bill Received at DO</h4>
        <div className="flex items-center gap-4 mb-4" role="radiogroup" aria-labelledby="s10-bill-do-q">
          <span id="s10-bill-do-q" className="text-sm font-medium">Bill Received at DO?</span>
          <label className="flex items-center gap-1 cursor-pointer text-sm">
            <input type="radio" name="billReceivedDO" checked={data.billReceivedDO === "yes"} onChange={() => setData({...data, billReceivedDO: "yes"})} /> Yes
          </label>
          <label className="flex items-center gap-1 cursor-pointer text-sm">
            <input type="radio" name="billReceivedDO" checked={data.billReceivedDO === "no"} onChange={() => setData({...data, billReceivedDO: "no"})} /> No
          </label>
        </div>
        
        {data.billReceivedDO === "yes" && (
          <div className="pl-4 border-l-2 border-primary/20 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Received Date</label>
                <input type="date" value={data.doReceivedDate} onChange={e => setData({...data, doReceivedDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input type="number" value={data.doAmount} onChange={e => setData({...data, doAmount: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
              </div>
            </div>
            <div className="flex gap-2">
              <label className="px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer flex items-center gap-2">
                <Upload className="size-4" aria-hidden="true"/> Upload Documents
                <input type="file" multiple className="hidden" onChange={e => { if(e.target.files) setData({...data, doDocs: [...data.doDocs, ...Array.from(e.target.files)]}) }} />
              </label>
            </div>
            <div className="space-y-2">
              {data.doDocs?.map((doc: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 border rounded bg-background">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2"><FileText className="size-4 text-primary" aria-hidden="true"/> <span className="text-sm font-medium">{doc.name}</span></div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground ml-6">
                      <span>Uploaded: Today</span>
                      <span>By: Current User</span>
                      <span>v1.0</span>
                      <span className="text-green-600 font-medium">OCR: Pending</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-1.5 text-primary hover:bg-muted rounded" title="View" aria-label="View document"><Eye className="size-4" aria-hidden="true"/></button>
                    <button className="p-1.5 text-green-600 hover:bg-muted rounded" title="Download" aria-label="Download document"><Download className="size-4" aria-hidden="true"/></button>
                    <button className="p-1.5 text-blue-600 hover:bg-muted rounded" title="Replace Version" aria-label="Replace document version"><Upload className="size-4" aria-hidden="true"/></button>
                    <button onClick={() => { const docs = [...data.doDocs]; docs.splice(idx, 1); setData({...data, doDocs: docs}) }} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Delete Draft" aria-label="Delete document"><Trash2 className="size-4" aria-hidden="true"/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Section 3 */}
      <div className="border border-border rounded-xl p-4">
        <h4 className="font-bold text-primary mb-4">SECTION 3: Bill Sent to PS / Minister</h4>
        <div className="flex items-center gap-4 mb-4" role="radiogroup" aria-labelledby="s10-bill-ps-q">
          <span id="s10-bill-ps-q" className="text-sm font-medium">Bill Sent to PS / Minister?</span>
          <label className="flex items-center gap-1 cursor-pointer text-sm">
            <input type="radio" name="billSentPS" checked={data.billSentPS === "yes"} onChange={() => setData({...data, billSentPS: "yes"})} /> Yes
          </label>
          <label className="flex items-center gap-1 cursor-pointer text-sm">
            <input type="radio" name="billSentPS" checked={data.billSentPS === "no"} onChange={() => setData({...data, billSentPS: "no"})} /> No
          </label>
        </div>
        
        {data.billSentPS === "yes" && (
          <div className="pl-4 border-l-2 border-primary/20 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Forwarding Date</label>
                <input type="date" value={data.psForwardingDate} onChange={e => setData({...data, psForwardingDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Remarks</label>
                <input type="text" value={data.psRemarks} onChange={e => setData({...data, psRemarks: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
              </div>
            </div>
            <div>
              <label className="px-4 py-2 border border-border bg-background rounded-lg cursor-pointer inline-flex items-center justify-center gap-2">
                <Upload className="size-4" aria-hidden="true"/> Upload Single File
                <input type="file" className="hidden" onChange={e => { if(e.target.files && e.target.files[0]) setData({...data, psDoc: e.target.files[0]}) }} />
              </label>
              {data.psDoc && (
                <div className="flex justify-between items-center p-3 border rounded bg-background mt-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2"><FileText className="size-4 text-primary" aria-hidden="true"/> <span className="text-sm font-medium">{data.psDoc.name}</span></div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground ml-6">
                      <span>Uploaded: Today</span>
                      <span>By: Current User</span>
                      <span>v1.0</span>
                      <span className="text-green-600 font-medium">OCR: Pending</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-1.5 text-primary hover:bg-muted rounded" title="View" aria-label="View document"><Eye className="size-4" aria-hidden="true"/></button>
                    <button className="p-1.5 text-green-600 hover:bg-muted rounded" title="Download" aria-label="Download document"><Download className="size-4" aria-hidden="true"/></button>
                    <button className="p-1.5 text-blue-600 hover:bg-muted rounded" title="Replace Version" aria-label="Replace document version"><Upload className="size-4" aria-hidden="true"/></button>
                    <button onClick={() => setData({...data, psDoc: null})} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Delete Draft" aria-label="Delete document"><Trash2 className="size-4" aria-hidden="true"/></button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Section 4 */}
      <div className="border border-border rounded-xl p-4">
        <h4 className="font-bold text-primary mb-4">SECTION 4: Payment Order Made</h4>
        <div className="flex items-center gap-4 mb-4" role="radiogroup" aria-labelledby="s10-payment-q">
          <span id="s10-payment-q" className="text-sm font-medium">Payment Order Made?</span>
          <label className="flex items-center gap-1 cursor-pointer text-sm">
            <input type="radio" name="paymentOrderMade" checked={data.paymentOrderMade === "yes"} onChange={() => setData({...data, paymentOrderMade: "yes"})} /> Yes
          </label>
          <label className="flex items-center gap-1 cursor-pointer text-sm">
            <input type="radio" name="paymentOrderMade" checked={data.paymentOrderMade === "no"} onChange={() => setData({...data, paymentOrderMade: "no"})} /> No
          </label>
        </div>
        
        {data.paymentOrderMade === "yes" && (
          <div className="pl-4 border-l-2 border-primary/20 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Payment Order Date</label>
                <input type="date" value={data.paymentOrderDate} onChange={e => setData({...data, paymentOrderDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Installment Phase</label>
                <select value={data.installmentPhase} onChange={e => setData({...data, installmentPhase: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background">
                  <option>25%</option>
                  <option>50%</option>
                  <option>75%</option>
                  <option>100%</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount Released</label>
                <input type="number" value={data.amountReleased} onChange={e => setData({...data, amountReleased: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Release Remarks</label>
                <input type="text" value={data.releaseRemarks} onChange={e => setData({...data, releaseRemarks: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-background" />
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
              <p className="font-semibold text-green-800 mb-2">Fund Release Tracker</p>
              <div className="flex items-center justify-between text-xs font-medium text-green-700 mb-2">
                <span className={data.installmentPhase === "25%" ? "bg-green-600 text-white px-2 py-1 rounded" : ""}>25%</span>
                <span>→</span>
                <span className={data.installmentPhase === "50%" ? "bg-green-600 text-white px-2 py-1 rounded" : ""}>50%</span>
                <span>→</span>
                <span className={data.installmentPhase === "75%" ? "bg-green-600 text-white px-2 py-1 rounded" : ""}>75%</span>
                <span>→</span>
                <span className={data.installmentPhase === "100%" ? "bg-green-600 text-white px-2 py-1 rounded" : ""}>100%</span>
              </div>
              <div className="flex justify-between mt-4">
                <div>
                  <p className="text-xs text-green-600">Released Amount</p>
                  <p className="text-sm font-bold text-green-900">₹{data.amountReleased || "0"}</p>
                </div>
                <div>
                  <p className="text-xs text-green-600">Release Date</p>
                  <p className="text-sm font-bold text-green-900">{data.paymentOrderDate || "-"}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <select value={data.paymentDocType} onChange={e => setData({...data, paymentDocType: e.target.value})} className="px-3 py-2 border rounded-lg bg-background">
                <option>Payment Order</option>
                <option>Fund Release Approval</option>
                <option>Sanction Letter</option>
              </select>
              <label className="px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer flex items-center gap-2">
                <Upload className="size-4" aria-hidden="true"/> Upload Single File
                <input type="file" className="hidden" onChange={e => { if(e.target.files && e.target.files[0]) setData({...data, paymentDoc: e.target.files[0]}) }} />
              </label>
            </div>
            {data.paymentDoc && (
              <div className="flex justify-between items-center p-3 border rounded bg-background mt-2">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2"><FileText className="size-4 text-primary" aria-hidden="true"/> <span className="text-sm font-medium">{data.paymentDoc.name}</span> <span className="text-xs bg-muted px-2 py-0.5 rounded">{data.paymentDocType}</span></div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground ml-6">
                    <span>Uploaded: Today</span>
                    <span>By: Current User</span>
                    <span>v1.0</span>
                    <span className="text-green-600 font-medium">OCR: Pending</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-1.5 text-primary hover:bg-muted rounded" title="View" aria-label="View document"><Eye className="size-4" aria-hidden="true"/></button>
                  <button className="p-1.5 text-green-600 hover:bg-muted rounded" title="Download" aria-label="Download document"><Download className="size-4" aria-hidden="true"/></button>
                  <button className="p-1.5 text-blue-600 hover:bg-muted rounded" title="Replace Version" aria-label="Replace document version"><Upload className="size-4" aria-hidden="true"/></button>
                  <button onClick={() => setData({...data, paymentDoc: null})} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Delete Draft" aria-label="Delete document"><Trash2 className="size-4" aria-hidden="true"/></button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
