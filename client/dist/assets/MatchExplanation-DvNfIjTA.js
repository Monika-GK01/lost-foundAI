import{c,j as e}from"./index-BGalEC44.js";import{T as i,P as o,C as m}from"./tag-Clgc8m4M.js";import{M as x}from"./map-pin-PM-cATmc.js";import{C as d}from"./circle-check-big-DOp1v6cR.js";/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=c("FolderOpen",[["path",{d:"m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2",key:"usdka0"}]]);/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=c("Image",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",ry:"2",key:"1m3agn"}],["circle",{cx:"9",cy:"9",r:"2",key:"af1f0g"}],["path",{d:"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",key:"1xmnt7"}]]);/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=c("Type",[["polyline",{points:"4 7 4 4 20 4 20 7",key:"1nosan"}],["line",{x1:"9",x2:"15",y1:"20",y2:"20",key:"swin9y"}],["line",{x1:"12",x2:"12",y1:"4",y2:"20",key:"1tx1rr"}]]);function h({label:r,value:l,icon:t}){const a=Math.round(l*100),s=a>=70?"bg-green-500":a>=40?"bg-yellow-500":"bg-gray-400";return e.jsxs("div",{className:"flex items-center gap-2",children:[t&&e.jsx("span",{className:"flex w-5 items-center justify-center text-[var(--color-text-secondary)]",children:t}),e.jsx("span",{className:"w-24 text-xs text-[var(--color-text-secondary)]",children:r}),e.jsx("div",{className:"h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700",children:e.jsx("div",{className:`h-full rounded-full ${s}`,style:{width:`${a}%`}})}),e.jsxs("span",{className:"w-8 text-right text-xs font-medium",children:[a,"%"]})]})}const u=[{key:"imageScore",label:"Image",icon:p},{key:"titleScore",label:"Title",icon:g},{key:"brandScore",label:"Brand",icon:i},{key:"categoryScore",label:"Category",icon:y},{key:"colorScore",label:"Color",icon:o},{key:"locationScore",label:"Location",icon:x},{key:"dateScore",label:"Date",icon:m}];function N({scores:r,showExplanation:l=!0}){const t=r.explanation??[];return e.jsxs("div",{className:"space-y-3",children:[r.summary&&e.jsx("p",{className:"rounded-lg bg-primary-50 px-3 py-2 text-sm italic text-primary-800 dark:bg-primary-900/20 dark:text-primary-200",children:r.summary}),e.jsx("div",{className:"space-y-1.5 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50",children:u.map(({key:a,label:s,icon:n})=>e.jsx(h,{label:s,value:r[a]??0,icon:e.jsx(n,{size:12})},a))}),l&&t.length>0&&e.jsxs("div",{children:[e.jsx("p",{className:"mb-2 text-sm font-medium",children:"Why this match?"}),e.jsx("ul",{className:"space-y-1.5",children:t.map((a,s)=>e.jsxs("li",{className:"flex items-start gap-2 text-sm text-[var(--color-text-secondary)]",children:[e.jsx(d,{size:15,className:"mt-0.5 shrink-0 text-green-500"}),a]},s))})]})]})}export{p as I,N as M};
