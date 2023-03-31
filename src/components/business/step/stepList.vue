<template>
  <div class="app-container">
    <el-form label-width="80px" inline v-show="selectedList.length > 0">
      <!--  批量删除 -->

      <el-popover
        v-show="selectedList.length > 0"
        placement="top"
        popper-class="down-popover"
        v-model="showBatchDelete"
      >
        <p>确定删除所选中的测试步骤?</p>
        <div style="text-align: right; margin: 0">
          <el-button size="mini" type="text" @click="cancelBatchDeletePopover()">取消</el-button>
          <el-button type="primary" size="mini" @click="deleteStepOnList">确定</el-button>
        </div>
        <el-button
          slot="reference"
          type="primary"
          size="mini"
          style="margin-left: 5px"
        >批量删除
        </el-button>
      </el-popover>

      <el-popover
        v-model="showBatchChangeStatusToRun"
        placement="top"
        popper-class="down-popover"
      >
        <p>确定把所选步骤状态改为要执行?</p>
        <div style="text-align: right; margin: 0">
          <el-button size="mini" type="text" @click="cancelShowBatchChangeStatusToRun()">取消</el-button>
          <el-button type="primary" size="mini" @click="changeStatus(null, 1, true)">确定</el-button>
        </div>
        <el-button
          slot="reference"
          type="primary"
          size="mini"
          style="margin-left: 5px"
        >批量改为要执行
        </el-button>
      </el-popover>

      <el-popover
        v-model="showBatchChangeStatusToNotRun"
        placement="top"
        popper-class="down-popover"
      >
        <p>确定把所选步骤状态改为不执行?</p>
        <div style="text-align: right; margin: 0">
          <el-button size="mini" type="text" @click="cancelShowBatchChangeStatusToNotRun()">取消</el-button>
          <el-button type="primary" size="mini" @click="changeStatus(null, 0, true)">确定</el-button>
        </div>
        <el-button
          slot="reference"
          type="primary"
          size="mini"
          style="margin-left: 5px"
        >批量改为不执行
        </el-button>
      </el-popover>

      <el-tooltip
        class="item"
        effect="dark"
        placement="top-start"
      >
        <div slot="content">
          <div>执行测试时只会将状态为要运行的步骤拿出来运行</div>
        </div>
        <span><i style="color: #409EFF; margin-left: 10px" class="el-icon-question"/></span>
      </el-tooltip>

    </el-form>

    <!-- 步骤列表 -->
    <el-table
      ref="stepListTable"
      v-loading="tableLoadingIsShow"
      element-loading-text="正在排序中"
      element-loading-spinner="el-icon-loading"
      :data="stepList"
      fit
      row-key="id"
      highlight-current-row
      style="width: 100%"
      :height="tableHeight"
      @selection-change="clickSelectAll"
    >
      <el-table-column type="selection" min-width="2%"/>

      <el-table-column prop="num" label="序号" min-width="8%">
        <template slot-scope="scope">
          <span>{{ scope.$index + 1 }}</span>
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
            @change="changeStatus(scope.row, null, true)"
          />
        </template>
      </el-table-column>

      <el-table-column v-if="dataType !== 'api'" align="center" label="执行事件" min-width="25%">
        <template slot-scope="scope">
          <span>{{ parseExecuteType(scope.row.execute_type) }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="步骤名称" min-width="30%">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" min-width="20%">
        <template slot-scope="scope">

          <!-- 编辑步骤 -->
          <el-button
            v-if="!scope.row.quote_case"
            type="text"
            size="mini"
            style="margin-right: 10px"
            @click.native="editStep(scope.row)"
          >修改
          </el-button>

          <!-- 复制引用用例的步骤 -->
          <el-popover
            v-if="scope.row.quote_case"
            :ref="`popover-${scope.row.id}`"
            v-model="scope.row.pullStepPopoverIsShow"
            placement="top"
            style="margin-right: 10px"
            popper-class="down-popover"
          >
            <p>复制此引用用例下的步骤并生成新的步骤?</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="cancelPullStepPopover(scope.row)">取消</el-button>
              <el-button type="primary" size="mini" @click="pullCaseStep(scope.row)">确定</el-button>
            </div>
            <el-button
              slot="reference"
              type="text"
              size="mini"
              :loading="scope.row.pullIsLoading"
            >拉取
            </el-button>
          </el-popover>

          <!-- 复制步骤 -->
          <el-popover
            :ref="scope.row.id"
            v-model="scope.row.copyStepPopoverIsShow"
            placement="top"
            style="margin-right: 10px"
            popper-class="down-popover"
          >
            <p>复制此步骤并生成新的步骤?</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="cancelCopyStepPopover(scope.row)">取消</el-button>
              <el-button type="primary" size="mini" @click="copy(scope.row)">确定</el-button>
            </div>
            <el-button
              slot="reference"
              type="text"
              size="mini"
              :loading="scope.row.copyIsLoading"
            >复制
            </el-button>
          </el-popover>

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

          <!-- 删除步骤 -->
          <el-popover
            :ref="scope.row.id"
            v-model="scope.row.deletePopoverIsShow"
            placement="top"
            popper-class="down-popover"
          >
            <p>确定删除【{{ scope.row.name }}】?</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="cancelDeletePopover(scope.row)">取消</el-button>
              <el-button
                type="primary"
                size="mini"
                @click="deleteStepOnList(scope.row)"
              >确定
              </el-button>
            </div>
            <el-button
              slot="reference"
              style="color: red"
              type="text"
              size="mini"
            >删除
            </el-button>
          </el-popover>

        </template>
      </el-table-column>
    </el-table>

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
                    @change="changeStatus(scope.row, null, false)"
                  />
                </template>
              </el-table-column>

              <el-table-column align="center" label="操作" min-width="30%">
                <template slot-scope="scope">

                  <!-- 复制引用用例的步骤 -->
                  <el-popover
                    v-if="scope.row.quote_case"
                    :ref="`popover-${scope.row.id}`"
                    v-model="scope.row.pullStepPopoverIsShow"
                    placement="top"
                    style="margin-right: 10px"
                    popper-class="down-popover"
                  >
                    <p>复制此引用用例下的步骤并生成新的步骤?</p>
                    <div style="text-align: right; margin: 0">
                      <el-button size="mini" type="text" @click="cancelPullStepPopover(scope.row)">取消</el-button>
                      <el-button type="primary" size="mini" @click="pullCaseStep(scope.row)">确定</el-button>
                    </div>
                    <el-button
                      slot="reference"
                      type="text"
                      size="mini"
                      :loading="scope.row.pullIsLoading"
                    >复制步骤
                    </el-button>
                  </el-popover>

                  <!-- 复制步骤 -->
                  <el-popover
                    :ref="scope.row.id"
                    v-model="scope.row.copyStepPopoverIsShow"
                    placement="top"
                    style="margin-right: 10px"
                    popper-class="down-popover"
                  >
                    <p>复制此步骤并生成新的步骤?</p>
                    <div style="text-align: right; margin: 0">
                      <el-button size="mini" type="text" @click="cancelCopyStepPopover(scope.row)">取消</el-button>
                      <el-button type="primary" size="mini" @click="copy(scope.row)">确定</el-button>
                    </div>
                    <el-button
                      slot="reference"
                      type="text"
                      size="mini"
                      :loading="scope.row.copyIsLoading"
                    >复制
                    </el-button>
                  </el-popover>

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
    </el-drawer>
  </div>
</template>

<script>
import Sortable from 'sortablejs'
import variablesView from '@/components/Inputs/variables'
import headersView from '@/components/Inputs/changeRow'
import skipIfView from '@/components/Inputs/skipIf'

import {
  deleteStep as apiDeleteStep,
  putStepIsRun as apiPutStepIsRun,
  stepSort as apiStepSort,
  stepCopy as apiStepCopy,
  stepList as apiStepList
} from '@/apis/apiTest/step'
import { caseFrom as apiCaseFrom, getCase as apiGetCase, pullStep as apiPullStep } from '@/apis/apiTest/case'

import {
  deleteStep as webUiDeleteStep,
  putStepIsRun as webUiPutStepIsRun,
  stepSort as webUiStepSort,
  stepCopy as webUiStepCopy,
  stepList as webUiStepList
} from '@/apis/webUiTest/step'
import { caseFrom as webUiCaseFrom, getCase as webUiGetCase, pullStep as webUiPullStep } from '@/apis/webUiTest/case'

import {
  deleteStep as appUiDeleteStep,
  putStepIsRun as appUiPutStepIsRun,
  stepSort as appUiStepSort,
  stepCopy as appUiStepCopy,
  stepList as appUiStepList
} from '@/apis/appUiTest/step'
import { caseFrom as appUiCaseFrom, getCase as appUiGetCase, pullStep as appUiPullStep } from '@/apis/appUiTest/case'

export default {
  name: 'StepList',
  components: {
    skipIfView,
    headersView,
    variablesView
  },
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'dataType',
    // eslint-disable-next-line vue/require-prop-types
    'caseId'
  ],
  data() {
    return {

      tableLoadingIsShow: false, // 加载状态
      stepList: [], // 步骤列表
      currentStep: {}, // 当前步骤

      // 拖拽排序参数
      sortable: null,
      oldList: [],
      newList: [],

      tableHeight: 500, // 表格高度
      activeNames: ['6'],
      direction: 'rtl', // 抽屉打开方式
      showCaseDetail: {
        remarkDetail: '',
        fromDetail: '',
        skip_if: '',
        variables: '',
        headers: '',
        stepList: []
      },
      caseIdList: [], // 用于记录查看的用例的来源
      caseRemarkIsShow: false, // 是否展示被引用用例的描述

      selectedList: [],
      showBatchDelete: false,
      showBatchChangeStatusToRun: false,
      showBatchChangeStatusToNotRun: false,

      deleteStepUrl: '',
      putStepIsRunUrl: '',
      stepSortUrl: '',
      stepCopyUrl: '',
      stepListUrl: '',
      caseFromUrl: '',
      getCaseUrl: '',
      pullStepUrl: ''
    }
  },
  watch: {
    'caseId': {
      handler(newVal, oldVal) {
        if (newVal) {
          this.getStepList()
        } else {
          this.stepList = []
        }
      }
    }
  },

  mounted() {
    // 步骤提交事件，获取步骤列表
    this.$bus.$on(this.$busEvents.drawerIsCommit, (_type, caseId) => {
      if (_type === 'stepInfo') {
        this.getStepList()
      } else if (_type === 'showStepList') {
        this.showCaseRemark(caseId)
      }
    })
  },

  beforeDestroy() {
    // 页面销毁的时候，关闭bus监听选中事件
    this.$bus.$off(this.$busEvents.drawerIsCommit)
  },

  created() {
    if (this.dataType === 'api') {
      this.deleteStepUrl = apiDeleteStep
      this.putStepIsRunUrl = apiPutStepIsRun
      this.stepSortUrl = apiStepSort
      this.stepCopyUrl = apiStepCopy
      this.stepListUrl = apiStepList
      this.caseFromUrl = apiCaseFrom
      this.getCaseUrl = apiGetCase
      this.pullStepUrl = apiPullStep
    } else if (this.dataType === 'webUi') {
      this.deleteStepUrl = webUiDeleteStep
      this.putStepIsRunUrl = webUiPutStepIsRun
      this.stepSortUrl = webUiStepSort
      this.stepCopyUrl = webUiStepCopy
      this.stepListUrl = webUiStepList
      this.caseFromUrl = webUiCaseFrom
      this.getCaseUrl = webUiGetCase
      this.pullStepUrl = webUiPullStep
    } else {
      this.deleteStepUrl = appUiDeleteStep
      this.putStepIsRunUrl = appUiPutStepIsRun
      this.stepSortUrl = appUiStepSort
      this.stepCopyUrl = appUiStepCopy
      this.stepListUrl = appUiStepList
      this.caseFromUrl = appUiCaseFrom
      this.getCaseUrl = appUiGetCase
      this.pullStepUrl = appUiPullStep
    }

    this.tableHeight = window.innerHeight * 0.80

    // 初始化父组件传过来的步骤列表
    if (this.caseId) {
      this.getStepList()
    }
  },
  methods: {

    // 全选
    clickSelectAll(val) {
      this.selectedList = val
    },

    cancelShowBatchChangeStatusToRun() {
      this.showBatchChangeStatusToRun = false
    },

    cancelShowBatchChangeStatusToNotRun() {
      this.showBatchChangeStatusToNotRun = false
    },

    cancelBatchDeletePopover() {
      this.showBatchDelete = false
    },

    changeStatus(row, status, isGetStepList) {
      let selectedIdList = []
      // eslint-disable-next-line no-unused-vars
      let changeStatus = 0
      if (row === null) { // 批量修改
        this.showBatchChangeStatusToRun = false
        this.showBatchChangeStatusToNotRun = false
        this.selectedList.forEach(data => {
          selectedIdList.push(data.id)
        })
        changeStatus = status
      } else {
        selectedIdList = [row.id]
        changeStatus = row.status
      }
      this.putStepIsRunUrl({ 'id': selectedIdList, 'status': changeStatus }).then(response => {
        this.showMessage(this, response)
        if (isGetStepList) {
          this.getStepList()
        }
      })
    },

    // 获取步骤列表
    getStepList() {
      this.tableIsLoading = true
      this.stepListUrl({ 'caseId': this.caseId }).then(response => {
        this.stepList = response.data

        this.oldList = this.stepList.map(v => v.id)
        this.newList = this.oldList.slice()
        this.$nextTick(() => {
          this.setSort()
        })
      })
      this.tableIsLoading = false
    },

    // 删除步骤
    deleteStepOnList(row) {
      let selectedIdList = []
      if (row.id) {
        this.$set(row, 'deletePopoverIsShow', false)
        selectedIdList = [row.id]
      } else { // 批量删除
        this.showBatchDelete = false
        this.selectedList.forEach(report => {
          selectedIdList.push(report.id)
        })
      }
      this.tableLoadingIsShow = true
      this.deleteStepUrl({ 'id': selectedIdList }).then(response => {
        this.tableLoadingIsShow = false
        if (this.showMessage(this, response)) {
          this.getStepList()
        }
      })
    },

    // 解析执行方式
    parseExecuteType(executeType) {
      return this.$busEvents.data.uiTestExecuteTypeDict[executeType]
    },

    cancelDeletePopover(row) {
      this.$set(row, 'deletePopoverIsShow', false)
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

    // 复制步骤
    copy(row) {
      this.$set(row, 'copyStepPopoverIsShow', false)
      this.$set(row, 'copyIsLoading', true)
      this.stepCopyUrl({ 'id': row.id, 'caseId': this.caseId }).then(response => {
        this.$set(row, 'copyIsLoading', false)
        if (this.showMessage(this, response)) {
          this.getStepList()
        }
      })
    },

    pullCaseStep(row) {
      this.$set(row, 'pullIsLoading', true)
      this.pullStepUrl({ 'current': row.id, 'caseId': this.caseId }).then(response => {
        this.$set(row, 'pullIsLoading', false)
        if (this.showMessage(this, response)) {
          this.getStepList()
        }
      })
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
    },

    // 拖拽排序
    setSort() {
      const el = this.$refs.stepListTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost',
        setData: function(dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.stepList.splice(evt.oldIndex, 1)[0]
          this.stepList.splice(evt.newIndex, 0, targetRow)
          const tempIndex = this.newList.splice(evt.oldIndex, 1)[0]
          this.newList.splice(evt.newIndex, 0, tempIndex)

          this.tableLoadingIsShow = true
          this.stepSortUrl({
            List: this.newList
          }).then(response => {
            this.showMessage(this, response)
            this.tableLoadingIsShow = false
          })
        }
      })
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
