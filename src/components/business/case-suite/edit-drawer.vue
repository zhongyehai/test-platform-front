<template>
  <div>
    <el-drawer v-model="drawerIsShow" :title="formData.id ? '修改用例集' : '新增用例集'" size="60%">

      <el-form
          ref="ruleFormRef"
          :model="formData"
          :rules="formRules"
          label-width="90px">

        <div style="margin: 0 20px 20px 20px">
          <div>1、基础用例集: 用于创建某一个步骤或者某一个节点，<span style="color: red">只能被当前服务下的用例引用</span></div>
          <div>2、引用用例集: 用于创建某一个节点、流程节点的用例集，<span style="color: red">只能被创建其他用例的时候引用</span></div>
          <div>3、单接口用例集: 用于创建测试单接口的用例集，<span style="color: red">只能被任务使用</span></div>
          <div>4、流程用例集: 用于创建测试流程的用例集，<span style="color: red">只能被任务使用</span></div>
          <div>5、造数据用例集: 用于创建快速造数据的用例集，提升手工测试效率，不能被其他用例引用，<span style="color: red">可在造数工具菜单使用</span></div>
          <div>6、修改<span style="color: red">一级用例集</span>的类型，<span style="color: red">子用例集</span>的类型会跟随修改</div>
        </div>

        <el-form-item label="用例集类型" prop="suite_type" class="is-required" size="small">
          <el-select
            v-model="formData.suite_type"
            default-first-option
            size="small"
            :disabled="formData.parent !== null"
            style="width: 100%"
            placeholder="请选择用例集类型"
            class="filter-item"
        >
          <el-option
              v-for="suiteType in suiteTypeList"
              :key="suiteType.key"
              :label="suiteType.value"
              :value="suiteType.key"
          />
        </el-select>
        </el-form-item>

        <el-form-item label="用例集名称" prop="name" class="is-required" size="small">
          <el-input v-model="formData.name" size="small" placeholder="同一节点下，用例集名称不可重复"/>
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
import {PostCaseSuite, PutCaseSuite, GetCaseSuite} from "@/api/business-api/case-suite";
import {bus, busEvent} from "@/utils/bus-events";
import {GetConfigByCode} from "@/api/config/config-value";

const props = defineProps({
  testType: {
    default: '',
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
  if (message.eventType === 'edit-case-suite') {
    getSuiteTypeList()
    resetForm()
    if (message.content.id){
      getData(message.content.id)
    }else {
      formData.value.project_id = message.content.project_id
      formData.value.parent = message.content.parent
      formData.value.suite_type = message.content.suite_type
    }
    drawerIsShow.value = true
  }
}

const suiteTypeList = ref([])
const drawerIsShow = ref(false)
let submitButtonIsLoading = ref(false)

const ruleFormRef = ref(null)
const formData = ref({
  id: undefined,
  name: undefined,
  parent: undefined,
  suite_type: undefined,
  project_id: undefined,
  controller: undefined
})
const formRules = {
  suite_type: [
    {required: true, message: '请选择用例集类型', trigger: 'blur'}
  ],
  name: [
    {required: true, message: '请输入用例集名字', trigger: 'blur'}
  ]
}
const resetForm = () => {
  formData.value = {
    id: undefined,
    name: undefined,
    parent: undefined,
    suite_type: undefined,
    project_id: undefined,
    controller: undefined
  }
  ruleFormRef.value && ruleFormRef.value.resetFields();
  submitButtonIsLoading.value = false
}
const sendEvent = (content: any, command: string) => {
  bus.emit(busEvent.drawerIsCommit, {eventType: 'edit-case-suite', content: content, command: command});
};

const submitForm = () =>{
  if (formData.value.id){
    changeData()
  }else {
    addData()
  }
}

const getData = (dataId: number) => {
  GetCaseSuite(props.testType, {id: dataId}).then(response => {
    formData.value = response.data
  })
}

const getSuiteTypeList = () => {
  if (suiteTypeList.value.length < 1){
    GetConfigByCode({ code: props.testType === 'api' ? 'api_suite_list' : 'ui_suite_list' }).then(response => {
      suiteTypeList.value = response.data
    })
  }
}

const addData = () => {
  ruleFormRef.value.validate((valid) => {
    if (valid) {
      submitButtonIsLoading.value = true
      PostCaseSuite(props.testType, formData.value).then(response => {
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
      PutCaseSuite(props.testType, formData.value).then(response => {
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
