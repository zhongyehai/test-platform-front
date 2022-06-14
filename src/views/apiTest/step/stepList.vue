<template>
  <div class="app-container">

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
    >
      <el-table-column prop="num" label="序号" min-width="9%">
        <template slot-scope="scope">
          <span>{{ scope.$index + 1 }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="执行" min-width="11%">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.is_run" @change="changeStepIsRun(scope.$index)"></el-switch>
        </template>
      </el-table-column>

      <el-table-column align="center" label="步骤名称" min-width="35%">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" min-width="18%">
        <template slot-scope="scope">

          <!-- 复制步骤 -->
          <el-popconfirm
            placement="top"
            hide-icon
            style="margin-right: 10px"
            title="复制此步骤并生成新的步骤？"
            confirm-button-text='确认'
            cancel-button-text='取消'
            @confirm="copy(scope.row)"
          >
            <el-button
              type="text"
              slot="reference"
              icon="el-icon-document-copy"
              :loading="scope.row.copyIsLoading"
            ></el-button>
          </el-popconfirm>

          <!-- 编辑步骤 -->
          <el-button
            v-if="!scope.row.quote_case"
            type="text"
            size="mini"
            style="margin-right: 10px"
            icon="el-icon-edit"
            @click.native="editStep(scope.row, scope.$index)"></el-button>

          <!-- 删除步骤 -->
          <el-popconfirm
            v-if="!scope.row.quote_case"
            placement="top"
            hide-icon
            :title="`确定删除【${scope.row.name}】?`"
            confirm-button-text='确认'
            cancel-button-text='取消'
            @confirm="deleteStepOnList({id: scope.row.id, index: scope.$index})"
          >
            <el-button
              slot="reference"
              type="text"
              style="color: red"
              icon="el-icon-delete"
            ></el-button>
            <!--:loading="scope.row.deleteLoadingIsShow"-->
          </el-popconfirm>

          <!-- 解除引用 -->
          <el-popconfirm
            v-if="scope.row.quote_case"
            placement="top"
            hide-icon
            :title="`是否解除引用【${scope.row.name}】？`"
            confirm-button-text='确认'
            cancel-button-text='取消'
            @confirm="deleteStepOnList({id: scope.row.id, index: scope.$index})"
          >
            <el-button
              slot="reference"
              type="text"
              style="color: red"
              icon="el-icon-delete"
            ></el-button>
            <!--:loading="scope.row.deleteLoadingIsShow"-->
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import Sortable from 'sortablejs'

import {deleteStep, putStepIsRun, stepSort, stepCopy} from "@/apis/apiTest/step"

export default {
  name: 'stepList',
  components: {},
  props: ['caseId', 'caseStepList'],
  data() {
    return {

      // 加载状态
      tableLoadingIsShow: false,

      // 步骤列表
      stepList: [],

      // 当前步骤
      currentStep: {},

      // 拖拽排序参数
      sortable: null,
      oldList: [],
      newList: [],

      tableHeight: 500  // 表格高度
    }
  },

  mounted() {

    // 新增步骤提交事件，把此步骤添加到步骤列表
    this.$bus.$on(this.$busEvents.api.apiAddStepIsCommit, (step) => {
      this.stepList.push(step)

      this.oldList = this.stepList.map(v => v.id)
      this.newList = this.oldList.slice()
    })

    // 修改步骤提交事件，更改对应的步骤数据
    this.$bus.$on(this.$busEvents.api.apiEditStepIsCommit, (step) => {
      for (let index in this.stepList) {
        if (this.stepList[index].id === step.id) {
          for (let key in step) {
            this.$set(this.stepList[index], key, step[key])
          }
          // this.stepList[index] = step
          return
        }
      }
    })
  },

  beforeDestroy() {
    // 页面销毁的时候，关闭bus监听选中事件
    this.$bus.$off(this.$busEvents.api.apiAddStepIsCommit)
    this.$bus.$off(this.$busEvents.api.apiEditStepIsCommit)
  },

  created() {

    this.tableHeight = window.innerHeight * 0.78;

    // 初始化父组件传过来的步骤列表
    this.stepList = this.caseStepList ? this.caseStepList : []

    this.oldList = this.stepList.map(v => v.id)
    this.newList = this.oldList.slice()
    this.$nextTick(() => {
      this.setSort()
    })
  },
  methods: {

    // 修改步骤的执行状态
    changeStepIsRun(index) {
      let step = this.stepList[index]
      putStepIsRun({'id': step.id, 'is_run': step.is_run}).then(response => {
        this.showMessage(this, response)
      })
    },

    // 删除步骤
    deleteStepOnList(stepInfo) {
      this.tableLoadingIsShow = true
      deleteStep({"id": stepInfo.id}).then(response => {
        this.tableLoadingIsShow = false
        if (this.showMessage(this, response)) {
          this.stepList.splice(stepInfo.index, 1)  // 从步骤列表中删除步骤
        }
      })
    },

    // 点击编辑步骤
    editStep(row, index) {
      this.currentStep = row
      this.$bus.$emit(this.$busEvents.api.apiEditStep, this.currentStep)
    },

    // 复制步骤
    copy(row) {
      this.$set(row, 'copyIsLoading', true)
      stepCopy({'id': row.id}).then(response => {
        this.$set(row, 'copyIsLoading', false)
        if (this.showMessage(this, response)) {
          this.stepList.push(response.data)

          this.oldList = this.stepList.map(v => v.id)
          this.newList = this.oldList.slice()
        }
      })
    },

    // 拖拽排序
    setSort() {
      const el = this.$refs.stepListTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost',
        setData: function (dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.stepList.splice(evt.oldIndex, 1)[0]
          this.stepList.splice(evt.newIndex, 0, targetRow)
          const tempIndex = this.newList.splice(evt.oldIndex, 1)[0]
          this.newList.splice(evt.newIndex, 0, tempIndex)

          this.tableLoadingIsShow = true
          stepSort({
            List: this.newList
          }).then(response => {
            this.showMessage(this, response)
            this.tableLoadingIsShow = false
          })
        }
      })
    }
  },
  watch: {
    'caseStepList': {

      handler(newVal, oldVal) {
        if (newVal && newVal.length > 0) {
          this.stepList = newVal
        } else {
          this.stepList = []
        }

        this.oldList = this.stepList.map(v => v.id)
        this.newList = this.oldList.slice()
      }
    }
  }
}
</script>

<style>
.sortable-ghost {
  opacity: .8;
  color: #fff !important;
  background: #42b983 !important;
}
</style>

<style scoped>

</style>
