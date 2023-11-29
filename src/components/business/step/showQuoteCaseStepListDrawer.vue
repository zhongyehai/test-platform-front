<template>
  <el-drawer
    title="步骤列表"
    size="95%"
    :append-to-body="true"
    :visible.sync="drawerIsShow"
    :direction="direction"
  />

</template>

<script>
import skipIfView from '@/components/Inputs/skipIf'
import scriptView from '@/components/Selector/script.vue'
import headersView from '@/components/Inputs/changeRow'
import variablesView from '@/components/Inputs/variables'
import stepView from '@/components/business/step/index.vue'

import {
  postCase as apiPostCase,
  putCase as apiPutCase,
  copyCase as apiCopyCase,
  caseRun as apiCaseRun,
  getCase as apiGetCase
} from '@/apis/apiTest/case'
import { getCaseSuite as apiGetCaseSuite } from '@/apis/apiTest/suite'

import {
  postCase as webUiPostCase,
  putCase as webUiPutCase,
  copyCase as webUiCopyCase,
  caseRun as webUiCaseRun,
  getCase as webUiGetCase
} from '@/apis/webUiTest/case'
import { getCaseSuite as webUiGetCaseSuite } from '@/apis/webUiTest/suite'

import {
  postCase as appUiPostCase,
  putCase as appUiPutCase,
  copyCase as appUiCopyCase,
  caseRun as appUiCaseRun,
  getCase as appUiGetCase
} from '@/apis/appUiTest/case'
import { getCaseSuite as appUiGetCaseSuite } from '@/apis/appUiTest/suite'
import pythonScriptIndex from '@/views/assist/script/index.vue'

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

      postCaseUrl: '',
      putCaseUrl: '',
      copyCaseUrl: '',
      caseRunUrl: '',
      getCaseUrl: '',
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
        if (command === 'add') {
          this.initNewTempCase()
          this.activeName = 'caseInFo'
        } else if (command === 'edit') {
          this.initUpdateTempCase(currentCase)
          this.activeName = 'stepInFo'
        } else if (command === 'copy') { // 复制用例
          this.copyCaseUrl({ id: currentCase.id }).then(response => {
            if (this.showMessage(this, response)) {
              this.tempCase = response.data.case
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
  },

  created() {
    if (this.dataType === 'api') {
      this.postCaseUrl = apiPostCase
      this.putCaseUrl = apiPutCase
      this.copyCaseUrl = apiCopyCase
      this.caseRunUrl = apiCaseRun
      this.getCaseUrl = apiGetCase
      this.getCaseSuiteUrl = apiGetCaseSuite
    } else if (this.dataType === 'webUi') {
      this.postCaseUrl = webUiPostCase
      this.putCaseUrl = webUiPutCase
      this.copyCaseUrl = webUiCopyCase
      this.caseRunUrl = webUiCaseRun
      this.getCaseUrl = webUiGetCase
      this.getCaseSuiteUrl = webUiGetCaseSuite
    } else {
      this.postCaseUrl = appUiPostCase
      this.putCaseUrl = appUiPutCase
      this.copyCaseUrl = appUiCopyCase
      this.caseRunUrl = appUiCaseRun
      this.getCaseUrl = appUiGetCase
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

    // 打开添加步骤抽屉
    showAddStepDrawer() {
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'showAddStepDrawer')
    },

    // 初始化新增用例模板
    initNewTempCase() {
      this.tempCase.id = ''
      this.tempCase.name = ''
      this.tempCase.desc = ''
      this.tempCase.run_times = ''
      this.tempCase.script_list = []
      this.tempCase.before_case = []
      this.tempCase.after_case = []
      this.tempCase.variables = [{ key: null, value: null, remark: null, data_type: '' }]
      this.tempCase.skip_if = {
        skip_type: null,
        data_source: null,
        check_value: null,
        comparator: null,
        data_type: null,
        expect: null
      }
      this.tempCase.headers = [{ key: null, value: null, remark: null }]
      this.tempCase.project_id = this.currentProjectId || ''
      this.tempCase.suite_id = this.currentSetId || ''
      this.drawerType = 'add'
      this.drawerIsShow = true
    },

    // 初始化修改用例模板
    initUpdateTempCase(currentCase) {
      this.tempCase = currentCase
      // this.getStepList()
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

    // 保存用例
    changeTab(activeName, oldActiveName) {
      return new Promise((resolve, reject) => {
        if (oldActiveName && oldActiveName === 'caseInFo') {
          this.submitLoadingIsShow = true
          if (this.tempCase.id) { // 修改
            this.putCaseUrl(this.getCaseDataToCommit()).then(response => {
              this.submitLoadingIsShow = false
              if (this.showMessage(this, response)) {
                this.sendDrawerIsCommit()
                return resolve()
              } else {
                this.activeName = 'caseInFo'
              }
            })
          } else { // 新增
            this.postCaseUrl(this.getCaseDataToCommit()).then(response => {
              this.submitLoadingIsShow = false
              if (this.showMessage(this, response)) {
                this.drawerType = 'update'
                this.tempCase.id = response.data.id
                this.sendDrawerIsCommit()
                return resolve()
              } else {
                this.activeName = 'caseInFo'
              }
            })
          }
        }
        return resolve()
      })
    },

    // 新增用例
    addCase() {
      this.submitLoadingIsShow = true
      this.postCaseUrl(this.getCaseDataToCommit()).then(response => {
        this.submitLoadingIsShow = false
        if (this.showMessage(this, response)) {
          this.drawerIsShow = false
          this.tempCase.id = response.data.id
          this.sendDrawerIsCommit()
        }
      })
    },

    // 修改用例
    changCase() {
      this.submitLoadingIsShow = true
      this.putCaseUrl(this.getCaseDataToCommit()).then(response => {
        this.submitLoadingIsShow = false
        if (this.showMessage(this, response)) {
          this.drawerIsShow = false
          this.sendDrawerIsCommit()
        }
      })
    },

    // 点击调试按钮
    clickRunDebug() {
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'selectRunEnv', 'caseDrawer', false)
    },

    // 保存并调试
    debugCase(runConf) {
      this.submitLoadingIsShow = true
      if (this.tempCase.id) {
        this.putCaseUrl(this.getCaseDataToCommit()).then(response => {
          this.submitLoadingIsShow = false
          if (this.showMessage(this, response)) {
            this.sendDrawerIsCommit()
            this.runCase(this.tempCase.id, runConf)
          }
        })
      } else {
        this.postCaseUrl(this.getCaseDataToCommit()).then(response => {
          this.submitLoadingIsShow = false
          if (this.showMessage(this, response)) {
            this.tempCase.id = response.data.id
            this.sendDrawerIsCommit()
            this.runCase(this.tempCase.id, runConf)
          }
        })
      }
    },

    sendDrawerIsCommit() {
      this.$bus.$emit(this.$busEvents.drawerIsCommit, 'caseInfo')
    },

    // 运行用例
    runCase(caseId, runConf) {
      this.isShowDebugLoading = true
      this.caseRunUrl({
        case_id_list: [caseId],
        env_list: runConf.runEnv,
        is_async: runConf.runType,
        browser: runConf.browser,
        server_id: runConf.runServer,
        phone_id: runConf.runPhone,
        no_reset: runConf.noReset,
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
