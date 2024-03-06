<template>
  <div>
    <el-drawer v-model="drawerIsShow" :title=" formData.id ? '修改定时任务' : '新增定时任务'" size="75%">

      <el-form
          ref="ruleFormRef"
          :model="formData"
          :rules="formRules"
          label-width="120px">

        <el-tabs v-model="activeName">
          <el-tab-pane label="任务信息" name="task">
            <el-form-item prop="name" label="任务名称" size="small" class="is-required">
              <el-input v-model="formData.name" auto-complete="off" />
            </el-form-item>

            <!-- 选择运行环境 -->
            <el-form-item prop="env_list" label="运行环境" size="small" class="is-required">
              <el-select
                  v-model="formData.env_list"
                  multiple
                  filterable
                  default-first-option
                  placeholder="请选择运行环境"
                  style="width: 98%"
                  size="small"
              >
                <el-option v-for="(env) in runEnvList" :key="env.code" :label="env.name" :value="env.code" />
              </el-select>
              <el-tooltip class="item" effect="dark" placement="top-start">
                <template #content>
                  触发此定时任务时，会以此处选择的环境来执行，请确保此任务涉中及到的所有服务都设置了当前选中环境的域名
                </template>
                <span><i style="color: #409EFF" class="iconfont icon-testquestion-circle-fill"/></span>
              </el-tooltip>
            </el-form-item>

            <el-form-item v-if="testType==='ui'" prop="browser" label="运行浏览器" size="small" class="is-required">
              <el-radio
                  v-for="(value, key) in runBrowserNameDict "
                  :key="key"
                  v-model="formData.conf.browser"
                  :label="key"
              >{{ value }}
              </el-radio>
            </el-form-item>

            <el-form-item v-if="testType==='app'" prop="server_id" label="运行服务器" size="small" class="is-required">
              <el-select
                  v-model="formData.conf.server_id"
                  filterable
                  default-first-option
                  placeholder="请选择运行服务器"
                  style="width: 100%"
                  size="small"
              >
                <el-option
                    v-for="server in runServerList"
                    :key="server.id"
                    :label="`${server.name}   (最近一次访问：${appiumServerRequestStatusMappingContent[server.status]})`"
                    :value="server.id"
                />
              </el-select>
            </el-form-item>

            <el-form-item v-if="testType==='app'" prop="phone_id" label="运行手机" size="small" class="is-required">
              <el-select
                  v-model="formData.conf.phone_id"
                  filterable
                  default-first-option
                  placeholder="请选择运行手机"
                  style="width: 100%"
                  size="small"
              >
                <el-option
                    v-for="phone in runPhoneList"
                    :key="phone.id"
                    :label="phone.name"
                    :value="phone.id"
                />
              </el-select>
            </el-form-item>

            <el-form-item v-if="testType==='app'" prop="no_reset" label="APP缓存" size="small" class="is-required">
              <el-radio v-model="formData.conf.no_reset" :label="false">重置</el-radio>
              <el-radio v-model="formData.conf.no_reset" :label="true">不重置</el-radio>
            </el-form-item>

            <el-form-item prop="is_send" label="发送报告" size="small" class="is-required">
              <el-radio v-model="formData.is_send" label="not_send">不发送</el-radio>
              <el-radio v-model="formData.is_send" label="always">始终发送</el-radio>
              <el-radio v-model="formData.is_send" label="on_fail">仅有不通过用例时发送</el-radio>
            </el-form-item>

            <el-form-item v-show="formData.env_list.length > 1" prop="merge_notify" label="是否合并通知" size="small" class="is-required">
              <el-radio v-model="formData.merge_notify" :label="0">不合并</el-radio>
              <el-radio v-model="formData.merge_notify" :label="1">合并</el-radio>
              <el-tooltip class="item" effect="dark" placement="top-start">
                <template #content>
                  <div>1、不合并通知：达到触发发送通知的条件时，每个环境都会发一份通知</div>
                  <div>2、合并通知：达到触发发送通知的条件时，汇总每个环境的通知，只通知一次</div>
                  <div>注：当选择了多个环境时，才会出现此选项</div>
                </template>
                <span><i style="color: #409EFF" class="iconfont icon-testquestion-circle-fill"/></span>
              </el-tooltip>
            </el-form-item>

            <el-form-item v-show="formData.is_send !== 'not_send'" prop="receive_type" size="small" class="is-required" label="接收方式">
              <el-radio v-model="formData.receive_type" label="ding_ding">钉钉群</el-radio>
              <el-radio v-model="formData.receive_type" label="we_chat">企业微信群</el-radio>
              <el-radio v-model="formData.receive_type" label="email">邮件</el-radio>
              <el-tooltip class="item" effect="dark" placement="top-start">
                <template #content>
                  1、钉钉群为关键词模式，关键词为“测试”、“报告”、“统计”
                </template>
                <span><i style="color: #409EFF" class="iconfont icon-testquestion-circle-fill"/></span>
              </el-tooltip>
            </el-form-item>

            <div v-show="formData.is_send !== 'not_send'">
              <div v-show="formData.receive_type === 'ding_ding' || formData.receive_type === 'we_chat'">
                <el-form-item prop="webhook_list" label="webhook地址" size="small" class="is-required">
                  <oneColumnRow ref="webhookListInputRef" :current-data="formData.webhook_list"/>
                </el-form-item>
              </div>

              <div v-show="formData.receive_type === 'email'">
                <el-form-item prop="email_server" label="邮箱服务器" size="small" class="is-required">
                  <el-select
                      v-model="formData.email_server"
                      filterable
                      default-first-option
                      placeholder="选择邮箱服务器"
                      value-key="id"
                      style="min-width: 100%"
                      size="small"
                  >
                    <el-option v-for="item in emailServerList" :key="item.id" :label="item.name" :value="item.value" />
                  </el-select>
                </el-form-item>
                <el-form-item prop="email_from" label="发件人邮箱" size="small" class="is-required">
                  <el-input
                      v-model="formData.email_from"
                      size="small"
                      placeholder="默认支持QQ邮箱，可到全局参数添加对应的服务器，配置类型选邮箱"
                  />
                </el-form-item>

                <el-form-item prop="email_pwd" label="邮箱密码" size="small" class="is-required">
                  <el-input v-model="formData.email_pwd" size="small" type="text" />
                </el-form-item>

                <el-form-item prop="email_to" label="收件人邮箱" size="small" class="is-required">
                  <oneColumnRow ref="emailToInputRef" :current-data="formData.email_to" />
                </el-form-item>
              </div>
            </div>

            <el-form-item prop="cron" label="时间配置" size="small" class="is-required">
              <el-input
                  v-model="formData.cron"
                  style="width: 80%"
                  placeholder="秒 分 时 日 月 周 年 (0 0 12 * * ? * 每天中午12点触发), 如：0 15 10 ? * MON-FRI"
              />
              <el-link
                  type="primary"
                  href="https://www.bejson.com/othertools/cron/"
                  target="_blank"
                  style="width: 20%"
              >
                调试cron表达式
              </el-link>
            </el-form-item>

            <el-form-item prop="skip_holiday" label="节假日/调休日" size="small" class="is-required">
              <el-radio
                  v-model="formData.skip_holiday"
                  v-for="item in skipHolidayItem"
                  :key="item.value"
                  :label="item.value"
              >
                {{ item.label }}
              </el-radio>
              <el-tooltip class="item" effect="dark" placement="top-start">
                <template #content>
                  <div>1、用于设置当定时任务触发时，当前日期为节假日或者调休日时，是否执行</div>
                  <div>2、节假日的数据来源：参数配置的holiday_list对应的值</div>
                  <div>注：每年需手动更新节假日，格式为 ["01-01", "10-01"] </div>
                </template>
                <span><i style="color: #409EFF" class="iconfont icon-testquestion-circle-fill"/></span>
              </el-tooltip>
            </el-form-item>

            <el-form-item prop="is_async" label="运行机制" size="small" class="is-required">
              <el-radio v-model="formData.is_async" v-for="(value, key) in runModeData" :key="parseInt(key)" :label="parseInt(key)">
                {{ value }}
              </el-radio>
              <el-tooltip class="item" effect="dark" placement="top-start">
                <template #content>
                  <div>1、串行执行: 用例一条一条顺序串行执行</div>
                  <div>2、并行执行: 每条用例一个线程并行执行</div>
                  <div>注：并行执行仅仅是为了提升执行效率，请勿用于压力测试</div>
                </template>
                <span><i style="color: #409EFF" class="iconfont icon-testquestion-circle-fill"/></span>
              </el-tooltip>
            </el-form-item>

            <el-form-item prop="call_back" size="small">
              <template #label>
                <span>回调流水线</span>
                <el-tooltip class="item" effect="dark" placement="top-start">
                  <template #content>
                    <div>1、用于回调流水线自动化测试的执行结果，流水线根据结果判断是否往下走</div>
                    <div>2、json参数会添加参数：status=运行结果，全部通过为true，否则为false</div>
                    <div>3、json参数会添加参数：taskId=任务id</div>
                    <div>4、json参数会添加参数extend字段，来源于触发请求时传的extend字段，接收的什么就返回什么</div>
                    <div>5、请严格按照示例填写内容，否则回调会不成功</div>
                  </template>
                  <span><i style="color: #409EFF" class="iconfont icon-testquestion-circle-fill"/></span>
                </el-tooltip>
              </template>
              <div :style="jsonEditorStyle">
                <jsonEditorView ref="callBackEditorViewRef" :json-data="formData.call_back" />
              </div>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="选择用例" name="case">
            <selectCaseView
                ref="caseSelectorRef"
                :test-type="testType"
                :case-id="formData.case_ids"
                :suite-id="formData.suite_ids"
                :case-suite-Tree="caseSuiteTree"
                :case-list="caseList"
            ></selectCaseView>
          </el-tab-pane>
        </el-tabs>
      </el-form>

      <template #footer>
        <div slot="footer" class="dialog-footer">
          <div style="float: left">
            <el-button
                v-show="formData.id"
                size="small"
                type="primary"
                :loading="submitButtonIsLoading"
                @click="clickRun"
            >调试</el-button>
          </div>

          <el-button size="small" @click="drawerIsShow = false"> {{ '取消' }}</el-button>
          <el-button
              type="primary"
              size="small"
              :loading="submitButtonIsLoading"
              @click="submitForm(undefined)"
          >保存</el-button>
        </div>
      </template>

    </el-drawer>
  </div>
