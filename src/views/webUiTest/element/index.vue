<template>

  <div>
    <el-table
      ref="elementListTable"
      v-loading="tableLoadingIsShow"
      element-loading-text="正在排序中"
      element-loading-spinner="el-icon-loading"
      :data="elementList"
      row-key="id"
      stripe
    >
      <el-table-column prop="num" label="序号" min-width="7%">
        <template slot-scope="scope">
          <span> {{ (pageNum - 1) * pageSize + scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="name" label="元素名称" min-width="20%">
        <template slot-scope="scope">
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>

      <el-table-column
        :show-overflow-tooltip=true
        prop="by"
        label="定位方式"
        align="center"
        :render-header="renderBy"
        min-width="23%">
        <template slot-scope="scope">
          <span> {{ parseFindElementOption(scope.row.by) }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="element" align="center" label="元素表达式" min-width="23%">
        <template slot-scope="scope">
          <span> {{ scope.row.element }} </span>
        </template>
      </el-table-column>

      <el-table-column
        :show-overflow-tooltip=true
        prop="wait_time_out"
        align="center"
        label="等待时间(秒)"
        :render-header="renderWaitTimeOut"
        min-width="15%">
        <template slot-scope="scope">
          <span> {{ scope.row.wait_time_out }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="create_user" align="center" label="最后修改人" min-width="10%">
        <template slot-scope="scope">
          <span>{{ parseUser(scope.row.update_user) }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" min-width="8%">
        <template slot-scope="scope">

          <!--修改元素-->
          <el-button
            type="text"
            style="margin-right: 8px"
            icon="el-icon-edit"
            @click="showEditForm(scope.row)">
          </el-button>

          <!-- 复制元素 -->
          <el-popover
            :ref="scope.row.id"
            placement="top"
            style="margin-right: 10px"
            popper-class="down-popover"
            v-model="scope.row.copyPopoverIsShow">
            <p>复制此元素并生成新的元素?</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="cancelCopyPopover(scope.row)">取消</el-button>
              <el-button type="primary" size="mini" @click="copyElement(scope.row)">确定</el-button>
            </div>
            <el-button
              slot="reference"
              type="text"
              icon="el-icon-document-copy"
            ></el-button>
          </el-popover>

          <!-- 删除元素 -->
          <el-popover
            :ref="scope.row.id"
            placement="top"
            popper-class="down-popover"
            v-model="scope.row.deletePopoverIsShow">
            <p>确定删除【{{ scope.row.name }}】?</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="cancelDeletePopover(scope.row)">取消</el-button>
              <el-button type="primary" size="mini" @click="delElement(scope.row)">确定</el-button>
            </div>
            <el-button
              slot="reference"
              style="color: red"
              type="text"
              icon="el-icon-delete"
              :loading="scope.row.isShowDeleteLoading"
            ></el-button>
          </el-popover>
        </template>
      </el-table-column>

    </el-table>

    <pagination
      v-show="elementTotal>0"
      :total="elementTotal"
      :page.sync="pageNum"
      :limit.sync="pageSize"
      @pagination="getElementList"
    />

    <elementDrawer
      :currentProjectId="currentProjectId"
      :currentModuleId="currentModuleId"
      :currentPageId="pageId"
    ></elementDrawer>
  </div>
</template>

<script>
import Sortable from 'sortablejs'
import Pagination from '@/components/Pagination'

import elementDrawer from '@/views/webUiTest/element/drawer'

import {userList} from '@/apis/system/user'
import {elementList, deleteElement, elementSort} from '@/apis/webUiTest/element'


export default {
  name: 'index',
  components: {
    Pagination,
    elementDrawer
  },

  // 接收父组件传参的key
  props: [
    'currentProjectId',
    'currentModuleId',
    'currentPageId',
    'userDict'
  ],
  data() {
    return {
      tableLoadingIsShow: false,  // 请求列表等待响应的状态
      tempElement: {},  // 元素新增/编辑临时数据

      // 元素数据列表
      pageNum: 1,
      pageSize: 20,
      elementTotal: 0,
      elementList: [],
      userList: [],
      // userDict: {},
      // 拖拽排序参数
      sortable: null,
      oldList: [],
      newList: [],
      pageId: ''
    }
  },

  created() {

    this.oldList = this.elementList.map(v => v.id)
    this.newList = this.oldList.slice()
    this.$nextTick(() => {
      this.setSort()
    })

    this.pageId = this.currentPageId
    if (this.currentPageId) {
      this.getElementList()
    }
  },

  mounted() {

    this.$bus.$on(this.$busEvents.ui.uiElementDrawerCommitSuccess, (status) => {
      this.getElementList()
    })
  },

  methods: {

    // 解析用户
    parseUser(userId) {
      return this.userDict[userId].name
    },

    // 打开编辑框
    showEditForm(row) {
      this.tempElement = JSON.parse(JSON.stringify(row))
      this.$bus.$emit(this.$busEvents.ui.uiElementDrawerStatus, 'edit', this.tempElement)
    },

    // 删除元素
    delElement(row) {
      this.$set(row, 'deletePopoverIsShow', false)
      this.$set(row, 'isShowDeleteLoading', true)
      deleteElement({'id': row.id}).then(response => {
        this.$set(row, 'isShowDeleteLoading', false)
        if (this.showMessage(this, response)) {
          this.getElementList()
        }
      })
    },

    // 解析定位方式
    parseFindElementOption(option){
      return this.$busEvents.data.findElementOptionDict[option]
    },

    cancelDeletePopover(row){
      this.$set(row, 'deletePopoverIsShow', false)
    },

    cancelCopyPopover(row){
      this.$set(row, 'copyPopoverIsShow', false)
    },

    // 复制元素
    copyElement(element) {
      this.tempElement = element
      this.tempElement.id = ''
      this.$bus.$emit(this.$busEvents.ui.uiElementDrawerStatus, 'copy', JSON.parse(JSON.stringify(this.tempElement)))
      this.$set(element, 'copyPopoverIsShow', false)
    },

    // 根据页面获取元素列表
    getElementList(params) {
      this.tableLoadingIsShow = true
      if (this.pageId) {
        elementList({
          'pageId': this.pageId,
          'pageNum': this.pageNum,
          'pageSize': this.pageSize
        }).then(response => {
          this.elementList = response.data.data
          this.elementTotal = response.data.total

          this.oldList = this.elementList.map(v => v.id)
          this.newList = this.oldList.slice()
        })
      }
      this.tableLoadingIsShow = false
    },

    // 拖拽排序
    setSort() {
      const el = this.$refs.elementListTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost',
        setData: function (dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.elementList.splice(evt.oldIndex, 1)[0]
          this.elementList.splice(evt.newIndex, 0, targetRow)
          const tempIndex = this.newList.splice(evt.oldIndex, 1)[0]
          this.newList.splice(evt.newIndex, 0, tempIndex)

          // 发送请求，改变排序
          this.tableLoadingIsShow = true
          elementSort({
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
    renderBy (h, {column}) {
      // 悬浮提示的文字内容
      const info = '在此处新增/修改地址（定位方式为【页面地址】）后，会自动同步到页面信息的页面地址'
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
    renderWaitTimeOut (h, {column}) {
      // 悬浮提示的文字内容
      const info = '预设等待元素出现的超时时间，再执行用例时，将会执行此时间的等待'
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

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.ui.uiElementDrawerCommitSuccess)
    // this.$bus.$off(this.$busEvents.ui.uiPageDrawerCommitSuccess)
    // this.$bus.$off(this.$busEvents.ui.uiPageDrawerIsOpen)
  },

  watch: {

    // 监听父组件传过来的当前选中的页面，获取对应的元素列表
    'currentPageId': {
      deep: true,  // 深度监听
      handler(newVal, oldVal) {
        if (newVal) {
          this.pageId = newVal
          this.getElementList()
        } else {
          this.elementList = []
        }
      }
    }
  }
}
</script>

<style>

</style>
