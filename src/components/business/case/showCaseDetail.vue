<template>
  <!-- 引用用例详情 -->
  <el-drawer
    size="75%"
    :append-to-body="true"
    :visible.sync="caseRemarkIsShow"
    :before-close="beforeCloseDrawer"
    :direction="direction"
  >
    <template slot="title">
      <div>用例详情</div>
      <el-button
        v-show="caseIdList.length > 1"
        type="primary"
        size="mini"
        style="margin-left: 50px"
        @click="backLast()"
      >回到上一级
      </el-button>
    </template>

    <div class="demo-drawer__content" style="margin-left: 20px">
      <el-collapse v-model="activeNames">
        <el-collapse-item name="1">
          <template slot="title">
            <div class="el-collapse-item-title">用例来源: {{ showCaseDetail.fromDetail }}</div>
          </template>
        </el-collapse-item>

        <el-collapse-item name="2">
          <template slot="title">
            <div class="el-collapse-item-title">用例描述:</div>
          </template>
          <pre class="el-collapse-item-content" style="overflow: auto">{{ showCaseDetail.remarkDetail }}</pre>
        </el-collapse-item>

        <el-collapse-item name="3">
          <template slot="title">
            <div class="el-collapse-item-title">跳过条件:</div>
          </template>
          <skipIfView
            ref="skipIfView"
            :skip-if-data="showCaseDetail.skip_if"
            :use_type="'case'"
          />
        </el-collapse-item>

        <el-collapse-item name="4">
          <template slot="title">
            <div class="el-collapse-item-title">公共变量:</div>
          </template>
          <variablesView
            ref="variablesView"
            :current-data="showCaseDetail.variables"
            :placeholder-key="'key'"
            :placeholder-value="'value'"
            :placeholder-desc="'备注'"
          />
        </el-collapse-item>

        <el-collapse-item name="5">
          <template slot="title">
            <div class="el-collapse-item-title">头部信息:</div>
          </template>
          <headersView
            ref="headersView"
            :current-data="showCaseDetail.headers"
            :placeholder-key="'key'"
            :placeholder-value="'value'"
            :placeholder-desc="'备注'"
          />
        </el-collapse-item>

        <el-collapse-item name="6">
          <template slot="title">
            <div class="el-collapse-item-title">步骤列表:</div>
          </template>
          <el-table
            ref="caseStepListTable"
            :data="showCaseDetail.stepList"
            fit
            row-key="id"
            highlight-current-row
            style="width: 100%"
          >
            <el-table-column prop="num" label="序号" min-width="15%">
              <template slot-scope="scope">
                <span>{{ scope.$index + 1 }}</span>
              </template>
            </el-table-column>

            <el-table-column align="center" label="步骤名称" min-width="35%">
              <template slot-scope="scope">
                <span>{{ scope.row.name }}</span>
              </template>
            </el-table-column>

            <el-table-column align="center" min-width="15%">
              <template slot="header">
                <span>执行</span>
                <el-tooltip
                  class="item"
                  effect="dark"
                  placement="top-start"
                >
                  <div slot="content">
                    <div>若此处设置为不运行，则执行测试时将不会运行此步骤</div>
                  </div>
                  <span><i style="color: #409EFF" class="el-icon-question"/></span>
                </el-tooltip>
              </template>
              <template slot-scope="scope">
                <el-switch
                  v-model="scope.row.status"
                  :inactive-value="0"
                  :active-value="1"
                  @change="changeStatus(scope.row)"
                />
              </template>
            </el-table-column>

            <el-table-column align="center" label="操作" min-width="30%">
              <template slot-scope="scope">

                <!-- 查看用例详情 -->
                <el-button
                  v-if="scope.row.quote_case"
                  slot="reference"
                  type="text"
                  size="mini"
                  style="margin-right: 5px"
                  @click="showCaseRemark(scope.row.quote_case)"
                >查看
                </el-button>

                <!-- 点击编辑步骤 -->
                <el-button
                  v-if="!scope.row.quote_case"
                  slot="reference"
                  type="text"
                  size="mini"
                  style="margin-right: 5px"
                  @click="editStep(scope.row)"
                >修改
                </el-button>

              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>
      </el-collapse>

    </div>

    <!-- api步骤编辑 -->
    <editApiStepView
      v-if="dataType === 'api'"
      ref="editStepView"
      :case-id="caseId"
    />

    <!-- ui步骤编辑 -->
    <editUiStepView
      v-else
      ref="editStepView"
      :data-type="dataType"
      :case-id="caseId"
    />

    <div class="demo-drawer__footer">

      <!--      <el-button-->
      <!--        slot="reference"-->
      <!--        size="mini"-->
      <!--        type="primary"-->
      <!--        style="float: left"-->
      <!--        :loading="isShowDebugLoading"-->
      <!--        @click="clickRunDebug()"-->
      <!--      >调试-->
      <!--      </el-button>-->

      <el-button
        size="mini"
        type="primary"
        :loading="submitLoadingIsShow"
        @click="changCase()"
      >
        {{ '保存用例' }}
      </el-button>
    </div>

  </el-drawer>
