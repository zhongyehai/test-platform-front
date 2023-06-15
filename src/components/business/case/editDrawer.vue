<template>
  <el-drawer
    title="修改用例"
    size="95%"
    :append-to-body="true"
    :visible.sync="drawerIsShow"
    :direction="direction"
  >

    <el-tabs v-model="activeName" style="margin-left: 20px;margin-right: 20px">

      <!-- 用例信息组件 -->
      <el-tab-pane label="用例信息" name="caseInFo">

        <el-form size="mini" label-width="100px">

          <el-row>
            <el-col :span="12">
              <el-form-item label="用例名称" class="is-required">
                <el-input v-model="tempCase.name" />
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="脚本文件">
                <scriptView
                  ref="scriptView"
                  :cite="'case'"
                  :script-list="tempCase.script_list"
                />
                <el-popover
                  class="el_popover_class"
                  placement="top-start"
                  trigger="hover"
                >
                  <div>
                    <div>1、用例下要用到自定义函数可以在这里统一引用对应的脚本文件</div>
                    <div>2、此处引用的脚本文件，对于当前用例下的测试步骤均有效</div>
                    <div>3、若此处引用了脚本文件，服务处也引用了脚本文件，则会把两边引用的合并去重</div>
                  </div>
                  <el-button slot="reference" type="text" icon="el-icon-question" />
                </el-popover>
              </el-form-item>
            </el-col>

            <el-col :span="4">
              <el-form-item label="执行次数" class="is-required">
                <el-input-number
                  v-model="tempCase.run_times"
                  :min="1"
                  :max="1000"
                  controls-position="right"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>

            <!-- 脚本文件选择 -->
            <el-col :span="18">
              <el-form-item label="用例来源">
                <el-input v-model="caseFromStr" disabled />
              </el-form-item>
            </el-col>

            <!-- 执行次数 -->
            <el-col :span="6">
              <el-form-item label="用例集" class="is-required" style="margin-bottom: 5px">
                <el-select v-model="caseSuiteLabel" placeholder="请选择用例集" size="mini" style="width: 100%">
                  <el-option :value="[]" style="height: auto">
                    <el-tree
                      ref="suiteTree"
                      :data="caseSuiteTree"
                      show-checkbox
                      node-key="id"
                      check-strictly
                      highlight-current
                      :props="defaultProps"
                      @check-change="handleNodeClick"
                    />
                  </el-option>
                </el-select>

              </el-form-item>
            </el-col>

          </el-row>

          <el-form-item label="用例描述" class="is-required">
            <el-input v-model="tempCase.desc" size="mini" type="textarea" autosize :placeholder="'请填写当前用例的作用、注意事项、出参'" />
          </el-form-item>
        </el-form>

        <el-form :inline="true" class="demo-form-inline" size="mini">

          <el-tabs v-model="caseInFoActiveName" style="margin-left: 20px;margin-right: 20px">

            <!-- 跳过条件 -->
            <el-tab-pane name="editSkipIf">
              <template slot="label">
                <span> 跳过条件 </span>
                <el-tooltip class="item" effect="dark" placement="top-start">
                  <div slot="content"> 任意一行设置的表达式成立，都会执行跳过操作，使用方法与断言一致，详见断言示例</div>
                  <span><i style="color: #409EFF" class="el-icon-question" /></span>
                </el-tooltip>
              </template>
              <skipIfView
                ref="skipIfView"
                :data-type="dataType"
                :skip-if-data="tempCase.skip_if"
                :project-id="currentProjectId"
                :use-type="'case'"
              />
            </el-tab-pane>

            <el-tab-pane name="editVariables">
              <template slot="label">
                <span> 自定义变量 </span>
                <el-tooltip class="item" effect="dark" placement="top-start">
                  <div slot="content">
                    1、可用此功能设置一些预设值，比如token、账号信息 <br>
                    2、在此处设置的值，对于此用例下的测试步骤均可直接引用 <br>
                    3、此处的value可以使用自定义函数处理/获取数据，比如用自定义函数取数据库获取对应的数据 <br>
                    4、若在此处设置的key与服务的公共变量中的某个key一致，则对于这个key，则会用此处设置的值 <br>
                    5、若在测试步骤中提取的值使用的key和此处设置的key相同，则在此用例的后续测试步骤执行过程用，会用测试步骤中提取到的值
                  </div>
                  <span><i style="color: #409EFF" class="el-icon-question" /></span>
                </el-tooltip>
              </template>
              <variablesView
                ref="variablesView"
                :current-data="tempCase.variables"
                :placeholder-key="'key'"
                :placeholder-value="'value'"
                :placeholder-desc="'备注'"
              />
            </el-tab-pane>

            <el-tab-pane v-if="dataType === 'api'">
              <template slot="label">
                <span> 头部参数 </span>
                <el-tooltip class="item" effect="dark" placement="top-start">
                  <div slot="content">
                    1、可用此功能设置当前用例的固定的头部参数，比如token、cookie <br>
                    2、在此处设置的值，在运行此用例下的测试步骤的时候，会自动加到对应的步骤的头部参数上 <br>
                    3、此处的value可以使用公共变量设置的值 <br>
                    4、此处的value可以使用自定义函数处理/获取数据，比如用自定义函数取数据库获取对应的数据 <br>
                    5、若在此处设置的key与服务的头部参数中的某个key一致，则对于这个key，则会用此处设置的值 <br>
                    6、若在用例中，测试步骤已用相同的key设置了其他值，则会使用测试步骤中设置的值
                  </div>
                  <span><i style="color: #409EFF" class="el-icon-question" /></span>
                </el-tooltip>
              </template>
              <headersView
                ref="headersView"
                :current-data="tempCase.headers"
                :placeholder-key="'key'"
                :placeholder-value="'value'"
                :placeholder-desc="'备注'"
              />
            </el-tab-pane>

          </el-tabs>

        </el-form>
      </el-tab-pane>

      <!-- 步骤管理组件 -->
      <el-tab-pane name="stepInFo">
        <template slot="label">
          <span> 步骤管理 </span>
          <el-popover class="el_popover_class" placement="top-start" trigger="hover">
            <div>点击添加步骤</div>
            <el-button
              v-show="activeName === 'stepInFo'"
              slot="reference"
              type="text"
              style="margin-left: 10px"
              icon="el-icon-plus"
              @click="showAddStepDrawer()"
            />
          </el-popover>
        </template>
        <stepView
          ref="stepView"
          :data-type="dataType"
          :project-id="currentProjectId || ''"
          :case-id="tempCase.id"
        />
      </el-tab-pane>

      <!-- Python脚本 -->
      <el-tab-pane label="python脚本">
        <template slot="label">
          <span> Python脚本 </span>
          <el-tooltip class="item" effect="dark" placement="top-start">
            <div slot="content">
              1、Python脚本管理，为了方便查找和修改，在此处可进行处理 <br>
              2、脚本本身不与用例进行关联，若需要脚本逻辑根据环境变化，请在脚本中编写内容
            </div>
            <span><i style="color: #409EFF" class="el-icon-question" /></span>
          </el-tooltip>
        </template>
        <pythonScriptIndex />
      </el-tab-pane>

    </el-tabs>

    <div class="demo-drawer__footer">

      <el-button
        slot="reference"
        size="mini"
        type="primary"
        style="float: left"
        :loading="isShowDebugLoading"
        @click="clickRunDebug()"
      >调试
      </el-button>
      <el-tooltip
        style="float: left"
        class="item"
        effect="dark"
        placement="top-start"
      >
        <div slot="content">
          <div>1: 会用设置的参数运行用例</div>
          <div>2: 不会自动保存跳过条件、自定义变量、头部信息设置的参数</div>
          <div>3: 若调试完毕后要保存参数设置，请手动点击保存按钮</div>
        </div>
        <span><i style="color: #409EFF" class="el-icon-question" /></span>
      </el-tooltip>

      <el-button size="mini" @click=" drawerIsShow = false"> {{ '取消' }}</el-button>

      <el-button size="mini" type="primary" :loading="submitLoadingIsShow" @click="changCase()"> {{ '保存并继续填写' }} </el-button>

      <el-button size="mini" type="primary" :loading="submitLoadingIsShow" @click="changCase(true)"> {{ '保存并关闭抽屉' }} </el-button>
    </div>

  </el-drawer>

