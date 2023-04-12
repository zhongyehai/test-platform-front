<template>
  <el-drawer
    :title=" drawerType === 'update' ? '修改用例' : '新增用例'"
    size="95%"
    :visible.sync="drawerIsShow"
    :direction="direction"
  >
    <!--    :wrapperClosable="false"-->

    <el-tabs v-model="activeName" style="margin-left: 20px;margin-right: 20px" :before-leave="changeTab">

      <!-- 用例信息组件 -->
      <el-tab-pane label="用例信息" name="caseInFo">

        <el-form size="mini" label-width="100px">

          <el-row>
            <el-col :span="18">
              <el-form-item label="用例名称" class="is-required">
                <el-input v-model="tempCase.name" />
              </el-form-item>
            </el-col>

            <el-col :span="6">
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

            <!-- 执行次数 -->
            <el-col :span="6">
              <el-form-item label="用例归属" class="is-required" style="margin-bottom: 5px">
                <el-select v-model="caseSetLabel" placeholder="请选择用例集" size="mini" style="width: 100%">
                  <el-option :value="[]" style="height: auto">
                    <el-tree
                      ref="setTree"
                      :data="caseSetTree"
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

        </el-form>

        <el-form :inline="true" class="demo-form-inline" size="mini">

          <el-tabs v-model="caseInFoActiveName" style="margin-left: 20px;margin-right: 20px">

            <!-- 跳过条件 -->
            <el-tab-pane name="editSkipIf">
              <template slot="label">
                <span> 跳过条件 </span>
                <el-tooltip
                  class="item"
                  effect="dark"
                  placement="top-start"
                >
                  <div slot="content"> 任意一行设置的表达式成立，都会执行跳过操作，使用方法与断言一致，详见断言示例</div>
                  <span><i style="color: #409EFF" class="el-icon-question" /></span>
                </el-tooltip>
              </template>
              <skipIfView
                ref="skipIfView"
                :skip-if-data="tempCase.skip_if"
                :use_type="'case'"
              />
            </el-tab-pane>

            <el-tab-pane name="editVariables">
              <template slot="label">
                <span> 自定义变量 </span>
                <el-tooltip
                  class="item"
                  effect="dark"
                  placement="top-start"
                >
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
                <span> 头部信息 </span>
                <el-tooltip
                  class="item"
                  effect="dark"
                  placement="top-start"
                >
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
      <el-tab-pane label="步骤管理" name="stepInFo">
        <stepView
          ref="stepView"
          :data-type="dataType"
          :project-id="currentProjectId || ''"
          :case-id="tempCase.id"
          :temp-case="tempCase"
        />
      </el-tab-pane>

      <!-- 用例描述 -->
      <el-tab-pane label="用例描述" name="stepDesc">
        <el-input v-model="tempCase.desc" size="mini" type="textarea" :rows="20" :placeholder="'用例的描述、备注'" />
      </el-tab-pane>

      <!-- Python脚本 -->
      <el-tab-pane label="python脚本">
        <template slot="label">
          <span> Python脚本 </span>
          <el-tooltip class="item" effect="dark" placement="top-start">
            <div slot="content">
              1、Python脚本管理，为了方便查找和修改，在此处可进行处理 <br>
              2、脚本本身不与环境进行关联，若需要脚本逻辑根据环境变化，请在脚本中编写内容
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
      >运行
      </el-button>

      <el-button size="mini" @click=" drawerIsShow = false"> {{ '取消' }}</el-button>
      <el-button
        size="mini"
        type="primary"
        :loading="submitLoadingIsShow"
        @click="drawerType === 'add' ? addCase() : changCase() "
      >
        {{ '保存' }}
      </el-button>
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
  postCase as apiPostCase,
  putCase as apiPutCase,
  copyCase as apiCopyCase,
  caseRun as apiCaseRun,
  getCase as apiGetCase
} from '@/apis/apiTest/case'
import { getCaseSet as apiGetCaseSet } from '@/apis/apiTest/caseSet'

import {
  postCase as webUiPostCase,
  putCase as webUiPutCase,
  copyCase as webUiCopyCase,
  caseRun as webUiCaseRun,
  getCase as webUiGetCase
} from '@/apis/webUiTest/case'
import { getCaseSet as webUiGetCaseSet } from '@/apis/webUiTest/caseSet'

