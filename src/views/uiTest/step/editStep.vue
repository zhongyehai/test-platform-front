<template>
  <div>
    <el-drawer
      :title=" currentStep.id ? '修改步骤' : '新增步骤'"
      size="70%"
      :append-to-body="true"
      :wrapperClosable="false"
      :visible.sync="drawerIsShow"
      :direction="direction">
      <!--    <el-tabs v-model="activeName" v-show="currentStep.api_id" style="margin-left: 20px;margin-right: 20px">-->
      <el-tabs v-model="activeName" style="margin-left: 20px;margin-right: 20px">
        <!-- 步骤信息 -->
        <el-tab-pane label="步骤信息" name="editStepInfo">
          <el-form label-width="120px" v-model="currentStep">

            <el-form-item label="步骤名称" prop="name" size="small" class="is-required">
              <el-input v-model="currentStep.name" placeholder="步骤名称"></el-input>
            </el-form-item>

            <el-form-item label="前置处理" size="small">
              <el-input
                type="textarea"
                autosize
                v-model="currentStep.up_func"
                placeholder="前置处理函数，多个时用英文的 分号 ' ; ' 分隔"></el-input>
            </el-form-item>

            <el-form-item label="后置处理" size="small">
              <el-input
                type="textarea"
                autosize
                v-model="currentStep.down_func"
                placeholder="后置处理函数，多个时用英文的 分号 ' ; ' 分隔"></el-input>
            </el-form-item>

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
                ></el-option>
              </el-select>
            </el-form-item>

            <!-- 选择文件 -->
            <el-form-item
              v-show="currentStep.execute_type && currentStep.execute_type.indexOf('is_upload') !== -1"
              :label="'选择文件'"
              prop="send_keys"
              size="small"
              class="is-required">
                <el-row>
                  <el-col :span="20">
                    <el-input disabled v-model="currentStep.send_keys" placeholder="选择文件" style="width: 90%"></el-input>
                  </el-col>

                  <el-col :span="4">
                    <el-button type="primary" @click.native="openFileUploadDialog" size="mini">上传文件</el-button>
                  </el-col>
                </el-row>
            </el-form-item>

            <!-- 输入文本 -->
            <el-form-item
              v-show="currentStep.execute_type && currentStep.execute_type.indexOf('is_input') !== -1"
              label="输入内容"
              prop="send_keys"
              size="small"
              class="is-required">
              <el-input type="textarea" autosize v-model="currentStep.send_keys" placeholder="输入对应内容"></el-input>
            </el-form-item>

            <el-form-item label="执行次数" class="is-required">
              <el-input-number
                v-model="currentStep.run_times"
                size="mini"
                :precision="0"
                :min="1"
                :max="1000"
              ></el-input-number>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 元素信息，允许修改元素 -->
        <el-tab-pane label="元素信息" name="element">
          <el-form label-width="120px">

            <el-form-item label="所属项目" prop="projectName" size="small">
              <el-input disabled v-model="currentElement.projectName"></el-input>
            </el-form-item>

            <el-form-item label="所属页面" prop="pageName" size="small">
              <el-input disabled v-model="currentElement.pageName"></el-input>
            </el-form-item>

            <el-form-item label="元素名" prop="elementName" size="small">
              <el-input disabled v-model="currentElement.name"></el-input>
            </el-form-item>

            <el-form-item :label="'定位方式'" prop="by" size="mini" class="is-required">
              <el-select
                v-model="currentElement.by"
                filterable
                default-first-option
                clearable
                size="mini"
                style="width:100%"
                placeholder="请选择定位方式">
                <el-option
                  v-for="option in $busEvents.data.findElementOptionList"
                  :key="option.label"
                  :label="option.label"
                  :value="option.value"
                ></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="定位元素" prop="element" size="small">
              <el-input v-model="currentElement.element"></el-input>
            </el-form-item>

          </el-form>
        </el-tab-pane>

        <!-- 数据提取 -->
        <el-tab-pane label="数据提取" name="editExtracts">
          <extractsView
            ref="extractsView"
            :currentData="currentStep.extracts"
            :tempElementList="tempElementList"
            :placeholderKey="'起个变量名'"
            :placeholderValue="'提取数据的表达式'"
            :placeholderDesc="'备注'"
          ></extractsView>
        </el-tab-pane>

        <!-- 断言信息 -->
        <el-tab-pane label="断言" name="editAssert">
          <validatesView
            ref="validatesView"
            :tempElementList="tempElementList"
            :stepDrawerStatus="drawerIsShow"
            :validates="currentStep.validates"
          ></validatesView>
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
          @click="changElement()">{{ '保存元素修改' }}
        </el-button>

        <el-button
          v-show="activeName !== 'element'"
          style="float: right; margin-left: 10px"
          size="mini"
          type="primary"
          :loading="submitButtonIsLoading"
          @click="currentStep.id ? editStep() : addStep()">{{ '保存步骤' }}
        </el-button>

        <el-button
          v-show="activeName !== 'element' && currentStep.id"
          style="float: right"
          size="mini"
          @click="rowBackStep()"> {{ '还原步骤' }}
        </el-button>
      </div>

      <uploadFileView></uploadFileView>

    </el-drawer>

  </div>
</template>

<script>

import headersView from "@/components/Inputs/changeRow"
import paramsView from "@/components/Inputs/changeRow"
import bodyView from '@/components/apiBody'
import jsonEditorView from "@/components/jsonView";
import extractsView from "@/components/uiTest/extract"
import validatesView from "@/components/uiTest/validates";
import uploadFileView from "@/components/file/uploadFile";

import {getProject} from "@/apis/uiTest/project";
import {getPage} from "@/apis/uiTest/page";
import {changeElementById, elementList, getElement, putElement} from "@/apis/uiTest/element";
import {postStep, putStep} from "@/apis/uiTest/step"

