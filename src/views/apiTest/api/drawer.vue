<template>
  <!-- 新增/修改接口表单 -->
  <el-drawer
    :title=" drawerType === 'update' ? '修改接口' : '新增接口'"
    :visible.sync="drawerIsShow"
    :direction="direction"
    size="85%"
  >
    <!-- 接口所属信息 -->
    <el-form style="margin-left: 20px;margin-right: 20px" label-width="100px">

      <el-row>

        <!-- 接口名称 -->
        <el-col :span="9">
          <el-form-item label="接口名称" class="is-required" style="margin-bottom: 5px">
            <el-input v-model="tempApi.name" placeholder="接口名称" size="mini" />
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
                />
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <!-- 接口超时时间 -->
        <el-col :span="6">
          <el-form-item label="超时时间" class="is-required" style="margin-bottom: 5px">
            <el-input-number v-model="tempApi.time_out" size="mini" :min="5" />
            <el-popover class="el_popover_class" placement="top-start" trigger="hover">
              <div>发送request请求时，等待回调的超时时间，最少设置为5秒</div>
              <el-button slot="reference" type="text" icon="el-icon-question" />
            </el-popover>
          </el-form-item>
        </el-col>

      </el-row>

      <!-- 前置条件 -->
      <el-row>
        <el-form-item label="前置条件" prop="up_func" style="margin-bottom: 5px">
          <el-input
            v-model="tempApi.up_func"
            type="textarea"
            autosize
            style="width: 98%"
            placeholder="前置处理函数，多个时用英文的 分号 ' ; ' 分隔"
            size="mini"
          />
          <el-popover class="el_popover_class" placement="top-start" trigger="hover">
            <div>在运行接口之前要做的一些前置操作，使用自定义函数的形式实现</div>
            <el-button slot="reference" type="text" icon="el-icon-question" />
          </el-popover>
        </el-form-item>
      </el-row>

      <!-- 后置条件 -->
      <el-row>
        <el-form-item label="后置条件" prop="down_func" style="margin-bottom: 5px">
          <el-input
            v-model="tempApi.down_func"
            type="textarea"
            autosize
            style="width: 98%"
            placeholder="后置处理函数，多个时用英文的 分号 ' ; ' 分隔"
            size="mini"
          />
          <el-popover class="el_popover_class" placement="top-start" trigger="hover">
            <div>在运行接口之后要做的一些后置操作，使用自定义函数的形式实现</div>
            <el-button slot="reference" type="text" icon="el-icon-question" />
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
        />

        <!-- 接口地址 -->
        <el-input
          v-model="tempApi.addr"
          class="input-with-select"
          placeholder="请输入接口地址"
          size="mini"
          style="width: 76%;margin-right: 5px"
          @change="changeUrl"
        />

      </el-form-item>
    </el-form>

    <!-- 参数信息 -->
    <el-tabs v-model="bodyShow" style="margin: 0 20px 0 20px;">

      <!-- 头部信息 -->
      <el-tab-pane label="头部信息" name="headers">
        <el-tooltip slot="label" class="item-tabs" effect="light" placement="top">
          <div slot="content">
            1、可用此功能设置当前接口的固定的头部参数，比如token、cookie <br>
            2、在此处设置的值，在运行此接口的时候，会自动加到头部参数上 <br>
            3、此处的value可以使用自定义函数处理/获取数据，比如用自定义函数取数据库获取对应的数据 <br>
            4、若在此处设置了与服务的头部参数设置的同样的key，则会用此处设置的value
          </div>
          <span>头部信息</span>
        </el-tooltip>
        <headersView
          ref="headersView"
          :current-data="tempApi.headers"
          :placeholder-key="'key'"
          :placeholder-value="'value'"
          :placeholder-desc="'备注'"
        />
      </el-tab-pane>

      <!-- 接口查询字符串信息 -->
      <el-tab-pane label="url参数" name="params">
        <queryStringView
          ref="queryStringView"
          :current-data="tempApi.params"
          :placeholder-key="'key'"
          :placeholder-value="'value'"
          :placeholder-desc="'备注'"
          :bus-event-name="busEventName"
        />
      </el-tab-pane>

      <!-- 请求体 -->
      <el-tab-pane label="请求体" name="body" :disabled="methodSelectorChoiceMethod === 'GET'">
        <bodyView
          ref="bodyView"
          :data-type="tempApi.data_type"
          :data-json="tempApi.data_json"
          :data-form="tempApi.data_form"
          :data-urlencoded="tempApi.data_urlencoded"
          :data-text="tempApi.data_text"
        />
      </el-tab-pane>

      <!-- 数据提取信息 -->
      <el-tab-pane label="数据提取" name="extracts">
        <extractsView
          ref="extractsView"
          :current-data="tempApi.extracts"
          :placeholder-key="'起个变量名'"
          :placeholder-value="'提取表达式'"
          :placeholder-desc="'备注'"
        />
      </el-tab-pane>

      <!-- 断言信息 -->
      <el-tab-pane label="断言" name="validates">
        <validatesView
          ref="validatesView"
          :data-type="'api'"
          :element-list="[]"
          :validates="tempApi.validates"
        />
      </el-tab-pane>

      <!-- 响应信息 -->
      <el-tab-pane label="响应对象" name="response">
        <JsonViewer
          :value="strToJson(tempApi.response)"
          :expand-depth="5"
          copyable
        />
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
        @click="debugApi()"
      >运行
      </el-button>

      <el-button size="mini" @click=" drawerIsShow = false"> {{ '取消' }}</el-button>
      <el-button
        type="primary"
        size="mini"
        :loading="isShowSubmitLoading"
        @click=" drawerType === 'update' ? changApi() : addApi() "
      >
        {{ '保存' }}
      </el-button>

    </div>

  </el-drawer>

