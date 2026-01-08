<template>
  <a class="azz-button" href="https://azz.net/godotalphaagent" target="_blank" rel="noopener noreferrer" title="Alpha爱赞助链接">
    <span class="text">爱赞助</span>
  </a>
</template>

<style scoped>
.azz-button {
  position: fixed;
  right: 20px;
  bottom: 220px;
  z-index: 100;
  background-color: #07bb7c; /* Alpha brand color */
  color: white !important; /* Force white color to override theme link styles */
  width: 56px;
  height: 56px;
  padding: 0;
  border-radius: 50%;
  text-decoration: none;
  box-shadow: 0 4px 12px #068559; /* Colored shadow */
  transition: all 0.3s ease;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
    border: 2px solid transparent;
    text-align: center;
  }
  
  .azz-button:hover {
    background-color: #07a46d;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px #05704b;
    text-decoration: none !important;
  }
  
  .azz-button .text {
    display: block;
    font-size: 14px;
    line-height: 1;
    width: 100%;
  }

/* Mobile adaptation */
@media (max-width: 719px) {
  .azz-button {
    right: 16px;
    bottom: 30px;
    width: 48px;
    height: 48px;
  }
  
  .azz-button .text {
    font-size: 12px;
  }
}
</style>
