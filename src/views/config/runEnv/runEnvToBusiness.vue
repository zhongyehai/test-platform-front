<template>

  <!-- 新增/修改配置表单 -->
  <el-drawer
    title="批量管理【运行环境】与【业务线】的绑定关系"
    size="70%"
    :visible.sync="drawerIsShow"
    :direction="direction"
  >

    <div style="margin-left: 20px">

      <div style="margin-top: 20px">
        <span>选择环境: </span>
        <runEnvCheckbox
          ref="runEnvCheckbox"
          :env-list="runEnvList"
          :get-item="'id'"
        />
      </div>

      <div style="margin-top: 40px">
        <span>选择业务线: </span>
        <businessCheckbox
          ref="businessCheckbox"
          :data-list="businessDataList"
          :get-item="'id'"
        />
      </div>

    </div>

    <div class="demo-drawer__footer">
      <el-button
        style="float: left"
        type="primary"
        size="mini"
        :loading="submitButtonIsLoading"
        @click="putRunEnvToBusiness('delete')"
      >解除绑定
      </el-button>

      <el-button size="mini" @click="drawerIsShow = false"> {{ '取消' }}</el-button>

      <el-button
        type="primary"
        size="mini"
        :loading="submitButtonIsLoading"
        @click="putRunEnvToBusiness('add')"
      >设置绑定
      </el-button>

    </div>
  </el-drawer>

</template>

<script>

import waves from '@/directive/waves'
import runEnvCheckbox from '@/components/Selector/runEnvCheckbox.vue'
import businessCheckbox from '@/components/Selector/baseCheckbox.vue'

import { runEnvList, runEnvToBusiness } from '@/apis/config/runEnv'
import { businessList } from '@/apis/config/business'

export default {
  name: 'Drawer',
  directives: { waves },
  components: {
    runEnvCheckbox,
    businessCheckbox
  },
  data() {
    return {
      drawerIsShow: false, // 抽屉的显示状态
      direction: 'rtl', // 抽屉打开方式

      businessDataList: [],
      runEnvList: [],

      submitButtonIsLoading: false
    }
  },

  computed: {},

  watch: {},

  created() {
  },

  mounted() {
    // 监听 bus 配置操作指令
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, run_env_list) => {
      if (_type === 'runEnvToBusiness') {
        this.runEnvList = run_env_list

        this.getRunEnvList()
        this.getBusinessDataList()
        this.drawerIsShow = true
      }
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsShow)
  },

  methods: {
    // 获取业务线
    getRunEnvList() {
      runEnvList({ getAll: true, pageNum: 1, pageSize: 9999 }).then(response => {
        this.runEnvList = response.data.data
      })
    },

    // 获取业务线
    getBusinessDataList() {
      businessList({ getAll: true, pageNum: 1, pageSize: 9999 }).then(response => {
        this.businessDataList = response.data.data
      })
    },

    // 修改环境与业务线的绑定关系
    putRunEnvToBusiness(command) {
      const data = {
        env_list: this.$refs.runEnvCheckbox.selectedEnvDataList,
        business_list: this.$refs.businessCheckbox.selectedDataList,
        command: command
      }
      this.submitButtonIsLoading = true
      runEnvToBusiness(data).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.drawerIsShow = false
        }
      })
    }

  }
}
</script>

<style scoped>

</style>
