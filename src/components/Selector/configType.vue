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
    <el-option v-for="item in configTypeList" :key="item.id" :label="item.name" :value="item.id"></el-option>
  </el-select>
</template>

<script>

export default {
  name: "configType",
  props: ['configTypeList', 'configType', 'dialogType'],
  data() {
    return {
      tempConfigType: '',
    }
  },
  methods: {},

  created() {
    this.tempConfigType = this.configType
  },

  watch: {
    'configType': {
      handler(newVal, oldVal) {
        this.tempConfigType = newVal
      }
    }
  }
}
</script>

<style scoped>

</style>
