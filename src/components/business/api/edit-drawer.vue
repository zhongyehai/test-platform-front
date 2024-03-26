<template>
  <div>
    <el-drawer v-model="drawerIsShow" title="修改接口" size="85%">

      <el-form ref="ruleFormRef" :model="formData" :rules="formRules" label-width="90px">
        <el-row>
          <el-col :span="9">
            <el-form-item label="接口名称" prop="name" class="is-required" >
              <el-input v-model="formData.name" placeholder="接口名称" size="small" />
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="超时时间" prop="time_out" class="is-required">
              <el-input-number v-model="formData.time_out" size="small" :min="5" />
              <el-popover class="el_popover_class" placement="top-start" trigger="hover">
                <div>发送request请求时，等待回调的超时时间，最少设置为5秒</div>
                <el-button type="text"><i style="color: #409EFF" class="iconfont icon-testquestion-circle-fill" /></el-button>
              </el-popover>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-form-item label="接口信息" prop="addr" class="is-required">
            <el-input
                v-model="formData.addr"
                placeholder="请输入接口地址"
                size="small"
                class="required input-with-select"
                :style="{width: addrInputWidth}"
                @change="changeUrl"
            >
              <template #prepend>
                <el-select v-model="formData.method" placeholder="选择请求方式" size="small" style="width: 115px">
                  <el-option v-for="item in methodsList" :key="item" :value="item" :label="item" />
                </el-select>
              </template>
            </el-input>

          </el-form-item>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item prop="up_func" style="margin-bottom: 5px">
              <template #label>
                <span> 前置条件 </span>
                <el-tooltip class="item" effect="dark" placement="top-start" content="在运行接口之前要做的一些前置操作，使用自定义函数的形式实现">
                  <span><i style="color: #409EFF" class="iconfont icon-testquestion-circle-fill" /></span>
                </el-tooltip>
              </template>
              <oneColumnRow ref="upFuncInputRefRef" :current-data="formData.up_func" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item prop="down_func" style="margin-bottom: 5px">
              <template #label>
                <span> 后置条件 </span>
                <el-tooltip class="item" effect="dark" placement="top-start" content="在运行接口之后要做的一些后置操作，使用自定义函数的形式实现">
                  <span><i style="color: #409EFF" class="iconfont icon-testquestion-circle-fill" /></span>
                </el-tooltip>
              </template>
              <oneColumnRow ref="downFuncInputRef" :current-data="formData.down_func" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- 参数信息 -->
      <el-tabs v-model="dataActiveName" style="margin: 0 20px 0 20px;">

        <!-- 头部信息 -->
        <el-tab-pane name="headers">
          <template #label>
            <span> 头部信息 </span>
            <el-tooltip class="box-item" effect="dark" placement="top-start">
              <template #content>
                1、可用此功能设置当前接口的固定的头部参数，比如token、cookie <br>
                2、在此处设置的值，在运行此接口的时候，会自动加到头部参数上 <br>
                3、此处的value可以使用自定义函数处理/获取数据，比如用自定义函数取数据库获取对应的数据 <br>
                4、若在此处设置了与服务的头部参数设置的同样的key，则会用此处设置的value
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

        <!-- 接口查询字符串信息 -->
        <el-tab-pane label="url参数" name="params">
          <queryStringView
              ref="queryStringViewRef"
              :current-data="formData.params"
              :placeholder-key="'key'"
              :placeholder-value="'value'"
              :placeholder-desc="'备注'"
              :bus-event-name="busEventParam"
              :remark-is-required="false"
          />
        </el-tab-pane>

        <!-- 请求体 -->
        <el-tab-pane label="请求体" name="body" :disabled="formData.method === 'GET'">
          <bodyView
              ref="bodyViewRef"
              :body-type="formData.body_type"
              :data-json="formData.data_json"
              :data-form="formData.data_form"
              :data-urlencoded="formData.data_urlencoded"
              :data-text="formData.data_text"
          />
        </el-tab-pane>

        <!-- 数据提取信息 -->
        <el-tab-pane label="数据提取" name="extracts">
          <apiExtractorView
              ref="extractsViewRef"
              :current-data="formData.extracts"
              :placeholder-key="'起个变量名'"
              :placeholder-value="'提取表达式'"
              :placeholder-desc="'备注'"
          />
        </el-tab-pane>

        <!-- 断言信息 -->
        <el-tab-pane label="断言" name="validates">
          <validatesView
              ref="validatesViewRef"
              :test-type="'api'"
              :element-list="[]"
              :current-data="formData.validates"
          />
        </el-tab-pane>

        <!-- 响应信息 -->
        <el-tab-pane label="响应对象" name="response">
          <show-json :json-data="formData.response"/>
        </el-tab-pane>

      </el-tabs>

      <template #footer>
        <div slot="footer" class="dialog-footer">
          <el-button
              size="small"
              type="primary"
              style="float: left"
              :loading="debugButtonIsLoading"
              @click="changeData(true)"
          >运行</el-button>

          <el-button size="small" @click="drawerIsShow = false"> {{ '取消' }}</el-button>
          <el-button
              type="primary"
              size="small"
              :loading="submitButtonIsLoading"
              @click="changeData(false)"
          >保存</el-button>
        </div>
      </template>

    </el-drawer>
  </div>