</template>

<script>
import skipIfView from '@/components/Inputs/skipIf'
import scriptView from '@/components/Selector/script.vue'
import headersView from '@/components/Inputs/changeRow'
import variablesView from '@/components/Inputs/variables'
import stepView from '@/components/business/step/index.vue'

import {
  putCase as apiPutCase,
  copyCase as apiCopyCase,
  caseRun as apiCaseRun,
  getCase as apiGetCase,
  caseFrom as apiCaseFrom
} from '@/apis/apiTest/case'
import { getCaseSuite as apiGetCaseSuite } from '@/apis/apiTest/caseSuite'

import {
  putCase as webUiPutCase,
  copyCase as webUiCopyCase,
  caseRun as webUiCaseRun,
  getCase as webUiGetCase,
  caseFrom as webUiCaseFrom
} from '@/apis/webUiTest/case'
import { getCaseSuite as webUiGetCaseSuite } from '@/apis/webUiTest/caseSuite'

import {
  putCase as appUiPutCase,
  copyCase as appUiCopyCase,
  caseRun as appUiCaseRun,
  getCase as appUiGetCase,
  caseFrom as appUiCaseFrom
} from '@/apis/appUiTest/case'
import { getCaseSuite as appUiGetCaseSuite } from '@/apis/appUiTest/caseSuite'
import pythonScriptIndex from '@/views/assist/script/index.vue'
import {
  getConfigByName,
  getExtractsMapping,
  getSkipIfDataSourceMapping,
  getSkipIfTypeMapping
} from '@/apis/config/config'
import { getAssertMapping } from '@/apis/apiTest/api'
import { extractMappingList, keyBoardCodeMappingList } from '@/apis/webUiTest/step'
import { getUiAssertMappingList } from '@/utils/getConfig'

