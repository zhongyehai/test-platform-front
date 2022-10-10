<template>
  <el-select
    v-model="current_env"
    filterable
    default-first-option
    placeholder="请选择运行环境"
    style="width: 90%"
    size="mini"
  >
    <el-option
      v-for="(value, key) in environments"
      :key="key"
      :label="value"
      :value="key"
    >
    </el-option>
  </el-select>
</template>

<script>
import {getConfigByName} from "@/apis/config/config";

export default {
  name: "environment",
  props: ['env'],
  data() {
    return {
      current_env: '',
      environments: []
    }
  },

  methods: {
    // 获取环境配置
    initEnv() {
      getConfigByName({'name': 'run_test_env'}).then(response => {
        this.environments = JSON.parse(response.data.value)
      })
    },
  },

  mounted(){
    this.initEnv()
  },

  created(){
    this.current_env = this.env
  },

  watch: {
    // 实时更新接口选择的环境
    'env': {
      deep: true,  // 深度监听
      handler(newVal, oldVal) {
        this.current_env = newVal
      }
    },
  }
}
</script>

<style scoped>

</style>
