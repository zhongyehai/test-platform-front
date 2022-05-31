<template>
  <el-select
    v-model="tempHostIndex"
    clearable
    filterable
    placeholder="请选择host" size="small"
    style="min-width: 20%;padding-right:10px"
  >
    <el-option v-for="(item) in hostListToDict(tempHostList)"
               :key="item.index"
               :label="item.value"
               :value="item.index"
    >
    </el-option>
  </el-select>
</template>

<script>
export default {
  name: "host",
  props: [
    'hostIndex',
    'hostList',
    'busOnEventName',
    'busEmitEventName'
  ],

  data() {
    return {
      tempHostIndex: '',
      tempHostList: [],
    }
  },

  methods: {
    hostListToDict(data) {
      let host_list = Array()
      if (!data) {
        return host_list
      }
      for (let i = 0; i < data.length; i++) {
        host_list.push({index: i, value: data[i]})
      }
      return host_list
    },

    // 把[xxx1,xxx2] 转为 [{value:xxx1},{value:xxx2}]，用于将后端数据转为前端能渲染的格式
    // hostListToDict(data) {
    //   let host_list = Array()
    //   if (!data) {
    //     return host_list
    //   }
    //   for (let i = 0; i < data.length; i++) {
    //     host_list.push({index: i, value: data[i]})
    //   }
    //   return host_list
    // },

    // // 把[{value:xxx1},{value:xxx2}] 转为 [xxx1,xxx2]，用于将前端数据转为后端能解析的格式
    // hostDictToList(data) {
    //   let host_list = Array()
    //   for (let i = 0; i < data.length; i++) {
    //     if (data[i].value) {
    //       host_list.push(data[i].value)
    //     }
    //   }
    //   return host_list
    // },

    // // 根据api的host索引从host列表中获取对应的值
    // getHostValueByHostIndex(hostIndex, hostList) {
    //   if (hostList.length > 0 || hostIndex >= 0) {
    //     return hostList[hostIndex]
    //   }
    // },
  },

  created() {
    this.tempHostIndex = this.hostIndex
    this.tempHostList = this.hostList
  },

  mounted() {

    // 监听服务选择器的变化
    if (this.busOnEventName) {
      this.$bus.$on(this.busOnEventName, (project) => {
        this.tempHostList = project.hosts
      })
    }
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    if (this.busOnEventName) {
      this.$bus.$off(this.busOnEventName)
    }
  },

  watch: {

    // 实时更新接口选择的host索引
    'hostIndex': {
      handler(newVal, oldVal) {
        this.tempHostIndex = newVal
      }
    },

    // 实时更新服务的host列表
    'hostList': {
      handler(newVal, oldVal) {
        this.tempHostList = newVal
      }
    }
  }
}
</script>

<style scoped>

</style>
