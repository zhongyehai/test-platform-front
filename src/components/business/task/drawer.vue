<template>
  <el-drawer
    :title=" tempTask.id ? '修改定时任务' : '新增定时任务'"
    size="75%"
    :visible.sync="drawerIsShow"
    :direction="direction"
  >
    <el-form label-width="120px" style="margin-left: 20px;margin-right: 20px">

      <el-tabs v-model="activeName">
        <el-tab-pane label="任务信息" name="taskInfo">
          <el-form-item label="任务名称" size="mini" class="is-required">
            <el-input v-model="tempTask.name" auto-complete="off" />
          </el-form-item>

          <!-- 选择运行环境 -->
          <el-form-item v-if="dataType !== 'appUi'" label="运行环境" size="mini" class="is-required">
            <el-select
              v-model="tempTask.env_list"
              multiple
              filterable
              default-first-option
              placeholder="请选择运行环境"
              style="width: 98%"
              size="mini"
            >
              <el-option
                v-for="(env) in envList"
                :key="env.code"
                :label="env.name"
                :value="env.code"
              />
            </el-select>
            <el-popover class="el_popover_class" placement="top-start" trigger="hover">
              <div>
                触发此定时任务时，会以此处选择的环境来执行，请确保此任务涉中及到的所有服务都设置了当前选中环境的域名
              </div>
              <el-button slot="reference" type="text" icon="el-icon-question" />
            </el-popover>
          </el-form-item>

          <el-form-item v-if="dataType==='webUi'" label="运行浏览器" size="mini" class="is-required">
            <el-radio
              v-for="(value, key) in $busEvents.data.runBrowserNameDict "
              :key="key"
              v-model="tempTask.conf.browser"
              :label="key"
            >{{ value }}
            </el-radio>
          </el-form-item>

          <el-form-item v-if="dataType==='appUi'" label="运行服务器" size="mini" class="is-required">
            <el-select
              v-model="tempTask.conf.server_id"
              filterable
              default-first-option
              placeholder="请选择运行服务器"
              style="width: 100%"
              size="mini"
            >
              <el-option
                v-for="server in $busEvents.data.runServerList"
                :key="server.id"
                :label="`${server.name}   (最近一次访问：${statusContentMapping[server.status]})`"
                :value="server.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item v-if="dataType==='appUi'" label="运行手机" size="mini" class="is-required">
            <el-select
              v-model="tempTask.conf.phone_id"
              filterable
              default-first-option
              placeholder="请选择运行手机"
              style="width: 100%"
              size="mini"
            >
              <el-option
                v-for="phone in $busEvents.data.runPhoneList"
                :key="phone.id"
                :label="phone.name"
                :value="phone.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item v-if="dataType==='appUi'" label="APP缓存" size="mini" class="is-required">
            <el-radio v-model="tempTask.conf.no_reset" :label="false">重置</el-radio>
            <el-radio v-model="tempTask.conf.no_reset" :label="true">不重置</el-radio>
          </el-form-item>

          <el-form-item label="发送报告" size="mini" class="is-required">
            <el-radio v-model="tempTask.is_send" label="not_send">不发送</el-radio>
            <el-radio v-model="tempTask.is_send" label="always">始终发送</el-radio>
            <el-radio v-model="tempTask.is_send" label="on_fail">仅有不通过用例时发送</el-radio>
          </el-form-item>

          <el-form-item v-show="tempTask.env_list.length > 1" label="是否合并通知" size="mini" class="is-required">
            <el-radio v-model="tempTask.merge_notify" :label="0">不合并</el-radio>
            <el-radio v-model="tempTask.merge_notify" :label="1">合并</el-radio>
            <el-popover class="el_popover_class" placement="top-start" trigger="hover">
              <div>1、不合并通知：达到触发发送通知的条件时，每个环境都会发一份通知</div>
              <div>2、合并通知：达到触发发送通知的条件时，汇总每个环境的通知，只通知一次</div>
              <div>注：当选择了多个环境时，才会出现此选项</div>
              <el-button slot="reference" type="text" icon="el-icon-question" />
            </el-popover>
          </el-form-item>

          <el-form-item v-show="tempTask.is_send !== 'not_send'" size="mini" class="is-required" label="接收方式">
            <el-radio v-model="tempTask.receive_type" label="ding_ding">钉钉群</el-radio>
            <el-radio v-model="tempTask.receive_type" label="we_chat">企业微信群</el-radio>
            <el-radio v-model="tempTask.receive_type" label="email">邮件</el-radio>
            <el-popover class="el_popover_class" placement="top-start" trigger="hover">
              <div>1、钉钉群为关键词模式，关键词为“测试”、“报告”、“统计”</div>
              <el-button slot="reference" type="text" icon="el-icon-question" />
            </el-popover>
          </el-form-item>

          <div v-show="tempTask.is_send !== 'not_send'">
            <div v-show="tempTask.receive_type === 'ding_ding' || tempTask.receive_type === 'we_chat'">
              <el-form-item label="webhook地址" size="mini" class="is-required">
                <oneColumnRow
                  ref="webhookListInput"
                  :current-data="tempTask.webhook_list"
                />
              </el-form-item>
            </div>

            <div v-show="tempTask.receive_type === 'email'">
              <el-form-item label="邮箱服务器" size="mini" class="is-required">
                <emailServerSelector
                  ref="emailServerSelector"
                  :old-email-server="tempTask.email_server"
                />
              </el-form-item>
              <el-form-item label="发件人邮箱" size="mini" class="is-required">
                <el-input
                  v-model="tempTask.email_from"
                  size="mini"
                  placeholder="默认支持QQ邮箱，可到全局参数添加对应的服务器，配置类型选邮箱"
                />
              </el-form-item>
              <el-form-item label="邮箱密码" prop="desc" size="mini" class="is-required">
                <el-input
                  v-model="tempTask.email_pwd"
                  size="mini"
                  type="text"
                />
              </el-form-item>
              <el-form-item label="收件人邮箱" size="mini" class="is-required">
                <oneColumnRow
                  ref="emailToInput"
                  :current-data="tempTask.email_to"
                />
              </el-form-item>
            </div>
          </div>

          <el-form-item label="时间配置" size="mini" class="is-required">
            <el-input
              v-model="tempTask.cron"
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

          <el-form-item label="节假日/调休日" size="mini" class="is-required">
            <el-radio
              v-for="item in skip_holiday_item"
              :key="item.value"
              v-model="tempTask.skip_holiday"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio>
            <el-popover class="el_popover_class" placement="top-start" trigger="hover">
              <div>1、用于设置当定时任务触发时，当前日期为节假日或者调休日时，是否执行</div>
              <div>2、节假日的数据来源：参数配置的holiday_list对应的值</div>
              <div>注：每年需手动更新节假日，格式为 ["01-01", "10-01"] </div>
              <el-button slot="reference" type="text" icon="el-icon-question" />
            </el-popover>
          </el-form-item>

          <el-form-item label="运行机制" size="mini" class="is-required">
            <el-radio
              v-for="(value, key) in runModeData"
              :key="key"
              v-model="tempTask.is_async"
              :label="parseInt(key)"
            >
              {{ value }}
            </el-radio>
            <el-popover class="el_popover_class" placement="top-start" trigger="hover">
              <div>1、串行执行: 用例一条一条顺序串行执行</div>
              <div>2、并行执行: 每条用例一个线程并行执行</div>
              <div>注：并行执行仅仅是为了提升执行效率，请勿用于压力测试</div>
              <el-button slot="reference" type="text" icon="el-icon-question" />
            </el-popover>
          </el-form-item>

          <el-form-item label="回调流水线" size="mini">
            <el-row>
              <el-col :span="23">
                <jsonEditorView
                  ref="jsonEditorView"
                  :data-json="tempTask.call_back"
                />
              </el-col>
              <el-col :span="1">
                <el-popover class="el_popover_class" placement="top-start" trigger="hover">
                  <div>1、用于回调流水线自动化测试的执行结果，流水线根据结果判断是否往下走</div>
                  <div>2、json参数会添加参数：status=运行结果，全部通过为true，否则为false</div>
                  <div>3、json参数会添加参数：taskId=任务id</div>
                  <div>4、json参数会添加参数extend字段，来源于触发请求时传的extend字段，接收的什么就返回什么</div>
                  <div>5、请严格按照示例填写内容，否则回调会不成功</div>
                  <el-button slot="reference" type="text" icon="el-icon-question" />
                </el-popover>
              </el-col>
            </el-row>
          </el-form-item>
        </el-tab-pane>

        <el-tab-pane label="配置任务用例" name="case">

          <el-row>
            <el-col style="width: 25%; border:1px solid;border-color: #ffffff rgb(234, 234, 234) #ffffff #ffffff;">
              <el-tabs v-model="caseSuiteTab">
                <el-tab-pane name="caseSuiteTab">
                  <template slot="label">
                    <span> 用例集列表 </span>
                    <el-tooltip
                      class="item"
                      effect="dark"
                      placement="top-start"
                    >
                      <div slot="content">
                        1、仅可选择类型为<span style="color: red">接口</span>和<span style="color: red">流程</span>的用例集<br>
                        2、若没有选择用例集和用例，则默认运行当前服务下的所有类型为<span style="color: red">接口</span>和<span style="color: red">流程</span>用例集下的所有<span style="color: red">状态为要执行</span>的用例<br>
                        3、若要选择用例集下的<span style="color: red">所有用例</span>，则勾选对应的用例集即可，无需再选择用例<br>
                        4、若要选择<span style="color: red">指定用例</span>，则点击对应的用例集获取用例列表，再在用例列表中勾选要选择的用例<br>
                        5、若要既选择了用例集，又选择了用例，则会运行选中用<span style="color: red">例集下的所有状态为要执行的用例 + 选择的用例</span><br>
                      </div>
                      <span><i style="color: #409EFF" class="el-icon-question" /></span>
                    </el-tooltip>
                  </template>
                  <el-tree
                    ref="suiteTree"
                    class="suiteTree"
                    :data="tempCaseSuiteList"
                    show-checkbox
                    node-key="id"
                    check-strictly
                    highlight-current
                    :default-expanded-keys="tempTask.suite_ids"
                    :default-checked-keys="tempTask.suite_ids"
                    :props="defaultProps"
                    @node-click="clickTree"
                  />
                </el-tab-pane>
              </el-tabs>
            </el-col>

            <el-col :span="18">
              <el-tabs v-model="caseTab" style="margin-left: 5px">
                <el-tab-pane name="caseTab">
                  <template slot="label">
                    <span> 用例列表 </span>
                    <el-tooltip
                      class="item"
                      effect="dark"
                      placement="top-start"
                    >
                      <div slot="content">
                        1、若没有选择用例集和用例，则默认运行当前服务下的所有类型为<span style="color: red">接口</span>和<span style="color: red">流程</span>用例集下的所有<span style="color: red">状态为要执行</span>的用例<br>
                        2、若要选择用例集下的<span style="color: red">所有用例</span>，则勾选对应的用例集即可，无需再选择用例<br>
                        3、若要选择<span style="color: red">指定用例</span>，则点击对应的用例集获取用例列表，再在用例列表中勾选要选择的用例<br>
                        4、若要既选择了用例集，又选择了用例，则会运行选中用<span style="color: red">例集下的所有状态为要执行的用例 + 选择的用例</span><br>
                        5、仅用例状态为<span style="color: red">要运行</span>的用例可选中、会执行
                      </div>
                      <span><i style="color: #409EFF" class="el-icon-question" /></span>
                    </el-tooltip>
                  </template>
                  <el-table
                    ref="multipleTable"
                    v-loading="tableLoadingIsShow"
                    size="mini"
                    :data="currentCaseList"
                    element-loading-text="正在获取数据..."
                    element-loading-spinner="el-icon-loading"
                    tooltip-effect="dark"
                    style="width: 100%"
                    @select="selectRow"
                    @select-all="selectAll"
                  >
                    <el-table-column type="selection" :selectable="isDisable" min-width="10%" />

                    <el-table-column show-overflow-tooltip label="用例名" prop="name" min-width="50%" />

                    <el-table-column show-overflow-tooltip label="用例描述" min-width="15%">
                      <template slot-scope="scope">
                        <el-popover
                          :ref="scope.row.id"
                          trigger="hover"
                          placement="bottom-start"
                          style="margin-right: 10px"
                          popper-class="down-popover"
                        >
                          <showCaseDesc
                            :case-desc="scope.row.desc"
                            :case-skip-if="scope.row.skip_if"
                            :case-variables="scope.row.variables"
                            :case-extracts="scope.row.output"
                            :project-id="''"
                          />
                          <span slot="reference"> {{ scope.row.desc || '-' }} </span>
                        </el-popover>
                      </template>
                    </el-table-column>

                    <el-table-column align="center" min-width="25%">
                      <template slot="header">
                        <span> 用例状态 </span>
                        <el-tooltip
                          class="item"
                          effect="dark"
                          placement="top-start"
                        >
                          <div slot="content">
                            <div>1: 批量/定时任务运行时，只有调试结果为 "调试通过-要执行" 的才会执行</div>
                            <div>2: 请务必将用例调试通过后再设为调试通过</div>
                          </div>
                          <span><i style="color: #409EFF" class="el-icon-question" /></span>
                        </el-tooltip>
                      </template>
                      <template slot-scope="scope">
                        <div>
                          <div style="width: 80%; margin-left:auto; margin-right:auto">
                            <el-select
                              :ref="`statusSelector${scope.row.id}`"
                              slot="prepend"
                              v-model="scope.row.status"
                              disabled
                              size="mini"
                              placeholder="选择调试结果"
                              filterable
                              class="select"
                              @change="changeCaseIsRun(scope.row)"
                            >
                              <el-option label="未调试-不执行" :value="0"><span style="color: #dcdfe6">未调试-不执行</span></el-option>
                              <el-option label="调试通过-要执行" :value="1"><span style="color: #67C23A">调试通过-要执行</span></el-option>
                              <el-option label="调试通过-不执行" :value="2"><span style="color: #909399">调试通过-不执行</span></el-option>
                              <el-option label="调试不通过-不执行" :value="3"><span style="color: #F56C6C">调试不通过-不执行</span></el-option>
                            </el-select>
                          </div>
                        </div>
                      </template>
                    </el-table-column>

                  </el-table>
                </el-tab-pane>
              </el-tabs>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>

    </el-form>

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

      <el-button size="mini" @click="drawerIsShow = false">取 消</el-button>
      <el-button
        type="primary"
        size="mini"
        :loading="submitButtonIsLoading"
        @click.native="tempTask.id ? updateTask() : createTask()"
      >保存
      </el-button>
    </div>

  </el-drawer>
