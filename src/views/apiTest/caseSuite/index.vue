<template>

  <caseSuiteView :data-type="'api'" />

</template>

<script>
import caseSuiteView from '@/components/business/suite/index.vue'

export default {
  name: 'Index',
  components: {
    caseSuiteView
  }
}
</script>

<style scoped>

</style>
