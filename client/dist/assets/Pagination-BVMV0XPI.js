import{c as d,j as r}from"./index-DWr7t1Rf.js";/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=d("ChevronLeft",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]);/**
 * @license lucide-react v0.395.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c=d("ChevronRight",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);function x({page:a,totalPages:s,onPageChange:n}){if(s<=1)return null;const o=[],i=Math.max(1,a-2),t=Math.min(s,a+2);for(let e=i;e<=t;e++)o.push(e);return r.jsxs("nav",{className:"flex items-center justify-center gap-1",role:"navigation","aria-label":"Pagination",children:[r.jsx("button",{onClick:()=>n(a-1),disabled:a<=1,className:"rounded-lg p-2 hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-800","aria-label":"Previous page",children:r.jsx(l,{size:18})}),i>1&&r.jsxs(r.Fragment,{children:[r.jsx("button",{onClick:()=>n(1),className:"rounded-lg px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800",children:"1"}),i>2&&r.jsx("span",{className:"px-1 text-gray-400",children:"…"})]}),o.map(e=>r.jsx("button",{onClick:()=>n(e),className:`rounded-lg px-3 py-1.5 text-sm font-medium ${e===a?"bg-primary-600 text-white":"hover:bg-gray-100 dark:hover:bg-gray-800"}`,"aria-label":`Page ${e}`,"aria-current":e===a?"page":void 0,children:e},e)),t<s&&r.jsxs(r.Fragment,{children:[t<s-1&&r.jsx("span",{className:"px-1 text-gray-400",children:"…"}),r.jsx("button",{onClick:()=>n(s),className:"rounded-lg px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800",children:s})]}),r.jsx("button",{onClick:()=>n(a+1),disabled:a>=s,className:"rounded-lg p-2 hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-800","aria-label":"Next page",children:r.jsx(c,{size:18})})]})}export{c as C,x as P};
