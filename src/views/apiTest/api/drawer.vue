<template>
  <!-- 新增/修改接口表单 -->
  <el-drawer
    :title=" drawerType === 'update' ? '修改接口' : '新增接口'"
    size="80%"
    :wrapperClosable="false"
    :visible.sync="drawerIsShow"
    :direction="direction">
    <!-- 接口所属信息 -->
    <el-form style="margin-left: 20px;margin-right: 20px" label-width="100px">

      <el-row>

        <!-- 接口名称 -->
        <el-col :span="9">
          <el-form-item label="接口名称" class="is-required" style="margin-bottom: 5px">
            <el-input v-model="tempApi.name" placeholder="接口名称" size="mini">
            </el-input>
          </el-form-item>
        </el-col>

        <!-- 选择模块 -->
        <el-col :span="9">
          <el-form-item label="选择模块" class="is-required" style="margin-bottom: 5px">
            <el-select v-model="moduleLabel" placeholder="请选择模块" size="mini" style="width: 100%">
              <el-option :value="[]" style="height: auto">
                <el-tree
                  ref="moduleTree"
                  :data="moduleTree"
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

        <!-- 接口超时时间 -->
        <el-col :span="6">
          <el-form-item label="超时时间" class="is-required" style="margin-bottom: 5px">
            <el-input-number size="mini" v-model="tempApi.time_out" :min="5"></el-input-number>
            <el-popover class="el_popover_class" placement="top-start" trigger="hover">
              <div>发送request请求时，等待回调的超时时间，最少设置为5秒</div>
              <el-button slot="reference" type="text" icon="el-icon-question"></el-button>
            </el-popover>
          </el-form-item>
        </el-col>

      </el-row>

      <!-- 前置条件 -->
      <el-row>
        <el-form-item label="前置条件" prop="up_func" style="margin-bottom: 5px">
          <el-input
            type="textarea"
            autosize
            style="width: 98%"
            v-model="tempApi.up_func"
            placeholder="前置处理函数，多个时用英文的 分号 ' ; ' 分隔"
            size="mini"></el-input>
          <el-popover class="el_popover_class" placement="top-start" trigger="hover">
            <div>在运行接口之前要做的一些前置操作，使用自定义函数的形式实现</div>
            <el-button slot="reference" type="text" icon="el-icon-question"></el-button>
          </el-popover>
        </el-form-item>
      </el-row>

      <!-- 后置条件 -->
      <el-row>
        <el-form-item label="后置条件" prop="down_func" style="margin-bottom: 5px">
          <el-input
            type="textarea"
            autosize
            style="width: 98%"
            v-model="tempApi.down_func"
            placeholder="后置处理函数，多个时用英文的 分号 ' ; ' 分隔"
            size="mini"></el-input>
          <el-popover class="el_popover_class" placement="top-start" trigger="hover">
            <div>在运行接口之后要做的一些后置操作，使用自定义函数的形式实现</div>
            <el-button slot="reference" type="text" icon="el-icon-question"></el-button>
          </el-popover>
        </el-form-item>
      </el-row>

    </el-form>

    <!-- 接口内容信息 -->
    <el-form style="margin: 0 20px 0 20px;">
      <el-form-item label="接口地址" class="is-required">

        <!-- 请求方法选择器 -->
        <methodsSelectorView
          ref="methodsSelectorView"
          :method="tempApi.method"
          :busEmitEventName="$busEvents.api.apiMethodSelectorChoiceMethod"
        ></methodsSelectorView>

        <!-- 接口地址 -->
        <el-input
          v-model="tempApi.addr"
          class="input-with-select"
          placeholder="请输入接口地址"
          size="mini"
          style="width: 78%;margin-right: 5px">
        </el-input>

      </el-form-item>
    </el-form>

    <!-- 参数信息 -->
    <el-tabs style="margin: 0 20px 0 20px;" v-model="bodyShow">

      <!-- 头部信息 -->
      <el-tab-pane label="头部信息" name="headers">
        <!-- 使用示例 -->
        <el-collapse accordion>
          <el-collapse-item>
            <template slot="title">
              <div style="color:#409eff"> 点击查看说明</div>
            </template>
            <div style="margin-left: 20px">
              1、可用此功能设置当前接口的固定的头部参数，比如token、cookie <br/>
              2、在此处设置的值，在运行此接口的时候，会自动加到头部参数上 <br/>
              3、此处的value可以使用自定义函数处理/获取数据，比如用自定义函数取数据库获取对应的数据 <br/>
              4、若在此处设置了与服务的头部参数设置的同样的key，则会用此处设置的value
            </div>
          </el-collapse-item>
        </el-collapse>
        <headersView
          ref="headersView"
          :currentData="tempApi.headers"
          :placeholder-key="'key'"
          :placeholder-value="'value'"
          :placeholder-desc="'备注'"
        ></headersView>
      </el-tab-pane>

      <!-- 接口查询字符串信息 -->
      <el-tab-pane label="url参数" name="params">
        <queryStringView
          ref="queryStringView"
          :currentData="tempApi.params"
          :placeholder-key="'key'"
          :placeholder-value="'value'"
          :placeholder-desc="'备注'"
        ></queryStringView>
      </el-tab-pane>

      <!-- 请求体 -->
      <el-tab-pane label="请求体" name="body" :disabled="methodSelectorChoiceMethod === 'GET'">
        <bodyView
          ref="bodyView"
          :data-type="tempApi.data_type"
          :data-json="tempApi.data_json"
          :data-form="tempApi.data_form"
          :data-text="tempApi.data_text"
        ></bodyView>
      </el-tab-pane>

      <!-- 数据提取信息 -->
      <el-tab-pane label="数据提取" name="extracts">
        <extractsView
          ref="extractsView"
          :currentData="tempApi.extracts"
          :placeholder-key="'起个变量名'"
          :placeholder-value="'提取表达式'"
          :placeholder-desc="'备注'"
        ></extractsView>
      </el-tab-pane>

      <!-- 断言信息 -->
      <el-tab-pane label="断言" name="validates">
        <validatesView
          ref="validatesView"
          :validates="tempApi.validates"
        ></validatesView>
      </el-tab-pane>

    </el-tabs>

    <div class="demo-drawer__footer">

      <el-button
        slot="reference"
        size="mini"
        type="primary"
        style="float: left"
        :loading="isShowDebugLoading"
        @click="clickDebugApi()"
      >调试
      </el-button>

      <el-button size="mini" @click=" drawerIsShow = false"> {{ '取消' }}</el-button>
      <el-button
        type="primary"
        size="mini"
        :loading="isShowSubmitLoading"
        @click=" drawerType === 'update' ? changApi() : addApi() ">
        {{ '保存' }}
      </el-button>

    </div>

    <selectRunEnv
      :callBackEvent="callBackEvent"
      :event="runEvent"
    ></selectRunEnv>

  </el-drawer>

