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
      <el-table-column prop="num" label="序号" min-width="6%">
        <template slot-scope="scope">
          <span> {{ (pageNum - 1) * pageSize + scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" prop="name" label="元素名称" min-width="15%">
        <template slot-scope="scope">
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" align="center" min-width="12%">
        <template slot="header">
          <span>定位方式</span>
          <el-tooltip
            class="item"
            effect="dark"
            placement="top-start"
          >
            <div slot="content">
              <div>在此处新增/修改地址（定位方式为【页面地址】）后，会自动同步到页面信息的页面地址</div>
            </div>
            <span><i style="color: #409EFF" class="el-icon-question" /></span>
          </el-tooltip>
        </template>
        <template slot-scope="scope">
          <span> {{ parseFindElementOption(scope.row.by) }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" prop="element" align="center" label="元素表达式" min-width="42%">
        <template slot-scope="scope">
          <span> {{ scope.row.element }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" align="center" min-width="10%">
        <template slot="header">
          <span>等待时间(秒)</span>
          <el-tooltip class="item" effect="dark" placement="top-start">
            <div slot="content">
              <div>预设等待元素出现的超时时间，再执行用例时，将会执行此时间的等待(秒)</div>
            </div>
            <span><i style="color: #409EFF" class="el-icon-question" /></span>
          </el-tooltip>
        </template>
        <template slot-scope="scope">
          <span> {{ scope.row.wait_time_out }} </span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" min-width="15%">
        <template slot-scope="scope">

          <!--修改元素-->
          <el-button
            type="text"
            size="mini"
            style="margin-right: 8px"
            @click="showEditForm(scope.row)"
          >修改
          </el-button>

          <!-- 复制元素 -->
          <el-popover
            :ref="scope.row.id"
            v-model="scope.row.copyPopoverIsShow"
            placement="top"
            style="margin-right: 10px"
            popper-class="down-popover"
          >
            <p>复制此元素并生成新的元素?</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="cancelCopyPopover(scope.row)">取消</el-button>
              <el-button type="primary" size="mini" @click="copyElement(scope.row)">确定</el-button>
            </div>
            <el-button
              slot="reference"
              type="text"
              size="mini"
            >复制</el-button>
          </el-popover>

          <!-- 删除元素 -->
          <el-popover
            :ref="scope.row.id"
            v-model="scope.row.deletePopoverIsShow"
            placement="top"
            popper-class="down-popover"
          >
            <p>确定删除【{{ scope.row.name }}】?</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="cancelDeletePopover(scope.row)">取消</el-button>
              <el-button type="primary" size="mini" @click="delElement(scope.row)">确定</el-button>
            </div>
            <el-button
              slot="reference"
              style="color: red"
              type="text"
              size="mini"
              :loading="scope.row.isShowDeleteLoading"
            >删除</el-button>
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
      :data-type="dataType"
      :current-project-id="currentProjectId"
      :current-module-id="currentModuleId"
      :current-page-id="pageId"
    />

    <addElementDrawer
      :data-type="dataType"
      :current-project-id="currentProjectId"
      :current-module-id="currentModuleId"
      :current-page-id="pageId"
    />
  </div>
</template>

<script>
import Sortable from 'sortablejs'
import Pagination from '@/components/Pagination'

import elementDrawer from '@/components/business/element/editElementDrawer.vue'
import addElementDrawer from '@/components/business/element/addElementDrawer.vue'

import {
  elementList as webUiElementList,
  deleteElement as webUiDeleteElement,
  elementSort as webUiElementSort
} from '@/apis/webUiTest/element'
import {
  elementList as appElementList,
  deleteElement as appDeleteElement,
  elementSort as appElementSort
} from '@/apis/appUiTest/element'

export default {
  name: 'Index',
  components: {
    Pagination,
    elementDrawer,
    addElementDrawer
  },

  // 接收父组件传参的key
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'dataType', 'currentProjectId', 'currentModuleId', 'currentPageId'
  ],
  data() {
    return {
      tableLoadingIsShow: false, // 请求列表等待响应的状态
      tempElement: {}, // 元素新增/编辑临时数据

      // 元素数据列表
      pageNum: 1,
      pageSize: 20,
      elementTotal: 0,
      elementList: [],

      // 拖拽排序参数
      sortable: null,
      oldList: [],
      newList: [],
      pageId: '',

      elementListUrl: '',
      deleteElementUrl: '',
      elementSortUrl: ''
    }
  },

  watch: {

    // 监听父组件传过来的当前选中的页面，获取对应的元素列表
    'currentPageId': {
      deep: true, // 深度监听
      handler(newVal, oldVal) {
        if (newVal) {
          this.pageId = newVal
          this.getElementList()
        } else {
          this.elementList = []
        }
      }
    }
  },

  created() {
    if (this.dataType === 'webUi') {
      this.elementListUrl = webUiElementList
      this.deleteElementUrl = webUiDeleteElement
      this.elementSortUrl = webUiElementSort
    } else {
      this.elementListUrl = appElementList
      this.deleteElementUrl = appDeleteElement
      this.elementSortUrl = appElementSort
    }

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
    this.$bus.$on(this.$busEvents.drawerIsCommit, (_type) => {
      if (_type === 'elementInfo') {
        this.getElementList()
      }
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsCommit)
  },

  methods: {

    // 打开编辑框
    showEditForm(row) {
      this.tempElement = JSON.parse(JSON.stringify(row))
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'elementInfo', 'edit', this.tempElement)
    },

    // 删除元素
    delElement(row) {
      this.$set(row, 'deletePopoverIsShow', false)
      this.$set(row, 'isShowDeleteLoading', true)
      this.deleteElementUrl({ 'id': row.id }).then(response => {
        this.$set(row, 'isShowDeleteLoading', false)
        if (this.showMessage(this, response)) {
          this.getElementList()
        }
      })
    },

    // 解析定位方式
    parseFindElementOption(option) {
      return this.$busEvents.data.findElementOptionDict[option]
    },

    cancelDeletePopover(row) {
      this.$set(row, 'deletePopoverIsShow', false)
    },

    cancelCopyPopover(row) {
      this.$set(row, 'copyPopoverIsShow', false)
    },

    // 复制元素
    copyElement(element) {
      this.tempElement = element
      this.tempElement.id = ''
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'elementInfo', 'copy', JSON.parse(JSON.stringify(this.tempElement)))
      this.$set(element, 'copyPopoverIsShow', false)
    },

    // 根据页面获取元素列表
    getElementList(params) {
      this.tableLoadingIsShow = true
      if (this.pageId) {
        this.elementListUrl({
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
        setData: function(dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.elementList.splice(evt.oldIndex, 1)[0]
          this.elementList.splice(evt.newIndex, 0, targetRow)
          const tempIndex = this.newList.splice(evt.oldIndex, 1)[0]
          this.newList.splice(evt.newIndex, 0, tempIndex)

          // 发送请求，改变排序
          this.tableLoadingIsShow = true
          this.elementSortUrl({
            List: this.newList,
            pageNum: this.pageNum,
            pageSize: this.pageSize
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

</style>
