<template>

  <reportView :data-type="'webUi'" />

</template>

<script>

import reportView from '@/components/business/report/index.vue'

export default {
  name: 'Index',
  components: {
    reportView
  }
}
</script>

<style scoped>

</style>
