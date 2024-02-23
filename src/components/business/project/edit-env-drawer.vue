<template>
  <div>
    <el-drawer v-model="drawerIsShow" :title="formData.id ? '修改环境' : '新增环境'" size="80%">

      <div
          v-loading.fullscreen.lock="drawerIsLoading"
          element-loading-text="正在处理中"
          element-loading-spinner="el-icon-loading"
      />

      <el-row>
        <el-col :span="3">
          <div>
            <el-tabs v-model="envListTabActiveName">
              <el-tab-pane label="环境列表" name="envList">
                <el-scrollbar class="aside_scroll" :style="{height: tableHeight}">
                  <el-tree
                      ref="runEnvTreeRef"
                      class="filter-tree project-tree"
                      highlight-current
                      default-expand-all
                      node-key="id"
                      :data="runEnvList"
                      :props="defaultProps"
                      @node-click="clickTable"
                  >
                  </el-tree>
                </el-scrollbar>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-col>

        <el-col :span="21">
          <div style="margin-left: 15px">
            <el-tabs v-model="envDetailTabActiveName">
              <el-tab-pane label="环境属性" name="envDetail">
                <el-scrollbar class="aside_scroll" :style="{height: tableHeight}">
                  <el-form
                      ref="ruleFormRef"
                      :model="formData"
                      :rules="formRules"
                      label-width="80px">
                    <el-form-item v-show="testType !== 'app'" prop="host" :label="'环境域名'" class="is-required" size="small">
                      <el-input v-model="formData.host" placeholder="域名" style="width: 98%" />
                      <el-popover
                          class="el_popover_class"
                          placement="top-start"
                          trigger="hover"
                      >
                        <div>当前服务在当前环境的域名</div>
                        <el-button slot="reference" type="text" icon="el-icon-question" />
                      </el-popover>
                    </el-form-item>

                    <el-tabs v-model="envDataActiveName" style="margin-left: 10px">
                      <el-tab-pane name="variables" label="自定义变量">
                        <template #label>
                          <span> 自定义变量 </span>
                          <el-tooltip class="box-item" effect="dark" placement="top-start">
                            <template #content>
                              1、可用此功能设置一些预设值，比如token、账号信息 <br>
                              2、在此处设置的值，对于此服务下的接口、用例均可直接引用 <br>
                              3、若此处设置的值key为a，value为1，则只需要在要使用时使用“$a”即可获取到“1” <br>
                              4、此处的value可以使用自定义函数处理/获取数据，比如用自定义函数取数据库获取对应的数据 <br>
                              5、若在用例的公用变量处设置了与此处同样的key，则会以用例处定义的变量覆盖此处的变量
                            </template>
                            <el-button type="text"><i style="color: #409EFF" class="iconfont icon-testquestion-circle-fill" /></el-button>
                          </el-tooltip>
                        </template>
                        <variablesView
                            ref="variablesViewRef"
                            :current-data="formData.variables"
                            :placeholder-key="'key'"
                            :placeholder-value="'value'"
                            :placeholder-desc="'备注'"
                        />
                      </el-tab-pane>

                      <!-- 头部信息 -->
                      <el-tab-pane v-if="testType === 'api'" name="headers"  label="头部信息">
                        <template #label>
                          <span> 头部信息 </span>
                          <el-tooltip class="box-item" effect="dark" placement="top-start">
                            <template #content>
                              1、可用此功能设置当前服务的固定的头部参数，比如token、cookie <br>
                              2、在此处设置的值，在运行此服务下的接口、用例的时候，会自动加到对应的接口/步骤的头部参数上 <br>
                              3、此处的value可以使用自定义函数处理/获取数据，比如用自定义函数取数据库获取对应的数据 <br>
                              4、若在用例的头部参数处设置了与此处同样的key，则会以用例处定义的参数覆盖此处的参数
                            </template>
                            <el-button type="text"><i style="color: #409EFF" class="iconfont icon-testquestion-circle-fill" /></el-button>
                          </el-tooltip>
                        </template>

                        <headersView
                            ref="headersViewRef"
                            :current-data="formData.headers"
                            :placeholder-key="'key'"
                            :placeholder-value="'value'"
                            :placeholder-desc="'备注'"
                            :remark-is-required="false"
                        />
                      </el-tab-pane>
                    </el-tabs>
                  </el-form>

                </el-scrollbar>
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-col>
      </el-row>

      <template #footer>
        <div slot="footer" class="dialog-footer">
          <el-button
              v-if="testType !== 'app'"
              v-show="runEnvList.length > 1"
              style="float: left"
              type="primary"
              size="small"
              @click="showEnvSynchronizer"
          >同步环境信息</el-button>

          <el-button size="small" @click="drawerIsShow = false">取消</el-button>
          <el-button type="primary" size="small" @click="changeData(false)">保存并继续填写</el-button>
          <el-button type="primary" size="small" @click="changeData(true)">保存并关闭</el-button>
        </div>
      </template>

      <synchronizeEnvView :test-type="testType" :project-id="formData.project_id" :run-env-list="runEnvList"></synchronizeEnvView>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>

