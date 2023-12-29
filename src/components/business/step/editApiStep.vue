<template>

  <el-drawer
    :title=" drawerType === 'update' ? '修改步骤' : '新增步骤'"
    size="85%"
    :append-to-body="true"
    :visible.sync="drawerIsShow"
    :direction="direction"
    :wrapper-closable="false"
  >
    <el-tabs v-show="currentStep.api_id" v-model="activeName" style="margin-left: 20px;margin-right: 20px">
      <!-- 步骤信息 -->
      <el-tab-pane label="步骤信息" name="editStepInfo">
        <el-form label-width="120px">

          <el-form-item label="步骤名称" prop="name" size="small" class="is-required">
            <el-input v-model="currentStep.name" placeholder="步骤名称" />
          </el-form-item>

          <el-form-item label="所属接口" prop="apiFrom" size="small">
            <el-input v-model="currentStep.apiFrom" disabled />
          </el-form-item>

          <el-form-item label="请求方法" prop="name" size="small">
            <el-input v-model="currentStep.method" disabled />
          </el-form-item>

          <el-form-item label="接口地址" prop="name" size="small">
            <el-input v-model="currentStep.addr" disabled />
          </el-form-item>

          <el-row>
            <el-col :span="12">
              <el-form-item label="前置处理" size="small">
                <template slot="label">
                  <span> 前置处理 </span>
                  <el-tooltip class="item" effect="dark" placement="top-start">
                    <div slot="content">在运行步骤之前要做的一些前置操作，使用自定义函数的形式实现</div>
                    <span><i style="color: #409EFF" class="el-icon-question" /></span>
                  </el-tooltip>
                </template>
                <oneColumnRow ref="upFuncInput" :current-data="currentStep.up_func" />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="后置处理" size="small">
                <template slot="label">
                  <span> 后置处理 </span>
                  <el-tooltip class="item" effect="dark" placement="top-start">
                    <div slot="content">在运行步骤之后要做的一些后置操作，使用自定义函数的形式实现</div>
                    <span><i style="color: #409EFF" class="el-icon-question" /></span>
                  </el-tooltip>
                </template>
                <oneColumnRow ref="downFuncInput" :current-data="currentStep.down_func" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="执行次数" class="is-required">
                <el-input-number
                  v-model="currentStep.run_times"
                  size="mini"
                  :precision="0"
                  :min="1"
                  :max="1000"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form label-width="200px">
                <el-form-item label="是否使用用例所在项目的域名">
                  <el-switch v-model="currentStep.replace_host" :active-value="1" :inactive-value="0" />
                  <el-popover class="el_popover_class" placement="top-start" trigger="hover">
                    <div>解析当前步骤时，若此项为激活状态，则使用用例所在服务的域名，否则使用步骤对应接口所在服务的域名</div>
                    <el-button slot="reference" type="text" icon="el-icon-question" />
                  </el-popover>
                </el-form-item>
              </el-form>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="超时时间">
                <el-input-number
                  v-model="currentStep.time_out"
                  size="mini"
                  :min="5"
                />
                <el-popover class="el_popover_class" placement="top-start" trigger="hover">
                  <div>发送request请求时，等待回调的超时时间，最少设置为5秒</div>
                  <el-button slot="reference" type="text" icon="el-icon-question" />
                </el-popover>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form label-width="200px">
                <el-form-item label="当有步骤失败时跳过当前步骤">
                  <el-switch v-model="currentStep.skip_on_fail" :active-value="1" :inactive-value="0" />
                  <el-popover class="el_popover_class" placement="top-start" trigger="hover">
                    <div>当前用例执行时，当前步骤之前的步骤出现失败/错误的情况，是否跳过当前步骤</div>
                    <el-button slot="reference" type="text" icon="el-icon-question" />
                  </el-popover>
                </el-form-item>
              </el-form>
            </el-col>
          </el-row>

        </el-form>
      </el-tab-pane>

      <!-- 跳过条件 -->
      <el-tab-pane label="跳过条件" name="editSkipIf">
        <skipIfView
          ref="skipIfView"
          :data-type="dataType"
          :skip-if-data="currentStep.skip_if"
          :project-id="projectId"
          :use-type="'step'"
        />
      </el-tab-pane>

      <!-- 头部信息 -->
      <el-tab-pane name="editHeaders">
        <template slot="label">
          <span> 头部信息 </span>
          <el-tooltip class="item" effect="dark" placement="top-start">
            <div slot="content">
              1、可用此功能设置当前接口的固定的头部参数，比如token、cookie <br>
              2、在此处设置的值，在运行此接口的时候，会自动加到头部参数上 <br>
              3、此处的value可以使用自定义函数处理/获取数据，比如用自定义函数取数据库获取对应的数据 <br>
              4、若在此处设置了与服务的头部参数设置的同样的key，则会用此处设置的value
            </div>
            <span><i style="color: #409EFF" class="el-icon-question" /></span>
          </el-tooltip>
        </template>

        <el-tabs v-model="headersActiveName" style="margin-left: 20px;margin-right: 20px">
          <el-tab-pane label="设置要发送的头部参数" name="setHeaders">
            <headersView
              ref="headersView"
              :current-data="currentStep.headers"
              :placeholder-key="'字段名'"
              :placeholder-value="'字段值'"
              :placeholder-desc="'备注'"
            />
          </el-tab-pane>

          <el-tab-pane name="delHeaders">
            <template slot="label">
              <span> 设置要去除的头部参数 </span>
              <el-tooltip class="item" effect="dark" placement="top-start">
                <div slot="content">
                  1、如果要去除在全局、用例、或者步骤执行过程中设置的头部参数，在此处设置对应的key即可 <br>
                  2、此处设置只对此步骤有效，不会影响其他步骤
                </div>
                <span><i style="color: #409EFF" class="el-icon-question" /></span>
              </el-tooltip>
            </template>
            <oneColumnRow
              ref="popHeaderFiledInput"
              :current-data="currentStep.pop_header_filed"
            />
          </el-tab-pane>
        </el-tabs>

      </el-tab-pane>

      <!-- url参数 -->
      <el-tab-pane label="url参数" name="editParams">
        <paramsView
          ref="paramsView"
          :current-data="currentStep.params"
          :placeholder-key="'字段名'"
          :placeholder-value="'字段值'"
          :placeholder-desc="'备注'"
        />
      </el-tab-pane>

      <!-- 请求体 -->
      <el-tab-pane label="请求体" name="editBody">
        <bodyView
          ref="bodyView"
          :body-type="currentStep.body_type"
          :data-json="currentStep.data_json"
          :data-form="currentStep.data_form"
          :data-urlencoded="currentStep.data_urlencoded"
          :data-text="currentStep.data_text"
        />
      </el-tab-pane>

      <!-- 数据提取 -->
      <el-tab-pane label="数据提取" name="editExtracts">
        <extractsView
          ref="extractsView"
          :current-data="currentStep.extracts"
          :placeholder-key="'起个变量名'"
          :placeholder-value="'提取数据的表达式'"
          :placeholder-desc="'备注'"
        />
      </el-tab-pane>

      <!-- 断言信息 -->
      <el-tab-pane label="断言" name="editAssert">
        <validatesView
          ref="validatesView"
          :data-type="'api'"
          :element-list="[]"
          :validates="currentStep.validates"
        />
      </el-tab-pane>

      <!-- 数据驱动 -->
      <el-tab-pane label="数据驱动" name="editDataDriver">
        <!-- 使用示例 -->
        <el-collapse accordion>
          <el-collapse-item>
            <template slot="title">
              <div style="color:#409eff"> 点击查看示例</div>
            </template>
            <div style="margin-left: 20px">
              列表嵌套字典，每一个字典就是一组请求数据，请求格式为
              <pre>
  [
    {
      "comment": "用例1描述",
      "data": "请求数据，支持自定义变量和自定义函数"
    },
    {
      "comment": "用例2描述",
      "data": "请求数据，支持自定义变量和自定义函数"
    }
  ]
              </pre>
            </div>
          </el-collapse-item>
        </el-collapse>
        <jsonEditorView
          ref="dataDriverView"
          :data-json="currentStep.data_driver"
        />
      </el-tab-pane>

    </el-tabs>

    <div class="demo-drawer__footer">
      <el-button
        style="float: right; margin-left: 10px"
        size="mini"
        type="primary"
        :loading="submitButtonIsLoading"
        @click="currentStep.id ? editStep() : addStep()"
      >{{ '保存步骤' }}
      </el-button>

      <el-button
        v-show="currentStep.id"
        style="float: left"
        size="mini"
        @click="rowBackStep()"
      > {{ '还原步骤' }}
      </el-button>
    </div>

  </el-drawer>
