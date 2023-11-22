<template>
  <el-select
    slot="prepend"
    v-model="tempMethod"
    size="mini"
    style="margin-right: 10px"
    placeholder="选择请求方式"
    filterable
    default-first-option
    @change="choiceMethod"
  >
    <el-option v-for="item in methods_list" :key="item" :value="item" :label="item" />
  </el-select>
</template>

<script>
import {getConfigByCode} from "@/apis/config/config";

export default {
  name: 'Methods',
  props: [
    'method'
  ],
  data() {
    return {
      tempMethod: 'POST',
      methods_list: []
    }
  },

  watch: {
    'method': {
      handler(newVal, oldVal) {
        this.tempMethod = newVal || 'POST'
        this.emitSelectorChoice(newVal)
      }
    }
  },

  mounted() {
    this.getMethods()
  },

  created() {
    this.tempMethod = this.method ? this.method : 'POST'
    this.emitSelectorChoice(this.tempMethod)
  },

  methods: {

    // 获取请求方式列表
    getMethods() {
      getConfigByCode({ code: 'http_method' }).then(response => {
        this.methods_list = response.data
      })

      // getMethodsMapping().then(response => {
      //   this.methods_list = response.data
      // })
    },

    emitSelectorChoice(method) {
      this.$bus.$emit(this.$busEvents.selectorChoice, 'method', method)
    },

    choiceMethod() {
      this.emitSelectorChoice(this.tempMethod)
    }
  }
}
</script>

<style scoped>

</style>
