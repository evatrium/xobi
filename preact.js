import{Component as e,h as t}from"preact";import{useCallback as n,useEffect as o,useState as r}from"preact/hooks";const i=e=>"[object Object]"===Object.prototype.toString.call(e),c=(e,t,n)=>Object.defineProperty(e,t,n),s=new Promise(e=>e()),$=e=>Object.keys(e),a=e=>!$(e).length,p=(e,t=!1)=>()=>t||(t=s.then(()=>(e(),t=!1))),h=(e,t)=>($(t).map(n=>i(e[n])&&i(t[n])?h(e[n],t[n]):e[n]=t[n]),e),l=(e=[],t=(t=>e.splice(e.indexOf(t)>>>0,1)))=>[n=>(e.push(n),()=>t(n)),(...t)=>e.slice().map(e=>e(...t))];let u=()=>Object.create(null);u.heyyoooo="!@#$!@#$!@#$!@#$";const f=(b=n=>o=>r=>{let i=!0===o;function c(){this.componentWillUnmount=(!i&&o?n.$select(o):n)[i?"$onAnyChange":"$onChange"](()=>this.setState(u())),this.render=()=>t(r,this.props,this.props.children)}return(c.prototype=new e).constructor=c},g=e=>t=>{let i=(([,e]=r(u()))=>n(()=>e(u()),[e]))(),c=!0===t;return o(()=>(!c&&t?e.$select(t):e)[c?"$onAnyChange":"$onChange"](i),[]),e},e=>{let t={},[n,o]=l(),r=p(()=>(!a(t)&&o($(t)),t={}));const u=(e,o="",[f,m]=l(),y)=>{if(e.$xobi)return e;y={$use:g&&g(e),$connect:b&&b(e),$xobi:{paths:{}},$notify:p(({$xobi:t}=e)=>(!a(t.paths)&&m($(t.paths)),t.paths={})),$onChange:e=>f(e),$onAnyChange:e=>n(e),$getState:()=>$(e).reduce((t,n)=>"function"!=typeof e[n]?(t[n]=i(e[n])&&e[n].$xobi?e[n].$getState():e[n],t):t,{}),$merge:t=>(i(t)&&h(e,t),s),$select:(t,n={})=>(h(n,y),h(n,e),n.$onChange=(n,[o,r]=l(),i,c)=>(i=e.$onAnyChange((e=[])=>[].concat(t).some(t=>e.includes(t))&&r(e)),c=o(n),()=>(i(),c())),n)};for(let t in y)c(e,t,{enumerable:!1,value:y[t]});for(let n in e){let s=e[n],$=o+(o?".":"")+n;i(s)&&u(e[n],$),c(e,n,{enumerable:!0,get:()=>s,set(o){if(o!==s){if("$"===n[0])return s=o;if(i(s)&&s.$xobi&&i(o))return h(e[n],o);s=o,t[$]=e.$xobi.paths[$]=!0,r(),e.$notify()}}})}return e};return u(e)});var b,g;export{f as xobi};
