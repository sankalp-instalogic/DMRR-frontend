import { useState } from "react";

import {
Plus,
Edit2,
X
} from "lucide-react";

import {
PieChart,
Pie,
Cell,
ResponsiveContainer,
Tooltip,
Legend,
BarChart,
Bar,
XAxis,
YAxis,
CartesianGrid
} from "recharts";

const pieData = [
{
name: "PWD",
value: 387,
},
{
name: "WRD",
value: 298,
},
{
name: "Forest",
value: 234,
},
];

const districtUtilization = [
{
district: "Mumbai",
PWD: 140,
WRD: 110,
Forest: 80,
},
{
district: "Pune",
PWD: 120,
WRD: 90,
Forest: 60,
},
{
district: "Nagpur",
PWD: 100,
WRD: 70,
Forest: 50,
},
];

const COLORS = [
"#2563eb",
"#16a34a",
"#f97316"
];

const budgets = [
{
  fy: "2025-26",
  lineDept: "PWD",
  allocated: 450,
  utilized: 387,
  remaining: 63,
  utilization: 86,
},
{
  fy: "2025-26",
  lineDept: "WRD",
  allocated: 380,
  utilized: 298,
  remaining: 82,
  utilization: 78,
},
{
  fy: "2025-26",
  lineDept: "Forest Department",
  allocated: 290,
  utilized: 234,
  remaining: 56,
  utilization: 81,
},
];

export function BudgetMaster() {
  const [selectedDept, setSelectedDept] = useState<any>(null);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Budget Master</h1>
          <p className="text-sm text-muted-foreground">Manage budget allocations</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2 hover:opacity-90">
          <Plus className="size-5" />
          Add Budget Entry
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-left text-sm">Financial Year</th>
                <th className="px-6 py-4 text-left text-sm">Line Department</th>
                <th className="px-6 py-4 text-left text-sm">Allocated</th>
                <th className="px-6 py-4 text-left text-sm">Utilized</th>
                <th className="px-6 py-4 text-left text-sm">Remaining</th>
                <th className="px-6 py-4 text-left text-sm">Utilization %</th>
                <th className="px-6 py-4 text-left text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((budget, index) => (
                <tr key={index} className="border-t border-border hover:bg-muted/50">
                  <td className="px-6 py-4 font-medium">{budget.fy}</td>
                  <td
className="text-primary cursor-pointer font-medium"
onClick={() => setSelectedDept(budget)}
>
{budget.lineDept}
</td>
                  <td className="px-6 py-4">{budget.allocated}</td>
                  <td className="px-6 py-4 text-accent">{budget.utilized}</td>
                  <td className="px-6 py-4">{budget.remaining}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-accent h-2 rounded-full"
                          style={{ width: `${budget.utilization}%` }}
                        />
                      </div>
                      <span className="text-sm">{budget.utilization}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 hover:bg-muted rounded">
                      <Edit2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {selectedDept && (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

<div className="bg-card rounded-xl shadow-xl w-[950px] max-h-[85vh] overflow-y-auto p-6 relative">

<button
onClick={() => setSelectedDept(null)}
className="absolute top-4 right-4"
>
<X className="size-5"/>
</button>

<h2 className="text-xl font-bold mb-6">
Line Department Details
</h2>

<div className="grid md:grid-cols-2 gap-6 mb-6">

<div>
<label className="text-sm font-medium">
Line Dept Name
</label>

<input
readOnly
value={selectedDept.lineDept}
className="w-full border rounded-lg px-4 py-2 bg-muted"
/>
</div>

<div>
<label className="text-sm font-medium">
Budget Allocated
</label>

<input
readOnly
value={`₹${selectedDept.allocated} Cr`}
className="w-full border rounded-lg px-4 py-2 bg-muted"
/>
</div>

<div>
<label className="text-sm font-medium">
Budget Utilized
</label>

<input
readOnly
value={`₹${selectedDept.utilized} Cr`}
className="w-full border rounded-lg px-4 py-2 bg-muted"
/>
</div>

</div>

<h3 className="font-bold mb-4">
Projects Utilizing Budget
</h3>

<table className="w-full border">

<thead className="bg-muted">

<tr>
<th className="border px-3 py-2">
District
</th>

<th className="border px-3 py-2">
Project Name
</th>

<th className="border px-3 py-2">
Project Description
</th>

<th className="border px-3 py-2">
Budget Used
</th>
</tr>

</thead>

<tbody>

<tr>
<td className="border px-3 py-2">
Mumbai
</td>

<td className="border px-3 py-2">
Flood Protection Wall
</td>

<td className="border px-3 py-2">
Construction of retaining wall
</td>

<td className="border px-3 py-2">
₹45 Cr
</td>
</tr>

<tr>
<td className="border px-3 py-2">
Pune
</td>

<td className="border px-3 py-2">
River Deepening
</td>

<td className="border px-3 py-2">
Desilting and widening
</td>

<td className="border px-3 py-2">
₹28 Cr
</td>
</tr>

<tr>
<td className="border px-3 py-2">
Nagpur
</td>

<td className="border px-3 py-2">
Storm Water Drainage
</td>

<td className="border px-3 py-2">
Drain network improvement
</td>

<td className="border px-3 py-2">
₹35 Cr
</td>
</tr>

</tbody>

</table>

</div>

</div>

)}


          
        </div>
      </div>
<div className="grid md:grid-cols-2 gap-6">

{/* Donut Chart */}

<div className="bg-card border rounded-xl p-6">

<h3 className="font-bold mb-5">
Budget Spent by Beneficiary Department
</h3>

<div className="h-[350px]">

<ResponsiveContainer width="100%" height="100%">

<PieChart>

<Pie
data={pieData}
innerRadius={70}
outerRadius={110}
dataKey="value"
nameKey="name"
label
>

{pieData.map((entry,index)=>(
<Cell
key={entry.name}
fill={COLORS[index % COLORS.length]}
/>
))}

</Pie>

<Tooltip/>
<Legend/>

</PieChart>

</ResponsiveContainer>

</div>

</div>


{/* Multiple Bar Chart */}

<div className="bg-card border rounded-xl p-6">

<h3 className="font-bold mb-5">
District-wise Budget Utilization
</h3>

<div className="h-[350px]">

<ResponsiveContainer width="100%" height="100%">

<BarChart data={districtUtilization}>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis dataKey="district"/>

<YAxis/>

<Tooltip/>

<Legend/>

<Bar dataKey="PWD" fill="#2563eb" />
<Bar dataKey="WRD" fill="#16a34a" />
<Bar dataKey="Forest" fill="#f97316" />

</BarChart>

</ResponsiveContainer>

</div>

</div>

</div>
      
    </div>
  );
}