</template>

<script>
import variablesView from '@/components/Inputs/variables'
import headersView from '@/components/Inputs/changeRow'
import skipIfView from '@/components/Inputs/skipIf'
import editApiStepView from '@/components/business/step/editApiStep.vue'
import editUiStepView from '@/components/business/step/editUiStep.vue'

import {
  putStepIsRun as apiPutStepIsRun,
  stepCopy as apiStepCopy,
  stepList as apiStepList
} from '@/apis/apiTest/step'
import {
  caseFrom as apiCaseFrom,
  getCase as apiGetCase,
  pullStep as apiPullStep,
  putCase as apiPutCase
} from '@/apis/apiTest/case'

import {
  putStepIsRun as webUiPutStepIsRun,
  stepCopy as webUiStepCopy,
  stepList as webUiStepList
} from '@/apis/webUiTest/step'
import {
  caseFrom as webUiCaseFrom,
  getCase as webUiGetCase,
  pullStep as webUiPullStep,
  putCase as webUiPutCase
} from '@/apis/webUiTest/case'

import {
  putStepIsRun as appUiPutStepIsRun,
  stepCopy as appUiStepCopy,
  stepList as appUiStepList
} from '@/apis/appUiTest/step'
import {
  caseFrom as appUiCaseFrom,
  getCase as appUiGetCase,
  pullStep as appUiPullStep,
  putCase as appUiPutCase
} from '@/apis/appUiTest/case'