</template>

<script lang="ts" setup>

import {computed, onBeforeUnmount, onMounted, ref} from "vue";
import jsonEditorView from '@/components/editor/json-editor.vue'
import selectCaseView from './select-case.vue'
import {GetConfigByCode, GetConfigList} from "@/api/config/config-value";
import {bus, busEvent} from "@/utils/bus-events";
import {GetRunEnvList} from "@/api/config/run-env";
import {appiumServerRequestStatusMappingContent} from "@/components/business/mapping";
import OneColumnRow from "@/components/input/one-column-row.vue";
import {GetConfigTypeList} from "@/api/config/config-type";
import {GetTask, PostTask, PutTask, RunTask} from "@/api/business-api/task";
import {GetCaseSuiteList} from "@/api/business-api/case-suite";
import {arrayToTree} from "@/utils/parse-data";
import {GetCaseList} from "@/api/business-api/case";
import {GetServerList} from "@/api/business-api/device-server";
import {GetPhoneList} from "@/api/business-api/device-phone";

const props = defineProps({
  testType: {
    default: '',
    type: String
  }
})

onMounted(() => {
  bus.on(busEvent.treeIsChoice, onTreeIsChoice);
  bus.on(busEvent.drawerIsShow, onShowDrawerEvent);
  bus.on(busEvent.drawerIsCommit, drawerIsCommit);
})

