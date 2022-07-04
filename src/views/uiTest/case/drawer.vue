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

          <!-- 第一行 -->
          <el-row>
            <!-- 用例名称 -->
            <el-col :span="10">
              <el-form-item label="用例名称" class="is-required">
                <el-input v-model="tempCase.name"></el-input>
              </el-form-item>
            </el-col>

            <!-- 用例集选择 -->
            <el-col :span="9">
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
            <el-col :span="5">
              <el-form-item label="执行次数" class="is-required">
                <el-input-number v-model="tempCase.run_times" :min="1" :max="1000" controls-position="right"
                ></el-input-number>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 函数文件 -->
          <el-form-item label="函数文件">
            <funcFilesView :funcFiles="tempCase.func_files" ref="funcFilesView"></funcFilesView>
          </el-form-item>
        </el-form>

        <el-form :inline="true" class="demo-form-inline" size="mini">

          <el-tabs type="border-card">

            <el-tab-pane label="公用变量">
              <!-- 使用示例 -->
              <el-collapse accordion>
                <el-collapse-item>
                  <template slot="title">
                    <div style="color:#409eff"> 点击查看说明</div>
                  </template>
                  <div style="margin-left: 20px">
                    1、可用此功能设置一些预设值，比如token、账号信息 <br/>
                    2、在此处设置的值，对于此用例下的测试步骤均可直接引用 <br/>
                    3、此处的value可以使用自定义函数处理/获取数据，比如用自定义函数取数据库获取对应的数据 <br/>
                    4、若在此处设置的key与服务的公共变量中的某个key一致，则对于这个key，则会用此处设置的值 <br/>
                    5、若在测试步骤中提取的值使用的key和此处设置的key相同，则在此用例的后续测试步骤执行过程用，会用测试步骤中提取到的值
                  </div>
                </el-collapse-item>
              </el-collapse>
              <variablesView
                ref="variablesView"
                :currentData="tempCase.variables"
                :placeholder-key="'key'"
                :placeholder-value="'value'"
                :placeholder-desc="'备注'"
              ></variablesView>
            </el-tab-pane>

            <!-- cookie设置 -->
            <el-tab-pane label="cookie设置">
              <!-- 使用示例 -->
              <el-collapse accordion>
                <el-collapse-item>
                  <template slot="title">
                    <div style="color:#409eff"> 点击查看说明</div>
                  </template>
                  <div style="margin-left: 20px">
                    1、cookie设置 <br/>
                    2、cookie设置 <br/>
                  </div>
                </el-collapse-item>
              </el-collapse>
              <headersView
                ref="cookiesView"
                :currentData="tempCase.cookies"
                :placeholder-key="'key'"
                :placeholder-value="'value'"
                :placeholder-desc="'备注'"
              ></headersView>
            </el-tab-pane>

            <!-- sessionStorage设置 -->
            <el-tab-pane label="sessionStorage设置">
              <!-- 使用示例 -->
              <el-collapse accordion>
                <el-collapse-item>
                  <template slot="title">
                    <div style="color:#409eff"> 点击查看说明</div>
                  </template>
                  <div style="margin-left: 20px">
                    1、sessionStorage设置 <br/>
                    2、sessionStorage设置 <br/>
                  </div>
                </el-collapse-item>
              </el-collapse>
              <headersView
                ref="sessionStorageView"
                :currentData="tempCase.session_storage"
                :placeholder-key="'key'"
                :placeholder-value="'value'"
                :placeholder-desc="'备注'"
              ></headersView>
            </el-tab-pane>

            <!-- localStorage设置 -->
            <el-tab-pane label="localStorage设置">
              <!-- 使用示例 -->
              <el-collapse accordion>
                <el-collapse-item>
                  <template slot="title">
                    <div style="color:#409eff"> 点击查看说明</div>
                  </template>
                  <div style="margin-left: 20px">
                    1、localStorage设置 <br/>
                    2、localStorage设置 <br/>
                  </div>
                </el-collapse-item>
              </el-collapse>
              <headersView
                ref="localStorageView"
                :currentData="tempCase.local_storage"
                :placeholder-key="'key'"
                :placeholder-value="'value'"
                :placeholder-desc="'备注'"
              ></headersView>
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
          :stepList="tempCase.steps"
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
import moduleSelectorView from "@/components/Selector/module";
import funcFilesView from '@/components/Selector/funcFile'
import headersView from '@/components/Inputs/changeRow'
import variablesView from '@/components/Inputs/changeRow'
import stepView from '@/views/uiTest/step'
import selectRunEnv from '@/components/selectRunEnv'  // 环境选择组件

