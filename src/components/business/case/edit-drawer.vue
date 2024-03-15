<template>
  <div>
    <el-drawer v-model="drawerIsShow" title="修改用例" size="95%">

      <el-tabs v-model="activeName" style="margin-left: 20px;margin-right: 20px">

        <!-- 用例信息组件 -->
        <el-tab-pane label="用例信息" name="caseInfo">

          <el-form
              size="small"
              label-width="100px"
              ref="ruleFormRef"
             :model="formData"
             :rules="formRules">

            <el-row>
              <el-col :span="12">
                <el-form-item label="用例名称" class="is-required">
                  <el-input v-model="formData.name" />
                </el-form-item>
              </el-col>

              <el-col :span="8">
                <el-form-item label="脚本文件">
                  <el-select
                      v-model="formData.script_list"
                      filterable
                      clearable
                      multiple
                      size="small"
                      style="width: 100%"
                      placeholder="请选则脚本"
                  >
                    <el-option v-for="item in scriptList" :key="item.id" :label="item.name" :value="item.id"/>
                  </el-select>
                  <el-popover class="el_popover_class" placement="top-start" trigger="hover">
                    <div>
                      <div>1、用例下要用到自定义函数可以在这里统一引用对应的脚本文件</div>
                      <div>2、此处引用的脚本文件，对于当前用例下的测试步骤均有效</div>
                      <div>3、若此处引用了脚本文件，服务处也引用了脚本文件，则会把两边引用的合并去重</div>
                    </div>
                    <el-button type="text"><i style="color: #409EFF" class="iconfont icon-testquestion-circle-fill" /></el-button>
                  </el-popover>
                </el-form-item>
              </el-col>

              <el-col :span="4">
                <el-form-item label="执行次数" class="is-required">
                  <el-input-number
                      v-model="formData.run_times"
                      :min="1"
                      :max="1000"
                      controls-position="right"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="用例来源">
              <el-input v-model="formData.from" disabled />
            </el-form-item>

            <el-form-item label="用例描述" class="is-required">
              <el-input v-model="formData.desc" size="small" type="textarea" autosize placeholder="'请填写当前用例的作用、注意事项、出参'" />
            </el-form-item>

            <el-tabs v-model="caseDetailActiveName" style="margin-left: 20px;margin-right: 20px">

              <!-- 跳过条件 -->
              <el-tab-pane name="skipIf">
                <template #label>
                  <span> 跳过条件 </span>
                  <el-tooltip class="item" effect="dark" placement="top-start" content="任意一行设置的表达式成立，都会执行跳过操作，使用方法与断言一致，详见断言示例">
                    <span><i style="color: #409EFF" class="iconfont icon-testquestion-circle-fill" /></span>
                  </el-tooltip>
                </template>
                <skipIfView
                    ref="skipIfViewRef"
                    :test-type="testType"
                    :current-data="formData.skip_if"
                    :project-id="projectId"
                    :use-type="'case'"
                />
              </el-tab-pane>

              <el-tab-pane name="variables">
                <template #label>
                  <span> 自定义变量 </span>
                  <el-tooltip class="item" effect="dark" placement="top-start">
                    <template #content>
                      1、可用此功能设置一些预设值，比如token、账号信息 <br>
                      2、在此处设置的值，对于此用例下的测试步骤均可直接引用 <br>
                      3、此处的value可以使用自定义函数处理/获取数据，比如用自定义函数取数据库获取对应的数据 <br>
                      4、若在此处设置的key与服务的公共变量中的某个key一致，则对于这个key，则会用此处设置的值 <br>
                      5、若在测试步骤中提取的值使用的key和此处设置的key相同，则在此用例的后续测试步骤执行过程用，会用测试步骤中提取到的值
                    </template>
                    <span><i style="color: #409EFF" class="iconfont icon-testquestion-circle-fill" /></span>
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

              <el-tab-pane v-if="testType === 'api'" name="headers">
                <template #label>
                  <span> 头部参数 </span>
                  <el-tooltip class="item" effect="dark" placement="top-start">
                    <template #content>
                      1、可用此功能设置当前用例的固定的头部参数，比如token、cookie <br>
                      2、在此处设置的值，在运行此用例下的测试步骤的时候，会自动加到对应的步骤的头部参数上 <br>
                      3、此处的value可以使用公共变量设置的值 <br>
                      4、此处的value可以使用自定义函数处理/获取数据，比如用自定义函数取数据库获取对应的数据 <br>
                      5、若在此处设置的key与服务的头部参数中的某个key一致，则对于这个key，则会用此处设置的值 <br>
                      6、若在用例中，测试步骤已用相同的key设置了其他值，则会使用测试步骤中设置的值
                    </template>
                    <span><i style="color: #409EFF" class="iconfont icon-testquestion-circle-fill" /></span>
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

        </el-tab-pane>

        <!-- 步骤管理组件 -->
        <el-tab-pane name="stepInfo">
          <template #label>
            <span> 步骤管理 </span>
            <el-popover class="el_popover_class" placement="top-start" trigger="hover" content="添加步骤">
              <div>点击添加步骤</div>
              <template #reference>
              <el-button
                  v-show="activeName === 'stepInfo'"
                  type="text"
                  style="margin-left: 10px"
                  @click="showAddStepDrawer()"
              ><i style="color: #409EFF" class="iconfont icon-testadd" /></el-button>
              </template>
            </el-popover>
          </template>
          <stepIndexView :test-type="testType" :case-id="formData.id" :project-id="projectId"></stepIndexView>
        </el-tab-pane>

      </el-tabs>

      <template #footer>
        <div slot="footer" class="dialog-footer">
          <div style="float: left">
            <el-button size="small" type="primary" :loading="submitButtonIsLoading" @click="clickRun">调试</el-button>
            <el-tooltip class="item" effect="dark" placement="top-start">
              <template #content>
                <div>1: 会用设置的参数运行用例</div>
                <div>2: 不会自动保存跳过条件、自定义变量、头部信息设置的参数</div>
                <div>3: 若调试完毕后要保存参数设置，请手动点击保存按钮</div>
              </template>
              <span><i style="color: #409EFF" class="iconfont icon-testquestion-circle-fill" /></span>
            </el-tooltip>
          </div>

          <el-button size="small" @click="drawerIsShow = false">取消</el-button>
          <el-button type="primary" size="small" :loading="submitButtonIsLoading" @click="changeData" >保存</el-button>
        </div>
      </template>

    </el-drawer>
  </div>
