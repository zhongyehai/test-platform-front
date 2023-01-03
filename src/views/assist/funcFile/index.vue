<template>
  <div class="app-container">
    <el-button
      type="primary"
      size="mini"
      style="margin-left: 10px"
      @click.native="showAddFuncFileDrawer()"
    >新增函数文件
    </el-button>

    <el-table
      ref="funcTable"
      v-loading="tableIsLoading"
      element-loading-text="正在排序中"
      element-loading-spinner="el-icon-loading"
      :data="funcFiles.list"
      row-key="id"
      stripe
    >
      <el-table-column label="序号" align="center" min-width="10%">
        <template slot-scope="scope">
          <span> {{ (pageNum - 1) * pageSize + scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true align="center" prop="name" label="文件名称" min-width="30%">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true align="center" prop="desc" label="备注" min-width="30%">
        <template slot-scope="scope">
          <span>{{ scope.row.desc }}</span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true align="center" prop="create_user" label="创建者" min-width="10%">
        <template slot-scope="scope">
          <span>{{ parseUser(scope.row.create_user) }}</span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true align="center" prop="update_user" label="最后修改人" min-width="10%">
        <template slot-scope="scope">
          <span>{{ parseUser(scope.row.update_user) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" min-width="10%">
        <template slot-scope="scope">

          <!--修改文件信息-->
          <el-button
            type="text"
            size="mini"
            icon="el-icon-edit"
            @click="sendEditEmit(scope.row, 'file')">
          </el-button>

          <!--修改函数内容-->
          <el-button
            type="text"
            size="mini"
            style="margin-right: 5px"
            icon="el-icon-edit-outline"
            @click="sendEditEmit(scope.row, 'data')">
          </el-button>

          <!-- 删除文件 -->
          <el-popover
            :ref="scope.row.id"
            placement="top"
            popper-class="down-popover"
            v-model="scope.row.deletePopoverIsShow">
            <p>确定删除【{{ scope.row.name }}】?</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="cancelDeletePopover(scope.row)">取消</el-button>
              <el-button type="primary" size="mini" @click="delFuncFile(scope.row)">确定</el-button>
            </div>
            <el-button
              slot="reference"
              style="color: red"
              type="text"
              size="mini"
              icon="el-icon-delete"
              :loading="scope.row.deleteLoadingIsShow"
            ></el-button>
          </el-popover>

        </template>
      </el-table-column>

    </el-table>

    <pagination
      v-show="funcFiles.total>0"
      :total="funcFiles.total"
      :page.sync="pageNum"
      :limit.sync="pageSize"
      @pagination="getFuncFileList"
    />

    <funcFileDrawer></funcFileDrawer>
    <funcDataDrawer></funcDataDrawer>
  </div>
</template>

<script>
import Sortable from 'sortablejs'
import funcFileDrawer from "@/views/assist/funcFile/drawer";
import funcDataDrawer from "@/views/assist/funcFile/funcDataDrawer";
import Pagination from '@/components/Pagination'

import {funcFileList, deleteFuncFile, funcSort} from '@/apis/assist/funcFile'
import {userList} from '@/apis/system/user'

export default {
  name: "funcFile",
  components: {
    Pagination,
    funcFileDrawer,
    funcDataDrawer
  },
  data() {
    return {
      // 拖拽排序参数
      sortable: null,
      oldList: [],
      newList: [],
      userList: [],
      userDict: {},
      funcDebugData: '',
      funcFiles: {
        list: [],
        total: 0,
      },
      tableIsLoading: false,
      pageSize: 20,
      pageNum: 1
    }
  },

  methods: {

    // 获取用户信息，同步请求
    async getUserList(func) {
      let response = await userList()
      this.currentUserList = response.data.data
      response.data.data.forEach(user => {
        this.userDict[user.id] = user
      })
      if (func) {
        func()
      }
    },

    // 解析用户
    parseUser(userId) {
      return this.userDict[userId].name
    },

    getFuncFileList() {
      this.tableIsLoading = true
      funcFileList({'pageNum': this.pageNum, 'pageSize': this.pageSize}).then(response => {
        this.tableIsLoading = false

        this.funcFiles.list = response.data.data
        this.funcFiles.total = response.data.total

        this.oldList = this.funcFiles.list.map(v => v.id)
        this.newList = this.oldList.slice()
        this.$nextTick(() => {
          this.setSort()
        })
      })
    },

    // 新增函数文件
    showAddFuncFileDrawer() {
      this.$bus.$emit(this.$busEvents.api.apiAddFuncFileDrawerIsShow, 'add')
    },

    sendEditEmit(funcFile, _type) {
      if (_type === 'file') {  // 编辑函数文件
        this.$bus.$emit(this.$busEvents.api.apiAddFuncFileDrawerIsShow, 'update', funcFile)
      } else if (_type === 'data') {  // 编辑函数文件内容
        this.$bus.$emit(this.$busEvents.api.apiEditFuncFileData, funcFile)
      }
    },

    cancelDeletePopover(row){
      this.$set(row, 'deletePopoverIsShow', false)
    },

    delFuncFile(row) {
      this.$set(row, 'deletePopoverIsShow', false)
      this.$set(row, 'deleteLoadingIsShow', true)
      deleteFuncFile({'id': row.id}).then(response => {
        this.$set(row, 'deleteLoadingIsShow', false)
        if (this.showMessage(this, response)) {
          this.getFuncFileList()
        }
      })
    },

    // 拖拽排序
    setSort() {
      const el = this.$refs.funcTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost',
        setData: function (dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.funcFiles.list.splice(evt.oldIndex, 1)[0]
          this.funcFiles.list.splice(evt.newIndex, 0, targetRow)

          const tempIndex = this.newList.splice(evt.oldIndex, 1)[0]
          this.newList.splice(evt.newIndex, 0, tempIndex)

          // 发送请求，改变排序
          this.tableIsLoading = true
          funcSort({
            List: this.newList,
            pageNum: this.pageNum,
            pageSize: this.pageSize,
          }).then(response => {
            this.showMessage(this, response)
            this.tableIsLoading = false
          })
        }
      })
    },

  },

  mounted() {
    this.getUserList(this.getFuncFileList)

    // 修改函数文件成功，重新请求列表
    this.$bus.$on(this.$busEvents.api.apiEditFuncFileIsCommit, (status) => {
      this.getFuncFileList()
    })

    // 新增函数文件成功，重新请求列表
    this.$bus.$on(this.$busEvents.api.apiAddFuncFileIsCommit, (status) => {
      this.getFuncFileList()
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.api.apiAddFuncFileIsCommit)
    this.$bus.$off(this.$busEvents.api.apiEditFuncFileIsCommit)
  },

}
</script>

<style scoped>

</style>
