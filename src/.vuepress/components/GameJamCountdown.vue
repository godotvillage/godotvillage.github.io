<template>
  <div class="countdown-container">
    <div class="countdown-title" v-if="isActive">距离 GameJam 开始还有</div>
    <div class="countdown-title" v-else>GameJam 已经开始！</div>
    
    <div class="countdown-timer" v-if="isActive">
      <div class="time-block">
        <span class="number">{{ days }}</span>
        <span class="label">天</span>
      </div>
      <div class="separator">:</div>
      <div class="time-block">
        <span class="number">{{ hours }}</span>
        <span class="label">时</span>
      </div>
      <div class="separator">:</div>
      <div class="time-block">
        <span class="number">{{ minutes }}</span>
        <span class="label">分</span>
      </div>
      <div class="separator">:</div>
      <div class="time-block">
        <span class="number">{{ seconds }}</span>
        <span class="label">秒</span>
      </div>
    </div>
    <div class="countdown-ended" v-else>
      活动火热进行中
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  targetDate: {
    type: String,
    default: '2024-01-01T00:00:00'
  }
});

const timeLeft = ref(0);
const isActive = ref(true);
let timer = null;

const calculateTimeLeft = () => {
  const difference = new Date(props.targetDate).getTime() - new Date().getTime();
  
  if (difference > 0) {
    timeLeft.value = difference;
    isActive.value = true;
  } else {
    timeLeft.value = 0;
    isActive.value = false;
    if (timer) clearInterval(timer);
  }
};

const days = computed(() => Math.floor(timeLeft.value / (1000 * 60 * 60 * 24)).toString().padStart(2, '0'));
const hours = computed(() => Math.floor((timeLeft.value / (1000 * 60 * 60)) % 24).toString().padStart(2, '0'));
const minutes = computed(() => Math.floor((timeLeft.value / 1000 / 60) % 60).toString().padStart(2, '0'));
const seconds = computed(() => Math.floor((timeLeft.value / 1000) % 60).toString().padStart(2, '0'));

onMounted(() => {
  calculateTimeLeft();
  timer = setInterval(calculateTimeLeft, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
.countdown-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #42b883 0%, #35495e 100%);
  border-radius: 16px;
  color: white;
  margin: 2rem 0;
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.countdown-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.countdown-timer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.time-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  padding: 1rem;
  border-radius: 8px;
  min-width: 80px;
  backdrop-filter: blur(5px);
}

.number {
  font-size: 2.5rem;
  font-weight: bold;
  line-height: 1;
  font-family: monospace;
}

.label {
  font-size: 0.9rem;
  margin-top: 0.5rem;
  opacity: 0.9;
}

.separator {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  opacity: 0.8;
}

.countdown-ended {
  font-size: 2rem;
  font-weight: bold;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@media (max-width: 600px) {
  .countdown-timer {
    gap: 0.2rem;
  }
  
  .time-block {
    min-width: 60px;
    padding: 0.5rem;
  }
  
  .number {
    font-size: 1.5rem;
  }
  
  .separator {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
}
</style>
