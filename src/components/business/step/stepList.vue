<template>
  <div class="app-container">
    <el-form v-show="selectedList.length > 0" label-width="80px" inline>

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
        <span><i style="color: #409EFF; margin-left: 10px" class="el-icon-question" /></span>
      </el-tooltip>

    </el-form>

    <!-- 步骤列表 -->
    <el-table
      ref="stepListTable"
      v-loading="tableLoadingIsShow"
      element-loading-text="正在获取数据..."
      element-loading-spinner="el-icon-loading"
      :data="stepList"
      fit
      row-key="id"
      highlight-current-row
      style="width: 100%"
      :height="tableHeight"
      :expand-row-keys="expands"
      stripe
      lazy
      :load="getStep"
      :tree-props="{ children: 'children', hasChildren: 'hasStep' }"
      @selection-change="clickSelectAll"
      @expand-change="changeExpandStatus"
    >

      <el-table-column type="selection" min-width="1%" />

      <el-table-column align="left" label="步骤名称" min-width="42%">
        <template slot-scope="scope">
          <el-tag
            size="small"
            :type="scope.row.quote_case ? 'warning' : 'success'"
          >
            {{ scope.row.quote_case ? '引用用例' : '步骤' }}
          </el-tag>
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>

      <el-table-column v-if="dataType !== 'api'" align="left" label="执行事件" min-width="10%">
        <template slot-scope="scope">
          <span>{{ parseExecuteType(scope.row.execute_type) }}</span>
        </template>
      </el-table-column>

      <el-table-column align="left" min-width="5%">
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
            <span><i style="color: #409EFF" class="el-icon-question" /></span>
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

      <el-table-column :show-overflow-tooltip="true" prop="desc" align="center" min-width="10%">
        <template slot="header">
          <span>用例详情</span>
          <el-tooltip
            class="item"
            effect="dark"
            placement="top-start"
          >
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
              :case-desc="scope.row.desc"
              :case-skip-if="scope.row.skip_if"
              :case-variables="scope.row.variables"
              :case-extracts="scope.row.output"
            />
            <span slot="reference"> {{ scope.row.desc || '-' }} </span>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column align="left" label="操作" min-width="10%">
        <template slot-scope="scope">

          <!-- 当前用例下的步骤才允许编辑 -->
          <el-button
            v-if="!scope.row.quote_case && scope.row.case_id === caseId"
            type="text"
            size="mini"
            style="margin-right: 10px"
            @click.native="editStep(scope.row)"
          >修改
          </el-button>

          <!-- 复制步骤 -->
          <el-popover
            :ref="scope.row.id"
            v-model="scope.row.copyStepPopoverIsShow"
            placement="top"
            style="margin-right: 10px"
            popper-class="down-popover"
          >
            <p>复制【当前步骤】并在当【前用用例】下生成新的步骤?</p>
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

          <!-- 只有当前用例下的步骤才允许删除 -->
          <el-popover
            v-if="scope.row.case_id === caseId"
            :ref="scope.row.id"
            v-model="scope.row.deletePopoverIsShow"
            placement="top"
            popper-class="down-popover"
          >
            <p>确定删除当前步骤?</p>
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

      <el-table-column prop="num" label="序号" min-width="3%">
        <template slot-scope="scope">
          <span>{{ scope.$index + 1 }}</span>
        </template>
      </el-table-column>

      <!-- 方便判断能否排序，渲染一列id，不展示给用户 -->
      <el-table-column v-show="false" prop="id" label="数据id" min-width="5%">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>

    </el-table>

  </div>
</template>

<script>
import { Message } from 'element-ui'
import Sortable from 'sortablejs'

import {
  deleteStep as apiDeleteStep,
  putStepIsRun as apiPutStepIsRun,
  stepSort as apiStepSort,
  stepCopy as apiStepCopy,
  stepList as apiStepList
} from '@/apis/apiTest/step'
import { caseFrom as apiCaseFrom, getCase as apiGetCase } from '@/apis/apiTest/case'

import {
  deleteStep as webUiDeleteStep,
  putStepIsRun as webUiPutStepIsRun,
  stepSort as webUiStepSort,
  stepCopy as webUiStepCopy,
  stepList as webUiStepList
} from '@/apis/webUiTest/step'
import { caseFrom as webUiCaseFrom, getCase as webUiGetCase } from '@/apis/webUiTest/case'

import {
  deleteStep as appUiDeleteStep,
  putStepIsRun as appUiPutStepIsRun,
  stepSort as appUiStepSort,
  stepCopy as appUiStepCopy,
  stepList as appUiStepList
} from '@/apis/appUiTest/step'
import { caseFrom as appUiCaseFrom, getCase as appUiGetCase } from '@/apis/appUiTest/case'
import showCaseDesc from '@/components/business/case/showCaseDesc.vue'

