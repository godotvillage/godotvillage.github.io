<template>
  <a class="feedback-button" href="https://ai.feishu.cn/share/base/form/shrcncDRFhpbbhOqR9AMBKMOuBe" target="_blank" rel="noopener noreferrer" title="插件反馈">
    <span class="text">反馈</span>
  </a>
</template>

<style scoped>
.feedback-button {
  position: fixed;
  right: 20px;
  bottom: 140px;
  z-index: 100;
  background-color: #FF6B35; /* Alpha brand color */
  color: white !important; /* Force white color to override theme link styles */
  width: 56px;
  height: 56px;
  padding: 0;
  border-radius: 50%;
  text-decoration: none;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3); /* Colored shadow */
  transition: all 0.3s ease;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
    border: 2px solid transparent;
    text-align: center;
  }
  
  .feedback-button:hover {
    background-color: #e55a28;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 107, 53, 0.4);
    text-decoration: none !important;
  }
  
  .feedback-button .text {
    display: block;
    font-size: 14px;
    line-height: 1;
    width: 100%;
  }

/* Mobile adaptation */
@media (max-width: 719px) {
  .feedback-button {
    right: 16px;
    bottom: 30px;
    width: 48px;
    height: 48px;
  }
  
  .feedback-button .text {
    font-size: 12px;
  }
}
</style>
