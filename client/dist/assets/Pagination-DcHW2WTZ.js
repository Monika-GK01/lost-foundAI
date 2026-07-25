import{c as o,j as r}from"./index-Dka3Renx.js";/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const a=o("ChevronLeft",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]);/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=o("ChevronRight",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);function x({page:s,totalPages:t,onPageChange:n}){if(t<=1)return null;const c=[],i=Math.max(1,s-2),d=Math.min(t,s+2);for(let e=i;e<=d;e++)c.push(e);return r.jsxs("div",{className:"flex items-center justify-center gap-1",children:[r.jsx("button",{onClick:()=>n(s-1),disabled:s<=1,className:"rounded-lg p-2 hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-800",children:r.jsx(a,{size:18})}),i>1&&r.jsxs(r.Fragment,{children:[r.jsx("button",{onClick:()=>n(1),className:"rounded-lg px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800",children:"1"}),i>2&&r.jsx("span",{className:"px-1 text-gray-400",children:"…"})]}),c.map(e=>r.jsx("button",{onClick:()=>n(e),className:`rounded-lg px-3 py-1.5 text-sm font-medium ${e===s?"bg-primary-600 text-white":"hover:bg-gray-100 dark:hover:bg-gray-800"}`,children:e},e)),d<t&&r.jsxs(r.Fragment,{children:[d<t-1&&r.jsx("span",{className:"px-1 text-gray-400",children:"…"}),r.jsx("button",{onClick:()=>n(t),className:"rounded-lg px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800",children:t})]}),r.jsx("button",{onClick:()=>n(s+1),disabled:s>=t,className:"rounded-lg p-2 hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-800",children:r.jsx(h,{size:18})})]})}export{x as P};
