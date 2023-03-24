<template>

  <reportShowView :data-type="'webUi'" />

</template>

<script>

import reportShowView from '@/components/business/report/show.vue'

export default {
  name: 'Show',
  components: {
    reportShowView
  }
}
</script>

<style scoped>

</style>
