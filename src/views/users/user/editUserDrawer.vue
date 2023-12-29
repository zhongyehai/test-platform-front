<template>
  <div class="app-container">

    <!-- 修改表单 -->
    <el-drawer
      title="修改用户"
      size="60%"
      :visible.sync="drawerIsShow"
      :direction="direction"
    >
      <el-form
        ref="dataForm"
        :model="tempUser"
        label-width="100px"
        style="min-width: 400px;margin-left: 20px;margin-right: 20px"
      >

        <!-- 用户信息 -->
        <el-form-item :label="'用户名'" prop="name" class="is-required" size="mini">
          <el-input v-model="tempUser.name" placeholder="2~12位" />
        </el-form-item>

        <el-form-item :label="'账号'" prop="name" class="is-required" size="mini">
          <el-input v-model="tempUser.account" disabled placeholder="2~12位" />
        </el-form-item>

        <el-form-item :label="'业务线'" class="is-required" size="mini">
          <businessView
            ref="businessView"
            :current-business="tempUser.business_list"
            :is-multiple="true"
            :select-width="'97%'"
          />
        </el-form-item>

        <el-form-item :label="'角色'" class="is-required" size="mini">
          <el-select
            v-model="tempUser.role_list"
            placeholder="请选择角色"
            multiple
            filterable
            style="width:100%"
          >
            <el-option
              v-for="role in roleList"
              :key="role.name"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>

      </el-form>
      <div class="demo-drawer__footer">
        <el-button size="mini" @click="drawerIsShow = false">取消</el-button>
        <el-button
          size="mini"
          type="primary"
          :loading="submitButtonIsLoading"
          @click="changUser()"
        >保存
        </el-button>
      </div>
    </el-drawer>

  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import businessView from '@/components/Selector/business'

import { putUser, userRoles } from '@/apis/system/user'

export default {
  name: 'Index',
  components: {
    businessView
  },
  directives: { waves },
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'roleList'
  ],
  data() {
    return {

      // 临时数据
      tempUser: {
        id: undefined,
        name: undefined,
        account: undefined,
        role_list: [],
        business_list: []
      },

      submitButtonIsLoading: false,
      drawerIsShow: false, // 编辑框的显示状态
      direction: 'rtl', // 抽屉打开方式
      listLoading: true // 请求加载状态
    }
  },

  mounted() {
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, command, user) => {
      if (_type === 'userInfo') {
        if (command === 'edit') {
          this.handleUpdate(user)
          this.drawerIsShow = true
        }
      }
    })
  },

  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsCommit)
  },

  methods: {

    // 初始化临时模板数据，点击修改按钮触发
    handleUpdate(row) {
      this.tempUser.id = row.id
      this.tempUser.name = row.name
      this.tempUser.account = row.account
      this.tempUser.business_list = row.business_list
      userRoles({ id: row.id }).then(response => {
        this.tempUser.role_list = response.data
      })
      this.drawerIsShow = true
    },

    // 修改用户
    changUser() {
      this.submitButtonIsLoading = true
      this.tempUser.business_list = this.$refs.businessView.business
      putUser(this.tempUser).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.drawerIsCommit, 'userInfo')
          this.drawerIsShow = false
        }
      })
    }
  }
}
</script>
