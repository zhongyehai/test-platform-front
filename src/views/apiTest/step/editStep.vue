<template>

  <el-drawer
    :title=" drawerType === 'update' ? '修改步骤' : '新增步骤'"
    size="65%"
    :append-to-body="true"
    :wrapperClosable="false"
    :visible.sync="drawerIsShow"
    :direction="direction">
    <el-tabs v-model="activeName" v-show="currentStep.api_id" style="margin-left: 20px;margin-right: 20px">
      <!-- 步骤信息 -->
      <el-tab-pane label="步骤信息" name="editStepInfo">
        <el-form label-width="120px">

          <el-form-item label="步骤名称" prop="name" size="small" class="is-required">
            <el-input v-model="currentStep.name" placeholder="步骤名称"></el-input>
          </el-form-item>

          <el-form-item label="所属服务" prop="projectName" size="small">
            <el-input disabled v-model="currentStep.projectName"></el-input>
          </el-form-item>

          <el-form-item label="所属接口" prop="apiName" size="small">
            <el-input disabled v-model="currentStep.apiName"></el-input>
          </el-form-item>

          <el-form-item label="请求方法" prop="name" size="small">
            <el-input disabled v-model="currentStep.method"></el-input>
          </el-form-item>

          <el-form-item label="接口地址" prop="name" size="small">
            <el-input disabled v-model="currentStep.addr"></el-input>
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

          <el-row>
            <el-col :span="12">
              <el-form-item label="执行次数" class="is-required">
                <el-input-number
                  v-model="currentStep.run_times"
                  size="mini"
                  :precision="0"
                  :min="1"
                  :max="1000"
                ></el-input-number>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form label-width="200px" v-show="currentStep.id">
                <el-form-item label="是否使用用例所在项目的域名">
                  <el-switch
                    :disabled="putStepHostIsLoading"
                    v-model="currentStep.replace_host"
                    @change="changeStatus()"></el-switch>
                  <el-popconfirm
                    placement="top"
                    title="解析当前步骤时，若此项为激活状态，则使用用例所在服务的域名，否则使用步骤对应接口所在服务的域名"
                    hide-icon>
                    <el-button slot="reference" type="text" icon="el-icon-question"></el-button>
                  </el-popconfirm>
                </el-form-item>
              </el-form>
            </el-col>
          </el-row>
        </el-form>
      </el-tab-pane>

      <!-- 头部信息 -->
      <el-tab-pane label="头部信息" name="editHeaders">
        <headersView
          ref="headersView"
          :currentData="currentStep.headers"
          :placeholderKey="'字段名'"
          :placeholderValue="'字段值'"
          :placeholderDesc="'备注'"
        ></headersView>
      </el-tab-pane>

      <!-- url参数 -->
      <el-tab-pane label="url参数" name="editParams">
        <paramsView
          ref="paramsView"
          :currentData="currentStep.params"
          :placeholderKey="'字段名'"
          :placeholderValue="'字段值'"
          :placeholderDesc="'备注'"
        ></paramsView>
      </el-tab-pane>

      <!-- 请求体 -->
      <el-tab-pane label="请求体" name="editBody">
        <bodyView
          ref="bodyView"
          :data-type="currentStep.data_type"
          :data-json="currentStep.data_json"
          :data-form="currentStep.data_form"
          :data-xml="currentStep.data_xml"
        ></bodyView>
      </el-tab-pane>

      <!-- 数据提取 -->
      <el-tab-pane label="数据提取" name="editExtracts">
        <extractsView
          ref="extractsView"
          :currentData="currentStep.extracts"
          :placeholderKey="'起个变量名'"
          :placeholderValue="'提取数据的表达式'"
          :placeholderDesc="'备注'"
        ></extractsView>
      </el-tab-pane>

      <!-- 断言信息 -->
      <el-tab-pane label="断言" name="editAssert">
        <validatesView
          ref="validatesView"
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
        <jsonEditorView
          ref="dataDriverView"
          :data-json="currentStep.data_driver"
        ></jsonEditorView>
      </el-tab-pane>
    </el-tabs>

    <div class="demo-drawer__footer">
      <el-button
        style="float: right; margin-left: 10px"
        size="mini"
        type="primary"
        :loading="submitButtonIsLoading"
        @click="currentStep.id ? editStep() : addStep()">{{ '保存步骤' }}
      </el-button>

      <el-button
        style="float: right"
        v-show="currentStep.id"
        size="mini"
        @click="rowBackStep()"> {{ '还原步骤' }}
      </el-button>
    </div>

  </el-drawer>
</template>

<script>

import headersView from "@/components/Inputs/changeRow"
import paramsView from "@/components/Inputs/changeRow"
import bodyView from '@/components/apiBody'
import jsonEditorView from "@/components/jsonView";
import extractsView from "@/components/Inputs/extract"
import validatesView from "@/components/Inputs/validates";