</template>

<script>
import projectSelectorView from "@/components/Selector/project";
import moduleSelectorView from "@/components/Selector/module";
import methodsSelectorView from "@/components/Selector/methods";
import headersView from '@/components/Inputs/changeRow'
import queryStringView from '@/components/Inputs/changeRow'
import bodyView from '@/components/apiBody'
import extractsView from '@/components/Inputs/extract'
import validatesView from '@/components/Inputs/validates'
import selectRunEnv from '@/components/selectRunEnv'  // 环境选择组件

import {postApi, putApi, runApi} from '@/apis/apiTest/api'
import {reportIsDone} from "@/apis/apiTest/report";
import {runTestTimeOutMessage} from "@/utils/message";
import {getModule} from "@/apis/apiTest/module";

export default {
  name: 'drawer',
  props: [
    'currentProjectId',
    'currentModuleId',
  ],
  components: {
    projectSelectorView,
    moduleSelectorView,
    methodsSelectorView,
    queryStringView,
    headersView,
    bodyView,
    extractsView,
    validatesView,
    selectRunEnv
  },
  data() {
    return {

      drawerIsShow: false, // 抽屉是否打开
      direction: 'rtl',  // 抽屉打开方式
      drawerType: '',  // title展示创建还是编辑

      // 请求方法选择组件选择的请求方法
      methodSelectorChoiceMethod: '',

      moduleTree: [],
      defaultProps: {
        children: "children",
        label: "name"
      },
      moduleLabel: '',

      // 是否展示请求接口时的等待状态
      isShowDebugLoading: false,

      isShowSubmitLoading: false,

      // 默认展示的tab页
      bodyShow: 'headers',

      // 接口新增/编辑临时数据
      tempApi: {
        id: '',
        name: '',
        desc: '',
        up_func: '',
        down_func: '',
        method: '',
        addr: '',
        time_out: 60,
        headers: [{key: null, value: null, remark: null}],
        params: [{key: null, value: null}],
        data_type: '',
        data_form: [{key: null, form_data_type: null, remark: null, value: null}],
        data_json: JSON.stringify({}),
        data_text: '',
        extracts: [{key: null, value: null, remark: null}],
        validates: [{key: null, value: null, validate_type: null, remark: null}],
        module_id: '',
        project_id: ''
      },

      runEvent: 'runApiEventOnDialog',
      callBackEvent: 'runApiOnDialog'
    }
  },

  methods: {

    // 勾选树事件
    handleNodeClick(data, checked, node) {
      if (checked && [data.id] !== this.$refs.moduleTree.getCheckedKeys()) {
        this.$refs.moduleTree.setCheckedKeys([data.id])  // 选中
        this.moduleLabel = data.name
      }
    },

    // 打开测试报告
    openReportById(reportId) {
      let {href} = this.$router.resolve({path: 'reportShow', query: {id: reportId}})
      window.open(href, '_blank')
    },

    // 调试api，先保存，走数据校验，再发送请求
    debugApi(runDict) {
      this.isShowDebugLoading = true
      if (this.tempApi.id) {
        putApi(this.getTempApi()).then(response => {
          this.isShowDebugLoading = false
          if (this.showMessage(this, response)) {
            this.$bus.$emit(this.$busEvents.api.apiApiDrawerCommitSuccess, 'success')
            this.runApis(runDict)
          }
        })
      } else {
        postApi(this.getTempApi()).then(response => {
          this.isShowDebugLoading = false
          if (this.showMessage(this, response)) {
            this.tempApi = response.data
            this.$bus.$emit(this.$busEvents.api.apiApiDrawerCommitSuccess, 'success')
            this.runApis(runDict)
          }
        })
      }
      this.drawerType = 'update'
    },

    clickDebugApi() {
      this.$bus.$emit(this.runEvent, false)
    },

    runApis(runDict) {
      this.isShowDebugLoading = true
      runApi({
        'projectId': this.tempApi.project_id,
        'apis': [this.tempApi.id],
        env: runDict.runEnv
      }).then(runResponse => {
        if (this.showMessage(this, runResponse)) {

          // 触发运行成功，每三秒查询一次，
          // 查询10次没出结果，则停止查询，提示用户去测试报告页查看
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
        } else {
          this.isShowDebugLoading = false
        }
      })
    },

    // 提交添加接口
    addApi() {
      this.isShowSubmitLoading = true
      postApi(this.getTempApi()).then(response => {
        this.isShowSubmitLoading = false
        if (this.showMessage(this, response)) {
          this.drawerIsShow = false
          this.$bus.$emit(this.$busEvents.api.apiApiDrawerCommitSuccess, 'success')
        }
      })
    },

    // 提交修改接口
    changApi() {
      this.isShowSubmitLoading = true
      putApi(this.getTempApi()).then(response => {
        this.isShowSubmitLoading = false
        if (this.showMessage(this, response)) {
          this.drawerIsShow = false
          this.$bus.$emit(this.$busEvents.api.apiApiDrawerCommitSuccess, 'success')
        }
      })
    },

    // 点击新增接口时，初始化 dialog 数据
    initNewTempApi() {
      this.tempApi.id = ''
      this.tempApi.name = ''
      this.tempApi.desc = ''
      this.tempApi.up_func = ''
      this.tempApi.down_func = ''
      this.tempApi.method = ''
      this.tempApi.addr = ''
      this.tempApi.time_out = 60
      this.tempApi.headers = [{key: null, value: null, remark: null}]
      this.tempApi.params = [{key: null, value: null}]
      this.tempApi.data_type = ''
      this.tempApi.data_form = [{key: null, data_type: null, remark: null, value: null}]
      this.tempApi.data_json = {}
      this.tempApi.data_text = ''
      this.tempApi.extracts = [{key: null, value: null, remark: null}]
      this.tempApi.validates = [{key: null, value: null, validate_type: null, remark: null}]
      this.tempApi.module_id = this.currentModuleId ? this.currentModuleId : ''
      this.tempApi.project_id = this.currentProjectId || ''
      this.drawerType = 'create'
      this.drawerIsShow = true
    },

    // 点击修改接口时，初始化 dialog 数据
    initUpdateTempApi(api) {
      this.tempApi = api
      this.drawerIsShow = true
    },

    // 获取 tempApi 用于提交数据
    getTempApi() {
      var json_data = this.$refs.bodyView.$refs.jsonEditorView.$refs.dataJsonView.tempDataJson
      return {
        id: this.tempApi.id,
        name: this.tempApi.name,
        desc: this.tempApi.desc,
        up_func: this.tempApi.up_func,
        down_func: this.tempApi.down_func,
        addr: this.tempApi.addr,
        time_out: this.tempApi.time_out,
        method: this.$refs.methodsSelectorView.tempMethod,
        headers: this.$refs.headersView.tempData,
        params: this.$refs.queryStringView.tempData,
        extracts: this.$refs.extractsView.tempData,
        validates: this.$refs.validatesView.tempValidates,
        data_type: this.$refs.bodyView.tempDataType,
        data_form: this.$refs.bodyView.$refs.dataFormView.tempDataForm,
        data_json: json_data ? JSON.parse(json_data) : {},
        data_text: this.$refs.bodyView.tempDataText,
        module_id: this.$refs.moduleTree.getCheckedKeys()[0],
        project_id: this.tempApi.project_id
      }
    }

  },

  mounted() {

    // 监听、接收模块树
    this.$bus.$on(this.$busEvents.api.apiModuleTreeIsDone, (moduleTree) => {
      this.moduleTree = moduleTree
    })

    // 监听请求方法选择器的选中事件
    this.$bus.$on(this.$busEvents.api.apiMethodSelectorChoiceMethod, (method) => {
      this.methodSelectorChoiceMethod = method
    })

    // 监听 接口编辑框命令事件
    this.$bus.$on(this.$busEvents.api.apiApiDrawerStatus, (command, api) => {
      if (command === 'add') {
        this.initNewTempApi()  // 新增
      } else if (command === 'edit') {
        this.initUpdateTempApi(api)  // 修改
        this.drawerType = 'update'
      } else if (command === 'copy') {
        this.initUpdateTempApi(api)  // 复制
        this.drawerType = 'add'
      }
    })

    this.$bus.$on(this.callBackEvent, (runDict) => {
      this.debugApi(runDict)
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.callBackEvent)
    this.$bus.$off(this.$busEvents.api.apiApiDrawerStatus)
    this.$bus.$off(this.$busEvents.api.apiModuleTreeIsDone)
    this.$bus.$off(this.$busEvents.api.apiMethodSelectorChoiceMethod)
  },

  watch: {

    // 监控父组件选中的服务, 实时获取对应的模块列表
    'currentProjectId': {
      deep: true,  // 深度监听
      handler(newVal, oldVal) {
        this.tempApi.project_id = newVal
      }
    },

    // 监控父组件选中的模块
    'currentModuleId': {
      deep: true,  // 深度监听
      handler(newVal, oldVal) {
        this.tempApi.module_id = newVal
      }
    },

    'drawerIsShow': {
      deep: true,
      handler(newVal, oldVal) {
        if (newVal) {
          getModule({'id': this.tempApi.module_id}).then(response => {
            this.moduleLabel = response.data.name
            this.$refs.moduleTree.setCheckedKeys([this.tempApi.module_id])
          })
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
