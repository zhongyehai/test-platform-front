<template>
  <div>
    <el-drawer v-model="drawerIsShow" title="新增接口" size="95%">

      <el-table ref="dataTable" :data="formData.api_list" stripe size="small" row-key="id">

        <el-table-column label="序号" header-align="center" min-width="4%">
          <template #default="scope">
            <div>{{ scope.$index + 1 }}</div>
          </template>
        </el-table-column>

        <el-table-column header-align="center" min-width="26%">
          <template #header>
            <span><span style="color: red">*</span>接口名</span>
          </template>
          <template #default="scope">
            <el-input v-model="scope.row.name" size="small" type="textarea" :rows="1" />
          </template>
        </el-table-column>

        <el-table-column header-align="center" min-width="10%">
          <template #header>
            <span><span style="color: red">*</span>请求方法</span>
          </template>
          <template #default="scope">
            <el-select v-model="scope.row.method" placeholder="选择请求方式" size="small" style="width: 115px">
              <el-option v-for="item in methodsList" :key="item" :value="item" :label="item" />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column header-align="center" min-width="56%">
          <template #header>
            <span><span style="color: red">*</span>接口地址</span>
          </template>
          <template #default="scope">
            <el-input v-model="scope.row.addr" size="small" type="textarea" :rows="1" />
          </template>
        </el-table-column>

        <el-table-column fixed="right"  align="center" label="操作" width="90">
          <template #default="scope">
            <el-tooltip class="item" effect="dark" placement="top-end" content="添加一行">
              <el-button
                  v-show="scope.$index === 0 || scope.$index === formData.api_list.length - 1"
                  type="text"
                  size="small"
                  style="margin: 2px; padding: 0"
                  @click.native="addRow"
              ><i class="iconfont icon-testadd"></i></el-button>
            </el-tooltip>

            <el-tooltip class="item" effect="dark" placement="top-end" content="复制当前行">
              <el-button
                  type="text"
                  size="small"
                  style="margin: 2px; padding: 0"
                  @click.native="copyRow(scope.row)"
              ><i class="iconfont icon-testjingdianwanfa"></i></el-button>
            </el-tooltip>

            <el-tooltip class="item" effect="dark" placement="top-end" content="删除当前行">
              <el-button
                  v-show="isShowDelButton(scope.$index)"
                  type="text"
                  size="small"
                  style="color: red;margin: 2px; padding: 0"
                  @click.native="delRow(scope.$index)"
              ><i class="iconfont icon-testdelete1"></i></el-button>
            </el-tooltip>

            <el-tooltip class="item" effect="dark" placement="top-end" content="清除数据">
              <el-button
                  v-show="formData.api_list.length === 1"
                  type="text"
                  size="small"
                  style="color: red;margin: 2px; padding: 0"
                  @click.native="clearData()"
              ><i class="iconfont icon-testshibai"></i></el-button>
            </el-tooltip>
          </template>
        </el-table-column>

      </el-table>

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
import {ElMessage} from "element-plus";
import {PostApi} from "@/api/business-api/api";
import {GetConfigByCode} from "@/api/config/config-value";

const props = defineProps({
  projectId: {
    default: '',
    type: String
  },
  moduleId: {
    default: '',
    type: String
  },
})

onMounted(() => {
  bus.on(busEvent.drawerIsShow, onShowDrawerEvent);
})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsShow, onShowDrawerEvent);
})

const onShowDrawerEvent = (message: any) => {
  if (message.eventType === 'add-api') {
    resetForm()
    getMethods()
    if (message.content){
      formData.value.api_list = [{
        id: `${Date.now()}`,
        name: message.content.name,
        method: message.content.method,
        addr: message.content.addr
      }]
    }
    drawerIsShow.value = true
  }
}

const drawerIsShow = ref(false)
const submitButtonIsLoading = ref(false)
const methodsList = ref([])
const ruleFormRef = ref(null)
const formData = ref({
  project_id: undefined,
  module_id: undefined,
  api_list: [{id: `${Date.now()}`, name: null, method: null, addr: null}]
})
const formRules = {}

const resetForm = () => {
  formData.value = {
    project_id: props.projectId,
    module_id: props.moduleId,
    api_list: [{id: `${Date.now()}`, name: null, method: null, addr: null}]
  }
  ruleFormRef.value && ruleFormRef.value.resetFields();
  submitButtonIsLoading.value = false
}

const sendEvent = () => {
  bus.emit(busEvent.drawerIsCommit, {eventType: 'api-editor'});
}

const getNewData = () => {
  return { id: `${Date.now()}`, name: null, method: null, addr: null }
}

const addRow = () => {
  formData.value.api_list.push(getNewData())
}

const copyRow = (row: {id: string, key: null, value: null, remark: null, data_type: null}) => {
  let newData = JSON.parse(JSON.stringify(row))
  newData.id = `${Date.now()}`
  formData.value.api_list.push(newData)
}

const isShowDelButton = (index: number) => {
  return !(formData.value.api_list.length === 1 && index === 0)
}

// 删除一行
const delRow = (index: number) => {
  formData.value.api_list.splice(index, 1)
}

const clearData = () => {
  formData.value.api_list[0] = getNewData()
}

const getMethods = () => {
  if (methodsList.value.length < 1){
    GetConfigByCode({ code: 'http_method' }).then(response => {
      methodsList.value = response.data
    })
  }
}

const validateDataList = () => {
  if (formData.value.api_list.length < 1){
    ElMessage.warning('请填写接口信息')
    throw new Error('请填写接口信息')
  }
  formData.value.api_list.forEach((item, index) => {
    if (!item.name || !item.method || !item.addr){
      ElMessage.warning(`第 ${index + 1} 行, 请完善数据`)
      throw new Error(`第 ${index + 1} 行, 请完善数据`);
    }
  })
}


const addData = () => {
  validateDataList()
  submitButtonIsLoading.value = true
  PostApi(formData.value).then(response => {
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
