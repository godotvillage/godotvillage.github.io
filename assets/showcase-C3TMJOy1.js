async function o(){const s=await fetch("/data/showcase.json");if(!s.ok)throw new Error(`加载作品数据失败: ${s.status}`);return s.json()}export{o as f};