import {
  postCase as appUiPostCase,
  putCase as appUiPutCase,
  copyCase as appUiCopyCase,
  caseRun as appUiCaseRun,
  getCase as appUiGetCase
} from '@/apis/appUiTest/case'
import { getCaseSet as appUiGetCaseSet } from '@/apis/appUiTest/caseSet'
import pythonScriptIndex from '@/views/assist/script/index.vue'

export default {
  name: 'Drawer',
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
    'dataType',
    // eslint-disable-next-line vue/require-prop-types
    'currentProjectId',
    // eslint-disable-next-line vue/require-prop-types
    'currentSetId'
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
      caseSetTree: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      caseSetLabel: '',
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
        set_id: ''
      },

      runEvent: 'runCaseEventOnDialog',
      callBackEvent: 'runCaseOnDialog',

      postCaseUrl: '',
      putCaseUrl: '',
      copyCaseUrl: '',
      caseRunUrl: '',
      getCaseUrl: '',
      getCaseSetUrl: ''
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
        this.tempCase.set_id = newVal
      }
    },

    'drawerIsShow': {
      deep: true,
      handler(newVal, oldVal) {
        if (newVal) {
          this.getCaseSetUrl({ 'id': this.tempCase.set_id }).then(response => {
            this.caseSetLabel = response.data.name
            this.$refs.setTree.setCheckedKeys([this.tempCase.set_id])
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
        } else if (command === 'edit') {
          this.initUpdateTempCase(currentCase)
        } else if (command === 'copy') { // 复制用例
          this.copyCaseUrl({ id: currentCase.id }).then(response => {
            if (this.showMessage(this, response)) {
              this.tempCase = response.data.case
              this.drawerType = 'copy'
              this.drawerIsShow = true
              this.sendDrawerIsCommit()
            }
          }
          )
        }
        this.activeName = 'caseInFo'
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
    this.$bus.$on(this.$busEvents.treeIsDone, (_type, caseSetTree) => {
      if (_type === 'caseSet') {
        this.caseSetTree = caseSetTree
      }
    })

    // 在操作步骤时触发的保存用例，这个时候保存后不关闭抽屉，只重新请求用例列表
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
      this.getCaseSetUrl = apiGetCaseSet
    } else if (this.dataType === 'webUi') {
      this.postCaseUrl = webUiPostCase
      this.putCaseUrl = webUiPutCase
      this.copyCaseUrl = webUiCopyCase
      this.caseRunUrl = webUiCaseRun
      this.getCaseUrl = webUiGetCase
      this.getCaseSetUrl = webUiGetCaseSet
    } else {
      this.postCaseUrl = appUiPostCase
      this.putCaseUrl = appUiPutCase
      this.copyCaseUrl = appUiCopyCase
      this.caseRunUrl = appUiCaseRun
      this.getCaseUrl = appUiGetCase
      this.getCaseSetUrl = appUiGetCaseSet
    }
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsShow)
    this.$bus.$off(this.$busEvents.drawerIsCommit)
    this.$bus.$off(this.$busEvents.treeIsDone)
  },

  methods: {

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
      this.tempCase.set_id = this.currentSetId || ''
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
      caseData.set_id = this.$refs.setTree.getCheckedKeys()[0] || this.tempCase.set_id
      caseData.script_list = this.$refs.scriptView.tempScriptList
      caseData.variables = this.$refs.variablesView.tempData
      caseData.headers = this.dataType === 'api' ? this.$refs.headersView.tempData : []
      caseData.skip_if = this.$refs.skipIfView.tempData
      return caseData
    },

    // 勾选树事件
    handleNodeClick(data, checked, node) {
      if (checked && [data.id] !== this.$refs.setTree.getCheckedKeys()) {
        this.$refs.setTree.setCheckedKeys([data.id]) // 选中
        this.caseSetLabel = data.name
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
        caseId: [caseId],
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
          this.$bus.$emit(this.$busEvents.drawerIsShow, 'process', response.data.run_id)
        }
      })
    }

  }
}
</script>

<style scoped>

</style>
