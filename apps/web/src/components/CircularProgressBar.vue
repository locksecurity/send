<template>
  <div
    class="progressbar"
    role="progressbar"
    :aria-valuenow="current"
    :aria-valuemin="min"
    :aria-valuemax="max"
    :style="`--value:${current}`"
  />
</template>

<script setup lang="ts">

defineProps({
  max: { type: Number, default: 100 },
  min: { type: Number, default: 0 },
  current: { type: Number }
})

</script>

<style scoped>
/** https://dev.to/alvaromontoro/comment/1j2o1 */
@keyframes growProgressBar {
  0%, 33% { --pgPercentage: 0; }
  100% { --pgPercentage: var(--value); }
}

@property --pgPercentage {
  syntax: '<number>';
  inherits: false;
  initial-value: 0;
}

.progressbar {
  --size: 12rem;
  --fg: #369;
  --bg: #def;
  --pgPercentage: var(--value);
  animation: growProgressBar 3s 1 forwards;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  display: grid;
  place-items: center;
  background:
    radial-gradient(closest-side, white 80%, transparent 0 99.9%, white 0),
    conic-gradient(var(--fg) calc(var(--pgPercentage) * 1%), var(--bg) 0)
    ;
  font-family: Helvetica, Arial, sans-serif;
  font-size: calc(var(--size) / 5);
  color: var(--fg);
}

.progressbar::before {
  counter-reset: percentage var(--value);
  content: counter(percentage) '%';
}
</style>