import {postCase, putCase, copyCase, caseRun} from "@/apis/uiTest/case";
import {getCaseSet} from "@/apis/uiTest/caseSet";
import {stepList} from "@/apis/uiTest/step";
import {reportIsDone} from "@/apis/uiTest/report";
import {runTestTimeOutMessage} from "@/utils/message";
import {getAssertMappingList, getExtractMappingList, getFindElementOption} from "@/utils/getConfig";

export default {
  name: 'drawer',
  props: [
    'currentProjectId',
    'currentSetId'
  ],
  components: {
    moduleSelectorView,
    funcFilesView,
    headersView,
    variablesView,
    stepView,
    selectRunEnv
  },
  data() {
    return {
      direction: 'rtl',  // 抽屉打开方式
      drawerIsShow: false,
      submitLoadingIsShow: false,
      isShowDebugLoading: false,
      activeName: 'caseInFo',
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
        is_run: true,
        run_times: '',
        func_files: [],
        variables: [{key: null, value: null, remark: null}],
        cookies: [{key: null, value: null, remark: null}],
        session_storage: [{key: null, value: null, remark: null}],
        local_storage: [{key: null, value: null, remark: null}],
        project_id: '',
        set_id: '',
        steps: []  // 测试步骤
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
      this.tempCase.variables = [{key: null, value: null, remark: null}]
      this.tempCase.cookies = [{key: null, value: null, remark: null}]
      this.tempCase.session_storage = [{key: null, value: null, remark: null}]
      this.tempCase.local_storage = [{key: null, value: null, remark: null}]
      this.tempCase.steps = []
      this.tempCase.project_id = this.currentProjectId || ''
      this.tempCase.set_id = this.currentSetId || ''
      this.drawerIsShow = true
    },

    // 初始化修改用例模板
    initUpdateTempCase(currentCase) {
      this.tempCase = currentCase
      this.getStepList()
      this.drawerIsShow = true
    },

    // 获取当前的用例数据，用于提交给后端
    getCaseDataToCommit() {
      let caseData = JSON.parse(JSON.stringify(this.tempCase))
      caseData.set_id = this.$refs.setTree.getCheckedKeys()[0]
      caseData.func_files = this.$refs.funcFilesView.tempFuncFiles
      caseData.variables = this.$refs.variablesView.tempData
      caseData.cookies = this.$refs.cookiesView.tempData
      caseData.session_storage = this.$refs.sessionStorageView.tempData
      caseData.local_storage = this.$refs.localStorageView.tempData
      caseData.steps = this.$refs.stepView.$refs.stepListView.stepList
      return caseData
    },

    // 勾选树事件
    handleNodeClick(data, checked, node) {
      if (checked && [data.id] !== this.$refs.setTree.getCheckedKeys()) {
        this.$refs.setTree.setCheckedKeys([data.id])  // 选中
        this.caseSetLabel = data.name
      }
    },

    // 获取步骤列表
    getStepList() {
      stepList({'caseId': this.tempCase.id}).then(response => {
        this.tempCase.steps = response.data
      })
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
    clickRunDebug(){
      this.$bus.$emit(this.runEvent, false)
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
    runCase(caseId, runDict) {
      this.isShowDebugLoading = true
      caseRun({caseId: [caseId], env: runDict.runEnv, is_async: runDict.runType}).then(runResponse => {
        // console.log('case.index.methods.runCase.response: ', JSON.stringify(response))
        if (this.showMessage(this, runResponse)) {

          // 触发运行成功，每三秒查询一次，
          // 查询指定时间没出结果，则停止查询，提示用户去测试报告页查看
          // 已出结果，则停止查询，展示测试报告
          var that = this
          // 初始化运行超时时间
          var runTimeoutCount = Number(this.$busEvents.runTimeout) * 1000 / 3000
          var queryCount = 1
          var timer = setInterval(function () {
            if (queryCount <= runTimeoutCount) {
              reportIsDone({'id': runResponse.data.report_id}).then(queryResponse => {
                if (queryResponse.data === 1) {
                  that.isShowDebugLoading = false
                  that.openReportById(runResponse.data.report_id)
                  clearInterval(timer)  // 关闭定时器
                }
              })
              queryCount += 1
            } else {
              that.isShowDebugLoading = false
              that.$notify(runTestTimeOutMessage(that));
              clearInterval(timer)  // 关闭定时器
            }
          }, 3000)
        }
      })
    },

    // 打开测试报告
    openReportById(reportId) {
      // console.log(`api.dialogForm.openReportById.reportId: ${JSON.stringify(reportId)}`)
      let {href} = this.$router.resolve({path: 'reportShow', query: {id: reportId}})
      window.open(href, '_blank')
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
              this.tempCase.steps = response.data.steps
              this.drawerIsShow = true
              this.$bus.$emit(this.$busEvents.ui.uiCaseDrawerCommitSuccess, 'success')
            }
          }
        )
      }
      this.activeName = 'caseInFo'
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
