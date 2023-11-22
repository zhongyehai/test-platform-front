<template>
  <el-table
    v-loading="tableLoadingIsShow"
    :show-header="false"
    size="mini"
    element-loading-text="正在获取数据..."
    element-loading-spinner="el-icon-loading"
    :data="stepDataList"
    fit
    row-key="id"
    highlight-current-row
    style="width: 100%"
    :expand-row-keys="expandIds"
    :header-cell-style="{'text-align':'center'}"
    :row-class-name="hiddenExpandRowIcon"
    stripe
    @expand-change="changeExpandStatus"
    @cell-dblclick="cellDblclick"
  >

    <el-table-column :min-width="minWidth.toString() + '%'" />

    <el-table-column type="expand" min-width="2%">
      <template slot-scope="scope">
        <ExpandStepList
          :ref="`${scope.row.id}_${scope.$index}_${scope.row.quote_case}`"
          :step-list="scope.row.children"
          :data-type="dataType"
          :current-case-id="scope.row.quote_case"
          :min-width="minWidth + 1"
        />
      </template>
    </el-table-column>

    <el-table-column prop="status" label="状态" min-width="4%">
      <template slot-scope="scope">
        <el-tooltip
          class="item"
          effect="dark"
          placement="top-start"
          style="margin-right: 10px"
        >
          <div slot="content">
            <div>若此处设置为不运行，则执行测试时将不会运行此步骤</div>
          </div>
          <el-switch
            v-model="scope.row.status"
            size="mini"
            :inactive-value="0"
            :active-value="1"
            @change="changeStatus(scope.row, null, true)"
          />
        </el-tooltip>
      </template>
    </el-table-column>

    <el-table-column align="left" prop="name" label="步骤名称" min-width="48%">
      <template slot-scope="scope">
        <el-tag
          size="small"
          :type="scope.row.quote_case ? 'warning' : 'success'"
        >
          {{ scope.row.quote_case ? '引用' : '步骤' }}
        </el-tag>
        <span> {{ scope.row.name }} </span>
      </template>
    </el-table-column>

    <el-table-column v-if="dataType !== 'api'" align="left" prop="execute_type" label="执行事件" min-width="15%">
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
        <!--        <el-button-->
        <!--          v-if="scope.row.quote_case"-->
        <!--          type="text"-->
        <!--          size="mini"-->
        <!--          style="margin-right: 10px"-->
        <!--          @click.native="showEditQuoteCaseName(scope.row)"-->
        <!--        >改名-->
        <!--        </el-button>-->

        <el-button
          v-if="scope.row.quote_case"
          type="text"
          size="mini"
          @click.native="sendBus('pull', scope.row)"
        >拉取
        </el-button>

        <!-- 当前用例下的步骤才允许编辑 -->
        <el-button
          v-if="!scope.row.quote_case"
          type="text"
          size="mini"
          @click.native="editStep(scope.row)"
        >修改
        </el-button>

        <!-- 复制步骤 -->
        <el-button
          slot="reference"
          type="text"
          size="mini"
          @click="sendBus('copy', scope.row)"
        >复制
        </el-button>

      </template>
    </el-table-column>

  </el-table>
</template>

<script>

import {
  putStepIsRun as apiPutStepIsRun,
  stepList as apiStepList
} from '@/apis/apiTest/step'
import { caseFrom as apiCaseFrom, getCase as apiGetCase } from '@/apis/apiTest/case'

import {
  putStepIsRun as webUiPutStepIsRun,
  stepList as webUiStepList
} from '@/apis/webUiTest/step'
import { caseFrom as webUiCaseFrom, getCase as webUiGetCase } from '@/apis/webUiTest/case'

import {
  putStepIsRun as appUiPutStepIsRun,
  stepList as appUiStepList
} from '@/apis/appUiTest/step'
import { caseFrom as appUiCaseFrom, getCase as appUiGetCase } from '@/apis/appUiTest/case'
import showCaseDesc from '@/components/business/case/showCaseDesc.vue'

export default {
  name: 'ExpandStepList',
  components: {
    showCaseDesc
  },
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'dataType', 'currentCaseId', 'stepList', 'minWidth'
  ],
  data() {
    return {

      tableLoadingIsShow: false, // 加载状态
      expandIds: [], // 要展开的行数据的id
      selectedDataList: [], // 通过复选框勾选的数据
      stepDataList: this.stepList,
      putStepIsRunUrl: '',
      stepListUrl: '',
      caseFromUrl: '',
      getCaseUrl: ''
    }
  },

  watch: {
    'stepList': {
      deep: true,
      handler(newVal, oldVal) {
        this.stepDataList = newVal
      }
    }
  },

  created() {
    if (this.dataType === 'api') {
      this.putStepIsRunUrl = apiPutStepIsRun
      this.stepListUrl = apiStepList
      this.caseFromUrl = apiCaseFrom
      this.getCaseUrl = apiGetCase
    } else if (this.dataType === 'webUi') {
      this.putStepIsRunUrl = webUiPutStepIsRun
      this.stepListUrl = webUiStepList
      this.caseFromUrl = webUiCaseFrom
      this.getCaseUrl = webUiGetCase
    } else {
      this.putStepIsRunUrl = appUiPutStepIsRun
      this.stepListUrl = appUiStepList
      this.caseFromUrl = appUiCaseFrom
      this.getCaseUrl = appUiGetCase
    }
  },
  methods: {

    // 动态添加class
    hiddenExpandRowIcon(row) {
      return row.row.quote_case ? 'canNotSort' : 'canNotSort hiddenRowIcon'
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
        this.sendBus('getExpandData')
        this.stepListUrl({ case_id: row.quote_case }).then(response => {
          this.sendBus('getExpandData')
          this.expandIds.push(row.id)
          this.$set(row, 'children', response.data.data)
        })
      } else {
        this.expandIds.splice(expandIdIndex, 1)
      }
    },

    // 向父组件发操作消息
    sendBus(command, row) {
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'expandStepList', command, row)
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
      this.stepListUrl({ case_id: case_id || this.currentCaseId }).then(response => {
        this.tableLoadingIsShow = false
        this.stepDataList = response.data.data
      })
    },

    // 解析执行方式
    parseExecuteType(executeType) {
      return this.$busEvents.data.uiTestExecuteTypeDict[executeType]
    },

    // 点击编辑步骤
    editStep(row) {
      this.$bus.$emit(
        this.$busEvents.drawerIsShow,
        'stepInfo',
        'edit',
        // 如果是引用用例下的步骤，就不深拷贝，就不必提交后再去请求和加载被引用用例下的步骤列表
        row.case_id === this.currentCaseId ? JSON.parse(JSON.stringify(row)) : row
      )
    }
  }
}
</script>

<style lang="scss" scoped>
//隐藏表格的展开icon
::v-deep .hiddenRowIcon .el-table__expand-icon {
  display: none;
}

//开关的尺寸
.el-switch__core {
  width: 30px !important;
  height: 16px;
}
.el-switch__core::after {
  width: 14px;
  height: 14px;
  margin-top: -1px;
}
.el-switch.is-checked .el-switch__core::after{
  margin-left: -15px;
}

</style>

<style scoped>

</style>
