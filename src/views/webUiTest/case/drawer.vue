<template>
  <el-drawer
    :title=" tempCase.id ? '修改用例' : '新增用例'"
    size="85%"
    :wrapperClosable="false"
    :visible.sync="drawerIsShow"
    :direction="direction">
    <el-tabs v-model="activeName" style="margin-left: 20px;margin-right: 20px" :before-leave="beforeLeave">

      <!-- 用例信息组件 -->
      <el-tab-pane label="用例信息" name="caseInFo">

        <el-form size="mini" label-width="100px">

          <el-row>
            <el-col :span="12">
              <el-form-item label="用例名称" class="is-required">
                <el-input v-model="tempCase.name"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="函数文件">
                <funcFilesView
                  :cite="'case'"
                  :funcFiles="tempCase.func_files"
                  ref="funcFilesView"
                ></funcFilesView>
                <el-popover
                  class="el_popover_class"
                  placement="top-start"
                  trigger="hover">
                  <div>
                    <div>1、用例下要用到自定义函数可以在这里统一引用对应的函数文件</div>
                    <div>2、此处引用的函数文件，对于当前用例下的测试步骤均有效</div>
                    <div>3、若此处引用了函数文件，服务处也引用了函数文件，则会把两边引用的合并去重</div>
                  </div>
                  <el-button slot="reference" type="text" icon="el-icon-question"></el-button>
                </el-popover>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <!-- 业务线选择 -->
            <el-col :span="12">
              <el-form-item label="业务线" class="is-required" style="margin-bottom: 5px">
                <businessView
                  ref="businessView"
                  :currentBusiness="tempCase.business_id"
                  :isMultiple="false"
                ></businessView>
              </el-form-item>
            </el-col>

            <!-- 用例集选择 -->
            <el-col :span="6">
              <el-form-item label="用例集" class="is-required" style="margin-bottom: 5px">
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
                    ></el-tree>
                  </el-option>
                </el-select>

              </el-form-item>

            </el-col>

            <!-- 执行次数 -->
            <el-col :span="6">
              <el-form-item label="执行次数" class="is-required">
                <el-input-number v-model="tempCase.run_times" :min="1" :max="1000" controls-position="right"
                ></el-input-number>
              </el-form-item>
            </el-col>

          </el-row>

        </el-form>

        <el-form :inline="true" class="demo-form-inline" size="mini">

          <el-tabs v-model="caseInFoActiveName" style="margin-left: 20px;margin-right: 20px">

            <!-- 跳过条件 -->
            <el-tab-pane label="跳过条件" name="editSkipIf">
              <el-tooltip class="item-tabs" effect="light" placement="top" slot="label">
                <div slot="content">
                  任意一行设置的表达式成立，都会执行跳过操作，使用方法与断言一致，详见断言示例
                </div>
                <span>跳过条件</span>
              </el-tooltip>
              <skipIfView
                ref="skipIfView"
                :skipIfData="tempCase.skip_if"
                :use_type="'case'"
              ></skipIfView>
            </el-tab-pane>

            <el-tab-pane label="自定义变量" name="editVariables">
              <el-tooltip class="item-tabs" effect="light" placement="top" slot="label">
                <div slot="content">
                  1、可用此功能设置一些预设值，比如token、账号信息 <br/>
                  2、在此处设置的值，对于此用例下的测试步骤均可直接引用 <br/>
                  3、此处的value可以使用自定义函数处理/获取数据，比如用自定义函数取数据库获取对应的数据 <br/>
                  4、若在此处设置的key与服务的公共变量中的某个key一致，则对于这个key，则会用此处设置的值 <br/>
                  5、若在测试步骤中提取的值使用的key和此处设置的key相同，则在此用例的后续测试步骤执行过程用，会用测试步骤中提取到的值
                </div>
                <span>自定义变量</span>
              </el-tooltip>
              <variablesView
                ref="variablesView"
                :currentData="tempCase.variables"
                :dataTypeMapping="dataTypeMapping"
                :placeholder-key="'key'"
                :placeholder-value="'value'"
                :placeholder-desc="'备注'"
              ></variablesView>
            </el-tab-pane>

          </el-tabs>

        </el-form>
      </el-tab-pane>

      <!-- 步骤管理组件 -->
      <el-tab-pane label="步骤管理" name="stepInFo">
        <stepView
          ref="stepView"
          :projectId="currentProjectId || ''"
          :caseId="tempCase.id"
          :tempCase="tempCase"
        ></stepView>
      </el-tab-pane>

      <!-- 用例描述 -->
      <el-tab-pane label="用例描述" name="stepDesc">
        <el-input v-model="tempCase.desc" size="mini" type="textarea" :rows="20" :placeholder="'用例的描述、备注'">
        </el-input>
      </el-tab-pane>

    </el-tabs>

    <selectRunEnv
      :callBackEvent="callBackEvent"
      :event="runEvent"
    ></selectRunEnv>

    <runProcess
      :runType="'webUi'"
      :busName="$busEvents.data.showRunProcessByDrawer"
    ></runProcess>

    <div class="demo-drawer__footer">
      <el-button
        slot="reference"
        size="mini"
        type="primary"
        style="float: left"
        :loading="isShowDebugLoading"
        @click="clickRunDebug()">调试
      </el-button>

      <el-button
        size="mini"
        @click=" drawerIsShow = false"
      >取消
      </el-button>

      <el-button
        size="mini"
        type="primary"
        :loading="submitLoadingIsShow"
        @click=" tempCase.id ? changCase() : addCase() "
      >保存
      </el-button>
    </div>

  </el-drawer>