onBeforeUnmount(() => {
  bus.off(busEvent.treeIsChoice, onTreeIsChoice);
  bus.off(busEvent.drawerIsShow, onShowDrawerEvent);
  bus.off(busEvent.drawerIsCommit, drawerIsCommit);
})

const onShowDrawerEvent = (message: any) => {
  if (message.eventType === 'edit-task') {
    resetForm()
    getRunAppEnv()
    getBrowserName()
    if (message.content){
      getData(message.content.id)
    }
    formData.value.project_id = project.value.id
    drawerIsShow.value = true
    getRunMode()
    getEmailServerList()
  }
}

const getRunAppEnv = () => {
  if (props.testType === 'app'){
    if (runServerList.value.length > 0) {
      formData.value.conf.server_id = runServerList.value[0].id
    }else {
      GetServerList({page_num: 1, page_size: 99999}).then(response => {
        runServerList.value = response.data.data
        formData.value.conf.server_id = runServerList.value[0].id
      })
    }

    if (runPhoneList.value.length > 0) {
      formData.value.conf.phone_id = runPhoneList.value[0].id
    }else {
      GetPhoneList({page_num: 1, page_size: 99999}).then(response => {
        runPhoneList.value = response.data.data
        formData.value.conf.phone_id = runPhoneList.value[0].id
      })
    }
  }
}

