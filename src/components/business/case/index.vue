<template>
  <div>

    <!-- 结构树/用例列表 -->
    <el-tabs v-model="caseTab" class="table_padding table_case">

      <!-- 用例管理 -->
      <el-tab-pane label="用例列表" name="case">

        <el-table
          ref="caseTable"
          v-loading="tableLoadingIsShow"
          element-loading-text="正在排序中"
          element-loading-spinner="el-icon-loading"
          :data="case_list"
          row-key="id"
          stripe
        >
          <el-table-column prop="num" label="序号" align="center" min-width="10%">
            <template slot-scope="scope">
              <span> {{ (pageNum - 1) * pageSize + scope.$index + 1 }} </span>
            </template>
          </el-table-column>

          <el-table-column :show-overflow-tooltip=true prop="name" align="center" label="用例名称" min-width="46%">
            <template slot-scope="scope">
              <span> {{ scope.row.name }} </span>
            </template>
          </el-table-column>

          <el-table-column
            align="center"
            label="是否执行"
            min-width="15%"
            :render-header="renderHeader"
          >
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.status"
                :inactive-value="0"
                :active-value="1"
                @change="changeCaseIsRun(scope.row)"></el-switch>
            </template>
          </el-table-column>

          <el-table-column label="操作" align="center" min-width="14%">
            <template slot-scope="scope">

              <!-- 运行用例 -->
              <el-button
                type="text"
                size="mini"
                slot="reference"
                icon="el-icon-video-play"
                @click="clickRunCase(scope.row)"
              ></el-button>

              <!--修改用例-->
              <el-button
                type="text"
                size="mini"
                style="margin-right: 8px"
                icon="el-icon-edit"
                @click="editCase(scope.row)">
              </el-button>

              <!-- 复制用例 -->
              <el-popover
                :ref="scope.row.id"
                placement="top"
                style="margin-right: 10px"
                popper-class="down-popover"
                v-model="scope.row.copyPopoverIsShow">
                <p>复制用例及其步骤？</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="cancelCopyPopover(scope.row)">取消</el-button>
                  <el-button type="primary" size="mini" @click="copyCase(scope.row)">确定</el-button>
                </div>
                <el-button
                  slot="reference"
                  type="text"
                  size="mini"
                  icon="el-icon-document-copy"
                ></el-button>
              </el-popover>

              <!-- 删除用例 -->
              <el-popover
                :ref="scope.row.id"
                placement="top"
                popper-class="down-popover"
                v-model="scope.row.deletePopoverIsShow">
                <p>确定删除【{{ scope.row.name }}】?</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="cancelDeletePopover(scope.row)">取消</el-button>
                  <el-button type="primary" size="mini" @click="delCase(scope.row)">确定</el-button>
                </div>
                <el-button
                  slot="reference"
                  style="color: red"
                  type="text"
                  size="mini"
                  icon="el-icon-delete"
                  :loading="scope.row.isShowDeleteLoading"
                ></el-button>
              </el-popover>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="case_total>0"
          :total="case_total"
          :page.sync="pageNum"
          :limit.sync="pageSize"
          @pagination="getCaseList"
        />
      </el-tab-pane>

    </el-tabs>

    <caseDrawer
      :dataType="dataType"
      :currentProjectId="currentProjectId"
      :currentSetId="currentSetId"
      :dataTypeMapping="dataTypeMapping"
    ></caseDrawer>

  </div>
</template>

<script>
import Sortable from 'sortablejs'
import Pagination from '@/components/Pagination'
import caseDrawer from '@/components/business/case/drawer'

import {getConfigByName} from "@/apis/config/config";
import {
  caseList as apiCaseList,
  caseRun as apiCaseRun,
  deleteCase as apiDeleteCase,
  putCaseIsRun as apiPutCaseIsRun,
  caseSort as apiCaseSort
} from '@/apis/apiTest/case'

import {
  caseList as webUiCaseList,
  caseRun as webUiCaseRun,
  deleteCase as webUiDeleteCase,
  putCaseIsRun as webUiPutCaseIsRun,
  caseSort as webUiCaseSort
} from '@/apis/webUiTest/case'
import {executeList as webUiExecuteList} from "@/apis/webUiTest/step";

import {
  caseList as appUiCaseList,
  caseRun as appUiCaseRun,
  deleteCase as appUiDeleteCase,
  putCaseIsRun as appUiPutCaseIsRun,
  caseSort as appUiCaseSort
} from '@/apis/appUiTest/case'
import {executeList as appUiExecuteList} from "@/apis/appUiTest/step";


