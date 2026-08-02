import{c as y,r as v,u as S,j as e,x as C,f as P,F as z,z as m,i as E}from"./index-BGalEC44.js";import{E as F}from"./EmptyState-Bw80IV1S.js";/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const T=y("Download",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"7 10 12 15 17 10",key:"2ggqvy"}],["line",{x1:"12",x2:"12",y1:"15",y2:"3",key:"1vk2je"}]]);/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=y("Printer",[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]]);/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D=y("Table2",[["path",{d:"M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18",key:"gugj83"}]]),j=[{value:"recovered",label:"Recovered Items"},{value:"lost",label:"Lost Items"},{value:"found",label:"Found Items"},{value:"claims",label:"Claims"}];function M(s,c){const r=n=>{const a=String(n??"");return/[",\n]/.test(a)?`"${a.replace(/"/g,'""')}"`:a};return[s.map(r).join(","),...c.map(n=>n.map(r).join(","))].join(`
`)}function I(s,c,r){const n=s instanceof Blob?s:new Blob([s],{type:r}),a=URL.createObjectURL(n),d=document.createElement("a");d.href=a,d.download=c,document.body.appendChild(d),d.click(),document.body.removeChild(d),URL.revokeObjectURL(a)}function H(){var g;const[s,c]=v.useState("recovered"),[r,n]=v.useState(""),[a,d]=v.useState(""),{data:h,isLoading:w,isFetching:f}=S({queryKey:["report",s,r,a],queryFn:()=>E.getReport({type:s,from:r||void 0,to:a||void 0})}),l=(g=h==null?void 0:h.data)==null?void 0:g.data,b=(l==null?void 0:l.headers)??[],o=(l==null?void 0:l.rows)??[],N=`${s}-report-${new Date().toISOString().slice(0,10)}`,k=()=>{if(o.length===0){m.error("No data to export");return}I(M(b,o),`${N}.csv`,"text/csv;charset=utf-8"),m.success("CSV downloaded")},$=()=>{var x;if(o.length===0){m.error("No data to export");return}const t=((x=j.find(p=>p.value===s))==null?void 0:x.label)??"Report",i=window.open("","_blank");if(!i){m.error("Please allow pop-ups to export PDF");return}const u=o.map(p=>`<tr>${p.map(R=>`<td>${String(R??"").replace(/</g,"&lt;")}</td>`).join("")}</tr>`).join("");i.document.write(`
      <html>
        <head>
          <title>${t}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h1 { font-size: 20px; margin-bottom: 4px; }
            p { color: #666; font-size: 12px; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
            th { background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h1>${t} Report</h1>
          <p>Generated ${new Date().toLocaleString()} · ${o.length} records${r||a?` · ${r||"…"} to ${a||"…"}`:""}</p>
          <table>
            <thead><tr>${b.map(p=>`<th>${p}</th>`).join("")}</tr></thead>
            <tbody>${u}</tbody>
          </table>
          <script>window.onload = function () { window.print(); }<\/script>
        </body>
      </html>
    `),i.document.close()};return e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-2xl font-bold",children:"Reports Export"}),e.jsx("p",{className:"mt-1 text-sm text-[var(--color-text-secondary)]",children:"Generate and export recovered, lost, found, and claims reports."})]}),e.jsxs("div",{className:"card space-y-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-sm font-medium",children:"Report Type"}),e.jsx("div",{className:"flex flex-wrap gap-2",children:j.map(t=>e.jsx("button",{onClick:()=>c(t.value),className:C("rounded-lg px-3 py-2 text-sm font-medium transition-colors",s===t.value?"bg-primary-600 text-white":"bg-gray-100 text-[var(--color-text-secondary)] hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"),children:t.label},t.value))})]}),e.jsxs("div",{className:"flex flex-wrap items-end gap-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-sm font-medium",children:"From"}),e.jsx("input",{type:"date",value:r,onChange:t=>n(t.target.value),className:"input-field"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"mb-1.5 block text-sm font-medium",children:"To"}),e.jsx("input",{type:"date",value:a,onChange:t=>d(t.target.value),className:"input-field"})]}),e.jsxs("div",{className:"ml-auto flex gap-2",children:[e.jsxs("button",{onClick:k,disabled:f||o.length===0,className:"btn-secondary disabled:opacity-50",children:[e.jsx(T,{size:15})," CSV"]}),e.jsxs("button",{onClick:$,disabled:f||o.length===0,className:"btn-secondary disabled:opacity-50",children:[e.jsx(L,{size:15})," PDF"]})]})]})]}),e.jsxs("div",{className:"card p-0",children:[e.jsxs("div",{className:"flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3",children:[e.jsxs("h3",{className:"flex items-center gap-2 font-semibold",children:[e.jsx(D,{size:16})," Preview"]}),e.jsxs("span",{className:"text-sm text-[var(--color-text-secondary)]",children:[(l==null?void 0:l.count)??0," records"]})]}),w?e.jsx("div",{className:"space-y-3 p-4",children:[1,2,3,4].map(t=>e.jsx(P,{className:"h-10 w-full"},t))}):o.length===0?e.jsx("div",{className:"p-4",children:e.jsx(F,{icon:e.jsx(z,{size:40}),title:"No records",description:"No data matches the selected filters."})}):e.jsxs("div",{className:"max-h-[520px] overflow-auto",children:[e.jsxs("table",{className:"w-full min-w-[640px] text-left text-sm",children:[e.jsx("thead",{className:"sticky top-0 bg-[var(--color-surface)] text-xs uppercase tracking-wider text-[var(--color-text-secondary)]",children:e.jsx("tr",{children:b.map(t=>e.jsx("th",{className:"whitespace-nowrap border-b border-[var(--color-border)] px-4 py-3 font-semibold",children:t},t))})}),e.jsx("tbody",{className:"divide-y divide-[var(--color-border)]",children:o.slice(0,200).map((t,i)=>e.jsx("tr",{className:"hover:bg-gray-50 dark:hover:bg-gray-800/40",children:t.map((u,x)=>e.jsx("td",{className:"whitespace-nowrap px-4 py-2.5 text-[var(--color-text-secondary)]",children:u},x))},i))})]}),o.length>200&&e.jsxs("p",{className:"border-t border-[var(--color-border)] px-4 py-2 text-center text-xs text-[var(--color-text-secondary)]",children:["Showing first 200 of ",o.length," records. Export to view all."]})]})]})]})}export{H as default};
