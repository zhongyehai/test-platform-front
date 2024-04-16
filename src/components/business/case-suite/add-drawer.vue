<template>
  <div>
    <el-drawer v-model="drawerIsShow" title="新增用例集" size="60%">

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

        <el-form-item label="用例集名" prop="name" class="is-required" size="small">
          <template #label>
            <span>用例集名
                <el-tooltip class="item" effect="dark" placement="top-start" content="同一节点下，用例集名称不可重复">
                  <span style="margin-left:5px;color: #409EFF"><Help></Help></span>
                </el-tooltip>
            </span>
          </template>
          <oneColumnRow ref="dataListRef" :current-data="formData.data_list" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div slot="footer" class="dialog-footer">
          <el-button size="small" @click="drawerIsShow = false"> {{ '取消' }}</el-button>
          <el-button
              type="primary"
              size="small"
              :loading="submitButtonIsLoading"
              @click="addData"
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
import {PostCaseSuite, GetCaseSuite} from "@/api/business-api/case-suite";
import {bus, busEvent} from "@/utils/bus-events";
import {GetConfigByCode} from "@/api/config/config-value";
import oneColumnRow from "@/components/input/one-column-row.vue";
import {Help} from "@icon-park/vue-next";
import {ElMessage} from "element-plus";

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
  if (message.eventType === 'add-case-suite') {
    getSuiteTypeList()
    resetForm()
    formData.value.project_id = message.content.project_id
    formData.value.parent = message.content.parent
    formData.value.suite_type = message.content.suite_type
    drawerIsShow.value = true
  }
}

const suiteTypeList = ref([])
const drawerIsShow = ref(false)
const dataListRef = ref()
let submitButtonIsLoading = ref(false)

const ruleFormRef = ref(null)
const formData = ref({
  data_list: [],
  parent: undefined,
  suite_type: undefined,
  project_id: undefined
})
const formRules = {
  suite_type: [
    {required: true, message: '请选择用例集类型', trigger: 'blur'}
  ]
}
const resetForm = () => {
  formData.value = {
    data_list: [],
    parent: undefined,
    suite_type: undefined,
    project_id: undefined
  }
  ruleFormRef.value && ruleFormRef.value.resetFields();
  submitButtonIsLoading.value = false
}
const sendEvent = (content: any, command: string) => {
  bus.emit(busEvent.drawerIsCommit, {eventType: 'case-suite', content: content, command: command});
};

const getSuiteTypeList = () => {
  if (suiteTypeList.value.length < 1){
    GetConfigByCode({ code: props.testType === 'api' ? 'api_suite_list' : 'ui_suite_list' }).then(response => {
      suiteTypeList.value = response.data
    })
  }
}

const getCaseSuiteName = () => {
  const dataList = dataListRef.value.getData()
  if(dataList.length === 0){
    ElMessage.warning(`请填写数据`)
    throw new Error(`请填写数据`);
  }
  dataList.forEach((item, index) => {
    if (!item){
      ElMessage.warning(`第 ${index + 1} 行，请填写数据`)
      throw new Error(`第 ${index + 1} 行，请填写数据`);
    }
  })
  return dataList
}

const addData = () => {
  ruleFormRef.value.validate((valid) => {
    if (valid) {
      const dataList = getCaseSuiteName()
      submitButtonIsLoading.value = true
      PostCaseSuite(props.testType, {...formData.value, data_list: dataList}).then(response => {
        submitButtonIsLoading.value = false
        if (response) {
          sendEvent(response.data, 'add')
          drawerIsShow.value = false
        }
      })
    }
  })
}

</script>


<style scoped lang="scss">

</style>
