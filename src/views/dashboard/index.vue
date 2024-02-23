<template>
  <div class="box">
    <Card/>

    <div style="margin-top: 10px"></div>

    <Charts />
  </div>
</template>

<script lang="ts" setup>
import Card from './card.vue'
import Charts from './chart.vue'
</script>

<style lang="scss" scoped>
.box {
  padding: 15px;
}
</style>