export default {
  name: 'CaseDrawer',
  components: {
    pythonScriptIndex,
    skipIfView,
    scriptView,
    headersView,
    variablesView,
    stepView
  },
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'dataType', 'currentProjectId', 'currentSetId'
  ],
  data() {
    return {
      direction: 'rtl', // 抽屉打开方式
      drawerType: '',
      drawerIsShow: false,
      submitLoadingIsShow: false,
      isShowDebugLoading: false,
      activeName: 'caseInFo',
      caseInFoActiveName: 'editVariables',
      caseSuiteTree: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      caseSuiteLabel: '',
      tempCase: {
        id: '',
        name: '',
        desc: '',
        status: 0,
        run_times: '',
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
        before_case: [],
        after_case: [],
        project_id: '',
        suite_id: ''
      },

      runEvent: 'runCaseEventOnDialog',
      callBackEvent: 'runCaseOnDialog',
      caseFromStr: '', // 用例来源

      putCaseUrl: '',
      copyCaseUrl: '',
      caseRunUrl: '',
      getCaseUrl: '',
      getCaseFromUrl: '',
      getCaseSuiteUrl: ''
    }
  },

  watch: {

    'currentProjectId': {
      deep: true,
      handler(newVal, oldVal) {
        this.tempCase.project_id = newVal
      }
    },

    'currentSetId': {
      deep: true,
      handler(newVal, oldVal) {
        this.tempCase.suite_id = newVal
      }
    },

    'drawerIsShow': {
      deep: true,
      handler(newVal, oldVal) {
        if (newVal) {
          this.getCaseSuiteUrl({ 'id': this.tempCase.suite_id || this.currentSetId }).then(response => {
            this.caseSuiteLabel = response.data.name
            this.$refs.suiteTree.setCheckedKeys([this.tempCase.suite_id])
          })
        }
      }
    }
  },

  mounted() {
    // 监听 case抽屉 的状态
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, command, currentCase) => {
      if (_type === 'caseInfo') {
        if (command === 'edit') {
          this.getCaseFrom(currentCase.id)
          this.initUpdateTempCase(currentCase)
          this.activeName = 'stepInFo'
        } else if (command === 'copy') { // 复制用例
          this.copyCaseUrl({ id: currentCase.id }).then(response => {
            if (this.showMessage(this, response)) {
              this.tempCase = response.data.case
              this.getCaseFrom(this.tempCase.id)
              this.drawerType = 'copy'
              this.drawerIsShow = true
              this.sendDrawerIsCommit()
              this.activeName = 'caseInFo'
            }
          }
          )
        }
      }
    })

    // 引用用例为步骤后，后端会合并两条用例的公共变量，所以获取当前用例的最新公共变量
    this.$bus.$on(this.$busEvents.quoteCaseToStep, (testCase, status) => {
      if (status) {
        this.getCaseUrl({ id: this.tempCase.id }).then(response => {
          this.tempCase.variables = response.data.variables
        })
      }
    })

    // 监听、接收用例集树
    this.$bus.$on(this.$busEvents.treeIsDone, (_type, caseSuiteTree) => {
      if (_type === 'caseSuite') {
        this.caseSuiteTree = caseSuiteTree
      }
    })

    // 接收执行测试指令
    this.$bus.$on(this.$busEvents.drawerIsCommit, (_type, _runUnit, runDict) => {
      if (_type === 'selectRunEnv' && _runUnit === 'caseDrawer') {
        this.debugCase(runDict)
      }
    })

    // 从后端获取数据类型映射
    if (this.$busEvents.data.dataTypeMappingList.length === 0) {
      getConfigByName({ 'name': 'data_type_mapping' }).then(response => {
        this.$busEvents.data.dataTypeMappingList = JSON.parse(response.data)
      })
    }

    if (this.dataType !== 'api') {
      if (this.$busEvents.data.assertMappingList.length === 0) {
        getUiAssertMappingList(this)
      }

      // 从后端获取UI测试数据提取方式映射
      if (this.$busEvents.data.uiTestExtractMappingList.length === 0) {
        extractMappingList().then(response => {
          this.$busEvents.data.uiTestExtractMappingList = response.data
        })
      }
    }

    // 从后端获取跳过方式映射
    if (this.$busEvents.data.skipIfTypeMappingList.length === 0) {
      getSkipIfTypeMapping().then(response => {
        this.$busEvents.data.skipIfTypeMappingList = response.data
      })
    }

    // 从后端获取跳过条件映射，用例
    getSkipIfDataSourceMapping({ test_type: this.dataType, type: 'case' }).then(response => {
      this.$busEvents.data.caseSkipIfDataSourceMapping = response.data
    })

    // 从后端获取跳过条件映射，步骤
    getSkipIfDataSourceMapping({ test_type: this.dataType, type: 'step' }).then(response => {
      this.$busEvents.data.stepSkipIfDataSourceMapping = response.data
    })

    // 从后端获取app键盘code类型映射
    if (this.dataType === 'appUi') {
      getConfigByName({ 'name': 'app_key_code' }).then(response => {
        this.$busEvents.data.keyboardKeyCodeList = JSON.parse(response.data)
      })
    }

    // 从后端获取响应对象数据源映射
    if (this.$busEvents.data.responseDataSourceMappingList.length === 0) {
      getExtractsMapping().then(response => {
        this.$busEvents.data.responseDataSourceMappingList = response.data
      })
    }

    // 从后端获取断言数方式映射
    if (this.$busEvents.data.apiTestAssertMappingList.length === 0) {
      getAssertMapping().then(response => {
        this.$busEvents.data.apiTestAssertMappingList = response.data
      })
    }

    // 从后端获取PC键盘code类型映射
    if (this.dataType === 'webUi') {
      keyBoardCodeMappingList().then(response => {
        this.$busEvents.data.keyboardKeyCodeList = response.data
      })
    }
  },

  created() {
    if (this.dataType === 'api') {
      this.putCaseUrl = apiPutCase
      this.copyCaseUrl = apiCopyCase
      this.caseRunUrl = apiCaseRun
      this.getCaseUrl = apiGetCase
      this.getCaseFromUrl = apiCaseFrom
      this.getCaseSuiteUrl = apiGetCaseSuite
    } else if (this.dataType === 'webUi') {
      this.putCaseUrl = webUiPutCase
      this.copyCaseUrl = webUiCopyCase
      this.caseRunUrl = webUiCaseRun
      this.getCaseUrl = webUiGetCase
      this.getCaseFromUrl = webUiCaseFrom
      this.getCaseSuiteUrl = webUiGetCaseSuite
    } else {
      this.putCaseUrl = appUiPutCase
      this.copyCaseUrl = appUiCopyCase
      this.caseRunUrl = appUiCaseRun
      this.getCaseUrl = appUiGetCase
      this.getCaseFromUrl = appUiCaseFrom
      this.getCaseSuiteUrl = appUiGetCaseSuite
    }
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsShow)
    this.$bus.$off(this.$busEvents.drawerIsCommit)
    this.$bus.$off(this.$busEvents.treeIsDone)
  },

  methods: {

    getCaseFrom(caseId) {
      this.getCaseFromUrl({ id: caseId }).then(response => {
        this.caseFromStr = response.data
      })
    },

    // 打开添加步骤抽屉
    showAddStepDrawer() {
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'showAddStepDrawer')
    },

    // 初始化修改用例模板
    initUpdateTempCase(currentCase) {
      this.tempCase = currentCase
      this.drawerType = 'update'
      this.drawerIsShow = true
    },

    // 获取当前的用例数据，用于提交给后端
    getCaseDataToCommit() {
      const caseData = JSON.parse(JSON.stringify(this.tempCase))
      caseData.suite_id = this.$refs.suiteTree.getCheckedKeys()[0] || this.tempCase.suite_id
      caseData.script_list = this.$refs.scriptView.tempScriptList
      caseData.variables = this.$refs.variablesView.tempData
      caseData.headers = this.dataType === 'api' ? this.$refs.headersView.tempData : []
      caseData.skip_if = this.$refs.skipIfView.tempData
      return caseData
    },

    // 勾选树事件
    handleNodeClick(data, checked, node) {
      if (checked && [data.id] !== this.$refs.suiteTree.getCheckedKeys()) {
        this.$refs.suiteTree.setCheckedKeys([data.id]) // 选中
        this.caseSuiteLabel = data.name
      }
    },

    // 修改用例
    changCase(isClose) {
      this.submitLoadingIsShow = true
      this.putCaseUrl(this.getCaseDataToCommit()).then(response => {
        this.submitLoadingIsShow = false
        if (this.showMessage(this, response)) {
          if (isClose) {
            this.drawerIsShow = false
          }
          this.sendDrawerIsCommit()
        }
      })
    },

    // 点击调试按钮
    clickRunDebug() {
      this.$bus.$emit(
        this.$busEvents.drawerIsShow,
        'selectRunEnv',
        'caseDrawer',
        false,
        null,
        {
          variables: JSON.parse(JSON.stringify(this.tempCase.variables)),
          headers: this.tempCase.headers ? JSON.parse(JSON.stringify(this.tempCase.headers)) : undefined,
          skip_if: JSON.parse(JSON.stringify(this.tempCase.skip_if)),
          run_times: this.tempCase.run_times
        }
      )
    },

    // 触发调试
    debugCase(runConf) {
      this.runCase(this.tempCase.id, runConf)
    },

    sendDrawerIsCommit() {
      this.$bus.$emit(this.$busEvents.drawerIsCommit, 'caseInfo')
    },

    // 运行用例
    runCase(caseId, runConf) {
      this.isShowDebugLoading = true
      this.caseRunUrl({
        caseId: [caseId],
        env_list: runConf.runEnv,
        is_async: runConf.runType,
        browser: runConf.browser,
        server_id: runConf.runServer,
        phone_id: runConf.runPhone,
        no_reset: runConf.noReset,
        temp_variables: runConf.temp_variables,
        'trigger_type': 'page'
      }).then(response => {
        // console.log('case.index.methods.runCase.response: ', JSON.stringify(response))
        this.isShowDebugLoading = false
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.drawerIsShow, 'process', response.data.batch_id)
        }
      })
    }

  }
}
</script>

<style scoped>

</style>
