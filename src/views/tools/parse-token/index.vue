<template>
  <div class="layout-container">
    <el-row style="margin-top: 20px">
      <el-col :span="11" style="float: left">
        <div style="margin-bottom: 20px;text-align: center; font-size: 25px; color: #fb015b">token字符串</div>
        <div style="margin-left: 20px">
          <el-input v-model="tokenStr" size="small" type="textarea" rows="20" :placeholder="'token字符串'" />
          <div v-show="errorMsg" style="padding-top: 10px; color: red">
            <span> {{ errorMsg }}</span>
          </div>
        </div>
      </el-col>

      <el-col :span="11" style="float: right">
        <div style="margin-bottom: 20px; text-align: center; font-size: 25px; color: #fb015b">解析后的内容</div>

        <div style="margin-left: 20px">
          <div style="font-size: 14px; color: #d63aff">HEADER</div>
          <showJson :json-data="parsedToken.header"/>
        </div>

        <div style="margin-left: 20px">
          <div style="margin-top: 20px; font-size: 14px; color: #00b9f1">PAYLOAD</div>
          <showJson :json-data="parsedToken.payload"/>
        </div>
      </el-col>

    </el-row>
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from "vue";
import showJson from '@/components/show-json.vue'
import {jwtDecode} from "jwt-decode";

const tokenStr = ref('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6Ilx1N2JhMVx1NzQwNlx1NTQ1OCIsInJvbGVfbGlzdCI6WzEsMl0sImFwaV9wZXJtaXNzaW9ucyI6WyJhZG1pbiJdLCJidXNpbmVzc19saXN0IjpbMV0sImV4cCI6MTcwMjU1MTk5NS4yOTMzOTN9.lqJk2M-43D6Mqs3izacxwdQdMqE-DMTY1O30U35itZM')
const errorMsg = ref('')
const parsedToken = computed(() => {
  try {
    const parsed = {
      header: jwtDecode(tokenStr.value, {header: true}),
      payload: jwtDecode(tokenStr.value)
    }
    errorMsg.value = undefined
    return parsed
  } catch (e) {
    errorMsg.value = ' * 无法解析，请检查token是否正确'
    return {
      header: {},
      payload: {}
    }
  }
})

</script>

<style scoped lang="scss">

</style>
