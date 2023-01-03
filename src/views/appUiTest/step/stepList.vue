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
      <el-table-column prop="num" label="序号" align="center" min-width="10%">
        <template slot-scope="scope">
          <span>{{ scope.$index + 1 }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="执行" min-width="15%" :render-header="renderHeader">
        <template slot-scope="scope">
          <el-switch
            :inactive-value="0"
            :active-value="1"
            v-model="scope.row.status"
            @change="changeStepIsRun(scope.$index)"></el-switch>
        </template>
      </el-table-column>

      <el-table-column align="center" label="执行事件" min-width="20%">
        <template slot-scope="scope">
          <span>{{ parseExecuteType(scope.row.execute_type) }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="步骤名称" min-width="30%">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" min-width="25%">
        <template slot-scope="scope">

          <!-- 编辑步骤 -->
          <el-button
            v-if="!scope.row.quote_case"
            type="text"
            size="mini"
            style="margin-right: 10px"
            icon="el-icon-edit"
            @click.native="editStep(scope.row, true)"></el-button>

          <!-- 复制引用用例的步骤 -->
          <el-popover
            :ref="`popover-${scope.row.id}`"
            v-if="scope.row.quote_case"
            placement="top"
            style="margin-right: 10px"
            popper-class="down-popover"
            v-model="scope.row.pullStepPopoverIsShow">
            <p>复制此引用用例的步骤并生成新的步骤?</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="cancelPullStepPopover(scope.row)">取消</el-button>
              <el-button type="primary" size="mini" @click="pullCaseStep(scope.row)">确定</el-button>
            </div>
            <el-button
              slot="reference"
              type="text"
              size="mini"
              icon="el-icon-bottom-left"
              :loading="scope.row.pullIsLoading"
            ></el-button>
          </el-popover>

          <!-- 复制步骤 -->
          <el-popover
            :ref="scope.row.id"
            placement="top"
            style="margin-right: 10px"
            popper-class="down-popover"
            v-model="scope.row.copyStepPopoverIsShow">
            <p>复制此步骤并生成新的步骤?</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="cancelCopyStepPopover(scope.row)">取消</el-button>
              <el-button type="primary" size="mini" @click="copy(scope.row)">确定</el-button>
            </div>
            <el-button
              slot="reference"
              type="text"
              size="mini"
              icon="el-icon-document-copy"
              :loading="scope.row.copyIsLoading"
            ></el-button>
          </el-popover>

          <!-- 查看用例描述 -->
          <el-button
            v-if="scope.row.quote_case"
            slot="reference"
            type="text"
            size="mini"
            style="margin-right: 5px"
            icon="el-icon-view"
            @click="showCaseRemark(scope.row.quote_case)"
          ></el-button>

          <!-- 删除步骤 -->
          <el-popover
            :ref="scope.row.id"
            v-if="!scope.row.quote_case"
            placement="top"
            popper-class="down-popover"
            v-model="scope.row.deletePopoverIsShow">
            <p>确定删除【{{ scope.row.name }}】?</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="cancelDeletePopover(scope.row)">取消</el-button>
              <el-button type="primary" size="mini"
                         @click="deleteStepOnList({id: scope.row.id, index: scope.$index, row: scope.row})">确定
              </el-button>
            </div>
            <el-button
              slot="reference"
              style="color: red"
              type="text"
              size="mini"
              icon="el-icon-delete"
            ></el-button>
          </el-popover>

          <!-- 解除引用 -->
          <el-popover
            :ref="scope.row.id"
            v-if="scope.row.quote_case"
            placement="top"
            popper-class="down-popover"
            v-model="scope.row.deletePopoverIsShow">
            <p>是否解除引用【{{ scope.row.name }}】?</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="cancelDeletePopover(scope.row)">取消</el-button>
              <el-button type="primary" size="mini"
                         @click="deleteStepOnList({id: scope.row.id, index: scope.$index, row: scope.row})">确定
              </el-button>
            </div>
            <el-button
              slot="reference"
              style="color: red"
              type="text"
              size="mini"
              icon="el-icon-delete"
            ></el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>

    <!-- 引用用例详情 -->
    <el-drawer
      title="用例信息"
      size="60%"
      :append-to-body="true"
      :wrapperClosable="false"
      :visible.sync="caseRemarkIsShow"
      :direction="direction">
      <div class="demo-drawer__content" style="margin-left: 20px">

        <!-- 用例来源 -->
        <div>
          <label>用例来源:</label>
          <div style="margin-top: 20px">
            {{caseFromDetail}}
            <el-button
              v-show="caseIdList.length > 1"
              type="primary"
              size="mini"
              @click="backLast()"
            >回到上一级</el-button>
          </div>
        </div>

        <hr style="margin-top: 20px; margin-bottom: 20px">

        <!-- 用例描述 -->
        <div>
          <label>用例描述:</label>
          <pre class="el-collapse-item-content" style="overflow: auto">{{ caseRemarkDetail }}</pre>
        </div>

        <hr style="margin-bottom: 20px">

        <!-- 步骤列表 -->
        <div>
          <label>步骤列表:</label>
          <el-table
            ref="caseStepListTable"
            :data="caseStepList"
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

            <el-table-column align="center" label="操作" min-width="30%">
              <template slot-scope="scope">

                <!-- 复制引用用例的步骤 -->
                <el-popover
                  :ref="`popover-${scope.row.id}`"
                  v-if="scope.row.quote_case"
                  placement="top"
                  style="margin-right: 10px"
                  popper-class="down-popover"
                  v-model="scope.row.pullStepPopoverIsShow">
                  <p>复制此引用用例的步骤并生成新的步骤?</p>
                  <div style="text-align: right; margin: 0">
                    <el-button size="mini" type="text" @click="cancelPullStepPopover(scope.row)">取消</el-button>
                    <el-button type="primary" size="mini" @click="pullCaseStep(scope.row)">确定</el-button>
                  </div>
                  <el-button
                    slot="reference"
                    type="text"
                    size="mini"
                    icon="el-icon-bottom-left"
                    :loading="scope.row.pullIsLoading"
                  ></el-button>
                </el-popover>

                <!-- 复制步骤 -->
                <el-popover
                  :ref="scope.row.id"
                  placement="top"
                  style="margin-right: 10px"
                  popper-class="down-popover"
                  v-model="scope.row.copyStepPopoverIsShow">
                  <p>复制此步骤并生成新的步骤?</p>
                  <div style="text-align: right; margin: 0">
                    <el-button size="mini" type="text" @click="cancelCopyStepPopover(scope.row)">取消</el-button>
                    <el-button type="primary" size="mini" @click="copy(scope.row)">确定</el-button>
                  </div>
                  <el-button
                    slot="reference"
                    type="text"
                    size="mini"
                    icon="el-icon-document-copy"
                    :loading="scope.row.copyIsLoading"
                  ></el-button>
                </el-popover>

                <!-- 查看用例详情 -->
                <el-button
                  v-if="scope.row.quote_case"
                  slot="reference"
                  type="text"
                  size="mini"
                  style="margin-right: 5px"
                  icon="el-icon-view"
                  @click="showCaseRemark(scope.row.quote_case)"
                ></el-button>

                <!-- 查看步骤详情 -->
                <el-button
                  v-if="!scope.row.quote_case"
                  slot="reference"
                  type="text"
                  size="mini"
                  style="margin-right: 5px"
                  icon="el-icon-view"
                  @click="editStep(scope.row, false)"
                ></el-button>

              </template>
            </el-table-column>
          </el-table>
        </div>

      </div>
    </el-drawer>
  </div>
</template>

<script>
import Sortable from 'sortablejs'

import {deleteStep, putStepIsRun, stepSort, stepCopy, executeList, stepList} from "@/apis/appUiTest/step"
import {getCase, pullStep, caseFrom} from "@/apis/appUiTest/case";

export default {
  name: 'stepList',
  components: {},
  props: ['caseId'],
  data() {
    return {
      tableLoadingIsShow: false,  // 加载状态
      stepList: [],  // 步骤列表
      currentStep: {},  // 当前步骤
      executeTypeList: [],

      // 拖拽排序参数
      sortable: null,
      oldList: [],
      newList: [],

      tableHeight: 500,  // 表格高度

      direction: 'rtl',  // 抽屉打开方式
      caseRemarkDetail: '',  // 被引用用例的描述
      caseFromDetail: '',
      caseStepList: [],
      caseIdList:[],  // 用于记录查看的用例的来源
      caseRemarkIsShow: false  // 是否展示被引用用例的描述
    }
  },

  mounted() {

    // 引用用例事件，把此步骤添加到步骤列表
    this.$bus.$on(this.$busEvents.ui.uiQuoteCaseToStep, (addStep) => {
      this.getStepList()
    })

    // 新增步骤提交事件，把此步骤添加到步骤列表
    this.$bus.$on(this.$busEvents.ui.uiAddStepIsCommit, (step) => {
      this.stepList.push(step)

      this.oldList = this.stepList.map(v => v.id)
      this.newList = this.oldList.slice()
    })

    // 修改步骤提交事件，更改对应的步骤数据
    this.$bus.$on(this.$busEvents.ui.uiEditStepIsCommit, (step) => {
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
    this.$bus.$off(this.$busEvents.ui.uiQuoteCaseToStep)
    this.$bus.$off(this.$busEvents.ui.uiAddStepIsCommit)
    this.$bus.$off(this.$busEvents.ui.uiEditStepIsCommit)
  },

  created() {

    // 获取步骤执行方式
    executeList().then(response => {
      this.executeTypeList = response.data
      this.$busEvents.data.executeTypeList = response.data
      this.$busEvents.data.executeTypeList.forEach(executeType => {
        this.$busEvents.data.executeTypeDict[executeType.value] = executeType.label
      })
    })

    this.tableHeight = window.innerHeight * 0.80;

    // 初始化父组件传过来的步骤列表
    if (this.caseId){
      this.getStepList()
    }
  },
  methods: {

    // 获取步骤列表
    getStepList() {
      this.tableIsLoading = true
      stepList({'caseId': this.caseId}).then(response => {
        this.stepList = response.data

        this.oldList = this.stepList.map(v => v.id)
        this.newList = this.oldList.slice()
        this.$nextTick(() => {
          this.setSort()
        })
      })
      this.tableIsLoading = false
    },

    // 修改步骤的执行状态
    changeStepIsRun(index) {
      let step = this.stepList[index]
      putStepIsRun({'id': step.id, 'status': step.status}).then(response => {
        this.showMessage(this, response)
      })
    },

    // 删除步骤
    deleteStepOnList(stepInfo) {
      this.$set(stepInfo.row, 'deletePopoverIsShow', false)
      this.tableLoadingIsShow = true
      deleteStep({"id": stepInfo.id}).then(response => {
        this.tableLoadingIsShow = false
        if (this.showMessage(this, response)) {
          this.stepList.splice(stepInfo.index, 1)  // 从步骤列表中删除步骤
        }
      })
    },

    // 点击查看步骤
    showCaseRemark(caseId){
      // 用例信息
      getCase({id:caseId}).then(response => {
        this.caseRemarkDetail = response.data.desc
      })

      // 用例归属
      caseFrom({id:caseId}).then(response => {
        this.caseFromDetail = response.data
      })

      // 步骤列表
      stepList({caseId:caseId}).then(response => {
        this.caseStepList = response.data
      })

      this.caseIdList.push(caseId)
      this.caseRemarkIsShow = true
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
    editStep(row, showSaveButton) {
      this.currentStep = JSON.parse(JSON.stringify(row))
      this.$bus.$emit(this.$busEvents.ui.uiShowStepDrawer, 'update', this.currentStep, showSaveButton)
    },

    // 复制步骤
    copy(row) {
      this.$set(row, 'copyStepPopoverIsShow', false)
      this.$set(row, 'copyIsLoading', true)
      stepCopy({'id': row.id, 'caseId': this.caseId}).then(response => {
        this.$set(row, 'copyIsLoading', false)
        if (this.showMessage(this, response)) {
          this.getStepList()
        }
      })
    },

    pullCaseStep(row){
      this.$set(row, 'pullIsLoading', true)
      pullStep({"current": row.id, 'caseId': this.caseId}).then(response => {
        this.$set(row, 'pullIsLoading', false)
        if (this.showMessage(this, response)) {
          this.getStepList()
        }
      })
    },

    // 回到上一个引用
    backLast(){
      this.caseIdList.pop()  // 当前引用id
      let caseId = this.caseIdList.pop()  // 上一个引用id
      this.showCaseRemark(caseId)
    },

    beforeCloseDrawer(done){
      this.caseIdList = []
      done()
    },

    // 解析执行方式
    parseExecuteType(executeType){
      return this.$busEvents.data.executeTypeDict[executeType]
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
    },
    renderHeader (h, {column}) {
      // 悬浮提示的文字内容
      const info = '若此处设置为不运行，则执行测试时将不会运行此步骤'
      return h(
        'div',
        [
          h('span', column.label),
          // placement指定悬浮显示方向
          h('el-tooltip', {props: {placement: 'top', effect: 'light'}},
            [
              // style 调文字颜色样式
              h('div', {slot: 'content', style: {whiteSpace: 'normal', color: 'blue'}}, info),
              // el-icon-warning是element图标, style 调图标颜色 样式
              h('i', {class: 'el-icon-warning', style: 'color: #409EFF; margin-left: 5px;'})
            ]
          )
        ]
      )
    },
  },
  watch: {
    'caseId': {
      handler(newVal, oldVal) {
        if (newVal) {
          this.getStepList()
        }else {
          this.stepList = []
        }
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