</template>

<script>
import skipIfView from "@/components/Inputs/skipIf"
import moduleSelectorView from "@/components/Selector/module";
import funcFilesView from '@/components/Selector/funcFile'
import headersView from '@/components/Inputs/changeRow'
import variablesView from '@/components/Inputs/variables'
import stepView from '@/views/webUiTest/step'
import selectRunEnv from '@/components/selectRunEnv'  // 环境选择组件
import runProcess from '@/components/runProcess'  // 测试执行进度组件
import businessView from '@/components/Selector/business'

import {getCaseSet} from "@/apis/webUiTest/caseSet";
import {postCase, putCase, getCase, copyCase, caseRun} from "@/apis/webUiTest/case";
import {getAssertMappingList, getExtractMappingList, getFindElementOption} from "@/utils/getConfig";

export default {
  name: 'drawer',
  props: [
    'currentProjectId',
    'currentSetId',
    'dataTypeMapping'
  ],
  components: {
    moduleSelectorView,
    funcFilesView,
    headersView,
    variablesView,
    stepView,
    selectRunEnv,
    skipIfView,
    runProcess,
    businessView
  },
  data() {
    return {
      direction: 'rtl',  // 抽屉打开方式
      drawerIsShow: false,
      submitLoadingIsShow: false,
      isShowDebugLoading: false,
      activeName: 'caseInFo',
      caseInFoActiveName: "editVariables",
      caseSetTree: [],
      defaultProps: {
        children: "children",
        label: "name"
      },
      caseSetLabel: '',
      tempCase: {
        id: '',
        name: '',
        desc: '',
        status: 0,
        run_times: '',
        func_files: [],
        variables: [{key: null, value: null, remark: null, data_type: 'str'}],
        skip_if: {
          skip_type: null,
          data_source: null,
          check_value: null,
          comparator: null,
          data_type: null,
          expect: null
        },
        business_id: '',
        project_id: '',
        set_id: ''
      },

      runEvent: 'runUiCaseEventOnDialog',
      callBackEvent: 'runUiCaseOnDialog'

    }
  },

  beforeCreate() {
    getFindElementOption(this)  // 定位元素方式
    // getExtractTypeList(this)  // 数据提取类型
    getExtractMappingList(this)  // 数据提取类型
    getAssertMappingList(this)  // 数据提取类型
  },

  methods: {

    // 初始化新增用例模板
    initNewTempCase() {
      this.tempCase.id = ''
      this.tempCase.name = ''
      this.tempCase.desc = ''
      this.tempCase.run_times = ''
      this.tempCase.func_files = []
      this.tempCase.variables = [{key: null, value: null, remark: null, data_type: 'str'}]
      this.tempCase.skip_if = {
        skip_type: null,
        data_source: null,
        check_value: null,
        comparator: null,
        data_type: null,
        expect: null
      }
      this.tempCase.business_id = ''
      this.tempCase.project_id = this.currentProjectId || ''
      this.tempCase.set_id = this.currentSetId || ''
      this.drawerIsShow = true
    },

    // 初始化修改用例模板
    initUpdateTempCase(currentCase) {
      this.tempCase = currentCase
      this.drawerIsShow = true
    },

    // 获取当前的用例数据，用于提交给后端
    getCaseDataToCommit() {
      let caseData = JSON.parse(JSON.stringify(this.tempCase))
      caseData.set_id = this.$refs.setTree.getCheckedKeys()[0] || this.tempCase.set_id
      caseData.func_files = this.$refs.funcFilesView.tempFuncFiles
      caseData.variables = this.$refs.variablesView.tempData
      caseData.skip_if = this.$refs.skipIfView.tempData
      caseData.business_id = this.$refs.businessView.business
      return caseData
    },

    // 勾选树事件
    handleNodeClick(data, checked, node) {
      if (checked && [data.id] !== this.$refs.setTree.getCheckedKeys()) {
        this.$refs.setTree.setCheckedKeys([data.id])  // 选中
        this.caseSetLabel = data.name
      }
    },

    // 新增用例
    addCase() {
      this.submitLoadingIsShow = true
      postCase(this.getCaseDataToCommit()).then(response => {
        this.submitLoadingIsShow = false
        if (this.showMessage(this, response)) {
          this.drawerIsShow = false
          this.tempCase.id = response.data.id
          this.$bus.$emit(this.$busEvents.ui.uiCaseDrawerCommitSuccess, 'success')
        }
      })
    },

    // 修改用例
    changCase() {
      this.submitLoadingIsShow = true
      putCase(this.getCaseDataToCommit()).then(response => {
        this.submitLoadingIsShow = false
        if (this.showMessage(this, response)) {
          this.drawerIsShow = false
          this.$bus.$emit(this.$busEvents.ui.uiCaseDrawerCommitSuccess, 'success')
        }
      })
    },

    // 点击调试按钮
    clickRunDebug() {
      this.$bus.$emit(this.runEvent, 'webUi')
    },

    // 保存并调试
    debugCase(runDict) {
      this.submitLoadingIsShow = true
      if (this.tempCase.id) {
        putCase(this.getCaseDataToCommit()).then(response => {
          this.submitLoadingIsShow = false
          if (this.showMessage(this, response)) {
            this.$bus.$emit(this.$busEvents.ui.uiCaseDrawerCommitSuccess, 'success')
            this.runCase(this.tempCase.id, runDict)
          }
        })
      } else {
        postCase(this.getCaseDataToCommit()).then(response => {
          this.submitLoadingIsShow = false
          if (this.showMessage(this, response)) {
            this.tempCase.id = response.data.id
            this.$bus.$emit(this.$busEvents.ui.uiCaseDrawerCommitSuccess, 'success')
            this.runCase(this.tempCase.id, runDict)
          }
        })
      }
    },

    // 运行用例
    runCase(caseId, runConf) {
      this.isShowDebugLoading = true
      caseRun({
        caseId: [caseId],
        env: runConf.runEnv,
        is_async: runConf.runType,
        browser: runConf.browser,
        'trigger_type': 'page'
      }).then(response => {
        // console.log('case.index.methods.runCase.response: ', JSON.stringify(response))
        this.isShowDebugLoading = false
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.data.showRunProcessByDrawer, response.data.report_id)
        }
      })
    },

    /* 点击切换tab
    * activeName：要去的标签页
    * oldActiveName：当前的标签页
    * */
    beforeLeave(activeName, oldActiveName) {
      if (!this.tempCase.id && oldActiveName === 'caseInFo') {
        postCase(this.getCaseDataToCommit()).then(response => {
          this.submitLoadingIsShow = false
          if (this.showMessage(this, response)) {
            this.tempCase = response.data
          } else {
            this.activeName = 'caseInFo'
          }
        })
      }
    },
  },

  mounted() {

    // 监听 case抽屉 的状态
    this.$bus.$on(this.$busEvents.ui.uiCaseDrawerStatus, (command, currentCase) => {
      if (command === 'add') {
        this.initNewTempCase()
      } else if (command === 'edit') {
        this.initUpdateTempCase(currentCase)
      } else if (command === 'copy') {  // 复制用例
        copyCase({id: currentCase.id}).then(response => {
            if (this.showMessage(this, response)) {
              this.tempCase = response.data.case
              this.drawerIsShow = true
              this.$bus.$emit(this.$busEvents.ui.uiCaseDrawerCommitSuccess, 'success')
            }
          }
        )
      }
      this.activeName = 'caseInFo'
    })

    // 引用用例为步骤后，后端会合并两条用例的公共变量，所以获取当前用例的最新公共变量
    this.$bus.$on(this.$busEvents.ui.uiQuoteCaseAsStepIsCommit, () => {
      getCase({id: this.tempCase.id}).then(response => {
        let tempCase_variables = {}, response_variables = {}

        response.data.variables.forEach(variable => {
          response_variables[variable["key"]] = variable
        })

        this.tempCase.variables.forEach(variable => {
          tempCase_variables[variable["key"]] = variable
        })

        for (let key in response_variables) {
          if (!(key in tempCase_variables)) {
            this.tempCase.variables.push(response_variables[key])
            // tempCase_variables[key] = response_variables[key]
          }
        }
      })
    })

    // 监听、接收用例集树
    this.$bus.$on(this.$busEvents.ui.uiCaseSetTreeIsDone, (caseSetTree) => {
      this.caseSetTree = caseSetTree
    })

    // 在添加步骤时触发的 保存用例，这个时候保存后不关闭用例的Dialog框，只重新请求用例列表
    this.$bus.$on(this.$busEvents.ui.uiIsAddStepTriggerSaveCase, (status) => {
      postCase(this.getCaseDataToCommit()).then(response => {
        if (this.showMessage(this, response)) {
          // 把接口返回的用例id赋值给this.tempCase.id
          this.tempCase.id = response.data.id
          this.$bus.$emit(this.$busEvents.ui.uiCaseDrawerCommitSuccess, 'success')
        }
      })
    })

    this.$bus.$on(this.callBackEvent, (runDict) => {
      this.debugCase(runDict)
    })

  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.callBackEvent)
    this.$bus.$off(this.$busEvents.ui.uiCaseDrawerStatus)
    this.$bus.$off(this.$busEvents.ui.uiCaseSetTreeIsDone)
    this.$bus.$off(this.$busEvents.ui.uiIsAddStepTriggerSaveCase)
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
          getCaseSet({'id': this.tempCase.set_id}).then(response => {
            this.caseSetLabel = response.data.name
            this.$refs.setTree.setCheckedKeys([this.tempCase.set_id])
          })
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