export default {
  name: 'ShowCaseDetail',
  components: {
    skipIfView,
    headersView,
    variablesView,
    editApiStepView,
    editUiStepView
  },
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'dataType'
  ],
  data() {
    return {
      caseId: '',
      activeNames: ['6'],
      direction: 'rtl', // 抽屉打开方式
      tempCase: {},
      showCaseDetail: {
        remarkDetail: '',
        fromDetail: '',
        skip_if: '',
        variables: '',
        headers: '',
        stepList: []
      },
      caseIdList: [], // 用于记录查看的用例的来源
      submitLoadingIsShow: false, // 编辑用例
      caseRemarkIsShow: false, // 是否展示被引用用例的描述

      selectedList: [],

      putCaseUrl: '',
      putStepIsRunUrl: '',
      stepCopyUrl: '',
      stepListUrl: '',
      caseFromUrl: '',
      getCaseUrl: '',
      pullStepUrl: ''
    }
  },

  mounted() {
    // 步骤提交事件，获取步骤列表
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, caseId) => {
      if (_type === 'showCaseInfo') {
        this.caseId = caseId
        this.showCaseRemark(caseId)
      }
    })
  },

  beforeDestroy() {
    // 页面销毁的时候，关闭bus监听选中事件
    this.$bus.$off(this.$busEvents.drawerIsShow)
  },

  created() {
    if (this.dataType === 'api') {
      this.putCaseUrl = apiPutCase
      this.putStepIsRunUrl = apiPutStepIsRun
      this.stepCopyUrl = apiStepCopy
      this.stepListUrl = apiStepList
      this.caseFromUrl = apiCaseFrom
      this.getCaseUrl = apiGetCase
      this.pullStepUrl = apiPullStep
    } else if (this.dataType === 'webUi') {
      this.putCaseUrl = webUiPutCase
      this.putStepIsRunUrl = webUiPutStepIsRun
      this.stepCopyUrl = webUiStepCopy
      this.stepListUrl = webUiStepList
      this.caseFromUrl = webUiCaseFrom
      this.getCaseUrl = webUiGetCase
      this.pullStepUrl = webUiPullStep
    } else {
      this.putCaseUrl = appUiPutCase
      this.putStepIsRunUrl = appUiPutStepIsRun
      this.stepCopyUrl = appUiStepCopy
      this.stepListUrl = appUiStepList
      this.caseFromUrl = appUiCaseFrom
      this.getCaseUrl = appUiGetCase
      this.pullStepUrl = appUiPullStep
    }
  },
  methods: {

    // 获取当前的用例数据，用于提交给后端
    getCaseDataToCommit() {
      const caseData = JSON.parse(JSON.stringify(this.tempCase))
      caseData.variables = this.$refs.variablesView.tempData
      caseData.headers = this.dataType === 'api' ? this.$refs.headersView.tempData : []
      caseData.skip_if = this.$refs.skipIfView.tempData
      return caseData
    },

    changCase() {
      this.submitLoadingIsShow = true
      this.putCaseUrl(this.getCaseDataToCommit()).then(response => {
        this.submitLoadingIsShow = false
        if (this.showMessage(this, response)) {
          this.caseRemarkIsShow = false
        }
      })
    },

    changeStatus(row) {
      this.putStepIsRunUrl({ 'id': [row.id], 'status': row.status }).then(response => {
        this.showMessage(this, response)
      })
    },

    cancelCopyStepPopover(row) {
      this.$set(row, 'copyStepPopoverIsShow', false)
    },

    cancelPullStepPopover(row) {
      this.$set(row, 'pullStepPopoverIsShow', false)
    },

    // 点击编辑步骤
    editStep(row) {
      this.currentStep = row
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'stepInfo', 'edit', JSON.parse(JSON.stringify(this.currentStep)))
    },

    // 点击查看步骤
    showCaseRemark(caseId) {
      // 用例信息
      this.getCaseUrl({ id: caseId }).then(response => {
        this.tempCase = response.data
        this.showCaseDetail.variables = response.data.variables
        this.showCaseDetail.skip_if = response.data.skip_if
        this.showCaseDetail.headers = response.data.headers
        this.showCaseDetail.remarkDetail = response.data.desc
      })

      // 用例归属
      this.caseFromUrl({ id: caseId }).then(response => {
        this.showCaseDetail.fromDetail = response.data
      })

      // 步骤列表
      this.stepListUrl({ caseId: caseId }).then(response => {
        this.showCaseDetail.stepList = response.data
      })

      this.caseIdList.push(caseId)
      this.caseRemarkIsShow = true
    },

    // 回到上一个引用
    backLast() {
      this.caseIdList.pop() // 当前引用id
      const caseId = this.caseIdList.pop() // 上一个引用id
      this.showCaseRemark(caseId)
    },

    beforeCloseDrawer(done) {
      this.caseIdList = []
      done()
    }
  }
}
</script>

<style>
.el-collapse-item-title {
  font-weight: 600;
  font-size: 15px;
  margin-left: 10px;
  color: #409eff
}

.sortable-ghost {
  opacity: .8;
  color: #fff !important;
  background: #42b983 !important;
}
</style>

<style scoped>

</style>
