<template>
  <div class="app-container">

    <el-form label-width="100px" :inline="true">

      <el-form-item :label="'函数名：'" size="mini">
        <el-input
          v-model="listQuery.file_name"
          class="input-with-select"
          placeholder="函数名，支持模糊搜索"
          size="mini"
          clearable
          style="width: 250px"
        />
      </el-form-item>

      <el-form-item :label="'创建人：'" size="mini">
        <el-select
          v-model="listQuery.create_user"
          :placeholder="'选择创建人'"
          filterable
          default-first-option
          clearable
          size="mini"
          class="filter-item"
        >
          <el-option v-for="user in currentUserList" :key="user.name" :label="user.name" :value="user.id" />
        </el-select>
      </el-form-item>

      <el-form-item :label="'最近修改人：'" size="mini">
        <el-select
          v-model="listQuery.update_user"
          :placeholder="'选择负责人'"
          filterable
          default-first-option
          clearable
          size="mini"
          class="filter-item"
        >
          <el-option v-for="user in currentUserList" :key="user.name" :label="user.name" :value="user.id" />
        </el-select>
      </el-form-item>

      <el-button
        type="primary"
        size="mini"
        @click="getFuncFileList()"
      >
        搜索
      </el-button>

      <el-button
        type="primary"
        size="mini"
        style="margin-left: 10px"
        @click.native="sendEditEmit('add')"
      >新增函数文件
      </el-button>

    </el-form>

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
          <span> {{ (listQuery.pageNum - 1) * listQuery.pageSize + scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" align="center" prop="name" label="文件名称" min-width="30%">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" align="center" prop="desc" label="备注" min-width="30%">
        <template slot-scope="scope">
          <span>{{ scope.row.desc }}</span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" align="center" prop="create_user" label="创建者" min-width="10%">
        <template slot-scope="scope">
          <span>{{ parseUser(scope.row.create_user) }}</span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" align="center" prop="update_user" label="最后修改人" min-width="10%">
        <template slot-scope="scope">
          <span>{{ parseUser(scope.row.update_user) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" min-width="15%">
        <template slot-scope="scope">

          <!--修改文件信息-->
          <el-button
            type="text"
            size="mini"
            style="margin-right: 10px"
            @click="sendEditEmit('update', scope.row)"
          >修改
          </el-button>

          <!-- 复制 -->
          <el-popover
            :ref="scope.row.name"
            v-model="scope.row.copyPopoverIsShow"
            placement="top"
            popper-class="down-popover"
          >
            <p>确定复制【{{ scope.row.name }}】并生成一条新的数据?</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="cancelCopyPopover(scope.row)">取消</el-button>
              <el-button type="primary" size="mini" @click="copyFile(scope.row)">确定</el-button>
            </div>
            <el-button
              slot="reference"
              type="text"
              size="mini"
              style="margin-right: 10px"
            >复制</el-button>
          </el-popover>

          <!-- 删除文件 -->
          <el-popover
            :ref="scope.row.id"
            v-model="scope.row.deletePopoverIsShow"
            placement="top"
            popper-class="down-popover"
          >
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
              :loading="scope.row.deleteLoadingIsShow"
            >删除</el-button>
          </el-popover>

        </template>
      </el-table-column>

    </el-table>

    <pagination
      v-show="funcFiles.total>0"
      :total="funcFiles.total"
      :page.sync="listQuery.pageNum"
      :limit.sync="listQuery.pageSize"
      @pagination="getFuncFileList"
    />

    <funcFileDrawer />

  </div>
</template>

<script>
import Sortable from 'sortablejs'
import funcFileDrawer from '@/views/assist/funcFile/drawer'
import Pagination from '@/components/Pagination'

import { funcFileList, deleteFuncFile, funcSort, copyFunc } from '@/apis/assist/funcFile'
import { userList } from '@/apis/system/user'

export default {
  name: 'FuncFile',
  components: {
    Pagination,
    funcFileDrawer
  },
  data() {
    return {
      listQuery: {
        file_name: '',
        create_user: '',
        update_user: '',
        pageNum: 1,
        pageSize: 20
      },

      // 拖拽排序参数
      sortable: null,
      oldList: [],
      newList: [],
      currentUserList: [],
      userDict: {},
      funcDebugData: '',
      funcFiles: {
        list: [],
        total: 0
      },
      tableIsLoading: false
    }
  },

  mounted() {
    this.getUserList(this.getFuncFileList)

    // 修改函数文件成功，重新请求列表
    this.$bus.$on(this.$busEvents.drawerIsCommit, (_type, status) => {
      if (_type === 'funcFileInfo') {
        this.getFuncFileList()
      }
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsCommit)
  },

  methods: {

    // 获取用户信息，同步请求
    async getUserList(func) {
      const response = await userList()
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
      funcFileList(this.listQuery).then(response => {
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
    // showAddFuncFileDrawer() {
    //   this.$bus.$emit(this.$busEvents.drawerIsShow, 'funcFileInfo', 'add')
    // },

    // 复制函数文件
    copyFile(row) {
      this.$set(row, 'copyPopoverIsShow', false)
      copyFunc({ id: row.id }).then(response => {
        if (this.showMessage(this, response)) {
          this.getFuncFileList()
        }
      })
    },

    sendEditEmit(_type, row) {
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'funcFileInfo', _type, row)
    },

    cancelCopyPopover(row) {
      this.$set(row, 'copyPopoverIsShow', false)
    },

    cancelDeletePopover(row) {
      this.$set(row, 'deletePopoverIsShow', false)
    },

    delFuncFile(row) {
      this.$set(row, 'deletePopoverIsShow', false)
      this.$set(row, 'deleteLoadingIsShow', true)
      deleteFuncFile({ 'id': row.id }).then(response => {
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
        setData: function(dataTransfer) {
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
            pageNum: this.listQuery.pageNum,
            pageSize: this.listQuery.pageSize
          }).then(response => {
            this.showMessage(this, response)
            this.tableIsLoading = false
          })
        }
      })
    }

  }

}
</script>

<style scoped>

</style>
