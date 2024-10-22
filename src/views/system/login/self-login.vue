<template>
  <div class="container">
    <div class="box">
      <div class="login-content-left">
        <img :src="loginLeftPng"/>
        <div class="login-content-left-mask">
          <div>{{ platformName }}</div>
          <div>{{ systemSubTitle }}</div>
        </div>
      </div>

      <div class="box-inner">
        <h1>登录</h1>
        <el-form class="form">
          <el-input
              size="large"
              v-model="form.account"
              placeholder="账号"
              name="account"
              type="text"
              maxlength="50"
          >
            <template #prepend>
              <i class="sfont system-xingmingyonghumingnicheng"></i>
            </template>
          </el-input>
          <el-input
              size="large"
              ref="password"
              v-model="form.password"
              :type="passwordType"
              placeholder="密码"
              name="password"
              maxlength="50"
          >
            <template #prepend>
              <i class="sfont system-mima"></i>
            </template>
            <template #append>
              <i class="sfont password-icon" :class="passwordType ? 'system-yanjing-guan': 'system-yanjing'"
                 @click="passwordTypeChange"></i>
            </template>
          </el-input>

          <el-button type="primary" name="login" :loading="form.loading" @click="submit" style="width: 100%;" size="small">
            登录
          </el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { systemTitle, systemSubTitle } from '@/config'
import {ref, reactive, onMounted} from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from 'element-plus'
import loginLeftPng from '@/assets/login/left.jpg';
import {LoginApi} from "@/api/system/user";
import {GetConfigByCode} from "@/api/config/config-value";
// import loginLeftPng from '@/assets/login/loginBackground.jpg';

const platformName = ref()
const store = useStore()
const router = useRouter()
const route = useRoute()
const form = reactive({account: '', password: '', loading: false})
const passwordType = ref('password')
const passwordTypeChange = () => {
  passwordType.value === '' ? passwordType.value = 'password' : passwordType.value = ''
}
const checkForm = () => {
  return new Promise((resolve, reject) => {
    if (form.account === '') {
      ElMessage.warning({ message: '账号不能为空', type: 'warning' });
      return;
    }
    if (form.password === '') {
      ElMessage.warning({ message: '密码不能为空', type: 'warning'})
      return;
    }
    resolve(true)
  })
}
const submit = () => {
  checkForm().then(() => {
    form.loading = true
    LoginApi({account: form.account, password: form.password}).then(response => {
      form.loading = false
      localStorage.setItem('id', response.data.id)
      localStorage.setItem('accessToken', response.data.access_token)
      localStorage.setItem('refreshToken', response.data.refresh_token)
      localStorage.setItem('userName', response.data.name)
      localStorage.setItem('account', response.data.account)
      localStorage.setItem('permissions', JSON.stringify(response.data.front_permissions))
      localStorage.setItem('business', JSON.stringify(response.data.business_list))
      localStorage.setItem('isAdmin', response.data.front_permissions.indexOf('admin') !== -1 ? '1' : '0')
      const redirect_path = route.query.redirect
      router.push(typeof redirect_path === 'string' ? redirect_path : '/')
    })
  })
}

onMounted(() => {
    GetConfigByCode({ code: 'platform_name' }).then(response => {
      platformName.value = response.data
      localStorage.setItem('platform_name', response.data)
    })

    // 获取配置的默认登录账户
    GetConfigByCode({ code: 'default_account' }).then(response => {
      form.account = response.data.account
      form.password = response.data.password
    })
})

</script>

<style lang="scss" scoped>
.container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #fff url('@/assets/login/loginBackground.jpg') no-repeat center;
  overflow: hidden;
  background-size: cover;
  cursor: pointer;
  user-select: none;

  .box {
    width: 1160px;
    display: flex;
    position: absolute;
    left: 50%;
    top: 50%;
    background: white;
    border-radius: 8px;
    transform: translate(-50%, -50%);
    height: 440px;
    overflow: hidden;
    box-shadow: 0 6px 20px 5px rgba(152, 152, 152, 0.1),
    0 16px 24px 2px rgba(117, 117, 117, 0.14);

    .login-content-left {
      position: relative;

      img {
        height: 440px;
      }

      .login-content-left-mask {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-image: linear-gradient(rgba(0,204,222,0.8), rgba(51,132,224,0.8));
        text-align: center;
        color: #fff;
        font-size: 1.8rem;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        letter-spacing: 2px;

        div:nth-child(1) {
          font-size: 3.5rem;
          margin-bottom: 1em;
        }
      }
    }

    .box-inner {
      width: 500px;

      h1 {
        margin-top: 80px;
        text-align: center;
      }

      .form {
        width: 80%;
        margin: 50px auto 15px;

        .el-input {
          margin-bottom: 20px;
        }

        .password-icon {
          cursor: pointer;
          color: #409eff;
        }
      }

      .fixed-top-right {
        position: absolute;
        top: 10px;
        right: 10px;
      }
    }
  }
}

@media screen and (max-width: 1260px) {
  .login-content-left {
    display: none;
  }
  .box {
    width: 500px !important;
  }
}

@media screen and (max-width: 750px) {
  .container .box, .container .box-inner {
    width: 100vw !important;
    height: 100vh;
    box-shadow: none;
    left: 0;
    top: 0;
    transform: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    h1 {
      margin-top: 0;
    }

    .form {
    }
  }
}
</style>
