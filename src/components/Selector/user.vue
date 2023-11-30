<template>
  <el-select
    v-model="tempData"
    style="width:100%"
    filterable
    default-first-option
    placeholder="请选择用户"
  >
    <el-option
      v-for="user in userList"
      :key="user.name"
      :label="user.name"
      :value="user.id"
    />
  </el-select>
</template>

<script>
import { userList } from '@/apis/system/user'

export default {
  name: 'User',
  props: ['user'],
  data() {
    return {
      userList: [],
      tempData: undefined
    }
  },
  watch: {
    'user': {
      handler(newVal, oldVal) {
        if (!newVal){
          this.tempData = this.userList[0].id
        }else {
          this.tempData = newVal
        }
      }
    }
  },
  mounted() {
    this.getUserList()
  },
  created() {
    this.tempData = this.user
  },
  methods: {
    // 请求用户信息
    getUserList() {
      userList().then(response => {
        this.userList = response.data.data
        if (!this.tempData){
          this.tempData = this.userList[0].id
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