</template>

<script>
import emailServerSelector from '@/components/Selector/email.vue'
import jsonEditorView from '@/components/jsonView.vue'
import oneColumnRow from '@/components/Inputs/oneColumnRow.vue'

import { getTask as apiGetTask, postTask as apiPostTask, putTask as apiPutTask, runTask as apiRunTask } from '@/apis/apiTest/task'
import { caseSuiteList as apiCaseSuiteList } from '@/apis/apiTest/suite'
import { caseList as apiCaseList, putCaseIsRun as apiPutCaseIsRun } from '@/apis/apiTest/case'

import { getTask as webUiGetTask, postTask as webUiPostTask, putTask as webUiPutTask, runTask as webUiRunTask } from '@/apis/webUiTest/task'
import { caseSuiteList as webUiCaseSuiteList } from '@/apis/webUiTest/suite'
import { caseList as webUiCaseList, putCaseIsRun as webUiPutCaseIsRun } from '@/apis/webUiTest/case'

import { getTask as appUiGetTask, postTask as appUiPostTask, putTask as appUiPutTask, runTask as appUiRunTask } from '@/apis/appUiTest/task'
import { caseSuiteList as appUiCaseSuiteList } from '@/apis/appUiTest/suite'
import { caseList as appUiCaseList, putCaseIsRun as appUiPutCaseIsRun } from '@/apis/appUiTest/case'