</template>

<script lang="ts" setup>

import {onBeforeUnmount, onMounted, ref} from "vue";
import variablesView from '@/components/input/variables.vue'
import headersView from '@/components/input/key-value-row.vue'
import skipIfView from '@/components/input/skip-if.vue'
import stepIndexView from '@/components/business/step/index.vue'
import {bus, busEvent} from "@/utils/bus-events";
import {GetConfigByCode, GetSkipIfDataSourceMapping} from "@/api/config/config-value";
import {GetCase, GetCaseFrom, PutCase, RunCase} from "@/api/business-api/case";
import {GetScriptList} from "@/api/assist/script";
import {getExtractMappingList, getFindElementOption, getUiAssertMappingList} from "@/utils/get-config";
import {GetExecuteMappingList, GetExtractMappingList, GetKeyBoardCodeMappingList} from "@/api/business-api/step";
import {ElMessage} from "element-plus";

const props = defineProps({
  testType: {
    default: '',
    type: String,
  },
  projectId: {
    default: '',
    type: String,
  }
})

onMounted(() => {

  // 从后端获取数据类型映射
  if (busEvent.data.dataTypeMapping.length === 0) {
    GetConfigByCode({ code: 'data_type_mapping' }).then(response => {
      busEvent.data.dataTypeMapping = response.data
    })
  }

  if (props.testType !== 'api') {
    getFindElementOption(props.testType)
    // getExtractMappingList(props.testType)

    if (busEvent.data.executeTypeList.length < 1){
      GetExecuteMappingList(props.testType).then(response => {
        busEvent.data.executeTypeList = response.data
        busEvent.data.executeTypeDict = {}
        busEvent.data.executeTypeList.forEach(item => {
          busEvent.data.executeTypeDict[item.value] = item.label
        })
      })
    }

    if (busEvent.data.uiAssertMapping.length === 0) {
      getUiAssertMappingList(props.testType)
    }

    // 从后端获取UI测试数据提取方式映射
    if (busEvent.data.uiExtractMappingList.length === 0) {
      GetExtractMappingList(props.testType).then(response => {
        busEvent.data.uiExtractMappingList = response.data
      })
    }
  }

  // 从后端获取跳过方式映射
  if (busEvent.data.skipIfTypeMappingList.length === 0) {
    GetConfigByCode({ code: 'skip_if_type_mapping' }).then(response => {
      busEvent.data.skipIfTypeMappingList = response.data
    })
  }

  // 从后端获取跳过条件映射，用例
  GetSkipIfDataSourceMapping({ test_type: props.testType, type: 'case' }).then(response => {
    busEvent.data.caseSkipIfDataSourceMapping = response.data
  })

  // 从后端获取跳过条件映射，步骤
  GetSkipIfDataSourceMapping({ test_type: props.testType, type: 'step' }).then(response => {
    busEvent.data.stepSkipIfDataSourceMapping = response.data
  })

  // 从后端获取app键盘code类型映射
  if (props.testType === 'app') {
    GetConfigByCode({ code: 'app_key_code' }).then(response => {
      busEvent.data.keyboardKeyCodeList = response.data
    })
  }

  // 从后端获取响应对象数据源映射
  if (busEvent.data.responseDataSource.length === 0) {
    GetConfigByCode({ code: 'extracts_mapping' }).then(response => {
      busEvent.data.responseDataSource = response.data
    })
  }

  // 从后端获取断言数方式映射
  if (busEvent.data.apiAssertMapping.length === 0) {
    GetConfigByCode({ code: 'assert_mapping_list' }).then(response => {
      busEvent.data.apiAssertMapping = response.data
    })
  }

  // 从后端获取PC键盘code类型映射
  if (props.testType === 'ui' && busEvent.data.keyboardKeyCodeList.length < 1) {
    GetKeyBoardCodeMappingList().then(response => {
      busEvent.data.keyboardKeyCodeList = response.data
    })
  }

  bus.on(busEvent.drawerIsShow, onShowDrawerEvent);
  bus.on(busEvent.drawerIsCommit, drawerIsCommit);
})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsShow, onShowDrawerEvent);
  bus.off(busEvent.drawerIsCommit, drawerIsCommit);
})

