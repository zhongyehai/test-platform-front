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
        <span>选择业务线: </span>
        <businessCheckbox
          ref="businessCheckbox"
          :data-list="business_list"
          :get-item="'id'"
        />
      </div>

      <div style="margin-top: 40px">
        <span>选择用户: </span>
        <userCheckbox
          ref="userCheckbox"
          :data-list="user_list"
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

import businessCheckbox from '@/components/Selector/baseCheckbox.vue'
import userCheckbox from '@/components/Selector/baseCheckbox.vue'

import { businessToUser } from '@/apis/config/business'
import { businessList } from '@/apis/config/business'

export default {
  name: 'BusinessToUser',
  directives: { waves },
  components: {
    userCheckbox,
    businessCheckbox
  },
  data() {
    return {
      drawerIsShow: false, // 抽屉的显示状态
      direction: 'rtl', // 抽屉打开方式

      businessDataList: [],
      business_list: [],
      user_list: [],

      submitButtonIsLoading: false
    }
  },

  computed: {},

  watch: {},

  created() {
  },

  mounted() {
    // 监听 bus 配置操作指令
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, business_list, user_list) => {
      if (_type === 'businessToUser') {
        this.business_list = business_list
        this.user_list = user_list

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
    getBusinessDataList() {
      businessList({ getAll: true, pageNum: 1, pageSize: 999 }).then(response => {
        this.businessDataList = response.data.data
      })
    },

    // 修改环境与业务线的绑定关系
    putRunEnvToBusiness(command) {
      const data = {
        user_list: this.$refs.userCheckbox.selectedDataList,
        business_list: this.$refs.businessCheckbox.selectedDataList,
        command: command
      }
      this.submitButtonIsLoading = true
      businessToUser(data).then(response => {
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
