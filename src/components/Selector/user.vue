<template>
  <el-select
    v-model="tempData"
    style="width:100%"
    filterable
    default-first-option
    clearable
    placeholder="请选择用户">
    <el-option
      v-for="user in userList"
      :key="user.name"
      :label="user.name"
      :value="user.id"
    />
  </el-select>
</template>

<script>
import {userList} from "@/apis/user/user";

export default {
  name: "user",
  props: ['user'],
  data() {
    return {
      userList: [],
      tempData: ''
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
      })
    },
  },
  watch: {
    'user': {
      handler(newVal, oldVal) {
        this.tempData = newVal
      }
    }
  }
}
</script>

<style scoped>

</style>