const onShowDrawerEvent = (message: any) => {
  if (message.eventType === 'edit-case') {
    getScriptList()
    resetForm()
    getData(message.content.id)
    drawerIsShow.value = true
  }
}

const drawerIsCommit = (message: any) => {
  if (message.eventType === 'select-run-env' && message.triggerFrom === triggerFrom) {
    runCase(message)
  }else if (message.eventType === 'quote-case'){ // 引用用例，会合并用例的变量和头信息，需要重新获取用例的详情
    getData(formData.value.id)
  }
}

const triggerFrom = 'case-editor'
const activeName = ref('stepInfo')
const caseDetailActiveName = ref('variables')
const scriptList = ref([])
const drawerIsShow = ref(false)
const submitButtonIsLoading = ref(false)
const variablesViewRef = ref(null)
const headersViewRef = ref(null)
const skipIfViewRef = ref(null)
const ruleFormRef = ref(null)
const formData = ref({
  id: undefined,
  name: undefined,
  desc: undefined,
  from: undefined,
  run_times: undefined,
  script_list: [],
  variables: [{ key: null, value: null, remark: null, data_type: '' }],
  headers: [{ key: null, value: null, remark: null }],
  skip_if: {
    skip_type: null,
    data_source: null,
    check_value: null,
    comparator: null,
    data_type: null,
    expect: null
  },
  suite_id: undefined
})
const formRules = {
  name: [
    {required: true, message: '请输入用例名字', trigger: 'blur'}
  ],
  desc: [
    {required: true, message: '请输入用例描述', trigger: 'blur'}
  ],
}
const resetForm = () => {
  formData.value = {
    id: undefined,
    name: undefined,
    desc: undefined,
    from: undefined,
    run_times: undefined,
    script_list: [],
    variables: [{ key: null, value: null, remark: null, data_type: '' }],
    headers: [{ key: null, value: null, remark: null }],
    skip_if: {
      skip_type: null,
      data_source: null,
      check_value: null,
      comparator: null,
      data_type: null,
      expect: null
    },
    suite_id: undefined
  }
  ruleFormRef.value && ruleFormRef.value.resetFields();
  submitButtonIsLoading.value = false
}
const sendEvent = (content: any, command: string) => {
  bus.emit(busEvent.drawerIsCommit, {eventType: 'case-editor', content: content, command: command});
}