const getBrowserName = () => {
  if (props.testType === 'ui') {
    if (Object.keys(runBrowserNameDict.value).length === 0){
      GetConfigByCode({ code: 'browser_name' }).then(response => {
        runBrowserNameDict.value = response.data
        formData.value.conf.browser = Object.keys(runBrowserNameDict.value)[0]
      })
    }else {
      formData.value.conf.browser = Object.keys(runBrowserNameDict.value)[0]
    }
  }
}

const onTreeIsChoice = (message: any) => {
  if (message.eventType === 'project-tree') {
    project.value = message.content
    getRunEnvList()
    getCaseSuiteTree(project.value.id)
  }
}

const drawerIsCommit = (message: any) => {
  if (message.eventType === 'select-run-env' && message.triggerFrom === triggerFrom) {
    submitForm(message)
  }
}

const triggerFrom = 'task-editor'
const activeName = ref('task')
const drawerIsShow = ref(false)
const submitButtonIsLoading = ref(false)
const runEnvList = ref([])
const runServerList = ref([])
const runPhoneList = ref([])
const caseSuiteTree = ref([])
const caseList = ref([])
const emailServerList = ref([])
const runModeData = ref({})
const runBrowserNameDict = ref({})
const project = ref()
const skipHolidayItem = [{ label: '跳过执行', value: 1 }, { label: '不跳过执行', value: 0 }]
const webhookListInputRef = ref(null)
const emailToInputRef = ref(null)
const callBackEditorViewRef = ref(null)
const caseSelectorRef = ref(null)
const ruleFormRef = ref(null)
const formData = ref({
  id: undefined,
  project_id: undefined,
  name: undefined,
  skip_holiday: 1,
  cron: '0 15 10 ? * MON-FRI',
  is_send: 'not_send',
  is_async: 1,
  merge_notify: 0,
  receive_type: 'ding_ding',
  webhook_list: [],
  env_list: [],
  email_server: undefined,
  email_to: [],
  email_from: undefined,
  email_pwd: undefined,
  suite_ids: [],
  case_ids: [],
  call_back: [
    {
      url: 'https://xxx',
      method: 'post',
      headers: {},
      json: {}
    }
  ],
  conf: {
    browser: '',
    server_id: '',
    phone_id: '',
    no_reset: false
  }
})

const validateEmailServer = (rule: any, value: any, callback: any) => {
  if (formData.value.receive_type === 'email' && !formData.value.email_server){
    callback(new Error('请选择邮箱服务器'))
  }
  callback()
}


const validateEmailFrom = (rule: any, value: any, callback: any) => {
  if (formData.value.receive_type === 'email' && !formData.value.email_from){
    callback(new Error('请输入发件人邮箱'))
  }
  callback()
}

const validateEmailPwd = (rule: any, value: any, callback: any) => {
  if (formData.value.receive_type === 'email' && !formData.value.email_pwd){
    callback(new Error('请输入发件人邮箱密码'))
  }
  callback()
}

const validateEmailTo = (rule: any, value: any, callback: any) => {
  if (formData.value.receive_type === 'email' && (!formData.value.email_to || formData.value.email_to.length < 1)){
    callback(new Error('请输入接收人的邮箱'))
  }
  callback()
}

const formRules = {
  name: [
    {required: true, message: '请输入任务名称', trigger: 'blur'}
  ],
  env_list: [
    {required: true, message: '请选择运行环境', trigger: 'blur'}
  ],
  cron: [
    {required: true, message: '请输入cron表达式', trigger: 'blur'}
  ],
  email_server: [
    {validator: validateEmailServer, trigger: 'blur'}
  ],
  email_from: [
    {validator: validateEmailFrom, trigger: 'blur'}
  ],
  email_pwd: [
    {validator: validateEmailPwd, trigger: 'blur'}
  ],
  email_to: [
    {validator: validateEmailTo, trigger: 'blur'}
  ]
}



