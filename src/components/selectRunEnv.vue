<template>
  <!-- 选择环境和运行模式 -->
  <el-dialog
    title="选择运行环境"
    append-to-body
    :visible.sync="dialogIsShow"
    :close-on-click-modal="false"
    width="70%"
  >

    <el-tabs v-model="showTabName">
      <el-tab-pane label="选择环境" name="selectRunEnv">
        <!-- 选择运行环境 -->
        <div>
          <div>
            <label>选择环境：</label>
          </div>
          <div style="margin-top: 10px">
            <label>
              <span style="color: red">
                注：请确保此次运行中涉及到的所有服务都设置了当前选中环境的域名 <br>
                比如选择的测试环境，那么在运行的时候所有步骤都会找自己所在服务的测试环境的域名
              </span>
            </label>
          </div>
          <runEnvCheckbox
            ref="runEnvCheckbox"
            :env-list="runEnvDataSource"
            :get-item="'code'"
          />

        </div>

        <!-- 选择运行浏览器 -->
        <div v-if="dataType === 'webUi'">
          <div style="margin-top: 20px">
            <label>选择浏览器：</label>
          </div>
          <div style="margin-top: 10px">
            <label>
              <span style="color: red">
                注： <br>
                1、请确保服务器已安装此浏览器 <br>
                2、请确webdriver版本与浏览器版本匹配
              </span>
            </label>
          </div>
          <div style="margin-top: 10px">
            <el-radio
              v-for="(value, key) in $busEvents.data.runBrowserNameDict "
              :key="key"
              v-model="runBrowser"
              :label="key"
            >{{ value }}
            </el-radio>
          </div>
        </div>

        <!-- 执行模式 -->
        <div v-if="dataType !== 'appUi' && showSelectRunModel">
          <div style="margin-top: 40px">
            <label>执行模式： </label>
          </div>

          <div style="margin-top: 10px">
            <label>
              <span style="color: red">
                串行执行: 用例一条一条顺序串行执行 <br>
                并行执行: 每条用例一个线程并行执行 <br>
                注：并行执行仅仅是为了提升执行效率，请勿用于压力测试<br>
              </span>
            </label>
          </div>

          <div style="margin-top: 10px">
            <el-radio v-for="(value, key) in runModeData" :key="key" v-model="runType" :label="key">{{ value }}</el-radio>
          </div>

        </div>

        <!-- 运行app的配置 -->
        <div v-if="dataType === 'appUi'">
          <div style="margin-top: 40px">
            <label>是否重置APP本地缓存： </label>
          </div>
          <div style="margin-top: 10px">
            <label>
              <span style="color: red">
                重置历史运行APP记录的信息，如登录信息、地址信息等 <br>
              </span>
            </label>
          </div>
          <div style="margin-top: 10px">
            <el-radio v-model="noReset" :label="false">重置</el-radio>
            <el-radio v-model="noReset" :label="true">不重置</el-radio>
          </div>

          <div style="margin-top: 40px">
            <label>运行终端： </label>
          </div>
          <div style="margin-top: 10px">
            <label>
              <span style="color: red">
                运行服务器: 要连接哪个终端的appium服务器进行app自动化测试 <br>
                运行手机: 该设备运行自动化测试的手机型号 <br>
                注：请确保测试平台与选中的appium服务器网络通畅、appium服务器已启动、手机已连接到该服务器<br>
              </span>
            </label>
          </div>
          <el-row>
            <el-col :span="12">
              <div style="margin-top: 10px">
                <label>运行服务器：</label>
                <el-select
                  v-model="runServer"
                  filterable
                  default-first-option
                  placeholder="请选择运行服务器"
                  style="width: 70%"
                  size="mini"
                >
                  <el-option
                    v-for="server in $busEvents.data.runServerList"
                    :key="server.id"
                    :label="`${server.name}   (最近一次访问：${statusContentMapping[server.status]})`"
                    :value="server.id"
                  />
                </el-select>
              </div>
            </el-col>

            <el-col :span="12">
              <div style="margin-top: 10px">
                <label>运行手机：</label>
                <el-select
                  v-model="runPhone"
                  filterable
                  default-first-option
                  placeholder="请选择运行手机"
                  style="width: 70%"
                  size="mini"
                >
                  <el-option
                    v-for="phone in $busEvents.data.runPhoneList"
                    :key="phone.id"
                    :label="phone.name"
                    :value="phone.id"
                  />
                </el-select>
              </div>
            </el-col>
          </el-row>

        </div>
      </el-tab-pane>

      <el-tab-pane v-if="showRunArgs" name="editRunArgs">
        <template slot="label">
          <span> 重新指定参数 </span>
          <el-tooltip class="item" effect="dark" placement="top-start">
            <div slot="content">
              1、支持执行时<span style="color: red">重新指定参数</span><br>
              2、此时设置的参数仅此次运行生效，<span style="color: red">不会保存</span>
            </div>
            <span><i style="color: #409EFF" class="el-icon-question" /></span>
          </el-tooltip>
        </template>

        <el-tabs v-model="showArgsTabName">
          <el-tab-pane label="执行信息" name="runTimes">
            <el-form size="mini" label-width="100px">
              <el-form-item label="执行次数" class="is-required">
                <el-input-number
                  v-model="runArgs.run_times"
                  :min="1"
                  :max="1000"
                  controls-position="right"
                />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane name="skipIf">
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
              :data-typed="dataType"
              :skip-if-data="runArgs.skip_if"
              :env-list="runEnvDataSource"
              :project-id="''"
              :use-type="'case'"
            />
          </el-tab-pane>

          <el-tab-pane name="variables">
            <template slot="label">
              <span> 用例入参 </span>
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
            <showCaseVariables
              ref="editVariables"
              :data-type="dataType"
              :case-variables="runArgs.variables"
              :can-edite="true"
            />
          </el-tab-pane>

          <el-tab-pane v-if="showRunArgs && runArgs.headers" name="headers">
            <template slot="label">
              <span> 头部参数 </span>
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
              :current-data="runArgs.headers"
              :placeholder-key="'key'"
              :placeholder-value="'value'"
              :placeholder-desc="'备注'"
              :can-edite="false"
            />
          </el-tab-pane>

        </el-tabs>

      </el-tab-pane>
    </el-tabs>

    <span slot="footer" class="dialog-footer">
      <el-button size="mini" @click="dialogIsShow = false">取 消</el-button>
      <el-button v-loading="submitButtonIsLoading" size="mini" type="primary" @click="runData()">确 定</el-button>
    </span>

  </el-dialog>
