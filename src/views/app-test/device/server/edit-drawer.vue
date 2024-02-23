<template>
  <div>
    <el-drawer v-model="drawerIsShow" title="修改服务器" size="60%">


      <el-form ref="ruleFormRef" :model="formData" :rules="formRules" label-width="100px">

        <el-form-item label="别名" prop="name" size="small" class="is-required">
          <el-input v-model="formData.name" placeholder="别名" size="small" />
        </el-form-item>

        <el-form-item label="系统类型" prop="os" size="small" class="is-required">
          <el-select
              v-model="formData.os"
              filterable
              default-first-option
              clearable
              size="small"
              style="width:100%"
              placeholder="请选择appium服务所在电脑的系统类型"
          >
            <el-option v-for="osType in busEvent.data.serverOsMapping" :key="osType" :label="osType" :value="osType"/>
          </el-select>
        </el-form-item>

        <el-form-item label="服务器ip" prop="ip" class="is-required" size="small">
          <el-input
              v-model="formData.ip"
              size="small"
              style="width: 94%"
              placeholder="服务器ip，如 196.128.123.123"
          />
          <el-popover class="el_popover_class" placement="top-start" trigger="hover">
            <template #default>
              <div>请填写ip地址，勿填写http</div>
              <div>如：地址为http://192.168.0.1，请填写：192.168.0.1</div>
            </template>
            <template #reference>
              <el-button type="text"><i style="color: #409EFF" class="iconfont icon-testquestion-circle-fill" /></el-button>
            </template>
          </el-popover>
        </el-form-item>

        <el-form-item label="服务器端口" prop="port" class="is-required" size="small">
          <el-input v-model="formData.port" size="small" placeholder="服务器端口" />
        </el-form-item>

      </el-form>

      <template #footer>
        <div slot="footer" class="dialog-footer">
          <el-button size="small" @click="drawerIsShow = false"> {{ '取消' }}</el-button>
          <el-button
              type="primary"
              size="small"
              :loading="submitButtonIsLoading"
              @click="changeData"
          >保存</el-button>
        </div>
      </template>

    </el-drawer>
  </div>
</template>

<script lang="ts" setup>

import {onBeforeUnmount, onMounted, ref} from "vue";
import {bus, busEvent} from "@/utils/bus-events";
import {GetServer, PutServer} from "@/api/business-api/device-server";


onMounted(() => {
  bus.on(busEvent.drawerIsShow, onShowDrawerEvent);
})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsShow, onShowDrawerEvent);
})

const onShowDrawerEvent = (message: any) => {
  if (message.eventType === 'edit-server') {
    resetForm()
    getData(message.content.id)
    drawerIsShow.value = true
  }
}

const drawerIsShow = ref(false)
const submitButtonIsLoading = ref(false)
const ruleFormRef = ref(null)
const formData = ref({
  id: undefined,
  name: undefined,
  os: undefined,
  ip: undefined,
  port: '4723'
})
const formRules = {
  name: [
    {required: true, message: '请输入服务器名字', trigger: 'blur'}
  ],
  os: [
    {required: true, message: '请选择服务器系统类型', trigger: 'blur'}
  ],
  ip: [
    {required: true, message: '请输入服务器ip', trigger: 'blur'}
  ],
  port: [
    {required: true, message: '请输入服务器端口', trigger: 'blur'}
  ]
}
const resetForm = () => {
  formData.value = {
    id: undefined,
    name: undefined,
    os: undefined,
    ip: undefined,
    port: '4723'
  }
  ruleFormRef.value && ruleFormRef.value.resetFields();
}
const sendEvent = () => {
  bus.emit(busEvent.drawerIsCommit, {eventType: 'server-editor'});
}

const getData = (dataId: any) => {
  GetServer({id: dataId}).then(response => {
    formData.value = response.data
  })
}

const changeData = () => {
  ruleFormRef.value.validate((valid) => {
    if (valid) {
      submitButtonIsLoading.value = true
      PutServer(formData.value).then(response => {
        submitButtonIsLoading.value = false
        if (response) {
          sendEvent()
          drawerIsShow.value = false
        }
      })
    }
  })
}

</script>


<style scoped lang="scss">

</style>