</template>

<script lang="ts" setup>

import {onBeforeUnmount, onMounted, ref} from "vue";
import {GetApi, PostApi, PutApi, RunApi, GetApiFrom} from "@/api/business-api/api";
import {bus, busEvent} from "@/utils/bus-events";
import OneColumnRow from "@/components/input/one-column-row.vue";
import headersView from '@/components/input/key-value-row.vue'
import queryStringView from '@/components/input/key-value-row.vue'
import apiExtractorView from '@/components/input/api-extractor.vue'
import validatesView from '@/components/input/validates.vue'
import bodyView from '@/components/input/api-body.vue'

import {GetConfigByCode} from "@/api/config/config-value";
import showJson from "@/components/show-json.vue";
import {paramsListToStr} from "@/utils/parse-data";
import {ElMessage} from "element-plus";

onMounted(() => {
  bus.on(busEvent.changeData, changeParamData);
  bus.on(busEvent.treeIsDone, treeIsDone);
  bus.on(busEvent.drawerIsCommit, onDrawerIsCommit);
  bus.on(busEvent.drawerIsShow, onShowDrawerEvent);
})

onBeforeUnmount(() => {
  bus.off(busEvent.changeData, changeParamData);
  bus.off(busEvent.treeIsDone, treeIsDone);
  bus.off(busEvent.drawerIsCommit, onDrawerIsCommit);
  bus.off(busEvent.drawerIsShow, onShowDrawerEvent);
})

const onShowDrawerEvent = (message: any) => {
  if (message.eventType === 'api-editor') {
    getMethods()
    resetForm()
    if (message.content){
      getData(message.command, message.content.id)
    }else {
      formData.value.module_id = message.module_id
      formData.value.project_id = message.project_id
    }
    drawerIsShow.value = true
  }
}

const onDrawerIsCommit = (message: any) => {
  if (message.eventType === runEvent && message.triggerFrom  === runTrigger) {
    runApis(message)
  }
}

const changeParamData = (message: any) => {
  if (message.eventType === busEventParam) {
    paramsToStr(message.content)
  }
}

const treeIsDone  = (message: any) => {
  if (message.eventType === 'module') {
    moduleTree.value = message.content
  }
}

const paramsToStr = (paramsList: any) => {
  formData.value.addr = formData.value.addr.split('?')[0] + paramsListToStr(paramsList)
}

const drawerIsShow = ref(false)
const dataActiveName = ref('headers')
const busEventParam = 'param'
const submitButtonIsLoading = ref(false)
const moduleTree = ref([])
const methodsList = ref([])
const upFuncInputRefRef = ref(null)
const downFuncInputRef = ref(null)
const debugButtonIsLoading = ref(false)
const ruleFormRef = ref(null)
const bodyViewRef = ref(null)
const extractsViewRef = ref(null)
const validatesViewRef = ref(null)
const queryStringViewRef = ref(null)
const headersViewRef = ref(null)
const runTrigger = 'api-drawer'
const runEvent = 'select-run-env'
const addrInputWidth  = `${window.innerWidth * 0.75}px`
const formData = ref({
  id: undefined,
  name: undefined,
  desc: undefined,
  up_func: [],
  down_func: [],
  method: undefined,
  addr: undefined,
  time_out: 60,
  headers: [{ key: undefined, value: undefined, remark: undefined }],
  params: [{ key: undefined, value: undefined, remark: undefined }],
  body_type: '',
  data_form: [],
  data_json: JSON.stringify({}),
  data_urlencoded: JSON.stringify({}),
  data_text: undefined,
  extracts: [{ key: undefined, value: undefined, remark: undefined }],
  validates: [{ key: undefined, value: undefined, validate_type: 'data', remark: undefined }],
  response: {},
  module_id: undefined,
  project_id: undefined
})
const formRules = {
  name: [
    {required: true, message: '请输入接口名字', trigger: 'blur'}
  ],
  method: [
    {required: true, message: '请选择请求方法', trigger: 'blur'}
  ],
  addr: [
    {required: true, message: '请输入接口地址', trigger: 'blur'}
  ],
  module_id: [
    {required: true, message: '请选择模块', trigger: 'blur'}
  ]
}
const resetForm = () => {
  formData.value = {
    id: undefined,
    name: undefined,
    desc: undefined,
    up_func: [],
    down_func: [],
    method: methodsList.value[0],
    addr: undefined,
    time_out: 60,
    headers: [{ key: undefined, value: undefined, remark: undefined }],
    params: [{ key: undefined, value: undefined, remark: undefined }],
    body_type: '',
    data_form: [],
    data_json: JSON.stringify({}),
    data_urlencoded: JSON.stringify({}),
    data_text: undefined,
    extracts: [{ key: undefined, value: undefined, remark: undefined }],
    validates: [{ key: undefined, value: undefined, validate_type: 'data', remark: undefined }],
    response: {},
    module_id: undefined,
    project_id: undefined
  }
  ruleFormRef.value && ruleFormRef.value.resetFields();
  submitButtonIsLoading.value = false
}
const sendEvent = () => {
  bus.emit(busEvent.drawerIsCommit, {eventType: 'api-editor'});
};