</template>

<script>
import { Message } from 'element-ui'
import { appiumServerRequestStatusMappingContent, appiumServerRequestStatusMappingTagType } from '@/utils/mapping'

import { getConfigByName, getRunModel } from '@/apis/config/config'
import { runEnvList } from '@/apis/config/runEnv'
import { getRunTimeout } from '@/utils/getConfig'
import runEnvCheckbox from '@/components/Selector/runEnvCheckbox.vue'
import showCaseVariables from '@/components/business/case/showCaseVariables.vue'
import headersView from '@/components/Inputs/changeRow.vue'
import skipIfView from '@/components/Inputs/skipIf.vue'

export default {
  name: 'SelectRunEnv',
  components: { skipIfView, headersView, showCaseVariables, runEnvCheckbox },
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'dataType', 'projectBusinessId'
  ],
  data() {
    return {
      dialogIsShow: false,
      submitButtonIsLoading: false,
      runModeData: {},

      runBrowser: undefined,
      runServer: undefined,
      runPhone: undefined,
      noReset: undefined,
      runUnit: 'api',
      runType: '0',
      showSelectRunModel: false,
      showRunArgs: false,
      runArgs: {},
      showTabName: 'selectRunEnv',
      showArgsTabName: 'variables',
      runEnvDataSource: [], // 运行环境list
      statusContentMapping: appiumServerRequestStatusMappingContent,
      statusTagTypeMapping: appiumServerRequestStatusMappingTagType
    }
  },

  mounted() {
    getRunTimeout(this) // 初始化等待用例运行超时时间

    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, runUnit, showSelectRunModel, business_id, args) => {
      if (_type === 'selectRunEnv') {
        this.runUnit = runUnit
        this.showSelectRunModel = showSelectRunModel

        // 设置执行环境
        if (this.dataType === 'api') {
          this.initRunMode()
        } else if (this.dataType === 'appUi') {
          this.getRunAppEnv()
          this.noReset = false
        } else {
          this.initRunMode()
          this.initBrowserName()
        }

        this.initEnvList(business_id)

        // 判断是否展示重新指定运行参数
        if (args) {
          this.showRunArgs = true
          this.runArgs = args
        } else {
          this.showRunArgs = false
          this.runArgs = {
            skip_if: [],
            variables: [],
            headers: []
          }
        }

        this.showTabName = 'selectRunEnv'
        this.submitButtonIsLoading = false
        this.dialogIsShow = true
      }
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsShow)
  },

  methods: {

    // 初始化运行环境
    initEnvList(business_id) {
      runEnvList({
        business_id: this.projectBusinessId ? this.projectBusinessId : business_id
      }).then(response => {
        this.runEnvDataSource = response.data.data
      })
    },

    getTempVariables() {
      let temp_variables = null
      if (this.showRunArgs) {
        temp_variables = {
          skip_if: this.$refs.skipIfView.tempData,
          variables: this.$refs.editVariables.caseVariables,
          run_times: this.runArgs.run_times
        }
        if (this.dataType === 'api') {
          temp_variables['headers'] = this.$refs.headersView.tempData
        }
      }
      return temp_variables
    },

    // 点确定
    runData() {
      if (this.runPhone || this.$refs.runEnvCheckbox.selectedEnvDataList.length > 0) {
        const temp_variables = this.getTempVariables()
        this.$bus.$emit(
          this.$busEvents.drawerIsCommit,
          'selectRunEnv',
          this.runUnit,
          {
            runEnv: this.$refs.runEnvCheckbox.selectedEnvDataList,
            browser: this.runBrowser,
            runServer: this.runServer,
            runPhone: this.runPhone,
            runType: parseInt(this.runType),
            noReset: this.noReset,
            temp_variables: temp_variables
          })
        this.submitButtonIsLoading = true
        this.dialogIsShow = false
      } else {
        Message.warning('请选择运行环境')
      }
    },

    // 获取浏览器配置
    initBrowserName() {
      if (Object.keys(this.$busEvents.data.runBrowserNameDict).length === 0) {
        getConfigByName({ 'name': 'browser_name' }).then(response => {
          this.$busEvents.data.runBrowserNameDict = JSON.parse(response.data)
          this.runBrowser = Object.keys(this.$busEvents.data.runBrowserNameDict)[0]
        })
      }
      this.runBrowser = Object.keys(this.$busEvents.data.runBrowserNameDict)[0]
    },

    // 获取执行模式配置
    initRunMode() {
      getRunModel().then(response => {
        this.runModeData = response.data
      })
    },

    // 获取app测试的运行环境
    getRunAppEnv() {
      if (this.$busEvents.data.runServerList.length > 0) {
        this.runServer = this.$busEvents.data.runServerList[0].id
      }
      if (this.$busEvents.data.runPhoneList.length > 0) {
        this.runPhone = this.$busEvents.data.runPhoneList[0].id
      }
    }
  }
}
</script>

<style scoped>

</style>
