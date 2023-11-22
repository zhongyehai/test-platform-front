<template>
  <div>
    <el-drawer
      :title=" currentStep.id ? '修改步骤' : '新增步骤'"
      size="85%"
      :append-to-body="true"
      :visible.sync="drawerIsShow"
      :direction="direction"
      :wrapper-closable="false"
    >

      <el-tabs v-model="activeName" style="margin-left: 20px;margin-right: 20px">
        <!-- 步骤信息 -->
        <el-tab-pane label="步骤信息" name="editStepInfo">
          <el-form v-model="currentStep" label-width="120px">

            <el-form-item label="步骤名称" prop="name" size="small" class="is-required">
              <el-input v-model="currentStep.name" placeholder="步骤名称" />
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

            <el-form-item label="执行方式" prop="execute_type" size="small" class="is-required">
              <el-select
                ref="pageSelectorView"
                v-model="currentStep.execute_type"
                placeholder="选择执行方式"
                size="mini"
                style="min-width: 100%"
                filterable
                default-first-option
              >
                <el-option
                  v-for="(item) in $busEvents.data.executeTypeList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>

            <!-- 选择文件 -->
            <el-form-item
              v-show="currentStep.execute_type && currentStep.execute_type.indexOf('is_upload') !== -1"
              :label="'选择文件'"
              prop="send_keys"
              size="small"
              class="is-required"
            >
              <el-row>
                <el-col :span="20">
                  <el-input
                    v-model="currentStep.send_keys"
                    disabled
                    placeholder="选择文件"
                    style="width: 90%"
                  />
                </el-col>

                <el-col :span="4">
                  <el-button type="primary" size="mini" @click.native="openFileUploadDialog">上传文件</el-button>
                </el-col>
              </el-row>
            </el-form-item>

            <!-- 输入文本 -->
            <el-form-item
              v-show="currentStep.execute_type &&
                currentStep.execute_type.indexOf('keyboard') === -1 &&
                currentStep.execute_type.indexOf('is_input') !== -1"
              label="输入内容"
              prop="send_keys"
              size="small"
              class="is-required"
            >
              <el-input
                v-model="currentStep.send_keys"
                type="textarea"
                autosize
                :style="{'width': currentStep.execute_type.indexOf('scroll_coordinate') !== -1 ? '98%' : '100%'}"
                :placeholder="
                  currentStep.execute_type.indexOf('coordinate_is_input1') !== -1 ? placeholder1 :
                  currentStep.execute_type.indexOf('coordinate_is_input2') !== -1 ? placeholder2 : '输入对应内容'"
              />
              <el-popover
                v-show="currentStep.execute_type.indexOf('scroll_coordinate') !== -1"
                class="el_popover_class"
                placement="top-start"
                trigger="hover"
              >
                <div>从坐标x1,y1移动到x2,y2</div>
                <el-button slot="reference" type="text" icon="el-icon-question" />
              </el-popover>
            </el-form-item>

            <!-- 模拟键盘输入 -->
            <el-form-item
              v-show="currentStep.execute_type.indexOf('keyboard') !== -1"
              label="选择输入内容"
              prop="send_keys"
              size="mini"
              class="is-required"
            >
              <el-select
                ref="pageSelectorView"
                v-model="currentStep.send_keys"
                placeholder="选择输入内容"
                size="mini"
                style="min-width: 100%"
                filterable
                default-first-option
              >
                <el-option
                  v-for="(value, key) in $busEvents.data.keyboardKeyCodeList"
                  :key="key"
                  :label="value"
                  :value="key"
                />
              </el-select>
            </el-form-item>

            <el-row>
              <el-col :span="6">
                <el-form-item label="等待超时时间" class="is-required" style="margin-bottom: 5px">
                  <el-input-number v-model="currentStep.wait_time_out" size="mini" :min="2" />
                  <el-popover class="el_popover_class" placement="top-start" trigger="hover">
                    <div>
                      1、等待元素出现的超时时间，最少设置为2秒 <br>
                      2、若在此时间内，元素出现，则立即执行步骤，若超过此时间，元素仍未出现，则报错 <br>
                      3、若元素管理处已设置超时时间，以步骤处设置的为准
                    </div>
                    <el-button slot="reference" type="text" icon="el-icon-question" />
                  </el-popover>
                </el-form-item>
              </el-col>
              <el-col :span="6">
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
            :case-id="caseId"
            :project-id="projectId"
            :use-type="'step'"
          />
        </el-tab-pane>

        <!-- 元素信息，允许修改元素 -->
        <el-tab-pane label="元素信息" name="element">
          <el-form label-width="120px">

            <el-form-item label="元素归属" prop="elementFrom" size="small">
              <el-input v-model="currentElement.elementFrom" disabled />
            </el-form-item>

            <el-form-item :label="'定位方式'" prop="by" size="mini" class="is-required">
              <el-select
                v-model="currentElement.by"
                filterable
                default-first-option
                clearable
                size="mini"
                style="width:100%"
                placeholder="请选择定位方式"
              >
                <el-option
                  v-for="option in $busEvents.data.findElementOptionList"
                  :key="option.label"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="元素表达式" prop="element" class="is-required" size="small">
              <el-input v-model="currentElement.element" type="textarea" :rows="1" />
            </el-form-item>

          </el-form>
        </el-tab-pane>

        <!-- 数据提取 -->
        <el-tab-pane label="数据提取" name="editExtracts">
          <extractsView
            ref="extractsView"
            :current-data="currentStep.extracts"
            :temp-element-list="tempElementList"
            :placeholder-key="'起个变量名'"
            :placeholder-value="'提取数据的表达式'"
            :placeholder-desc="'备注'"
          />
        </el-tab-pane>

        <!-- 断言信息 -->
        <el-tab-pane label="断言" name="editAssert">
          <validatesView
            ref="validatesView"
            :data-type="'page'"
            :element-list="tempElementList"
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
          <!--        <jsonEditorView-->
          <!--          ref="dataDriverView"-->
          <!--          :data-json="currentStep.data_driver"-->
          <!--        ></jsonEditorView>-->
        </el-tab-pane>
      </el-tabs>

      <div class="demo-drawer__footer">

        <el-button
          v-show="activeName === 'element'"
          style="float: right; margin-left: 10px"
          size="mini"
          type="primary"
          :loading="submitButtonIsLoading"
          @click="changElement()"
        >{{ '保存元素修改' }}
        </el-button>

        <el-button
          v-show="activeName !== 'element'"
          style="float: right; margin-left: 10px"
          size="mini"
          type="primary"
          :loading="submitButtonIsLoading"
          @click="currentStep.id ? editStep() : addStep()"
        >{{ '保存步骤' }}
        </el-button>

        <el-button
          v-show="activeName !== 'element' && currentStep.id"
          style="float: left"
          size="mini"
          @click="rowBackStep()"
        > {{ '还原步骤' }}
        </el-button>
      </div>

      <uploadFileView />

    </el-drawer>

  </div>
