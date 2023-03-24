<template>
  <projectView :data-type="'webUi'" />
</template>

<script>
import projectView from '@/components/business/project/index.vue'

export default {
  name: 'Project',
  components: {
    projectView
  }
}
</script>

<style scoped>

</style>
