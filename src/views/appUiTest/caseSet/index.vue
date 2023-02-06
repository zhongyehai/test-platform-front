<template>

  <caseSuiteView :dataType="'appUi'"></caseSuiteView>


</template>

<script>
import caseSuiteView from '@/components/business/suite/index.vue'

export default {
  name: 'index',
  components: {
    caseSuiteView
  }
};
</script>

<style scoped>

</style>
