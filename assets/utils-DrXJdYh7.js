function d(r){const e=r.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);if(!e)return{metadata:{},content:r};const a=e[1],i=e[2],s={},u=a.split(/\r?\n/);let t="",n=[];function c(){t&&n.length>0&&(s[t]=n.join(", "),n=[]),t=""}for(const l of u){const m=l.match(/^\s+-\s+(.*)/);if(m&&t){n.push(m[1].trim());continue}c();const o=l.match(/^(\w+):\s*(.*)/);if(o){const p=o[1],f=o[2].trim();f===""?t=p:s[p]=f}}return c(),{metadata:s,content:i}}function h(r){return r.replace(/<BiliBlackboard\s+width="([^"]*)"\s+link="([^"]*)"\s*\/>/g,(e,a,i)=>`<div class="bilibili-wrapper" style="max-width:${a||"750px"};margin:16px 0;">
  <iframe
    src="//player.bilibili.com/player.html?bvid=${i}&page=1&autoplay=false"
    scrolling="no"
    border="0"
    frameborder="no"
    framespacing="0"
    allowfullscreen="true"
    style="width:100%;aspect-ratio:16/9;border-radius:8px;"
  ></iframe>
</div>`)}export{h as a,d as p};