const getMethods = () => {
  if (methodsList.value.length < 1){
    GetConfigByCode({ code: 'http_method' }).then(response => {
      methodsList.value = response.data
    })
  }
}

const changeUrl = (value: string) => {
  const queryStr = value.split('?')[1]

  if (queryStr) {
    const queryStrParam = queryStr.split('&')

    const newParam = []
    for (let i = 0; i < queryStrParam.length; i++) {
      const param = queryStrParam[i]
      const [key, value] = param.split('=')

      if (key) {
        newParam.push({ 'id': i, 'key': key, 'value': value, 'remark': null, 'data_type': 'str' })
      }
    }
    if (newParam.length > 0) {
      formData.value.params = newParam
    }
  }
}

const getData = (command: string, dataId: any) => {
  GetApi({id: dataId}).then(response => {
    formData.value = response.data
  })
}

const changeData = (isDebug: boolean) => {
  ruleFormRef.value.validate((valid) => {
    if (valid) {
      const data = getApiDataToCommit()
      submitButtonIsLoading.value = true
      PutApi(data).then(response => {
        submitButtonIsLoading.value = false
        if (response) {
          sendEvent()
          if (!isDebug){
            drawerIsShow.value = false
          }else {
            selectRunEnv()
          }
        }
      })
    }
  })
}

const validateHeaders = () => {
  let data = headersViewRef.value.tempData
  data.forEach( (item: { key: any; value: any; remark: any; }, index: any) => {
    if (item.key || item.value || item.remark){
      if (!item.key || !item.value){
        ElMessage.warning(`头部信息参数，第 ${index + 1} 行，请完善数据`)
        throw new Error(`头部信息参数，第 ${index + 1} 行，请完善数据: ${JSON.stringify(item)}`);
      }
    }
  })
  return data
}

const validateParams = () => {
  let data = queryStringViewRef.value.tempData
  data.forEach( (item: { key: any; value: any; remark: any; }, index: any) => {
    if (item.key || item.value || item.remark){
      if (!item.key || !item.value){
        ElMessage.warning(`url参数，第 ${index + 1} 行，请完善数据`)
        throw new Error(`url参数，第 ${index + 1} 行，请完善数据: ${JSON.stringify(item)}`);
      }
    }
  })
  return data
}

const getApiDataToCommit = () => {
  let data = JSON.parse(JSON.stringify(formData.value))
  data.up_func = upFuncInputRef.value.getData()
  data.down_func = downFuncInputRef.value.getData()
  data.headers = validateHeaders()
  data.params = validateParams()
  data.body_type = bodyViewRef.value.tempBodyType
  data.data_form = bodyViewRef.value.getDataForm()
  data.data_json = bodyViewRef.value.getDataJson()
  data.data_text = bodyViewRef.value.tempDataText
  data.data_urlencoded = bodyViewRef.value.getUrlencoded()
  data.extracts = extractsViewRef.value.getExtracts()
  data.validates = validatesViewRef.value.getValidates()
  return data
}

const selectRunEnv = () => {
  bus.emit(busEvent.drawerIsShow, {
    eventType: runEvent,
    triggerFrom: runTrigger,
    showSelectRunModel: false,
    business_id: null,
    args: null
  })
}

const runApis = (runConf: { runEnv: any; }) => {
  RunApi({
    project_id: formData.value.project_id,
    api_list: [formData.value.id],
    env_list: runConf.runEnv
  }).then(response => {
    if (response) {
      bus.emit(busEvent.drawerIsShow, {
        eventType: 'run-process',
        batch_id: response.data.batch_id,
        report_id: response.data.report_id
      })
    }
  })
}

</script>


<style scoped lang="scss">
.input-with-select .el-input-group__prepend {
  background-color: var(--el-fill-color-blank);
}
</style>
