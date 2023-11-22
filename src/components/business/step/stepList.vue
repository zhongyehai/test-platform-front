<template>
  <div class="app-container">
    <!-- 拖拽排序调试用 -->
    <!--    <div style="margin-bottom: 20px">-->
    <!--      <el-row>-->
    <!--        <el-col :span="8">expandIds： {{ expandIds }}</el-col>-->
    <!--      </el-row>-->
    <!--    </div>-->
    <!--    <div style="margin-bottom: 20px">oldList: {{ oldList }}</div>-->
    <!--    <div style="margin-bottom: 20px">newList: {{ newList }}</div>-->

    <el-form label-width="80px" inline>

      <!--  批量删除 -->
      <el-popover
        v-model="showBatchDelete"
        placement="top"
        popper-class="down-popover"
      >
        <p>确定删除所选中的测试步骤?</p>
        <div style="text-align: right; margin: 0">
          <el-button size="mini" type="text" @click="cancelBatchDeletePopover()">取消</el-button>
          <el-button type="primary" size="mini" @click="deleteStepOnList">确定</el-button>
        </div>
        <el-button
          slot="reference"
          :disabled="selectedDataList.length === 0"
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
          :disabled="selectedDataList.length === 0"
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
          :disabled="selectedDataList.length === 0"
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
        <span><i style="color: #409EFF; margin-left: 10px" class="el-icon-question" /></span>
      </el-tooltip>

    </el-form>

    <!-- 步骤列表 -->
    <!--    :show-header="false"-->
    <el-table
      ref="stepListTable"
      v-loading="tableLoadingIsShow"
      element-loading-text="正在获取数据..."
      element-loading-spinner="el-icon-loading"
      :data="stepList"
      fit
      size="mini"
      row-key="id"
      highlight-current-row
      style="width: 100%"
      :height="tableHeight"
      :expand-row-keys="expandIds"
      :header-cell-style="{'text-align':'center'}"
      :row-class-name="hiddenExpandRowIcon"
      stripe
      @selection-change="clickSelectAll"
      @expand-change="changeExpandStatus"
      @cell-dblclick="cellDblclick"
    >
      <el-table-column type="selection" min-width="2%" />

      <el-table-column v-show="false" type="expand" min-width="0%">
        <template slot-scope="scope">
          <expandStepList
            :ref="`${scope.row.id}_${scope.$index}_${scope.row.quote_case}`"
            :data-type="dataType"
            :min-width="7"
            :current-case-id="scope.row.quote_case"
            :step-list="scope.row.stepList"
          />
        </template>
      </el-table-column>

      <el-table-column prop="num" label="序号" min-width="4%">
        <template slot-scope="scope">
          <span>{{ scope.$index + 1 }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="status" label="状态" min-width="5%">
        <template slot="header">
          <span>状态</span>
          <el-tooltip class="item" effect="dark" placement="top-start">
            <div slot="content">
              <div>若此处设置为不运行，则执行测试时将不会运行此步骤</div>
            </div>
            <span><i style="color: #409EFF" class="el-icon-question" /></span>
          </el-tooltip>
        </template>
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            size="mini"
            :inactive-value="0"
            :active-value="1"
            @change="changeStatus(scope.row, null, true)"
          />
        </template>
      </el-table-column>

      <el-table-column align="left" prop="name" label="步骤名称" min-width="45%">
        <template slot-scope="scope">
          <el-tag
            size="small"
            :type="scope.row.quote_case ? 'warning' : 'success'"
          >
            {{ scope.row.quote_case ? '引用' : '步骤' }}
          </el-tag>
          <!-- 调试排序用 -->
          <!--  <span> {{ scope.row.id }}_{{ scope.row.name }} </span> -->
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>

      <el-table-column v-if="dataType !== 'api'" align="right" prop="execute_type" label="执行事件" min-width="15%">
        <template slot-scope="scope">
          <span>{{ parseExecuteType(scope.row.execute_type) }}</span>
        </template>
      </el-table-column>

      <el-table-column show-overflow-tooltip prop="desc" align="right" min-width="10%">
        <template slot="header">
          <span>详情</span>
          <el-tooltip class="item" effect="dark" placement="top-start">
            <div slot="content">
              <div>引用用例的详情</div>
            </div>
            <span><i style="color: #409EFF" class="el-icon-question" /></span>
          </el-tooltip>
        </template>
        <template slot-scope="scope">
          <el-popover
            v-if="scope.row.quote_case"
            :ref="scope.row.id"
            trigger="hover"
            placement="bottom-start"
            style="margin-right: 10px"
            popper-class="down-popover"
          >
            <showCaseDesc
              :data-type="dataType"
              :case-desc="scope.row.desc"
              :case-skip-if="scope.row.skip_if"
              :case-variables="scope.row.variables"
              :case-extracts="scope.row.output"
              :case-id="scope.row.quote_case"
            />
            <span slot="reference"> {{ scope.row.desc || '-' }} </span>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column align="right" label="操作" min-width="15%">
        <template slot-scope="scope">

          <!-- 步骤为引用用例的只支持改名字 -->
          <el-button
            v-if="scope.row.quote_case"
            type="text"
            size="mini"
            @click.native="showEditQuoteCaseName(scope.row)"
          >改名
          </el-button>

          <!-- 当前用例下的步骤才允许编辑 -->
          <el-button
            v-if="!scope.row.quote_case"
            type="text"
            size="mini"
            @click.native="editStep(scope.row)"
          >修改
          </el-button>

          <!-- 拉取引用用例下的步骤 -->
          <el-button
            v-if="scope.row.quote_case"
            type="text"
            size="mini"
            :disabled="scope.row.pullIsDisabled"
            @click="showOperateDialog('pull', scope.row)"
          >拉取
          </el-button>

          <!-- 复制【当前步骤】并在当【前用用例】下生成新的步骤 -->
          <el-button
            type="text"
            size="mini"
            :disabled="scope.row.copyIsDisabled"
            @click="showOperateDialog('copy', scope.row)"
          >复制
          </el-button>

          <!-- 只有当前用例下的步骤才允许删除 -->
          <el-button
            type="text"
            size="mini"
            :disabled="scope.row.deleteIsDisabled"
            style="color: red"
            @click="showOperateDialog('delete', scope.row)"
          >删除
          </el-button>

        </template>
      </el-table-column>

    </el-table>

    <el-drawer
      title="修改引用用例的名字"
      size="50%"
      append-to-body
      :visible.sync="editQuoteCaseNameDrawerIsShow"
      :direction="direction"
    >
      <el-form label-width="120px" style="margin-left: 20px;margin-right: 20px">

        <el-form-item label="步骤名称" size="mini" class="is-required">
          <el-input v-model="currentStep.name" auto-complete="off" />
        </el-form-item>
      </el-form>

      <div class="demo-drawer__footer">

        <el-button size="mini" @click="editQuoteCaseNameDrawerIsShow = false">取 消</el-button>
        <el-button
          type="primary"
          size="mini"
          :loading="submitButtonIsLoading"
          @click.native="saveQuoteCaseName()"
        >保存
        </el-button>
      </div>
    </el-drawer>

    <el-dialog
      width="40%"
      title="请确认"
      :visible.sync="operateDialogIsShow"
      append-to-body
    >
      <span>{{ operateMessage }}</span>

      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="operateDialogIsShow = false">取 消</el-button>
        <el-button v-loading="operateConfirmIsLoading" size="mini" type="primary" @click="confirmOperateDialog()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Sortable from 'sortablejs'

import {
  deleteStep as apiDeleteStep,
  putStepIsRun as apiPutStepIsRun,
  stepSort as apiStepSort,
  stepCopy as apiStepCopy,
  stepList as apiStepList,
  putStep as apiPutStep
} from '@/apis/apiTest/step'
import { caseFrom as apiCaseFrom, getCase as apiGetCase, copyCaseStep as apiCopyCaseStep } from '@/apis/apiTest/case'

import {
  deleteStep as webUiDeleteStep,
  putStepIsRun as webUiPutStepIsRun,
  stepSort as webUiStepSort,
  stepCopy as webUiStepCopy,
  stepList as webUiStepList,
  putStep as webUiPutStep
} from '@/apis/webUiTest/step'
import { caseFrom as webUiCaseFrom, getCase as webUiGetCase, copyCaseStep as webUiCopyCaseStep } from '@/apis/webUiTest/case'

import {
  deleteStep as appUiDeleteStep,
  putStepIsRun as appUiPutStepIsRun,
  stepSort as appUiStepSort,
  stepCopy as appUiStepCopy,
  stepList as appUiStepList,
  putStep as appUiPutStep
} from '@/apis/appUiTest/step'
import { caseFrom as appUiCaseFrom, getCase as appUiGetCase, copyCaseStep as appUiCopyCaseStep } from '@/apis/appUiTest/case'
import showCaseDesc from '@/components/business/case/showCaseDesc.vue'
import expandStepList from '@/components/business/step/expandStepList.vue'
export default {
  name: 'StepList',
  components: {
    expandStepList,
    showCaseDesc
  },
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'dataType', 'caseId'
  ],
  data() {
    return {

      // 抽屉
      direction: 'rtl', // 抽屉打开方式

      // 表格
      tableLoadingIsShow: false, // 表格加载状态
      stepList: [], // 步骤列表
      expandIds: [], // 要展开的行数据的id
      tableHeight: 500, // 表格高度
      selectedDataList: [],
      showBatchDelete: false,
      showBatchChangeStatusToRun: false,
      showBatchChangeStatusToNotRun: false,

      // dialog 确认框
      operateDialogIsShow: false, // 操作确认框
      operateType: '', // 操作类型
      operateMessage: '', // 操作类型
      operateConfirmIsLoading: false, // 确认按钮loading
      operateData: {}, // 操作的数据，有可能是展开的子组件发起的操作

      // 拖拽排序参数
      sortable: null,
      oldList: [],
      newList: [],

      currentStep: {},
      submitButtonIsLoading: false,
      editQuoteCaseNameDrawerIsShow: false,

      deleteStepUrl: '',
      putStepIsRunUrl: '',
      copyCaseStepUrl: '',
      stepSortUrl: '',
      stepCopyUrl: '',
      stepListUrl: '',
      caseFromUrl: '',
      putStepUrl: '',
      getCaseUrl: ''
    }
  },

  mounted() {
    // 打开用例编辑框，获取步骤列表
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, command, currentCase) => {
      if (_type === 'caseInfo' && command === 'edit') {
        this.getStepList(currentCase.id)
      }
    })

    // 子组件的操作
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, command, row) => {
      if (_type === 'expandStepList') {
        if (command === 'getExpandData') { // 子组件展开数据
          this.tableLoadingIsShow = !this.tableLoadingIsShow
        } else {
          this.showOperateDialog(command, row)
        }
      }
    })

    // 步骤提交事件，获取步骤列表
    this.$bus.$on(this.$busEvents.drawerIsCommit, (_type, caseId) => {
      if (_type === 'stepInfo') {
        this.getStepList(caseId)
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
      this.putStepUrl = apiPutStep
      this.copyCaseStepUrl = apiCopyCaseStep
    } else if (this.dataType === 'webUi') {
      this.deleteStepUrl = webUiDeleteStep
      this.putStepIsRunUrl = webUiPutStepIsRun
      this.stepSortUrl = webUiStepSort
      this.stepCopyUrl = webUiStepCopy
      this.stepListUrl = webUiStepList
      this.caseFromUrl = webUiCaseFrom
      this.getCaseUrl = webUiGetCase
      this.putStepUrl = webUiPutStep
      this.copyCaseStepUrl = webUiCopyCaseStep
    } else {
      this.deleteStepUrl = appUiDeleteStep
      this.putStepIsRunUrl = appUiPutStepIsRun
      this.stepSortUrl = appUiStepSort
      this.stepCopyUrl = appUiStepCopy
      this.stepListUrl = appUiStepList
      this.caseFromUrl = appUiCaseFrom
      this.getCaseUrl = appUiGetCase
      this.putStepUrl = appUiPutStep
      this.copyCaseStepUrl = appUiCopyCaseStep
    }

    this.tableHeight = window.innerHeight * 0.80

    // 擦混关键组件时，初始化父组件传过来的步骤列表
    if (this.caseId) {
      this.getStepList()
    }
  },
  methods: {

    // 全选
    clickSelectAll(val) {
      this.selectedDataList = val
    },

    // 根据数据添加class
    hiddenExpandRowIcon(row) {
      const canNotSort = this.expandIds.length > 0 ? 'canNotSort' : '' // 是否能拖动
      const hiddenRowIcon = row.row.quote_case ? '' : 'hiddenRowIcon' // 是否展示展开/收起icon
      return `${canNotSort} ${hiddenRowIcon}`
    },

    // 打开二次操作确认框
    showOperateDialog(operateType, operateRow) {
      this.operateType = operateType
      this.operateData = operateRow
      this.operateConfirmIsLoading = false

      if (this.operateType === 'pull') {
        this.operateMessage = `复制引用用例【${operateRow.name}】下的步骤，并在当【前用用例】下生成新的步骤?`
      } else if (this.operateType === 'copy') {
        this.operateMessage = `复制步骤【${operateRow.name}】，并在当【前用用例】下生成新的步骤?`
      } else if (this.operateType === 'delete') {
        this.operateMessage = `删除步骤【${operateRow.name}】?`
      }

      this.operateDialogIsShow = true
    },

    // 提交二次确认
    confirmOperateDialog() {
      this.operateConfirmIsLoading = true
      if (this.operateType === 'pull') {
        this.pullCaseStep(this.operateData)
      } else if (this.operateType === 'copy') {
        this.copy(this.operateData)
      } else if (this.operateType === 'delete') {
        this.deleteStepOnList(this.operateData)
      }
      this.operateConfirmIsLoading = false
      this.operateDialogIsShow = false
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

    // 第一次点击展开引用用例
    getStep(row, treeNode, resolve) {
      if (this.expandIds.indexOf(row.id) === -1) {
        // 获取引用用例的步骤列表
        this.stepListUrl({ case_id: row.quote_case }).then(response => {
          this.expandIds.push(row.id)
          resolve(response.data.data)
        })
      }
    },

    // 双击单元格复制
    cellDblclick(row, column, cell, event) {
      const that = this
      if (column.property === 'name') {
        const data = row[column.property]
        this.$copyText(data).then(
          function(e) {
            that.$message.success('复制成功')
          }
        )
      }
    },

    // 点击打开或者收起引用用例
    changeExpandStatus(row, expandedRows) {
      const expandIdIndex = this.expandIds.indexOf(row.id)
      if (expandIdIndex === -1) {
        // 获取引用用例的步骤列表
        this.tableLoadingIsShow = true
        this.stepListUrl({ case_id: row.quote_case }).then(response => {
          this.tableLoadingIsShow = false
          this.expandIds.push(row.id)
          this.$set(row, 'stepList', response.data.data)
        })
      } else {
        this.expandIds.splice(expandIdIndex, 1)
      }
    },

    // 修改步骤的状态
    changeStatus(row, status, isGetStepList) {
      let selectedIdList = []
      // eslint-disable-next-line no-unused-vars
      let changeStatus = 0
      if (row === null) { // 批量修改
        this.showBatchChangeStatusToRun = false
        this.showBatchChangeStatusToNotRun = false
        this.selectedDataList.forEach(data => {
          selectedIdList.push(data.id)
        })
        changeStatus = status
      } else {
        selectedIdList = [row.id]
        changeStatus = row.status
      }
      this.tableLoadingIsShow = true
      this.putStepIsRunUrl({ id_list: selectedIdList, status: changeStatus }).then(response => {
        this.tableLoadingIsShow = false
        this.showMessage(this, response)
        if (isGetStepList) {
          this.getStepList()
        }
      })
    },

    // 获取步骤列表
    getStepList(case_id) {
      this.tableLoadingIsShow = true
      this.stepListUrl({ case_id: case_id || this.caseId, detail: true }).then(response => {
        this.tableLoadingIsShow = false

        this.expandIds = []
        this.stepList = response.data.data

        this.oldList = this.stepList.map(v => v.id)
        this.newList = this.oldList.slice()
        this.$nextTick(() => {
          this.setSort()
        })
      })
    },

    // 删除步骤
    deleteStepOnList(row) {
      let selectedIdList = []
      if (row.id) {
        this.$set(row, 'deletePopoverIsShow', false)
        selectedIdList = [row.id]
      } else { // 批量删除
        this.showBatchDelete = false
        this.selectedDataList.forEach(report => {
          selectedIdList.push(report.id)
        })
      }
      this.tableLoadingIsShow = true
      this.deleteStepUrl({ id_list: selectedIdList }).then(response => {
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

    // 打开引用用例名字修改框
    showEditQuoteCaseName(row) {
      this.currentStep = JSON.parse(JSON.stringify(row))
      this.editQuoteCaseNameDrawerIsShow = true
    },

    // 修改引用用例的名字
    saveQuoteCaseName() {
      this.submitButtonIsLoading = true
      this.putStepUrl(this.currentStep).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.editQuoteCaseNameDrawerIsShow = false
          this.getStepList()
        }
      })
    },

    // 点击编辑步骤
    editStep(row) {
      this.$bus.$emit(
        this.$busEvents.drawerIsShow,
        'stepInfo',
        'edit',
        row.case_id === this.caseId ? JSON.parse(JSON.stringify(row)) : row // 如果是引用用例下的步骤，就不深拷贝，就不必再取请求和加载被引用用例下的步骤列表
      )
    },

    // 复制步骤
    copy(row) {
      this.$set(row, 'copyIsDisabled', true)
      this.stepCopyUrl({ id: row.id, case_id: this.caseId }).then(response => {
        this.$set(row, 'copyIsDisabled', false)
        if (this.showMessage(this, response)) {
          this.getStepList()
        }
      })
    },

    // 拉取步骤
    pullCaseStep(row) {
      this.$set(row, 'pullIsDisabled', true)
      this.copyCaseStepUrl({ from_case: row.quote_case, to_case: this.caseId }).then(response => {
        this.$set(row, 'pullIsDisabled', false)
        if (this.showMessage(this, response)) {
          this.getStepList()
        }
      })
    },

    // 拖拽排序
    setSort() {
      const that = this
      const el = this.$refs.stepListTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost',
        forceFallback: false,
        filter: '.canNotSort', // 不可拖动的class

        // 选中数据回调函数
        // onChoose: function(evt) {
        //   // console.log(evt)
        //   const choose_id = parseInt(evt.item.children[index].innerText)
        //   console.log('choose_id: ', choose_id)
        // },

        // 开始拖动事件
        // onStart: function(evt) {
        //   console.log(evt)
        //   console.log(evt.item.children)
        //   console.log(evt.oldIndex)
        //   const start_id = parseInt(evt.item.children[index].innerText)
        //   console.log('start_id: ', start_id)
        //   that.sendSortRequest = true
        // },

        // 拖动数据是展开状态的，不允许拖拽排序
        // 拖动和要替换的步骤，有一个是非当前用例的步骤，不允许拖拽排序
        onMove: function(evt, originalEvent) {
          // 如果拖动的数据的第一列不是selection，则说明是引用用例下的步骤，不允许拖动
          that.sendSortRequest = true
          if (evt.dragged.children[0]._prevClass.indexOf('selection') === -1) {
            that.sendSortRequest = false
            return false
          }
        },

        setData: function(dataTransfer) {
          dataTransfer.setData('Text', '')
        },

        // 发送排序请求
        onEnd: evt => {
          // 拖动过程中标识为 sendSortRequest，不发送排序请求
          if (that.sendSortRequest) {
            const stepData = this.stepList.splice(evt.oldIndex, 1)[0]
            this.stepList.splice(evt.newIndex, 0, stepData)

            const tempIndex = this.newList.splice(evt.oldIndex, 1)[0]
            this.newList.splice(evt.newIndex, 0, tempIndex)

            this.tableLoadingIsShow = true
            this.stepSortUrl({ id_list: this.newList }).then(response => {
              this.tableLoadingIsShow = false
              if (this.showMessage(this, response)) {
                this.getStepList()
              }
            })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
//隐藏表格的展开icon
::v-deep .hiddenRowIcon .el-table__expand-icon {
  display: none;
}
////隐藏表格的展开icon
//::v-deep .hiddenRowIcon .el-table__expand-icon .el-table__expand-icon--expanded {
//  display: none;
//}

//开关的尺寸
.el-switch__core {
  width: 30px !important;
  height: 16px;
}
.el-switch__core::after {
  width: 10px;
  height: 10px;
  margin-top: -1px;
}
.el-switch.is-checked .el-switch__core::after{
  margin-left: -15px;
}

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