</template>

<script>

import skipIfView from '@/components/Inputs/skipIf'
import headersView from '@/components/Inputs/changeRow'
import paramsView from '@/components/Inputs/changeRow'
import bodyView from '@/components/apiBody'
import jsonEditorView from '@/components/jsonView'
import extractsView from '@/components/Inputs/extract'
import validatesView from '@/components/Inputs/validates'

import { postStep, putStep } from '@/apis/apiTest/step'
import { getApi, apiMsgBelongTo } from '@/apis/apiTest/api'
import { assertStrIsJson } from '@/utils/validate'
import oneColumnRow from '@/components/Inputs/oneColumnRow.vue'

export default {
  name: 'EditStep',
  components: {
    oneColumnRow,
    skipIfView,
    headersView,
    paramsView,
    bodyView,
    jsonEditorView,
    extractsView,
    validatesView
  },
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'dataType', 'caseId', 'projectId'
  ],
  data() {
    return {
      drawerIsShow: false,
      drawerType: 'add',
      direction: 'rtl', // 抽屉打开方式
      submitButtonIsLoading: false,
      activeName: 'editStepInfo',
      headersActiveName: 'setHeaders',
      currentStepCopy: '',
      currentStep: {
        'id': '',
        'status': '',
        'replace_host': 0,
        'name': '',
        'time_out': 60,
        'up_func': [],
        'down_func': [],
        'skip_if': {
          skip_type: null,
          data_source: null,
          expect: null,
          comparator: null,
          body_type: null,
          check_value: null
        },
        'skip_on_fail': 1,
        'pop_header_filed': '',
        'run_times': 0,
        'headers': [],
        'params': [],
        'extracts': [],
        'validates': [],
        'body_type': 'json',
        'data_form': [],
        'data_json': {},
        'data_urlencoded': {},
        'data_text': '',
        'data_driver': [],
        'case_id': this.caseId,
        'api_id': ''
      },

      validateTypeList: [],
      dataTypeMapping: []
    }
  },

  mounted() {
    this.validateTypeList = this.$busEvents.data.apiTestAssertMappingList
    this.dataTypeMapping = this.$busEvents.data.dataTypeMappingList

    // 新增/编辑步骤
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, drawerType, step) => {
      if (_type === 'stepInfo') {
        if (drawerType === 'edit') { // 修改
          // 获取接口的地址和请求方法
          getApi({ id: step.api_id }).then(response => {
            this.$set(this.currentStep, 'addr', response.data.addr)
            this.$set(this.currentStep, 'method', response.data.method)
          })

          // 获取接口的所属信息
          apiMsgBelongTo({ id: step.api_id }).then(response => {
            this.$set(this.currentStep, 'apiFrom', response.data[0].from)
          })

          this.currentStep = step
          this.currentStepCopy = JSON.parse(JSON.stringify(step)) // 深拷贝
          this.drawerType = 'update'
          this.drawerIsShow = true
        } else { // 新增
          step.case_id = this.caseId
          this.currentStep = JSON.parse(JSON.stringify(step)) // 深拷贝
          this.currentStep.replace_host = 0
          this.currentStep.skip_on_fail = 1
          this.currentStep.pop_header_filed = ''

          // 获取接口的所属信息
          apiMsgBelongTo({ id: step.api_id }).then(response => {
            this.$set(this.currentStep, 'apiFrom', response.message)
          })

          this.currentStepCopy = JSON.parse(JSON.stringify(this.currentStep)) // 深拷贝
          this.drawerType = 'add'
          this.submitButtonIsLoading = false
          this.drawerIsShow = true
        }
      }
    })
  },

  // 页面销毁的时候，关闭bus监听选中事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsShow)
  },
  methods: {

    getStepForCommit() {
      const json_data = this.$refs.bodyView.$refs.jsonEditorView.$refs.dataJsonView.tempDataJson
      assertStrIsJson(json_data, 'json请求体格式错误')
      const data_urlencoded = this.$refs.bodyView.$refs.urlencodedEditorView.$refs.dataJsonView.tempDataJson
      assertStrIsJson(data_urlencoded, 'form-urlencoded请求体格式错误')
      const data_driver = this.$refs.dataDriverView.$refs.dataJsonView.tempDataJson
      assertStrIsJson(data_driver, '数据驱动格式错误')
      const skip_if = this.$refs.skipIfView.tempData
      const pop_header_filed = this.$refs.popHeaderFiledInput.getData()
      return {
        'id': this.currentStep.id,
        'status': this.currentStep.status,
        'replace_host': this.currentStep.replace_host,
        'name': this.currentStep.name,
        'time_out': this.currentStep.time_out,
        'up_func': this.$refs.upFuncInput.getData(),
        'down_func': this.$refs.downFuncInput.getData(),
        'skip_if': skip_if,
        'skip_on_fail': this.currentStep.skip_on_fail,
        'pop_header_filed': pop_header_filed,
        'run_times': this.currentStep.run_times,
        'headers': this.$refs.headersView.tempData,
        'params': this.$refs.paramsView.tempData,
        'extracts': this.$refs.extractsView.tempData,
        'validates': this.$refs.validatesView.tempData,
        'body_type': this.$refs.bodyView.tempBodyType,
        'data_form': this.$refs.bodyView.$refs.dataFormView.tempData,
        'data_json': json_data ? JSON.parse(json_data) : {},
        'data_urlencoded': data_urlencoded ? JSON.parse(data_urlencoded) : {},
        'data_text': this.$refs.bodyView.tempDataText,
        'data_driver': data_driver ? JSON.parse(data_driver) : [],
        'quote_case': null,
        'case_id': this.currentStep.case_id ? this.currentStep.case_id : this.caseId,
        'api_id': this.currentStep.api_id
      }
    },

    // 新增步骤信息
    addStep() {
      const data = this.getStepForCommit()
      this.submitButtonIsLoading = true
      postStep(data).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.drawerIsCommit, 'stepInfo') // 重新请求步骤列表
          this.drawerIsShow = false
        }
      })
    },

    // 修改步骤信息
    editStep() {
      const data = this.getStepForCommit()
      this.submitButtonIsLoading = true
      putStep(data).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.drawerIsCommit, 'stepInfo') // 重新请求步骤列表
          this.drawerIsShow = false
        }
      })
    },

    // 取消保存
    rowBackStep() {
      this.currentStep = this.currentStepCopy
    }

  }
}
</script>

<style scoped>

</style>
