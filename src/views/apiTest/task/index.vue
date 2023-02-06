<template>
  <taskView :dataType="'api'"></taskView>
</template>

<script>
import taskView from "@/components/business/task/index.vue";


export default {
  name: "index",
  components: {
    taskView
  },
}
</script>

<style scoped>

</style>