</template>

<script>
import skipIfView from '@/components/Inputs/skipIf'
import extractsView from '@/components/uiTest/extract'
import uploadFileView from '@/components/file/uploadFile'
import validatesView from '@/components/Inputs/validates'

import { getProject as appUiGetProject } from '@/apis/appUiTest/project'
import { getPage as appUiGetPage } from '@/apis/appUiTest/page'
import {
  changeElementById as appUiChangeElementById,
  elementList as appUiElementList,
  getElement as appUiGetElement,
  putElement as appUiPutElement,
  elementFrom as appUiElementFrom
} from '@/apis/appUiTest/element'
import {
  executeList as appUiExecuteList,
  postStep as appUiPostStep,
  putStep as appUiPutStep
} from '@/apis/appUiTest/step'

import { getProject as webUiGetProject } from '@/apis/webUiTest/project'
import { getPage as webUiGetPage } from '@/apis/webUiTest/page'
import {
  changeElementById as webUiChangeElementById,
  elementList as webUiElementList,
  getElement as webUiGetElement,
  putElement as webUiPutElement,
  elementFrom as webUiElementFrom
} from '@/apis/webUiTest/element'
import {
  executeList as webUiExecuteList,
  postStep as webUiPostStep,
  putStep as webUiPutStep
} from '@/apis/webUiTest/step'
import oneColumnRow from '@/components/Inputs/oneColumnRow.vue'

