<template>
  <el-select
    v-model="tempConfigType"
    filterable
    default-first-option
    placeholder="选择配置类型"
    value-key="id"
    style="min-width: 100%"
    size="mini"
  >
    <el-option v-for="item in configTypeList" :key="item.id" :label="item.name" :value="item.id" />
  </el-select>
</template>

<script>

export default {
  name: 'ConfigType',
  props: ['configTypeList', 'configType', 'dialogType'],
  data() {
    return {
      tempConfigType: ''
    }
  },

  watch: {
    'configType': {
      handler(newVal, oldVal) {
        this.tempConfigType = newVal
      }
    }
  },

  created() {
    this.tempConfigType = this.configType
  },
  methods: {}
}
</script>

<style scoped>

</style>
