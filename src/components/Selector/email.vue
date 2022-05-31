<template>
  <el-select
    v-model="tempEmailServer"
    filterable
    default-first-option
    placeholder="选择邮箱服务器"
    value-key="id"
    style="min-width: 100%"
    size="mini"
  >
    <el-option v-for="item in configEmailServerList" :key="item.id" :label="item.name" :value="item.value">
    </el-option>
  </el-select>
</template>

<script>
import {configList} from "@/apis/config/config";

export default {
  name: "email",
  props: ['oldEmailServer'],
  data() {
    return {
      tempEmailServer: '',
      configEmailServerList: ''
    }
  },
  methods: {
    // 获取配置中的所有邮箱地址
    getConfigEmailList() {
      configList({'type': '邮箱'}).then(response => {
        this.configEmailServerList = response.data.data
      })
    },
  },

  mounted() {
    this.getConfigEmailList()
  },

  created() {
    this.tempEmailServer = this.oldEmailServer
  },

  watch: {
    'oldEmailServer': {
      handler(newVal, oldVal) {
        this.tempEmailServer = newVal
      }
    },
  }
}
</script>

<style scoped>

</style>