export default {
  name: 'EditStep',
  components: {
    oneColumnRow,
    extractsView,
    validatesView,
    uploadFileView,
    skipIfView
  },
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'dataType', 'caseId', 'projectId'
  ],
  data() {
    return {
      drawerIsShow: false,
      direction: 'rtl', // 抽屉打开方式
      submitButtonIsLoading: false,
      activeName: 'editStepInfo',
      currentStepCopy: {},
      currentElement: {},
      tempElementList: [],
      currentStep: {
        'id': '',
        'status': '',
        'name': '',
        'wait_time_out': 3,
        'up_func': [],
        'down_func': [],
        'skip_if': {},
        'skip_on_fail': 1,
        'execute_type': '',
        'send_keys': '',
        'run_times': 0,
        'extracts': [],
        'validates': [],
        'data_driver': [],
        'case_id': this.caseId,
        'project_id': ''
      },

      placeholder1: '{"x1": 0.2, "y1": 0.7, "x2": 0.1, "y2": 0.4}，从当前中心坐标往4个方向移动的百分比', // 滑动屏幕的描述
      placeholder2: '{"x1": 500, "y1": 1000, "x2": 600, "y2": 1024}，坐标的具体值', // 滑动屏幕的描述

      getProjectUrl: '',
      getPageUrl: '',
      changeElementByIdUrl: '',
      elementListUrl: '',
      getElementUrl: '',
      putElementUrl: '',
      postStepUrl: '',
      putStepUrl: '',
      elementFromUrl: '',
      executeListUrl: ''
    }
  },

  mounted() {
    // 新增步骤（把元素转为步骤）
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, drawerType, step) => {
      if (_type === 'stepInfo') {
        this.currentElement = step

        if (drawerType === 'add') { // 新增步骤
          this.currentStep.id = ''
          this.currentStep.status = 1
          this.currentStep.name = step.name
          this.currentStep.wait_time_out = step.wait_time_out
          this.currentStep.up_func = []
          this.currentStep.down_func = []
          this.currentStep.execute_type = this.$busEvents.data.executeTypeList[1].value
          this.currentStep.send_keys = ''
          this.currentStep.run_times = 1
          this.currentStep.skip_on_fail = 1
          this.currentStep.extracts = []
          this.currentStep.validates = []
          this.currentStep.data_driver = []
          this.currentStep.case_id = this.caseId
          this.currentStep.page_id = this.currentElement.page_id
          this.currentStep.element_id = this.currentElement.id
          this.submitButtonIsLoading = false
          this.drawerIsShow = true
        } else if (drawerType === 'edit') { // 修改步骤
          // 获取元素信息
          this.getElementUrl({ id: step.element_id }).then(response => {
            this.currentElement = response.data

            // 获取当前步骤对应元素所在页面的所有元素
            this.elementListUrl({ pageId: this.currentElement.page_id }).then(response => {
              this.tempElementList = response.data.data
            })
          })
          this.currentStep = step
          this.currentStepCopy = JSON.parse(JSON.stringify(step)) // 深拷贝
          this.submitButtonIsLoading = false
          this.drawerIsShow = true
        }

        // 获取元素归属
        this.elementFromUrl({ id: this.currentStep.element_id }).then(response => {
          this.$set(this.currentElement, 'elementFrom', response.message)
        })
      }
    })

    // 上传文件后展示给前端
    this.$bus.$on(this.$busEvents.drawerIsCommit, (_type, status, file_name_list) => {
      if (_type === 'uploadFile') {
        this.currentStep.send_keys = file_name_list[0]
      }
    })

    // 如果是ui测试用例，则获取步骤执行方式
    if (this.dataType !== 'api') {
      if (!this.$busEvents.data.executeTypeList || this.$busEvents.data.executeTypeList.length === 0) {
        this.executeListUrl().then(response => {
          this.executeTypeList = response.data
          this.$busEvents.data.executeTypeList = response.data
          this.$busEvents.data.executeTypeList.forEach(executeType => {
            this.$busEvents.data.uiTestExecuteTypeDict[executeType.value] = executeType.label
          })
        })
      }
    }
  },

  created() {
    if (this.dataType === 'webUi') {
      this.getProjectUrl = webUiGetProject
      this.getPageUrl = webUiGetPage
      this.changeElementByIdUrl = webUiChangeElementById
      this.elementListUrl = webUiElementList
      this.getElementUrl = webUiGetElement
      this.putElementUrl = webUiPutElement
      this.postStepUrl = webUiPostStep
      this.putStepUrl = webUiPutStep
      this.elementFromUrl = webUiElementFrom
      this.executeListUrl = webUiExecuteList
    } else {
      this.getProjectUrl = appUiGetProject
      this.getPageUrl = appUiGetPage
      this.changeElementByIdUrl = appUiChangeElementById
      this.elementListUrl = appUiElementList
      this.getElementUrl = appUiGetElement
      this.putElementUrl = appUiPutElement
      this.postStepUrl = appUiPostStep
      this.putStepUrl = appUiPutStep
      this.elementFromUrl = appUiElementFrom
      this.executeListUrl = appUiExecuteList
    }
  },

  beforeDestroy() {
    // 页面销毁的时候，关闭bus监听选中事件
    this.$bus.$off(this.$busEvents.drawerIsShow)
    this.$bus.$off(this.$busEvents.drawerIsCommit)
  },

  methods: {

    getStepForCommit() {
      return {
        'id': this.currentStep.id,
        'status': this.currentStep.status,
        'name': this.currentStep.name,
        'wait_time_out': this.currentStep.wait_time_out,
        'up_func': this.$refs.upFuncInput.getData(),
        'down_func': this.$refs.downFuncInput.getData(),
        'skip_if': this.$refs.skipIfView.tempData,
        'skip_on_fail': this.currentStep.skip_on_fail,
        'run_times': this.currentStep.run_times,
        'execute_type': this.currentStep.execute_type,
        'send_keys': this.currentStep.send_keys,
        'extracts': this.$refs.extractsView.tempData,
        'validates': this.$refs.validatesView.tempData,
        'quote_case': null,
        'case_id': this.currentStep.case_id,
        'element_id': this.currentElement.id,
        'page_id': this.currentElement.page_id,
        'project_id': this.currentStep.project_id
      }
    },

    // 新增步骤信息
    addStep() {
      this.submitButtonIsLoading = true
      this.postStepUrl(this.getStepForCommit()).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.drawerIsCommit, 'stepInfo') // 重新请求步骤列表
          this.drawerIsShow = false
        }
      })
    },

    // 修改步骤信息
    editStep() {
      this.submitButtonIsLoading = true
      this.putStepUrl(this.getStepForCommit()).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.drawerIsCommit, 'stepInfo') // 重新请求步骤列表
          this.drawerIsShow = false
        }
      })
    },

    // 修改元素
    changElement() {
      this.submitButtonIsLoading = true
      this.changeElementByIdUrl({
        id: this.currentStep.element_id,
        by: this.currentElement.by,
        element: this.currentElement.element
      }).then(response => {
        this.submitButtonIsLoading = false
        this.showMessage(this, response)
      })
    },

    // 打开文件上传窗口
    openFileUploadDialog() {
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'uploadFile')
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