const showAddStepDrawer = () => {
  bus.emit(busEvent.drawerIsShow, {eventType: 'select-step',  command: 'add', caseId: formData.value.id});
}

const getData = (dataId: any) => {
  GetCase(props.testType, {id: dataId}).then(response => {
    formData.value = response.data
    getCaseFrom(dataId)
  })
}

const getScriptList = () => {
  if (scriptList.value.length < 1){
    GetScriptList({page_num: 1, page_size: 99999}).then(response => {
      if (response) {
        scriptList.value = response.data.data
      }
    })
  }
}

const getCaseFrom = (caseId: any) => {
  GetCaseFrom(props.testType, { id: caseId }).then(response => {
    formData.value.from = response.data
  })
}

const changeData = () => {
  ruleFormRef.value.validate((valid) => {
    if (valid) {
      const data = getDataFormCommit()
      submitButtonIsLoading.value = true
      PutCase(props.testType, data).then(response => {
        submitButtonIsLoading.value = false
        if (response) {
          sendEvent(response.data, 'case-editor')
          drawerIsShow.value = false
        }
      })
    }
  })
}

const clickRun = () =>{
  const tempData = getDataFormCommit()
  const tempRunArgs = {
    variables: JSON.parse(JSON.stringify(tempData.variables)),
    headers: props.testType === 'api' ? JSON.parse(JSON.stringify(tempData.headers)) : undefined,
    skip_if: JSON.parse(JSON.stringify(tempData.skip_if)),
    run_times: formData.value.run_times
  }
  bus.emit(busEvent.drawerIsShow, {
    eventType: 'select-run-env',
    triggerFrom: triggerFrom,
    showSelectRunModel: false,
    business_id: null,
    runArgs: tempRunArgs
  })
}

const runCase = (runConf) => {
  RunCase(props.testType, {
    case_id_list: [formData.value.id],
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

const getDataFormCommit = () => {
  let data = JSON.parse(JSON.stringify(formData.value))
  data.skip_if = skipIfViewRef.value.getSkipIfData()
  data.headers = validateHeaders()
  data.variables = validateVariables()
  return data
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

const validateHeaders = () => {
  if (props.testType === 'api'){
    const data = headersViewRef.value.tempData
    data.forEach((item: { key: any; value: any; remark: any; }, index: number) => {
      if (item.key || item.value || item.remark){
        if (!item.key || !item.value){
          ElMessage.warning(`头部信息参数，第 ${index + 1} 行，请完善数据`)
          throw new Error(`头部信息参数，第 ${index + 1} 行，请完善数据: ${JSON.stringify(item)}`);
        }
      }
    })
    return data
  }
  return null
}

</script>


<style scoped lang="scss">

</style>
