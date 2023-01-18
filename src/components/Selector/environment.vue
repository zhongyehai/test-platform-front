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
      v-for="(env) in env_list"
      :key="env.code"
      :label="env.name"
      :value="env.code"
    >
    </el-option>
  </el-select>
</template>

<script>
import {runEnvList} from "@/apis/config/runEnv";

export default {
  name: "environment",
  props: ['env', 'env_type'],
  data() {
    return {
      current_env: '',
      env_list: []
    }
  },

  mounted() {
    // 获取环境列表
    runEnvList({test_type: this.env_type}).then(response => {
      this.env_list = response.data.data
    })
  },

  created() {
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
