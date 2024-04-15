<template>
  <div class="card" :style="{ 'borderColor': row.color }">
    <div class="card-left">
      <div class="name">{{ row.title }}</div>
      <div class="detail">{{ row.total }}</div>
    </div>
    <div class="card-right">
      <component class="card-icon" :is="getIcon(row.icon)"></component>
    </div>
  </div>
</template>

<script lang="ts" setup>

import * as iconPark from "@icon-park/vue-next";

defineProps({
  row: {
    default: {},
    type: Object
  }
})

const getIcon = (iconName: string) => {
  const normalizedIconName = iconName.charAt(0).toUpperCase() + iconName.slice(1);
  return iconPark[normalizedIconName] || null;
}

</script>

<style lang="scss" scoped>
.card {
  border-radius: 4px;
  overflow: hidden;
  border-left: 6px solid;
  height: 96px;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: calc(25% - 26px);
  background-color: var(--system-page-background);
  margin: 10px;
  box-shadow: 3px 3px 10px 0 rgba(58, 59, 69, 0.15);

  &-left {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding-left: 20px;

    .name {
      line-height: 18px;
      color: var(--system-page-tip-color);
      font-size: 16px;
      margin-bottom: 14px;
    }

    .detail {
      font-size: 20px;
      font-weight: bold;
      color: var(--system-page-color);
    }
  }

  &-right {
    padding-right: 15px;

    .card-icon {
      font-size: 40px;
      font-weight: 900;
      color: #e6e8ef;
    }
  }
}

@media screen and (max-width: 1200px) {
  .card {
    width: calc(50% - 26px);
  }
}

@media screen and (max-width: 500px) {
  .card {
    width: calc(100% - 26px);
  }
}
</style>
