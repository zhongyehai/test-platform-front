<template>
  <div>
    <el-drawer v-model="drawerIsShow" title="新增步骤" size="90%">

      <el-tabs v-model="activeName" style="margin-left: 20px">


        <!-- 选接口 -->
        <el-tab-pane v-if="testType === 'api'" label="接口列表" name="apiList">
          <selectApiView ref="selectApiViewRef" :test-type="testType" :case-id="caseId"/>
        </el-tab-pane>

        <!-- 选元素 -->
        <el-tab-pane v-if="testType !== 'api'" label="元素列表" name="apiList">
          <selectElementView ref="selectElementViewRef" :test-type="testType" :project-id="projectId" :case-id="caseId"/>
        </el-tab-pane>

        <!-- 引用用例 -->
        <el-tab-pane label="引用用例" name="quoteCase">
          <selectCaseView ref="quoteCaseRef" :test-type="testType" :project-id="projectId" :case-id="caseId" />
        </el-tab-pane>

      </el-tabs>

      <template #footer>
        <div slot="footer" class="dialog-footer">
          <el-button size="small" @click="drawerIsShow = false"> {{ '取消' }}</el-button>
          <el-button
              type="primary"
              size="small"
              :loading="submitButtonIsLoading"
              @click="addData"
          >保存</el-button>
        </div>
      </template>

    </el-drawer>
  </div>
</template>

<script lang="ts" setup>

import {onBeforeUnmount, onMounted, ref} from "vue";
import {bus, busEvent} from "@/utils/bus-events";
import selectApiView from './api-test/select-api.vue'
import selectElementView from './ui-test/select-element.vue'
import selectCaseView from './select-case.vue'

import {ElMessage, ElTree} from "element-plus";
import {GetProject} from "@/api/business-api/project";
import {PostElement} from "@/api/business-api/element";

const props = defineProps({
  testType: {
    default: '',
    type: String
  },
  deviceList: {
    default: [],
    type: Array
  },
  projectId: {
    default: null,
    type: Number
  },
  caseId: {
    default: null,
    type: Number
  },
})
const activeName = ref('apiList')
const selectApiViewRef = ref(null)
const selectElementViewRef = ref(null)
const quoteCaseRef = ref(null)
const drawerIsShow = ref(false)
const project = ref({template_device: ''})
const waitTimeOut = props.testType === 'app' ? 10 : 5
const submitButtonIsLoading = ref(false)
const ruleFormRef = ref(null)
const formData = ref({
  project_id: undefined,
  module_id: undefined,
  page_id: undefined,
  element_list: [{
    id: `${Date.now()}`,
    name: null,
    by: null,
    element: null,
    template_device: undefined,
    desc: null,
    wait_time_out: waitTimeOut
  }]
})
const formRules = {
  name: [
    {required: true, message: '请输入页面名字', trigger: 'blur'}
  ]
}

onMounted(() => {
  bus.on(busEvent.drawerIsShow, onShowDrawerEvent);
})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsShow, onShowDrawerEvent);
})

const onShowDrawerEvent = (message: any) => {
  if (message.eventType === 'select-step') {
    resetForm()
    drawerIsShow.value = true
  }
}

const resetForm = () => {
  formData.value = {
    project_id: undefined,
    module_id: undefined,
    page_id: undefined,
    element_list: [{
      id: `${Date.now()}`,
      name: null,
      by: null,
      element: null,
      template_device: undefined,
      desc: null,
      wait_time_out: waitTimeOut
    }]
  }
  ruleFormRef.value && ruleFormRef.value.resetFields();
}

const sendEvent = () => {
  bus.emit(busEvent.drawerIsCommit, {eventType: 'element-editor'});
}

const getNewData = () => {
  return { id: `${Date.now()}`, name: null, desc: null }
}

const addRow = () => {
  formData.value.element_list.push(getNewData())
}
const isShowDelButton = (index: number) => {
  return !(formData.value.element_list.length === 1 && index === 0)
}

// 删除一行
const delRow = (index: number) => {
  formData.value.element_list.splice(index, 1)
}

const clearData = () => {
  formData.value.element_list[0] = getNewData()
}

const validateDataList = () => {
  if (formData.value.element_list.length < 1){
    ElMessage.warning('请填写元素信息')
    throw new Error('请填写元素信息')
  }
  formData.value.element_list.forEach((item, index) => {
    if (!item.name|| !item.by || !item.element){
      ElMessage.warning(`第 ${index + 1} 行, 请完善数据`)
      throw new Error(`第 ${index + 1} 行, 请完善数据`);
    }
  })
}


const addData = () => {
  validateDataList()
  submitButtonIsLoading.value = true
  PostElement(props.testType, formData.value).then(response => {
    submitButtonIsLoading.value = false
    if (response) {
      sendEvent()
      drawerIsShow.value = false
    }
  })
}


</script>


<style scoped lang="scss">

</style>