export default {
  name: 'StepList',
  components: {
    showCaseDesc
  },
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'dataType', 'caseId'
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

      useCaseDrawerFrom: 'stepList',

      expands: [], // 要展开的行数据的id

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

      sendSortRequest: false,

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
      getCaseUrl: ''
    }
  },
  watch: {
    'caseId': {
      handler(newVal, oldVal) {
        this.expands = []
        this.stepList = []
        if (newVal) {
          this.getStepList()
        }
      }
    }
  },

  mounted() {
    // 步骤提交事件，获取步骤列表
    this.$bus.$on(this.$busEvents.drawerIsCommit, (_type, caseId) => {
      if (_type === 'stepInfo') {
        this.getStepList(caseId)
      }
      // else if (_type === 'showStepList') {
      //   this.showCaseEditDrawer(caseId)
      // }
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
    } else if (this.dataType === 'webUi') {
      this.deleteStepUrl = webUiDeleteStep
      this.putStepIsRunUrl = webUiPutStepIsRun
      this.stepSortUrl = webUiStepSort
      this.stepCopyUrl = webUiStepCopy
      this.stepListUrl = webUiStepList
      this.caseFromUrl = webUiCaseFrom
      this.getCaseUrl = webUiGetCase
    } else {
      this.deleteStepUrl = appUiDeleteStep
      this.putStepIsRunUrl = appUiPutStepIsRun
      this.stepSortUrl = appUiStepSort
      this.stepCopyUrl = appUiStepCopy
      this.stepListUrl = appUiStepList
      this.caseFromUrl = appUiCaseFrom
      this.getCaseUrl = appUiGetCase
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

    // 第一次点击展开引用用例
    getStep(row, treeNode, resolve) {
      if (this.expands.indexOf(row.id) === -1) {
        // 获取引用用例的步骤列表
        this.stepListUrl({ caseId: row.quote_case }).then(response => {
          this.expands.push(row.id)
          resolve(response.data.data)
        })
      }
    },

    // 点击打开或者收起引用用例
    changeExpandStatus(row, status) {
      if (status === false) {
        this.expands.pop(row.id)
      } else {
        if (this.expands.indexOf(row.id) === -1) {
          this.expands.push(row.id)
        }
      }
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
      this.tableLoadingIsShow = true
      this.putStepIsRunUrl({ 'id': selectedIdList, 'status': changeStatus }).then(response => {
        this.tableLoadingIsShow = false
        this.showMessage(this, response)
        if (isGetStepList) {
          this.getStepList()
        }
      })
    },

    // 获取步骤列表
    getStepList(case_id) {
      this.tableIsLoading = true
      this.stepListUrl({ 'caseId': case_id || this.caseId }).then(response => {
        this.stepList = response.data.data

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
      this.$bus.$emit(
        this.$busEvents.drawerIsShow,
        'stepInfo',
        'edit',
        JSON.parse(JSON.stringify(this.currentStep))
      )
    },

    // 点击查看步骤
    // showCaseEditDrawer(caseId) {
    //   this.getCaseUrl({ id: caseId }).then(response => {
    //     this.$bus.$emit(
    //       this.$busEvents.drawerIsShow,
    //       'caseInfo',
    //       'edit',
    //       JSON.parse(JSON.stringify(response.data)),
    //       this.useCaseDrawerFrom
    //     )
    //   })
    // },

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

    // 拖拽排序
    setSort() {
      const that = this
      const el = this.$refs.stepListTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost',
        forceFallback: false,

        // 页面效果
        // 拖动数据是展开状态的，不允许拖拽排序
        // 拖动和要替换的步骤，有一个是非当前用例的步骤，不允许拖拽排序
        onMove: function(evt, originalEvent) {
          const from_id = parseInt(evt.dragged.children[6].innerText)
          const to_id = parseInt(evt.related.children[6].innerText)

          if (that.expands.indexOf(from_id) !== -1) {
            // Message.error('数据是展开状态的，不允许拖拽排序')
            that.sendSortRequest = false
            return false
          } else if (that.newList.indexOf(from_id) === -1 || that.newList.indexOf(to_id) === -1) {
            // Message.error(`拖动和要替换的步骤，有一个是非当前用例的步骤，不允许拖拽排序: ${that.newList}、${from_id}、${to_id}`)
            that.sendSortRequest = false
            return false
          }
          that.sendSortRequest = true
          return true
        },
        setData: function(dataTransfer) {
          dataTransfer.setData('Text', '')
        },

        // 发送排序请求
        onEnd: evt => {
          console.log('onEnd.evt: ', evt)

          // 非当前用例的步骤，不发送排序请求
          if (that.sendSortRequest) {
            const targetRow = this.stepList.splice(evt.oldIndex, 1)[0]
            this.stepList.splice(evt.newIndex, 0, targetRow)

            const tempIndex = this.newList.splice(evt.oldIndex, 1)[0]
            this.newList.splice(evt.newIndex, 0, tempIndex)

            this.tableLoadingIsShow = true
            this.stepSortUrl({ List: this.newList }).then(response => {
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