export default {
  name: "editStep",
  props: [
    'projectId',
    'caseId'
  ],
  components: {
    headersView,
    paramsView,
    bodyView,
    jsonEditorView,
    extractsView,
    validatesView,
    uploadFileView
  },
  data() {
    return {
      drawerIsShow: false,
      direction: 'rtl',  // 抽屉打开方式
      submitButtonIsLoading: false,
      activeName: 'editStepInfo',
      currentStepCopy: {},
      currentElement: {},
      tempElementList: [],
      currentStep: {
        'id': '',
        "is_run": '',
        "name": '',
        "up_func": '',
        "down_func": '',
        "execute_type": '',
        "send_keys": '',
        "run_times": 0,
        "extracts": [],
        "validates": [],
        "data_driver": [],
        "case_id": this.caseId,
        "project_id": ''
      }
    }
  },
  methods: {

    initNewStep() {
      return {
        'id': '',
        "is_run": '',
        "name": '',
        "up_func": '',
        "down_func": '',
        "execute_type": '',
        "run_times": 0,
        "headers": [],
        "params": [],
        "extracts": [],
        "validates": [],
        "data_form": [],
        "data_json": '',
        "data_xml": '',
        "data_driver": '',
        "case_id": this.caseId,
        "project_id": ''
      }
    },

    getStepForCommit() {
      return {
        'id': this.currentStep.id,
        "is_run": this.currentStep.is_run,
        "name": this.currentStep.name,
        "up_func": this.currentStep.up_func,
        "down_func": this.currentStep.down_func,
        "run_times": this.currentStep.run_times,
        "execute_type": this.currentStep.execute_type,
        "send_keys": this.currentStep.send_keys,
        "extracts": this.$refs.extractsView.tempData,
        "validates": this.$refs.validatesView.tempValidates,
        "quote_case": null,
        "case_id": this.currentStep.case_id,
        "element_id": this.currentElement.id,
        "page_id": this.currentElement.page_id,
        "project_id": this.currentStep.project_id
      }
    },

    // 新增步骤信息
    addStep() {
      this.submitButtonIsLoading = true
      postStep(this.getStepForCommit()).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          // 避免重复请求步骤列表，新建完步骤过后，把新增的步骤给步骤列表更新
          this.$bus.$emit(this.$busEvents.ui.uiAddStepIsCommit, response.data)
          this.drawerIsShow = false
        }
      })
    },

    // 修改步骤信息
    editStep() {
      this.submitButtonIsLoading = true
      putStep(this.getStepForCommit()).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          // 避免重复请求步骤列表，新建完步骤过后，把新增的步骤给步骤列表更新
          this.$bus.$emit(this.$busEvents.ui.uiEditStepIsCommit, response.data)
          this.drawerIsShow = false
        }
      })
    },

    // 修改元素
    changElement() {
      this.submitButtonIsLoading = true
      changeElementById({
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
      this.$bus.$emit(this.$busEvents.file.uploadFileDialogIsShow, "ui_case")
    },

    // 取消保存
    rowBackStep() {
      this.currentStep = this.currentStepCopy
    }
  },

  mounted() {

    // 新增步骤
    this.$bus.$on(this.$busEvents.ui.uiShowStepDrawer, (type, step) => {
      this.currentElement = step

      if (type === 'add') {  // 新增步骤
        this.currentStep.id = ''
        this.currentStep.is_run = true
        this.currentStep.name = step.name
        this.currentStep.up_func = ''
        this.currentStep.down_func = ''
        this.currentStep.execute_type = ''
        this.currentStep.send_keys = ''
        this.currentStep.run_times = 1
        this.currentStep.extracts = []
        this.currentStep.validates = []
        this.currentStep.data_driver = []
        this.currentStep.project_id = this.projectId
        this.currentStep.case_id = this.caseId
        this.currentStep.page_id = this.currentElement.page_id
        this.currentStep.element_id = this.currentElement.id
        this.drawerIsShow = true

      } else if (type === 'update') {  // 修改步骤

        // 获取元素信息
        getElement({id: step.element_id}).then(response => {
          this.currentElement = response.data
        })

        // 获取元素的页面信息
        getPage({id: this.currentElement.page_id}).then(response => {
          this.$set(this.currentElement, 'pageName', response.data.name)
        })

        // 获取元素的项目信息
        getProject({id: this.currentElement.project_id}).then(response => {
          this.$set(this.currentElement, 'projectName', response.data.name)
        })

        this.currentStep = step
        this.currentStepCopy = JSON.parse(JSON.stringify(step))  // 深拷贝
        this.drawerIsShow = true
      }

      // 获取当前步骤对应元素所在页面的所有元素
      elementList({pageId: step.page_id}).then(response => {
        this.tempElementList = response.data.data
      })

    })

    // 打开用例抽屉的时候，初始化步骤编辑栏，定位到步骤信息栏
    this.$bus.$on(this.$busEvents.ui.uiCaseDrawerStatus, (command, currentCase) => {
      this.currentStep = this.initNewStep()
    })

    // 上传文件后展示给前端
    this.$bus.$on(this.$busEvents.file.uploadFileIsCommit, (status, file_name_list) => {
      this.currentStep.send_keys = file_name_list[0]
    })

  },

  beforeDestroy() {
    // 页面销毁的时候，关闭bus监听选中事件
    this.$bus.$off(this.$busEvents.ui.uiShowStepDrawer)
    this.$bus.$off(this.$busEvents.api.apiEditStep)
    this.$bus.$off(this.$busEvents.ui.uiCaseDrawerStatus)
    this.$bus.$off(this.$busEvents.file.uploadFileIsCommit)
  }
}
</script>

<style scoped>

</style>