import { arrayToTree } from '@/utils/parseData'
import { getConfigByCode } from '@/apis/config/config'
import {
  appiumServerRequestStatusMappingContent,
  appiumServerRequestStatusMappingTagType
} from '@/utils/mapping'
import showCaseDesc from '@/components/business/case/showCaseDesc.vue'
import { runEnvList } from '@/apis/config/runEnv'
import { assertStrIsJson } from '@/utils/validate'

export default {
  name: 'Drawer',
  components: {
    showCaseDesc,
    emailServerSelector,
    jsonEditorView,
    oneColumnRow
  },
  // eslint-disable-next-line vue/require-prop-types
  props: ['dataType', 'currenProjectId'],
  data() {
    return {
      activeName: 'taskInfo',
      caseTab: 'caseTab',
      caseSuiteTab: 'caseSuiteTab',

      defaultProps: {
        children: 'children',
        label: 'name'
      },
      direction: 'rtl', // 抽屉打开方式
      submitButtonIsLoading: false,
      drawerIsShow: false,
      isShowDebugLoading: false,
      tableLoadingIsShow: false,
      skip_holiday_item: [
        { label: '跳过执行', value: true },
        { label: '不跳过执行', value: false }
      ],
      tempTask: {
        skip_holiday: true,
        env_list: [],
        call_back: [
          {
            'url': 'https://xxx',
            'method': 'post',
            'headers': {},
            'json': {}
          }
        ],
        conf: {
          'browser': undefined,
          'server_id': undefined,
          'phone_id': undefined,
          'no_reset': undefined
        }
      },

      projectLists: '', // 服务列表
      projectSelectedId: '', // 服务选择框选择的服务id

      tempCaseSuiteList: [], // 当前选中服务下的用例集列表
      currentCaseList: [], // 当前选中模块下的用例列表
      envList: [],
      projectBusinessId: '',
      currentTreeDataId: '',
      runModeData: {},
      callBackPlaceholder: [
        {
          'url': 'https://xxx',
          'method': 'post',
          'headers': {},
          'json': {}
        }
      ],

      colorDict: {
        0: '#dcdfe6',
        1: '#67C23A',
        2: '#909399',
        3: '#F56C6C'
      },

      statusContentMapping: appiumServerRequestStatusMappingContent,
      statusTagTypeMapping: appiumServerRequestStatusMappingTagType,

      putCaseIsRunUrl: '',
      getTaskUrl: '',
      postTaskUrl: '',
      putTaskUrl: '',
      runTaskUrl: '',
      caseSuiteListUrl: '',
      caseListUrl: ''
    }
  },

  watch: {

    // 重新获取用例列表后，修改对应的重要等级背景色颜色
    'currentCaseList': {
      deep: true, // 深度监听
      handler(newVal, oldVal) {
        this.$nextTick(function() {
          newVal.forEach(test_case => {
            this.changeSelectCaseColor(test_case)
          })
        })
      }
    }

  },

  mounted() {
    this.initRunMode()

    // 服务树选中项事件
    this.$bus.$on(this.$busEvents.treeIsChoice, (_type, project, project_list) => {
      if (_type === 'project') {
        this.projectLists = project_list // 当前服务所在的服务列表
        // 如果服务变了，则清空用例集数和用例列表
        if (project.id !== this.projectSelectedId) {
          this.currentCaseList = []
          this.currentCaseList = []
        }
        this.projectSelectedId = project.id // 当前选中的服务
        this.projectBusinessId = project.business_id // 当前选中的服务
      }
    })

    // 监听服务树菜单点击事件
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, status, task_id) => {
      if (_type === 'taskInfo') {
        if (status === 'update') { // 修改
          this.getTaskUrl({ id: task_id }).then(response => {
            this.tempTask = response.data
            this.tempTask.call_back = response.data.call_back || this.callBackPlaceholder
          })
        } else { // 新增
          this.initNewTask()
          if (this.dataType === 'webUi') {
            if (Object.keys(this.$busEvents.data.runBrowserNameDict).length > 0) {
              this.tempTask.conf.browser = Object.keys(this.$busEvents.data.runBrowserNameDict)[0]
            }
          } else if (this.dataType === 'appUi') {
            this.tempTask.conf.no_reset = false
            this.tempTask.conf.server_id = this.$busEvents.data.runServerList[0].id
            this.tempTask.conf.phone_id = this.$busEvents.data.runPhoneList[0].id
          }
        }
        this.isShowDebugLoading = false
        this.submitButtonIsLoading = false
        this.drawerIsShow = true

        // 获取当前服务对应的用例集列表
        this.getCaseSuiteByProjectId(this.projectSelectedId)
        this.getRunEnvList()
      }
    })

    this.$bus.$on(this.$busEvents.drawerIsCommit, (_type, _runUnit, runDict) => {
      if (_type === 'selectRunEnv' && _runUnit === 'taskDrawer') {
        this.debugTask(runDict)
      }
    })
  },

  created() {
    if (this.dataType === 'api') {
      this.getTaskUrl = apiGetTask
      this.postTaskUrl = apiPostTask
      this.putTaskUrl = apiPutTask
      this.runTaskUrl = apiRunTask
      this.caseSuiteListUrl = apiCaseSuiteList
      this.caseListUrl = apiCaseList
      this.putCaseIsRunUrl = apiPutCaseIsRun
    } else if (this.dataType === 'webUi') {
      this.getTaskUrl = webUiGetTask
      this.postTaskUrl = webUiPostTask
      this.putTaskUrl = webUiPutTask
      this.runTaskUrl = webUiRunTask
      this.caseSuiteListUrl = webUiCaseSuiteList
      this.caseListUrl = webUiCaseList
      this.putCaseIsRunUrl = webUiPutCaseIsRun
    } else {
      this.getTaskUrl = appUiGetTask
      this.postTaskUrl = appUiPostTask
      this.putTaskUrl = appUiPutTask
      this.runTaskUrl = appUiRunTask
      this.caseSuiteListUrl = appUiCaseSuiteList
      this.caseListUrl = appUiCaseList
      this.putCaseIsRunUrl = appUiPutCaseIsRun
    }
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.treeIsChoice)
    this.$bus.$off(this.$busEvents.drawerIsShow)
  },
  methods: {

    // 获取环境列表
    getRunEnvList() {
      runEnvList({ business_id: this.projectBusinessId }).then(response => {
        this.envList = response.data.data
      })
    },

    // 用例列表的选中框是否禁用
    isDisable(row) {
      return row.status === 1
    },

    // 获取执行模式配置
    initRunMode() {
      getConfigByCode({ code: 'run_model' }).then(response => {
        this.runModeData = response.data
      })
    },

    // 执行列表默认勾选，遍历用例列表，如果用例的id在task.case_id里面，则把这行标为选中状态
    defaultClick() {
      this.$nextTick(() => {
        this.currentCaseList.forEach(caseRow => {
          if (this.tempTask.case_ids.indexOf(caseRow.id) >= 0) {
            this.$refs.multipleTable.toggleRowSelection(caseRow, true)
          }
        })
      })
    },

    // 点击用例集树，获取用例列表
    clickTree(data, node, element) {
      if (this.currentTreeDataId !== data.id) {
        this.getCaseList(data.id)
        this.currentTreeDataId = data.id
      }
    },

    // 列表勾选事件，如果勾选的数据在列表里面，就去掉此数据，如果不在，就添加
    selectRow(selection, row) {
      const index = this.tempTask.case_ids.indexOf(row.id)
      index >= 0 ? this.tempTask.case_ids.splice(index, 1) : this.tempTask.case_ids.push(row.id)
    },

    // 全选或者全部取消
    selectAll(selection) {
      if (selection.length > 0) { // 全选
        selection.forEach(row => {
          if (this.tempTask.case_ids.indexOf(row.id) < 0) {
            this.tempTask.case_ids.push(row.id)
          }
        })
      } else {
        this.currentCaseList.forEach(row => { // 全部取消
          const index = this.tempTask.case_ids.indexOf(row.id)
          if (index >= 0) {
            this.tempTask.case_ids.splice(index, 1)
          }
        })
      }
    },

    // 获取服务id对应的用例集列表
    getCaseSuiteByProjectId(project_id) {
      this.caseSuiteListUrl({
        page_num: 1,
        page_size: 9999,
        project_id: project_id,
        suite_type: ['api', 'process']
      }).then(response => {
        const response_data = JSON.stringify(response.data.data) === '{}' ? [] : response.data.data
        this.tempCaseSuiteList = arrayToTree(response_data, null)

        // 默认获取第一个用例集的用例
        if (this.tempCaseSuiteList.length > 0) {
          this.getCaseList(this.tempCaseSuiteList[0].id)
        }
      })
    },

    // 获取当前模块下的用例列表
    getCaseList(suiteId) {
      this.tableLoadingIsShow = true
      this.caseListUrl({ suite_id: suiteId, status: 1, detail: true }).then(response => {
        this.tableLoadingIsShow = false
        this.currentCaseList = response.data.data
        this.defaultClick() // 获取完用例列表过后 ，执行默认选中事件
      })
    },

    // 初始化定时任务
    initNewTask() {
      this.tempTask = {
        id: '',
        num: '',
        name: '',
        env_list: [],
        task_type: 'cron',
        cron: '0 15 10 ? * MON-FRI',
        skip_holiday: true,
        is_send: 'on_fail',
        is_async: 1,
        merge_notify: 0,
        receive_type: 'ding_ding',
        webhook_list: [],
        email_server: '',
        email_to: '',
        email_from: '',
        email_pwd: '',
        suite_ids: [],
        case_ids: [],
        call_back: this.callBackPlaceholder,
        conf: {
          'browser': undefined,
          'server_id': undefined,
          'phone_id': undefined,
          'no_reset': undefined
        },
        project_id: this.currenProjectId
      }
    },

    // 获取当前数据，用于提交
    getTaskToCommit() {
      const call_back = this.$refs.jsonEditorView.$refs.dataJsonView.tempDataJson
      const call_back_data = assertStrIsJson(call_back, '回调流水线格式错误')

      return {
        id: this.tempTask.id,
        num: this.tempTask.num,
        name: this.tempTask.name,
        env_list: this.tempTask.env_list,
        task_type: this.tempTask.task_type,
        cron: this.tempTask.cron,
        skip_holiday: this.tempTask.skip_holiday,
        is_send: this.tempTask.is_send,
        is_async: this.tempTask.is_async,
        merge_notify: this.tempTask.merge_notify,
        receive_type: this.tempTask.receive_type,
        webhook_list: this.$refs.webhookListInput.getData(),
        conf: this.tempTask.conf,
        email_server: this.$refs.emailServerSelector.tempEmailServer,
        email_to: this.$refs.emailToInput.getData(),
        email_from: this.tempTask.email_from,
        email_pwd: this.tempTask.email_pwd,
        call_back: call_back_data,
        project_id: this.tempTask.project_id,
        suite_ids: this.$refs.suiteTree.getCheckedKeys(),
        case_ids: this.tempTask.case_ids
      }
    },

    // 定时任务编辑框提交成功事件
    busEmit() {
      this.drawerIsShow = false
      this.$bus.$emit(this.$busEvents.drawerIsCommit, 'taskInfo')
    },

    // 创建定时任务
    createTask() {
      const data = this.getTaskToCommit()
      this.submitButtonIsLoading = true
      this.postTaskUrl(data).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          // this.tempTask.id = response.data.id
          this.busEmit()
        }
      })
    },

    // 修改定时任务
    updateTask() {
      const data = this.getTaskToCommit()
      this.submitButtonIsLoading = true
      this.putTaskUrl(data).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.busEmit()
        }
      })
    },

    // 点击调试按钮
    clickRunDebug() {
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'selectRunEnv', 'taskDrawer', true, this.projectBusinessId)
    },

    debugTask(runConf) {
      if (this.tempTask.id) {
        const data = this.getTaskToCommit()
        this.submitButtonIsLoading = true
        this.putTaskUrl(data).then(response => {
          this.submitButtonIsLoading = false
          if (this.showMessage(this, response)) {
            this.run(this.tempTask.id, runConf)
          }
        })
      } else {
        const data = this.getTaskToCommit()
        this.submitButtonIsLoading = true
        this.postTaskUrl(data).then(response => {
          this.submitButtonIsLoading = false
          if (this.showMessage(this, response)) {
            this.tempTask.id = response.data.id
            this.run(this.tempTask.id, runConf)
          }
        })
      }
    },

    // 运行任务
    run(taskId, runConf) {
      this.isShowDebugLoading = true
      this.runTaskUrl({
        id: taskId,
        env_list: runConf.runEnv,
        is_async: runConf.runType,
        browser: runConf.browser,
        server_id: runConf.runServer,
        phone_id: runConf.runPhone,
        no_reset: runConf.noReset,
        'trigger_type': 'page'
      }).then(response => {
        this.isShowDebugLoading = false
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.drawerIsShow, 'process', response.data.batch_id, response.data.report_id)
        }
      })
    },

    changeSelectCaseColor(row) {
      this.$refs[`statusSelector${row.id}`].$el.children[0].children[0].style.backgroundColor = this.colorDict[row.status]
    },

    // 修改用例状态
    changeCaseIsRun(row) {
      this.putCaseIsRunUrl({ id: [row.id], status: row.status }).then(response => {
        this.showMessage(this, response)
        this.changeSelectCaseColor(row)
      })
    }

  }
}
</script>

<style scoped>
.suiteTree {
  /*width: 80%;*/
  /*height: 60%;*/
  /*overflow: scroll;*/
}

.collapse_title {
  /*text-align: right;*/
  vertical-align: middle;
  /*float: left;*/
  font-size: 14px;
  font-weight: bold;
  color: #606266;
  /*line-height: 40px;*/
  /*padding: 0 12px 0 0;*/
  /*-webkit-box-sizing: border-box;*/
  box-sizing: border-box;
}
</style>