import {postStep, putStep, putStepHost} from "@/apis/apiTest/step"
import {getApi} from "@/apis/apiTest/api";
import {getProject} from "@/apis/apiTest/project";

export default {
  name: "editStep",
  props: [
    'caseId'
  ],
  components: {
    headersView,
    paramsView,
    bodyView,
    jsonEditorView,
    extractsView,
    validatesView
  },
  data() {
    return {
      drawerIsShow: false,
      drawerType: 'add',
      direction: 'rtl',  // 抽屉打开方式
      submitButtonIsLoading: false,
      putStepHostIsLoading: false,
      activeName: 'editStepInfo',
      currentStepCopy: '',
      currentStep: {
        'id': '',
        "is_run": '',
        "replace_host": '',
        "name": '',
        "up_func": '',
        "down_func": '',
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
        "api_id": '',
        "project_id": ''
      }
    }
  },
  methods: {

    initStep() {
      return {
        'id': '',
        "is_run": '',
        "replace_host": '',
        "name": '',
        "up_func": '',
        "down_func": '',
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
        "api_id": '',
        "project_id": ''
      }
    },

    getStepForCommit() {
      var json_data = this.$refs.bodyView.$refs.jsonEditorView.$refs.dataJsonView.tempDataJson
      return {
        'id': this.currentStep.id,
        "is_run": this.currentStep.is_run,
        "replace_host": this.currentStep.replace_host,
        "name": this.currentStep.name,
        "up_func": this.currentStep.up_func,
        "down_func": this.currentStep.down_func,
        "run_times": this.currentStep.run_times,
        "headers": this.$refs.headersView.tempData,
        "params": this.$refs.paramsView.tempData,
        "extracts": this.$refs.extractsView.tempData,
        "validates": this.$refs.validatesView.tempValidates,
        "data_form": this.$refs.bodyView.$refs.dataFormView.tempDataForm,
        "data_json": json_data ? JSON.parse(json_data) : {},
        "data_xml": this.$refs.bodyView.tempDataXml,
        "data_driver": this.$refs.dataDriverView.$refs.dataJsonView.tempDataJson ? JSON.parse(this.$refs.dataDriverView.$refs.dataJsonView.tempDataJson) : {},
        "quote_case": null,
        "case_id": this.caseId,
        "api_id": this.currentStep.api_id,
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
          this.$bus.$emit(this.$busEvents.api.apiAddStepIsCommit, response.data)
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
          this.$bus.$emit(this.$busEvents.api.apiEditStepIsCommit, response.data)
          this.drawerIsShow = false
        }
      })
    },

    // 修改步骤的引用host
    changeStatus(){
      this.putStepHostIsLoading = true
      putStepHost({'id': this.currentStep.id, 'replace_host': this.currentStep.replace_host}).then(response => {
        this.putStepHostIsLoading = false
        this.showMessage(this, response)
      })
    },

    // 取消保存
    rowBackStep() {
      this.currentStep = this.currentStepCopy
    }
  },

  mounted() {

    // 新增步骤
    this.$bus.$on(this.$busEvents.api.apiAddApiToStep, (step, type) => {
      if (type !== 'quote') {
        this.currentStep = JSON.parse(JSON.stringify(step))  // 深拷贝
        this.currentStepCopy = JSON.parse(JSON.stringify(step))  // 深拷贝
        this.drawerType = 'add'
        this.drawerIsShow = true
      }
    })

    // 编辑步骤
    this.$bus.$on(this.$busEvents.api.apiEditStep, (step) => {
      // 获取接口的地址和请求方法
      getApi({id: step.api_id}).then(response => {
        this.$set(this.currentStep, 'addr', response.data.addr)
        this.$set(this.currentStep, 'method', response.data.method)
        this.$set(this.currentStep, 'apiName', response.data.name)
      })
      getProject({id: step.project_id}).then(response => {
        this.$set(this.currentStep, 'projectName', response.data.name)
      })
      this.currentStep = step
      this.currentStepCopy = JSON.parse(JSON.stringify(step))  // 深拷贝
      this.drawerType = 'update'
      this.drawerIsShow = true
    })

    // 打开用例caseDialog的时候，初始化步骤编辑栏，定位到步骤信息栏
    this.$bus.$on(this.$busEvents.api.apiCaseDrawerStatus, (command, currentCase) => {
      this.currentStep = this.initStep()
    })

  },

  beforeDestroy() {
    // 页面销毁的时候，关闭bus监听选中事件
    this.$bus.$off(this.$busEvents.api.apiAddApiToStep)
    this.$bus.$off(this.$busEvents.api.apiEditStep)
    this.$bus.$off(this.$busEvents.api.apiCaseDrawerStatus)
  }
}
</script>

<style scoped>

</style>
