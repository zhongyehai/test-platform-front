<template>
  <div class="card-list">
    <Row v-for="row in title_list" :key="row.id" :row="row"  @click="sendEvent(row)"/>
  </div>
</template>

<script lang="ts" setup>
import Row from '@/components/card/index.vue'
import {onMounted, ref} from 'vue'
import {getTitleCount} from "@/api/business-api/dashboard";
import {bus, busEvent} from "@/utils/bus-events";

const title_list = ref([])
const icon_dict = {
  api: 'api', case: 'cubeFive', step: 'listNumbers', report: 'chartHistogram'
}
const color_dict = {
  api: '#36b9cc', case: '#4e73df', step: '#1cc88a', report: '#f6c23e'
}

onMounted(() => {
  getTitleCount().then(response => {
    title_list.value = []
    response.data.forEach((item: { name: string; title: string; total: number; color: string; icon: string }) => {
      item.icon = icon_dict[item.name]
      item.color = color_dict[item.name]
    })
    title_list.value = response.data
    sendEvent(title_list.value[0])
  })
})

const sendEvent = (row: any) => {
  bus.emit(busEvent.changeData, {type: 'dashboardCard', name: row.name});
};

</script>

<style lang="scss" scoped>
.card-list {
  width: calc(100% + 20px);
  margin-left: -10px;
  display: flex;
  flex-wrap: wrap;
}
</style>
