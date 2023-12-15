<template>
  <div class="str">
    {{ msg }}
  </div>
</template>

<script>
import { getTokenBySSOCode } from '@/apis/sso'
import { projectList } from '@/apis/apiTest/project'
import * as types from '@/store/types'

export default {
  data() {
    return {
      msg: undefined,
      sso_code: undefined,
      user_info: undefined
    }
  },

  watch: {
    'sso_code': {
      handler(newVal, oldVal) {
        if (newVal) {
          this.msg = '身份验证中...'
          getTokenBySSOCode({ code: this.$route.query.code }).then(response => {
            if (this.showMessage(this, response)) {
              this.user_info = response.data
              // 存储状态
              this.$busEvents.data.permissions = response.data.front_permissions
              this.$store.commit(types.token, response.data.token)
              this.$store.commit(types.userName, response.data.name)
              localStorage.setItem('id', response.data.id)
              localStorage.setItem('account', response.data.account)
              localStorage.setItem('permissions', JSON.stringify(response.data.front_permissions))
              localStorage.setItem('business', JSON.stringify(response.data.business_list))
              // 重定向到指定路由
              const redirect = this.$route.query.redirect || '/'
              this.$router.push({ path: redirect }) // 重定向到指定路由
              // this.$router.push({path: redirect.slice(redirect.indexOf('=') + 1)})  // 重定向到指定路由
            }
          })
        }
      }
    }
  },
  mounted() {
    if (!this.$route.query.code) { // 没有带code参数，从后端返回获取登录地址
      projectList().then(response => {
        if (response.status === 200) {
          // 重定向到首页
          const redirect = this.$route.query.redirect || '/'
          this.$router.push({ path: redirect })
        }
      })
    } else {
      // 重定向到获取code页面
      this.sso_code = this.$route.query
    }
  }
}

</script>

<style scoped>
.str {
  font-size: 30px;
  text-align: center;
  margin-top: 10%;
}
</style>
