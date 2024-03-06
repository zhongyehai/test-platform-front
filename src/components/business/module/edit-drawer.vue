<template>
  <div>
    <el-drawer v-model="drawerIsShow" :title="formData.id ? '修改模块' : '新增模块'" size="60%">

      <el-form
          ref="ruleFormRef"
          :model="formData"
          :rules="formRules"
          label-width="90px">

        <el-form-item label="模块名称" prop="name" class="is-required" size="small">
          <el-input v-model="formData.name" size="small"/>
        </el-form-item>

        <el-form-item label="controller" v-if="testType === 'api'" prop="controller" size="small">
          <el-input v-model="formData.controller" disabled size="small"/>
        </el-form-item>

      </el-form>

      <template #footer>
        <div slot="footer" class="dialog-footer">
          <el-button size="small" @click="drawerIsShow = false"> {{ '取消' }}</el-button>
          <el-button
              type="primary"
              size="small"
              :loading="submitButtonIsLoading"
              @click="submitForm"
          >
            {{ '保存' }}
          </el-button>
        </div>
      </template>

    </el-drawer>
  </div>
</template>

<script lang="ts" setup>

import {onBeforeUnmount, onMounted, ref} from "vue";
import {PostModule, PutModule, GetModule} from "@/api/business-api/module";
import {bus, busEvent} from "@/utils/bus-events";

const props = defineProps({
  testType: {
    default: 'api',
    type: String,
  }
})

onMounted(() => {
  bus.on(busEvent.drawerIsShow, onShowDrawerEvent);
})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsShow, onShowDrawerEvent);
})

const onShowDrawerEvent = (message: any) => {
  if (message.eventType === 'edit-module') {
    resetForm()
    if (message.content.id){
      getData(message.content.id)
    }else {
      formData.value.project_id = message.content.project_id
      formData.value.parent = message.content.parent
    }
    drawerIsShow.value = true
  }
}

const drawerIsShow = ref(false)
let submitButtonIsLoading = ref(false)

const ruleFormRef = ref(null)
const formData = ref({
  id: undefined,
  name: undefined,
  parent: undefined,
  project_id: undefined,
  controller: undefined
})
const formRules = {
  name: [
    {required: true, message: '请输入模块名字', trigger: 'blur'}
  ]
}
const resetForm = () => {
  formData.value = {
    id: undefined,
    name: undefined,
    parent: undefined,
    project_id: undefined,
    controller: undefined
  }
  ruleFormRef.value && ruleFormRef.value.resetFields();
  submitButtonIsLoading.value = false
}
const sendEvent = (content: any, command: string) => {
  bus.emit(busEvent.drawerIsCommit, {eventType: 'edit-module', content: content, command: command});
};

const submitForm = () =>{
  if (formData.value.id){
    changeData()
  }else {
    addData()
  }
}

const getData = (dataId: number) => {
  GetModule(props.testType, {id: dataId}).then(response => {
    formData.value = response.data
  })
}

const addData = () => {
  ruleFormRef.value.validate((valid) => {
    if (valid) {
      submitButtonIsLoading.value = true
      PostModule(props.testType, formData.value).then(response => {
        submitButtonIsLoading.value = false
        if (response) {
          sendEvent(response.data, 'add')
          drawerIsShow.value = false
        }
      })
    }
  })
}

const changeData = () => {
  ruleFormRef.value.validate((valid) => {
    if (valid) {
      submitButtonIsLoading.value = true
      PutModule(props.testType, formData.value).then(response => {
        submitButtonIsLoading.value = false
        if (response) {
          sendEvent(response.data, 'edit')
          drawerIsShow.value = false
        }
      })
    }
  })
}


</script>


<style scoped lang="scss">

</style>
