<template>
  <taskView :data-type="'appUi'" />
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
