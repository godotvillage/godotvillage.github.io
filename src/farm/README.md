---
title: 填坑农场
icon: seedling
index: false
sidebar: false
toc: false
article: false
author:
  name: Fromlan
  url: https://github.com/Fromlan
date: 2025-10-10
---

<div class="farm-container">
  <div class="farm-header">
    <h1>🌱 填坑农场</h1>
    <p class="farm-subtitle">种下创意的种子，收获完成的果实</p>
    <FarmStats />
  </div>

  <div class="farm-intro">
    <h2>🎯 农场简介</h2>
    <p>填坑农场是一个专为创意项目和想法管理而设计的协作平台。无论你有什么天马行空的想法，还是想要完成的小项目，都可以在这里"种下"，让小伙伴们一起来督促你"浇水施肥"。</p>
  </div>

  <div class="section">
    <h2>📋 项目展示</h2>
    <FarmList />
  </div>

  <div class="section">
    <h2>🔍 项目搜索</h2>
    <FarmSearch />
  </div>

  <div class="section">
    <h2>🌱 种下种子</h2>
    <FarmSubmitForm />
  </div>
</div>

<style>
.farm-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.farm-header {
  text-align: center;
  margin-bottom: 50px;
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  color: white;
  position: relative;
  overflow: hidden;
}

.farm-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="30" r="1.5" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="70" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="80" r="2.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="60" r="1.5" fill="rgba(255,255,255,0.1)"/></svg>');
  animation: float 20s infinite linear;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.farm-header h1 {
  margin: 0 0 15px 0;
  font-size: 2.5em;
  font-weight: 700;
  position: relative;
  z-index: 1;
}

.farm-subtitle {
  font-size: 1.3em;
  margin-bottom: 30px;
  opacity: 0.9;
  position: relative;
  z-index: 1;
}


.farm-intro {
  margin-bottom: 50px;
  text-align: center;
}

.farm-intro h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 2em;
}

.farm-intro p {
  color: #7f8c8d;
  font-size: 1.2em;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto 40px auto;
}

.features-grid {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) !important;
  gap: 25px !important;
  margin: 40px 0 !important;
  padding: 0 !important;
}

.feature-card {
  background: white !important;
  padding: 30px 20px !important;
  border-radius: 15px !important;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1) !important;
  transition: all 0.3s ease !important;
  border: 2px solid transparent !important;
  text-align: center !important;
  display: block !important;
}

.feature-card:hover {
  transform: translateY(-5px) !important;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
  border-color: #27ae60 !important;
}

.feature-icon {
  font-size: 3em !important;
  margin-bottom: 15px !important;
  display: block !important;
}

.feature-card h3 {
  color: #2c3e50 !important;
  margin: 10px 0 !important;
  font-size: 1.3em !important;
  font-weight: bold !important;
}

.feature-card p {
  color: #7f8c8d !important;
  line-height: 1.5 !important;
  margin: 0 !important;
  font-size: 1em !important;
}

.section {
  margin-bottom: 50px;
  padding: 30px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  position: relative;
  overflow: hidden;
}

.section::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  animation: backgroundMove 30s linear infinite;
}

@keyframes backgroundMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(20px, 20px); }
}

.section h2 {
  color: #2c3e50;
  margin-bottom: 25px;
  font-size: 1.8em;
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  z-index: 1;
}

.section > * {
  position: relative;
  z-index: 1;
}

/* 添加一些动画效果 */
.farm-container {
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-card {
  animation: fadeInUp 0.6s ease-out;
  animation-fill-mode: both;
}

.feature-card:nth-child(1) { animation-delay: 0.1s; }
.feature-card:nth-child(2) { animation-delay: 0.2s; }
.feature-card:nth-child(3) { animation-delay: 0.3s; }
.feature-card:nth-child(4) { animation-delay: 0.4s; }

/* 暗色模式样式 */
[data-theme='dark'] .farm-container {
  color: var(--vp-c-text);
}

[data-theme='dark'] .farm-header {
  background: linear-gradient(135deg, var(--vp-c-accent) 0%, var(--vp-c-accent-bg) 100%);
  color: var(--vp-c-text);
}

[data-theme='dark'] .farm-intro h2 {
  color: var(--vp-c-text);
}

[data-theme='dark'] .farm-intro p {
  color: var(--vp-c-text-mute);
}

[data-theme='dark'] .feature-card {
  background: var(--vp-c-bg-elv) !important;
  border: 2px solid var(--vp-c-border) !important;
  color: var(--vp-c-text) !important;
}

[data-theme='dark'] .feature-card:hover {
  border-color: var(--vp-c-accent) !important;
  box-shadow: 0 10px 30px var(--vp-c-shadow) !important;
}

[data-theme='dark'] .feature-card h3 {
  color: var(--vp-c-text) !important;
}

[data-theme='dark'] .feature-card p {
  color: var(--vp-c-text-mute) !important;
}

[data-theme='dark'] .section {
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-border);
}

[data-theme='dark'] .section h2 {
  color: var(--vp-c-text);
}

@media (max-width: 768px) {
  .farm-container {
    padding: 10px;
  }
  
  .farm-header {
    padding: 30px 15px;
    margin-bottom: 30px;
  }
  
  .farm-header h1 {
    font-size: 2em;
  }
  
  .farm-subtitle {
    font-size: 1.1em;
  }
  
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .section {
    padding: 20px 15px;
    margin-bottom: 30px;
  }
  
  .section h2 {
    font-size: 1.5em;
  }
}

</style>
