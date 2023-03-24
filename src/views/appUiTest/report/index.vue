<template>

  <reportView :data-type="'appUi'" />

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
