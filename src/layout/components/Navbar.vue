<template>
  <div class="navbar">

    <!--    <div style="float: left; margin-left: 10px;height: 100%;line-height: 50px; color: #5a5e66;">{{ platformName }}</div>-->

    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb class="breadcrumb-container" />

    <!--    <div style="float: left; margin-left: 40%;height: 100%;line-height: 50px; color: #5a5e66;">{{ platformName }}</div>-->

    <div class="right-menu">
      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          你好： {{ userName }}
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <el-dropdown-item divided @click.native="showPutPasswordDialog">
            <span style="display:block;">修改密码</span>
          </el-dropdown-item>
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">退出</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <!-- 修改密码框 -->
    <el-dialog :title="'修改密码'" :modle="tempPassword" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" label-position="left" label-width="70px" style="min-width: 400px;">
        <el-form-item :label="'旧密码'" prop="name" class="filter-item" size="mini">
          <el-input v-model="tempPassword.old_password" />
        </el-form-item>
        <el-form-item :label="'新密码'" prop="name" class="filter-item" size="mini">
          <el-input v-model="tempPassword.new_password" />
        </el-form-item>
        <el-form-item :label="'确认密码'" prop="name" class="filter-item" size="mini">
          <el-input v-model="tempPassword.sure_password" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <span v-if="is_can_change_password === false" style="color: red; float: left">*此账号不允许修改密码</span>

        <el-button size="mini" @click="dialogFormVisible = false"> {{ '取消' }}</el-button>
        <el-button
          :disabled="is_can_change_password === false"
          type="primary"
          size="mini"
          :loading="submitButtonIsLoading"
          @click="changePassword"
        > {{ '确定' }}
        </el-button>
      </div>

    </el-dialog>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import * as types from '@/store/types'
import { userPassword } from '@/apis/system/user'
import { getConfigByCode } from '@/apis/config/config'

export default {
  components: {
    Breadcrumb,
    Hamburger
  },
  data() {
    return {

      userName: this.$store.state.userName, // 用户名

      platformName: localStorage.getItem('platformName'),

      submitButtonIsLoading: false,

      // 密码修改框显示状态
      dialogFormVisible: false,
      is_can_change_password: true,

      account: localStorage.getItem('account'),

      // 密码修改临时表单
      tempPassword: {
        old_password: '',
        new_password: '',
        sure_password: ''
      }
    }
  },

  computed: {
    ...mapGetters(['sidebar', 'avatar'])
  },

  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },

    // 初始化密码修改框
    initPutPasswordDialog() {
      this.tempPassword = {
        old_password: '',
        new_password: '',
        sure_password: ''
      }
    },

    // 显示修改密码框
    showPutPasswordDialog() {
      this.initPutPasswordDialog()
      this.dialogFormVisible = true
      if (this.account === 'admin') { // 如果当前账号是admin，从后端拿是否可修改管理员账号密码的配置
        getConfigByCode({ code: 'change_admin_password' }).then(response => {
          this.is_can_change_password = [1, '1'].indexOf(response.data) !== -1
        })
      }
    },

    // 提交修改密码
    changePassword() {
      this.submitButtonIsLoading = true
      userPassword(this.tempPassword).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.dialogFormVisible = false
        }
      })
    },

    // 退出登录
    async logout() {
      localStorage.clear()
      // await this.$store.dispatch('user/logout')
      // this.$store.commit(types.token, '')
      // this.$store.commit(types.roles, '')
      // this.$store.commit(types.userName, '')
      // localStorage.setItem('state', '')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, .08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 45px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