import {onBeforeUnmount, onMounted, ref, nextTick} from "vue";
import synchronizeEnvView from "./synchronize-env.vue";
import {bus, busEvent} from "@/utils/bus-events";
import variablesView from '@/components/input/variables.vue'
import headersView from '@/components/input/key-value-row.vue'
import {GetProjectEnv, PutProjectEnv} from "@/api/business-api/project";
import {GetRunEnvList} from "@/api/config/run-env";
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
  if (message.eventType === 'project-env-editor') {
    resetForm(message.content.id)
    getRunEnvList()
    drawerIsShow.value = true
  }
}

const tableHeight = localStorage.getItem('tableHeight')
const drawerIsShow = ref(false)
const drawerIsLoading = ref(true)
const variablesViewRef = ref(null)
const headersViewRef = ref(null)
const runEnvTreeRef = ref(null)
const envDataActiveName = ref('variables')
const envListTabActiveName = ref('envList')
const envDetailTabActiveName = ref('envDetail')
const runEnvList = ref([])
const defaultProps = ref({ children: 'children', label: 'name' })
let submitButtonIsLoading = ref(false)

const ruleFormRef = ref(null)
const formData = ref({
  id: undefined,
  host: undefined,
  env_id: undefined,
  project_id: undefined,
  headers: [{ 'key': '', 'value': '', 'remark': '' }],
  variables: [{ 'key': '', 'value': '', 'remark': '' }]
})
const formRules = {
  host: [
    {required: true, message: '请输入域名', trigger: 'blur'},
    {min: 5, max: 255, message: '5 - 255 位', trigger: 'blur' }
  ]
}

const showEnvSynchronizer = () =>{
  bus.emit(busEvent.drawerIsShow, {eventType: 'synchronize-env'})
}

const validateVariables = () => {
  const variables = variablesViewRef.value.tempData
  variables.forEach((item: { key: any; value: any; remark: any; data_type: any; }, index: number) => {
    if (item.key || item.value || item.remark || item.data_type){
      if (!item.key || !item.value || !item.remark || !item.data_type){
        ElMessage.warning(`自定义变量，请完善第 ${index + 1} 行数据`)
        throw new Error(`自定义变量，请完善第 ${index + 1} 行数据`)
      }
    }
  })
  return variables
}

const validateHeaders =  () => {
  if (props.testType === 'api'){
    const headers = headersViewRef.value.tempData
    headers.forEach((item: { key: any; value: any; remark: any; data_type: any; }, index: number) => {
      if (item.key || item.value || item.remark){
        if (!item.key || !item.value){
          ElMessage.warning(`头部信息，请完善第 ${index + 1} 行数据`)
          throw new Error(`头部信息，请完善第 ${index + 1} 行数据`)
        }
      }
    })
    return headers
  }
}

const resetForm = (project_id: number) => {
  formData.value = {
    id: undefined,
    host: undefined,
    env_id: undefined,
    project_id: project_id,
    headers: [{ 'key': '', 'value': '', 'remark': '' }],
    variables: [{ 'key': '', 'value': '', 'remark': '' }]
  }
  ruleFormRef.value && ruleFormRef.value.resetFields();
}

const clickTable = (env: { id: number; }) => {
  formData.value.env_id = env.id
  getProjectEnv()
}

const getProjectEnv = () => {
  drawerIsLoading.value = true
  GetProjectEnv(props.testType, {env_id: formData.value.env_id, project_id: formData.value.project_id }).then(response => {
    drawerIsLoading.value = false
    if (response) {
      formData.value = response.data
    }
  })
}

const getRunEnvList = () => {
  GetRunEnvList({page_num: 1, page_size: 99999}).then(response => {
    runEnvList.value = response.data.data
    formData.value.env_id = runEnvList.value[0].id
    nextTick(() => {
      runEnvTreeRef.value.$el.querySelector(".el-tree-node__content").click()
    })
  })
}

const changeData = (isClose: boolean) => {
  ruleFormRef.value.validate((valid) => {
    if (valid) {
      let data = formData.value
      data.variables = validateVariables()
      data.headers = validateHeaders()
      drawerIsLoading.value = true
      PutProjectEnv(props.testType, data).then(response => {
        drawerIsLoading.value = false
        if (response && isClose) {
          drawerIsShow.value = false
        }
      })
    }
  })
}


</script>


<style scoped lang="scss">

</style>