const resetForm = () => {
  formData.value = {
    id: undefined,
    project_id: undefined,
    name: undefined,
    skip_holiday: 1,
    cron: '0 15 10 ? * MON-FRI',
    is_send: 'not_send',
    is_async: 1,
    merge_notify: 0,
    receive_type: 'ding_ding',
    webhook_list: [],
    env_list: [],
    email_server: undefined,
    email_to: [],
    email_from: undefined,
    email_pwd: undefined,
    suite_ids: [],
    case_ids: [],
    call_back: [
      {
        url: 'https://xxx',
        method: 'post',
        headers: {},
        json: {}
      }
    ],
    conf: {
      browser: '',
      server_id: '',
      phone_id: '',
      no_reset: false
    }
  }
  ruleFormRef.value && ruleFormRef.value.resetFields();
  submitButtonIsLoading.value = false
}
const sendEvent = () => {
  bus.emit(busEvent.drawerIsCommit, {eventType: 'task-editor'});
};

const jsonEditorStyle = computed(() => {
  return {
    width: `${window.innerWidth * 0.60}px`
  }
})


const getData = (taskId: any) => {
  GetTask(props.testType, {id: taskId}).then(response => {
    formData.value = response.data
  })
}

const getRunEnvList = () => {
  GetRunEnvList({ business_id: project.value.business_id }).then(response => {
    runEnvList.value = response.data.data
  })
}

const getCaseSuiteTree = (projectId: number) => {
  GetCaseSuiteList(props.testType, {page_num: 1, page_size: 99999, project_id: projectId, suite_type: 'api,process'}).then(response => {
    caseSuiteTree.value = arrayToTree(response.data.data, null)
  })
}


const getCaseList = (suiteId: number) => {
  GetCaseList(props.testType, {page_num: 1, page_size: 99999, suite_id: suiteId, status: 1, detail: true}).then(response => {
    caseList.value = arrayToTree(response.data.data, null)
  })
}

const getEmailServerList = () => {
  if (emailServerList.value.length < 1){
    GetConfigTypeList({page_num: 1, page_size: 99999}).then(response => {
      let emailConfigTypeId = 0
      response.data.data.forEach((item: { name: string; id: number; }) => {
        if (item.name === '邮箱') {
          emailConfigTypeId = item.id
        }
      })
      GetConfigList({ type: emailConfigTypeId }).then(response => {
        emailServerList.value = response.data.data
      })
    })
  }
}

const getRunMode = () => {
  if (Object.keys(runModeData.value).length < 1){
    GetConfigByCode({ code: 'run_model' }).then(response => {
      runModeData.value = response.data
    })
  }
}

const getCommitData = () => {
  const data = JSON.parse(JSON.stringify(formData.value))
  data.webhook_list = webhookListInputRef.value.getData()
  data.email_to = emailToInputRef.value.getData()
  data.call_back = callBackEditorViewRef.value.getJsonData()
  data.suite_ids = caseSelectorRef.value.getCaseSuiteIdList()
  data.case_ids = caseSelectorRef.value.caseIdList
  console.log('data: ', data)
  return data
}

const clickRun = () =>{
  bus.emit(busEvent.drawerIsShow, {
    eventType: 'select-run-env',
    triggerFrom: triggerFrom,
    showSelectRunModel: true,
    business_id: project.value.business_id,
    runArgs: undefined
  })
}

const runTask = (runConf) => {
  RunTask(props.testType, {
    id: formData.value.id,
    env_list: runConf.runEnv,
    is_async: runConf.runType,
    browser: runConf.browser,
    server_id: runConf.runServer,
    phone_id: runConf.runPhone,
    no_reset: runConf.noReset,
    temp_variables: runConf.temp_variables,
    'trigger_type': 'page'
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

const submitForm = (runConf) =>{
  if (formData.value.id){
    changeData(runConf)
  }else {
    addData()
  }
}

const addData = () => {
  ruleFormRef.value.validate((valid) => {
    if (valid) {
      const data = getCommitData()
      submitButtonIsLoading.value = true
      PostTask(props.testType, data).then(response => {
        submitButtonIsLoading.value = false
        if (response) {
          sendEvent()
          drawerIsShow.value = false
        }
      })
    }
  })
}

const changeData = (runConf: any) => {
  ruleFormRef.value.validate((valid) => {
    if (valid) {
      const data = getCommitData()
      submitButtonIsLoading.value = true
      PutTask(props.testType, data).then(response => {
        submitButtonIsLoading.value = false
        if (response) {
          sendEvent()
          if (runConf){
            runTask(runConf)
          }else {
            drawerIsShow.value = false
          }
        }
      })
    }
  })
}


</script>


<style scoped lang="scss">

</style>
