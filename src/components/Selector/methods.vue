<template>
  <el-select
    v-model="tempMethod"
    size="mini"
    style="width: 150px;margin-right: 10px"
    slot="prepend"
    placeholder="选择请求方式"
    filterable
    default-first-option
    @change="choiceMethod">
    <el-option v-for="item in methods_list" :key="item.value" :value="item.value" :label="item.value"></el-option>
  </el-select>
</template>

<script>
import {getMethodsMapping} from "@/apis/apiTest/api";

export default {
  name: "methods",
  props: [
    'method',
    'busOnEventName',
    'busEmitEventName',
  ],
  data() {
    return {
      tempMethod: 'POST',
      methods_list: []
    }
  },

  mounted() {
    this.getMethods()
  },

  created() {
    this.tempMethod = this.method ? this.method : 'POST'
    this.emitMethodSelectorChoiceMethod(this.tempMethod)
  },

  methods: {

    // 获取请求方式列表
    getMethods() {
      getMethodsMapping().then(response => {
        this.methods_list = response.data
      })
    },

    emitMethodSelectorChoiceMethod(method) {
      if (this.busOnEventName){
        this.$bus.$emit(this.busOnEventName, method)
      }
    },

    choiceMethod() {
      this.emitMethodSelectorChoiceMethod(this.tempMethod)
    }
  },

  watch: {
    'method': {
      handler(newVal, oldVal) {
        this.tempMethod = newVal ? newVal : 'POST'
        this.emitMethodSelectorChoiceMethod(newVal)
        // this.tempMethod = newVal
      }
    }
  }
}
</script>

<style scoped>

</style>