export default {
  name: 'index',
  components: {
    Pagination,
    caseDrawer
  },

  // 接收父组件传参的key
  props: [
    'dataType',
    'currentProjectId',
    'currentSetId'
  ],
  data() {
    return {

      // 初始化数据默认的数据
      pageNum: 1,
      pageSize: 20,

      tableLoadingIsShow: false,  // 请求列表等待响应的状态
      caseTab: 'case',  // tab页的显示

      tempCase: {},  // 用例新增/编辑临时数据
      currentCase: '',  // 当前点击的用例

      // 用例数据列表
      case_total: 0,
      case_list: [],

      // 拖拽排序参数
      sortable: null,
      oldList: [],
      newList: [],
      dataTypeMapping: [],

      caseListUrl: '',
      caseRunUrl: '',
      deleteCaseUrl: '',
      putCaseIsRunUrl: '',
      caseSortUrl: '',
      executeListUrl: '',
    }
  },

  methods: {

    // 编辑用例
    editCase(row) {
      this.tempCase = row
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'caseInfo', 'edit', this.tempCase)
    },

    // 删除用例
    delCase(row) {
      this.$set(row, 'deletePopoverIsShow', false)
      this.$set(row, 'isShowDeleteLoading', true)
      this.deleteCaseUrl({'id': row.id}).then(response => {
        this.$set(row, 'isShowDeleteLoading', false)
        if (this.showMessage(this, response)) {
          this.getCaseList()
        }
      })
    },

    // 复制用例
    copyCase(caseData) {
      this.tempCase = caseData
      this.tempCase.num = ''
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'caseInfo', 'copy', this.tempCase)
      this.$set(caseData, 'copyPopoverIsShow', false)
    },

    cancelDeletePopover(caseData) {
      this.$set(caseData, 'deletePopoverIsShow', false)
    },

    cancelCopyPopover(caseData) {
      this.$set(caseData, 'copyPopoverIsShow', false)
    },

    // 点击运行用例
    clickRunCase(row) {
      this.currentCase = row
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'selectRunEnv', 'caseIndex', false)
    },

    // 运行用例
    runCase(runConf) {
      this.caseRunUrl({
        caseId: [this.currentCase.id],
        env_code: runConf.runEnv,
        is_async: runConf.runType,
        browser: runConf.browser,
        'trigger_type': 'page'
      }).then(response => {
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.drawerIsShow, 'process', response.data.report_id)
        }
      })
    },

    // 修改用例状态
    changeCaseIsRun(row) {
      this.putCaseIsRunUrl({'id': row.id, 'status': row.status}).then(response => {
        this.showMessage(this, response)
      })
    },

    // 根据模块内容获取用例列表
    getCaseList(params) {
      this.tableLoadingIsShow = true
      this.caseListUrl({
        'setId': this.currentSetId,
        'pageNum': this.pageNum,
        'pageSize': this.pageSize
      }).then(response => {
        this.tableLoadingIsShow = false

        this.case_list = response.data.data
        this.case_total = response.data.total

        this.oldList = this.case_list.map(v => v.id)
        this.newList = this.oldList.slice()
      })

    },

    // 拖拽排序
    setSort() {
      const el = this.$refs.caseTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost',
        setData: function (dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.case_list.splice(evt.oldIndex, 1)[0]
          this.case_list.splice(evt.newIndex, 0, targetRow)

          const tempIndex = this.newList.splice(evt.oldIndex, 1)[0]
          this.newList.splice(evt.newIndex, 0, tempIndex)

          // 发送请求，改变排序
          this.tableLoadingIsShow = true
          this.caseSortUrl({
            List: this.newList,
            pageNum: this.pageNum,
            pageSize: this.pageSize,
          }).then(response => {
            this.showMessage(this, response)
            this.tableLoadingIsShow = false
          })
        }
      })
    },

    renderHeader(h, {column}) {
      // 悬浮提示的文字内容
      const info = '若此处设置为不运行，则运行用例集、定时任务时将不会运行此用例；请务必将用例调试通过后再设为要运行'
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

  mounted() {

    // 从后端获取数据类型映射
    getConfigByName({'name': 'data_type_mapping'}).then(response => {
      this.dataTypeMapping = JSON.parse(response.data.value)
    })

    // 如果是ui测试用例，则获取步骤执行方式
    if (this.dataType !== 'api') {
      this.executeListUrl().then(response => {
        this.executeTypeList = response.data
        this.$busEvents.data.executeTypeList = response.data
        this.$busEvents.data.executeTypeList.forEach(executeType => {
          this.$busEvents.data.executeTypeDict[executeType.value] = executeType.label
        })
      })
    }

    // 用例提交成功，请求用例列表
    this.$bus.$on(this.$busEvents.drawerIsCommit, (_type, _runUnit, runDict) => {
      if (_type === 'caseInfo') {
        this.getCaseList()
      } else if (_type === 'selectRunEnv' && _runUnit === 'caseIndex') {
        this.runCase(runDict)
      }
    })

    // this.$bus.$on(this.callBackEvent, (runDict) => {
    //   this.runCase(runDict)
    // })
  },

  created() {
    if (this.dataType === 'api') {
      this.caseListUrl = apiCaseList
      this.caseRunUrl = apiCaseRun
      this.deleteCaseUrl = apiDeleteCase
      this.putCaseIsRunUrl = apiPutCaseIsRun
      this.caseSortUrl = apiCaseSort
    } else if (this.dataType === 'webUi') {
      this.caseListUrl = webUiCaseList
      this.caseRunUrl = webUiCaseRun
      this.deleteCaseUrl = webUiDeleteCase
      this.putCaseIsRunUrl = webUiPutCaseIsRun
      this.caseSortUrl = webUiCaseSort
      this.executeListUrl = webUiExecuteList
    } else {
      this.caseListUrl = appUiCaseList
      this.caseRunUrl = appUiCaseRun
      this.deleteCaseUrl = appUiDeleteCase
      this.putCaseIsRunUrl = appUiPutCaseIsRun
      this.caseSortUrl = appUiCaseSort
      this.executeListUrl = appUiExecuteList
    }

    this.oldList = this.case_list.map(v => v.id)
    this.newList = this.oldList.slice()
    this.$nextTick(() => {
      this.setSort()
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsCommit)
  },

  watch: {

    // 监听父组件传过来的当前选中的用例集，实时获取父组件传过来的用例集对应下的用例列表
    'currentSetId': {
      deep: true,  // 深度监听
      handler(newVal, oldVal) {
        if (newVal) {
          this.getCaseList({
            'caseSetId': newVal,
            'pageNum': this.pageNum,
            'pageSize': this.pageSize
          })
        } else {
          this.case_list = []
        }
      }
    },
  }
}
</script>

<style>

</style>