</template>

<script>
import JsonViewer from 'vue-json-viewer'

import methodsSelectorView from '@/components/Selector/methods'
import headersView from '@/components/Inputs/changeRow'
import queryStringView from '@/components/Inputs/changeRow'
import bodyView from '@/components/apiBody'
import extractsView from '@/components/Inputs/extract'
import validatesView from '@/components/Inputs/validates'
import pythonScriptIndex from '@/views/assist/script/index.vue'

import { postApi, putApi, runApi } from '@/apis/apiTest/api'
import { getModule } from '@/apis/apiTest/module'
import { paramsListToStr } from '@/utils/parseData'
import { assertStrIsJson } from '@/utils/validate'

export default {
  name: 'Drawer',
  components: {
    pythonScriptIndex,
    JsonViewer,
    methodsSelectorView,
    queryStringView,
    headersView,
    bodyView,
    extractsView,
    validatesView
  },
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'currentProjectId', 'currentModuleId'
  ],
  data() {
    return {

      drawerIsShow: false, // 抽屉是否打开
      direction: 'rtl', // 抽屉打开方式
      drawerType: '', // title展示创建还是编辑
      methodSelectorChoiceMethod: '', // 请求方法选择组件选择的请求方法

      moduleTree: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      moduleLabel: '',
      isShowDebugLoading: false, // 是否展示请求接口时的等待状态
      isShowSubmitLoading: false,
      bodyShow: 'headers', // 默认展示的tab页

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
        headers: [{ key: null, value: null, remark: null }],
        params: [{ key: null, value: null }],
        data_type: '',
        data_form: [],
        data_json: JSON.stringify({}),
        data_urlencoded: JSON.stringify({}),
        data_text: '',
        extracts: [{ key: null, value: null, remark: null }],
        validates: [{ key: null, value: null, validate_type: 'data', remark: null }],
        response: {},
        module_id: '',
        project_id: ''
      },
      busEventName: 'param'
    }
  },

  watch: {

    // 监控父组件选中的服务, 实时获取对应的模块列表
    'currentProjectId': {
      deep: true, // 深度监听
      handler(newVal, oldVal) {
        this.tempApi.project_id = newVal
      }
    },

    // 监控父组件选中的模块
    'currentModuleId': {
      deep: true, // 深度监听
      handler(newVal, oldVal) {
        this.tempApi.module_id = newVal
      }
    },

    'drawerIsShow': {
      deep: true,
      handler(newVal, oldVal) {
        if (newVal) {
          getModule({ 'id': this.tempApi.module_id }).then(response => {
            this.moduleLabel = response.data.name
            this.$refs.moduleTree.setCheckedKeys([this.tempApi.module_id])
          })
        }
      }
    }
  },

  mounted() {
    // 监听、接收模块树
    this.$bus.$on(this.$busEvents.treeIsDone, (_type, moduleTree) => {
      if (_type === 'module') {
        this.moduleTree = moduleTree
      }
    })

    // 监听请求方法选择器的选中事件
    this.$bus.$on(this.$busEvents.selectorChoice, (_type, method) => {
      if (_type === 'method') {
        this.methodSelectorChoiceMethod = method
      }
    })

    // 监听 接口编辑框命令事件
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, command, api, isShowFrom) => {
      if (_type === 'apiInfo') {
        if (command === 'add') {
          this.initNewTempApi() // 新增
        } else if (command === 'edit') {
          this.initUpdateTempApi(api) // 修改
          this.drawerType = 'update'
        } else if (command === 'copy') {
          this.initUpdateTempApi(api) // 复制
          this.drawerType = 'add'
        }

        if (isShowFrom) { // 查看接口详情打开的编辑框
          this.moduleTree = [{ id: api.module_id, name: this.moduleLabel }]
        }
      }
    })

    this.$bus.$on(this.$busEvents.drawerIsCommit, (_type, _runUnit, runDict) => {
      if (_type === 'selectRunEnv' && _runUnit === 'apiDrawer') {
        this.runApis(runDict)
      }
    })

    this.$bus.$on(this.$busEvents.changeData, (_type, param) => {
      if (_type === this.busEventName) {
        this.paramsToStr(param)
      }
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.changeData)
    this.$bus.$off(this.$busEvents.drawerIsShow)
    this.$bus.$off(this.$busEvents.treeIsDone)
    this.$bus.$off(this.$busEvents.selectorChoice)
  },

  methods: {

    // 修改url,如果是包含了查询字符串，则自动解析
    changeUrl(value) {
      const queryStr = value.split('?')[1]

      if (queryStr) {
        const queryStrParam = queryStr.split('&')

        const newParam = []
        for (let i = 0; i < queryStrParam.length; i++) {
          const param = queryStrParam[i]
          const [key, value] = param.split('=')

          if (key) {
            newParam.push({ 'id': i, 'key': key, 'value': value, 'remark': null, 'data_type': 'str' })
          }
        }
        if (newParam.length > 0) {
          this.tempApi.params = newParam
        }
      }
    },

    // 初始化解析查询字符串参数
    paramsToStr(paramsList) {
      this.tempApi.addr = this.tempApi.addr.split('?')[0] + paramsListToStr(paramsList)
    },

    // 解析字符串为json
    strToJson(str) {
      try {
        return JSON.parse(str)
      } catch (err) {
        return str
      }
    },

    // 勾选树事件
    handleNodeClick(data, checked, node) {
      if (checked && [data.id] !== this.$refs.moduleTree.getCheckedKeys()) {
        this.$refs.moduleTree.setCheckedKeys([data.id]) // 选中
        this.moduleLabel = data.name
      }
    },

    // 调试api，先保存，走数据校验，再发送请求
    debugApi() {
      this.isShowDebugLoading = true
      if (this.tempApi.id) {
        putApi(this.getTempApi()).then(response => {
          this.isShowDebugLoading = false
          if (this.showMessage(this, response)) {
            this.drawerIsCommit(true)
            this.$bus.$emit(this.$busEvents.drawerIsShow, 'selectRunEnv', 'apiDrawer', false)
          }
        })
      } else {
        postApi(this.getTempApi()).then(response => {
          this.isShowDebugLoading = false
          if (this.showMessage(this, response)) {
            this.tempApi = response.data
            this.drawerIsCommit(true)
            this.$bus.$emit(this.$busEvents.drawerIsShow, 'selectRunEnv', 'apiDrawer', false)
          }
        })
      }
      this.drawerType = 'update'
    },

    runApis(runConf) {
      this.isShowDebugLoading = true
      runApi({
        'projectId': this.tempApi.project_id,
        'apis': [this.tempApi.id],
        env_list: runConf.runEnv
      }).then(response => {
        this.isShowDebugLoading = false
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.drawerIsShow, 'process', response.data.batch_id)
        } else {
          this.isShowDebugLoading = false
        }
      })
    },

    // 提交添加接口
    addApi() {
      const api_data = this.getTempApi()
      this.isShowSubmitLoading = true
      postApi(api_data).then(response => {
        this.isShowSubmitLoading = false
        if (this.showMessage(this, response)) {
          this.drawerIsCommit()
        }
      })
    },

    // 提交修改接口
    changApi() {
      const api_data = this.getTempApi()
      this.isShowSubmitLoading = true
      putApi(api_data).then(response => {
        this.isShowSubmitLoading = false
        if (this.showMessage(this, response)) {
          this.drawerIsCommit()
        }
      })
    },

    drawerIsCommit(drawerIsShow) {
      this.drawerIsShow = drawerIsShow
      this.$bus.$emit(this.$busEvents.drawerIsCommit, 'apiInfo')
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
      this.tempApi.headers = [{ key: null, value: null, remark: null }]
      this.tempApi.params = [{ key: null, value: null }]
      this.tempApi.data_type = ''
      this.tempApi.data_form = []
      this.tempApi.data_json = {}
      this.tempApi.data_urlencoded = {}
      this.tempApi.data_text = ''
      this.tempApi.response = {}
      this.tempApi.extracts = [{ key: null, value: null, remark: null }]
      this.tempApi.validates = [{ key: null, value: null, validate_type: 'data', remark: null }]
      this.tempApi.module_id = this.currentModuleId ? this.currentModuleId : ''
      this.tempApi.project_id = this.currentProjectId || ''
      this.drawerType = 'create'
      this.drawerIsShow = true
    },

    // 点击修改接口时，初始化 dialog 数据
    initUpdateTempApi(api) {
      this.tempApi = api
      this.paramsToStr(this.tempApi.params)
      this.drawerIsShow = true
    },

    // 获取 tempApi 用于提交数据
    getTempApi() {
      var json_data = this.$refs.bodyView.$refs.jsonEditorView.$refs.dataJsonView.tempDataJson
      assertStrIsJson(json_data, 'json请求体格式错误')
      var data_urlencoded = this.$refs.bodyView.$refs.urlencodedEditorView.$refs.dataJsonView.tempDataJson
      assertStrIsJson(data_urlencoded, 'form-urlencoded请求体格式错误')
      return {
        id: this.tempApi.id,
        name: this.tempApi.name,
        desc: this.tempApi.desc,
        up_func: this.tempApi.up_func,
        down_func: this.tempApi.down_func,
        addr: this.tempApi.addr.split('?')[0],
        time_out: this.tempApi.time_out,
        method: this.$refs.methodsSelectorView.tempMethod,
        headers: this.$refs.headersView.tempData,
        params: this.$refs.queryStringView.tempData,
        extracts: this.$refs.extractsView.tempData,
        validates: this.$refs.validatesView.tempData,
        // response: this.tempApi.response,
        data_type: this.$refs.bodyView.tempDataType,
        data_form: this.$refs.bodyView.$refs.dataFormView.tempData,
        data_json: json_data ? JSON.parse(json_data) : {},
        data_urlencoded: data_urlencoded ? JSON.parse(data_urlencoded) : {},
        data_text: this.$refs.bodyView.tempDataText,
        module_id: this.$refs.moduleTree.getCheckedKeys()[0],
        project_id: this.tempApi.project_id
      }
    }

  }
}
</script>

<style scoped>

</style>
