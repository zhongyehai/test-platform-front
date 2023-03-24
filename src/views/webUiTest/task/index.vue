<template>
  <taskView :data-type="'webUi'" />
</template>

<script>
import taskView from '@/components/business/task/index.vue'

export default {
  name: 'Index',
  components: {
    taskView
  }
}
</script>

<style scoped>

</style>
