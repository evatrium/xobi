import{useCallback as e,useEffect as t,useState as n}from"react";const o=e=>"[object Object]"===Object.prototype.toString.call(e),r=(e,t,n)=>Object.defineProperty(e,t,n),a=new Promise(e=>e()),c=e=>Object.keys(e),i=e=>!c(e).length,$=(e,t=!1)=>()=>t||(t=a.then(()=>(e(),t=!1))),l=(e,t)=>(c(t).map(n=>o(e[n])&&o(t[n])?l(e[n],t[n]):e[n]=t[n]),e),s=(e=[],t=(t=>e.splice(e.indexOf(t)>>>0,1)))=>[n=>(e.push(n),()=>t(n)),(...t)=>e.slice().map(e=>e(...t))];let u=()=>Object.create(null);const p=(b=o=>r=>{let a=(([,t]=n(u()))=>e(()=>t(u()),[t]))(),c=!0===r;return t(()=>(!c&&r?o.$select(r):o)[c?"$onAnyChange":"$onChange"](a),[]),o},e=>{let t={},[n,u]=s(),p=$(()=>(!i(t)&&u(c(t)),t={}));const h=(e,u="",[f,g]=s(),m)=>{if(e.$xobi)return e;m={$use:b&&b(e),$connect:null,$xobi:{paths:{}},$notify:$(({$xobi:t}=e)=>(!i(t.paths)&&g(c(t.paths)),t.paths={})),$onChange:e=>f(e),$onAnyChange:e=>n(e),$getState:()=>c(e).reduce((t,n)=>"function"!=typeof e[n]?(t[n]=o(e[n])&&e[n].$xobi?e[n].$getState():e[n],t):t,{}),$merge:t=>(o(t)&&l(e,t),a),$select:(t,n={})=>(l(n,m),l(n,e),n.$onChange=(n,[o,r]=s(),a,c)=>(a=e.$onAnyChange((e=[])=>[].concat(t).some(t=>e.includes(t))&&r(e)),c=o(n),()=>(a(),c())),n)};for(let t in m)r(e,t,{enumerable:!1,value:m[t]});for(let n in e){let a=e[n],c=u+(u?".":"")+n;o(a)&&h(e[n],c),r(e,n,{enumerable:!0,get:()=>a,set(r){if(r!==a){if("$"===n[0])return a=r;if(o(a)&&a.$xobi&&o(r))return l(e[n],r);a=r,t[c]=e.$xobi.paths[c]=!0,p(),e.$notify()}}})}return e};return h(e)});var b;export{p as xobi};
