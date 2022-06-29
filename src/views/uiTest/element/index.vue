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

      <el-table-column :show-overflow-tooltip=true prop="by" label="定位方式" min-width="20%">
        <template slot-scope="scope">
          <span> {{ parseFindElementOption(scope.row.by) }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="by" label="元素表达式" min-width="20%">
        <template slot-scope="scope">
          <span> {{ scope.row.element }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="create_user" label="创建者" min-width="10%">
        <template slot-scope="scope">
          <span>{{ parseUser(scope.row.create_user) }}</span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="create_user" label="最后修改人" min-width="12%">
        <template slot-scope="scope">
          <span>{{ parseUser(scope.row.update_user) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="元素操作" min-width="14%">
        <template slot-scope="scope">

          <!--修改元素-->
          <el-button
            type="text"
            style="margin-right: 8px"
            icon="el-icon-edit"
            @click="showEditForm(scope.row)">
          </el-button>

          <!-- 复制元素 -->
          <el-popconfirm
            placement="top"
            hide-icon
            style="margin-right: 8px"
            title="复制此元素并生成新的元素？"
            confirm-button-text='确认'
            cancel-button-text='取消'
            @onConfirm="copyElement(scope.row)"
          >
            <el-button
              type="text"
              slot="reference"
              icon="el-icon-document-copy"
            ></el-button>
          </el-popconfirm>

          <!-- 删除元素 -->
          <el-popconfirm
            placement="top"
            hide-icon
            style="margin-right: 8px"
            :title="`确定删除【${scope.row.name}】?`"
            confirm-button-text='确认'
            cancel-button-text='取消'
            @onConfirm="delElement(scope.row)"
          >
            <el-button
              slot="reference"
              type="text"
              style="color: red"
              icon="el-icon-delete"
              :loading="scope.row.isShowDeleteLoading"
            ></el-button>
          </el-popconfirm>
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
      :currentPageId="currentPageId"
    ></elementDrawer>
  </div>
</template>

<script>
import Sortable from 'sortablejs'
import Pagination from '@/components/Pagination'

import elementDrawer from '@/views/uiTest/element/drawer'

import {userList} from '@/apis/user/user'
import {elementList, deleteElement, elementSort} from '@/apis/uiTest/element'


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
    'pageElementList',
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

    this.elementList = this.pageElementList ? this.pageElementList : []

    this.oldList = this.elementList.map(v => v.id)
    this.newList = this.oldList.slice()
    this.$nextTick(() => {
      this.setSort()
    })

    this.pageId = this.currentPageId
  },

  mounted() {
    // this.getUserList()

    this.$bus.$on(this.$busEvents.ui.uiElementDrawerCommitSuccess, (status) => {
      this.getElementList()
    })

    // this.$bus.$on(this.$busEvents.ui.uiPageDrawerCommitSuccess, (status, pageId) => {
    //   this.pageId = pageId
    //   this.getElementList()
    // })

    // this.$bus.$on(this.$busEvents.ui.uiPageDrawerIsOpen, (pageId) => {
    //   this.pageId = pageId
    //   this.getElementList()
    // })

    // this.getElementList()
  },

  methods: {
    // 获取用户信息，同步请求
    // async getUserList() {
    //   let response = await userList()
    //   this.currentUserList = response.data.data
    //   response.data.data.forEach(user => {
    //     this.userDict[user.id] = user
    //   })
    // },

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

    // 复制元素
    copyElement(element) {
      this.tempElement = element
      this.tempElement.id = ''
      this.$bus.$emit(this.$busEvents.ui.uiElementDrawerStatus, 'copy', JSON.parse(JSON.stringify(this.tempElement)))
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
    }

  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.ui.uiElementDrawerCommitSuccess)
    this.$bus.$off(this.$busEvents.ui.uiPageDrawerCommitSuccess)
    this.$bus.$off(this.$busEvents.ui.uiPageDrawerIsOpen)
  },

  watch: {

    // 监听父组件传过来的当前选中的模块，实时获取父组件传过来的模块信息对应下的元素列表
    'currentModuleId': {
      deep: true,  // 深度监听
      handler(newVal, oldVal) {
        // console.log('currentModuleId.newVal: ', newVal)
        // console.log('currentModuleId.oldVal: ', oldVal)
        if (newVal) {
          this.getElementList({'moduleId': newVal, 'pageNum': this.pageNum, 'pageSize': this.pageSize
          })
        } else {
          this.elementList = []
        }

      }
    },

    'pageElementList': {

      handler(newVal, oldVal) {
        if (newVal && newVal.length > 0) {
          this.elementList = newVal
        } else {
          this.elementList = []
        }

        this.oldList = this.elementList.map(v => v.id)
        this.newList = this.elementList.slice()
      }
    }
  }
}
</script>

<style>

</style>
