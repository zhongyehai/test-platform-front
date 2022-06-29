<template>

  <div>

    <!-- 结构树/页面列表 -->
    <el-tabs v-model="pageTab" class="table_padding">

      <!-- 页面列表 -->
      <el-tab-pane label="页面列表" name="pageList">

        <el-table
          ref="pageListTable"
          v-loading="tableLoadingIsShow"
          element-loading-text="正在排序中"
          element-loading-spinner="el-icon-loading"
          :data="pageList"
          row-key="id"
          stripe
        >
          <el-table-column prop="num" label="序号" min-width="7%">
            <template slot-scope="scope">
              <span> {{ (pageNum - 1) * pageSize + scope.$index + 1 }} </span>
            </template>
          </el-table-column>

          <el-table-column :show-overflow-tooltip=true prop="name" label="页面名称" min-width="20%">
            <template slot-scope="scope">
              <span> {{ scope.row.name }} </span>
            </template>
          </el-table-column>

          <el-table-column :show-overflow-tooltip=true prop="addr" label="页面地址" min-width="47%">
            <template slot-scope="scope">
              <span> {{ scope.row.addr || '未设置' }} </span>
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

          <el-table-column label="页面操作" min-width="14%">
            <template slot-scope="scope">

              <!--修改页面-->
              <el-button
                type="text"
                style="margin-right: 8px"
                icon="el-icon-edit"
                @click="showEditForm(scope.row)">
              </el-button>

              <!-- 复制页面 -->
              <el-popconfirm
                placement="top"
                hide-icon
                style="margin-right: 8px"
                title="复制此页面并生成新的页面？"
                confirm-button-text='确认'
                cancel-button-text='取消'
                @onConfirm="clickCopyPage(scope.row)"
              >
                <el-button
                  type="text"
                  slot="reference"
                  icon="el-icon-document-copy"
                ></el-button>
              </el-popconfirm>

              <!-- 删除页面 -->
              <el-popconfirm
                placement="top"
                hide-icon
                style="margin-right: 8px"
                :title="`确定删除【${scope.row.name}】?`"
                confirm-button-text='确认'
                cancel-button-text='取消'
                @onConfirm="delPage(scope.row)"
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
          v-show="pageTotal>0"
          :total="pageTotal"
          :page.sync="pageNum"
          :limit.sync="pageSize"
          @pagination="getPageList"
        />
      </el-tab-pane>

    </el-tabs>

    <pageDrawer
      :currentProjectId="currentProjectId"
      :currentModuleId="currentModuleId"
      :userDict="userDict"
    ></pageDrawer>

  </div>
</template>

<script>
import Sortable from 'sortablejs'
import Pagination from '@/components/Pagination'

import pageDrawer from '@/views/uiTest/pages/drawer'

import {userList} from '@/apis/user/user'
import {pageList, deletePage, pageSort} from '@/apis/uiTest/page'
import {getFindElementOption} from "@/utils/getConfig";


export default {
  name: 'index',
  components: {
    Pagination,
    pageDrawer
  },

  // 接收父组件传参的key
  props: [
    'currentProjectId',
    'currentModuleId'
  ],
  data() {
    return {
      tableLoadingIsShow: false,  // 请求列表等待响应的状态
      pageTab: 'pageList',  //  tab页的显示

      // 页面数据列表
      pageNum: 1,
      pageSize: 20,
      pageTotal: 0,
      pageList: [],
      userList: [],
      userDict: {},

      // 拖拽排序参数
      sortable: null,
      oldList: [],
      newList: [],
    }
  },

  beforeCreate() {
    getFindElementOption(this)  // 获取定位方式
  },

  created() {

    this.oldList = this.pageList.map(v => v.id)
    this.newList = this.oldList.slice()
    this.$nextTick(() => {
      this.setSort()
    })
  },

  mounted() {
    this.getUserList()

    // 监听 页面 抽屉 框 的提交状态，提交成功，则重新请求页面列表
    this.$bus.$on(this.$busEvents.ui.uiPageDrawerCommitSuccess, () => {
      this.getPageList()
    })

    // 监听 元素是否为url，如果是的话，则更新页面的url
    this.$bus.$on(this.$busEvents.ui.uiElementIsUrl, (data) => {
      this.getPageList()
    })
  },


  beforeDestroy() {
    // 页面销毁的时候，关闭bus监听事件
    this.$bus.$off(this.$busEvents.ui.uiPageDrawerCommitSuccess)
  },

  methods: {
    // 获取用户信息，同步请求
    async getUserList() {
      let response = await userList()
      this.currentUserList = response.data.data
      response.data.data.forEach(user => {
        this.userDict[user.id] = user
      })
    },

    // 解析用户
    parseUser(userId) {
      return this.userDict[userId].name
    },

    // 打开编辑框
    showEditForm(row) {
      this.$bus.$emit(this.$busEvents.ui.uiPageDrawerStatus, 'edit', JSON.parse(JSON.stringify(row)))
    },

    // 删除页面
    delPage(row) {
      this.$set(row, 'isShowDeleteLoading', true)
      deletePage({'id': row.id}).then(response => {
        this.$set(row, 'isShowDeleteLoading', false)
        if (this.showMessage(this, response)) {
          this.getPageList()
        }
      })
    },

    // 复制页面
    clickCopyPage(page) {
      this.$bus.$emit(this.$busEvents.ui.uiPageDrawerStatus, 'copy', JSON.parse(JSON.stringify(page)))
    },

    // 根据模块内容获取页面列表
    getPageList(params) {
      this.tableLoadingIsShow = true
      pageList({
        'moduleId': this.currentModuleId,
        'pageNum': this.pageNum,
        'pageSize': this.pageSize
      }).then(response => {
        this.pageList = response.data.data
        this.pageTotal = response.data.total

        this.oldList = this.pageList.map(v => v.id)
        this.newList = this.oldList.slice()
      })
      this.tableLoadingIsShow = false
    },

    // 拖拽排序
    setSort() {
      const el = this.$refs.pageListTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost',
        setData: function (dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.pageList.splice(evt.oldIndex, 1)[0]
          this.pageList.splice(evt.newIndex, 0, targetRow)
          const tempIndex = this.newList.splice(evt.oldIndex, 1)[0]
          this.newList.splice(evt.newIndex, 0, tempIndex)

          // 发送请求，改变排序
          this.tableLoadingIsShow = true
          pageSort({
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

  watch: {

    // 监听父组件传过来的当前选中的模块，实时获取父组件传过来的模块信息对应下的页面列表
    'currentModuleId': {
      deep: true,  // 深度监听
      handler(newVal, oldVal) {
        if (newVal) {
          this.getPageList({
            'moduleId': newVal,
            'pageNum': this.pageNum,
            'pageSize': this.pageSize
          })
        } else {
          this.pageList = []
        }

      }
    }
  }
}
</script>

<style>

</style>
