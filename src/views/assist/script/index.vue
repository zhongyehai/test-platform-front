<template>
  <div class="app-container">

    <el-form label-width="100px" :inline="true">

      <el-form-item :label="'脚本类型：'" size="mini">
        <el-select
          v-model="listQuery.script_type"
          :placeholder="'选择脚本类型'"
          filterable
          default-first-option
          clearable
          size="mini"
          class="filter-item"
        >
          <el-option v-for="(value, key) in scriptTypeDict" :key="key" :label="value" :value="key" />
        </el-select>
      </el-form-item>

      <el-form-item :label="'脚本文件名：'" size="mini">
        <el-input
          v-model="listQuery.file_name"
          class="input-with-select"
          placeholder="脚本名，支持模糊搜索"
          size="mini"
          clearable
          style="width: 100%"
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

      <el-button
        type="primary"
        size="mini"
        @click="getScriptList()"
      >
        搜索
      </el-button>

      <el-button
        type="primary"
        size="mini"
        style="margin-left: 10px"
        @click.native="sendEditEmit('add')"
      >新增脚本
      </el-button>

    </el-form>

    <el-table
      ref="scriptTable"
      v-loading="tableIsLoading"
      size="mini"
      element-loading-text="正在排序中"
      element-loading-spinner="el-icon-loading"
      :data="scripts.list"
      row-key="id"
      stripe
    >
      <el-table-column label="序号" align="center" min-width="10%">
        <template slot-scope="scope">
          <span> {{ (listQuery.page_num - 1) * listQuery.page_size + scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column show-overflow-tooltip align="center" prop="name" label="脚本类型" min-width="10%">
        <template slot-scope="scope">
          <span>{{ scriptTypeDict[scope.row.script_type] }}</span>
        </template>
      </el-table-column>

      <el-table-column show-overflow-tooltip align="center" prop="name" label="脚本文件名" min-width="30%">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column show-overflow-tooltip align="center" prop="desc" label="备注" min-width="15%">
        <template slot-scope="scope">
          <span>{{ scope.row.desc }}</span>
        </template>
      </el-table-column>

      <el-table-column show-overflow-tooltip align="center" prop="create_user" label="创建者" min-width="10%">
        <template slot-scope="scope">
          <span>{{ parseUser(scope.row.create_user) }}</span>
        </template>
      </el-table-column>

      <el-table-column show-overflow-tooltip align="center" prop="update_user" label="最后修改人" min-width="10%">
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
            @click="sendEditEmit('update', scope.row)"
          >修改
          </el-button>

          <!-- 复制 -->
          <el-button
            type="text"
            size="mini"
            style="margin-right: 5px"
            @click="sendEditEmit('add', scope.row)"
          >复制
          </el-button>

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
              <el-button type="primary" size="mini" @click="delScript(scope.row)">确定</el-button>
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
      v-show="scripts.total>0"
      :total="scripts.total"
      :page.sync="listQuery.page_num"
      :limit.sync="listQuery.page_size"
      @pagination="getScriptList"
    />

    <ScriptDrawer
      :script-type-dict="scriptTypeDict"
    />

  </div>
</template>

<script>
import Sortable from 'sortablejs'
import ScriptDrawer from './drawer'
import Pagination from '@/components/Pagination'

import { scriptList, deleteScript, scriptSort, copyScript } from '@/apis/assist/script'
import { userList } from '@/apis/system/user'

export default {
  name: 'Script',
  components: {
    Pagination,
    ScriptDrawer
  },
  data() {
    return {
      listQuery: {
        detail: true,
        script_type: undefined,
        file_name: undefined,
        create_user: undefined,
        update_user: undefined,
        page_num: 1,
        page_size: 20
      },

      scriptTypeDict: {
        test: '执行测试', mock: 'mock脚本', encryption: '加密脚本', decryption: '解密脚本'
      },

      // 拖拽排序参数
      sortable: null,
      oldList: [],
      newList: [],
      currentUserList: [],
      userDict: {},
      funcDebugData: '',
      scripts: {
        list: [],
        total: 0
      },
      tableIsLoading: false
    }
  },

  mounted() {
    this.getUserList(this.getScriptList)

    // 修改脚本成功，重新请求列表
    this.$bus.$on(this.$busEvents.drawerIsCommit, (_type, status) => {
      if (_type === 'scriptInfo') {
        this.getScriptList()
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
      if (userId in Object.keys(this.userDict)) {
        return this.userDict[userId].name
      }
      return ' - '
    },

    getScriptList() {
      this.tableIsLoading = true
      scriptList(this.listQuery).then(response => {
        this.tableIsLoading = false

        this.scripts.list = response.data.data
        this.scripts.total = response.data.total

        this.oldList = this.scripts.list.map(v => v.id)
        this.newList = this.oldList.slice()
        this.$nextTick(() => {
          this.setSort()
        })
      })
    },

    // 新增脚本
    // showAddScriptDrawer() {
    //   this.$bus.$emit(this.$busEvents.drawerIsShow, 'scriptInfo', 'add')
    // },

    // 复制脚本
    copyFile(row) {
      this.$set(row, 'copyPopoverIsShow', false)
      copyScript({ id: row.id }).then(response => {
        if (this.showMessage(this, response)) {
          this.getScriptList()
        }
      })
    },

    sendEditEmit(_type, row) {
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'scriptInfo', _type, row)
    },

    cancelCopyPopover(row) {
      this.$set(row, 'copyPopoverIsShow', false)
    },

    cancelDeletePopover(row) {
      this.$set(row, 'deletePopoverIsShow', false)
    },

    delScript(row) {
      this.$set(row, 'deletePopoverIsShow', false)
      this.$set(row, 'deleteLoadingIsShow', true)
      deleteScript({ id: row.id }).then(response => {
        this.$set(row, 'deleteLoadingIsShow', false)
        if (this.showMessage(this, response)) {
          this.getScriptList()
        }
      })
    },

    // 拖拽排序
    setSort() {
      const el = this.$refs.scriptTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost',
        setData: function(dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.scripts.list.splice(evt.oldIndex, 1)[0]
          this.scripts.list.splice(evt.newIndex, 0, targetRow)

          const tempIndex = this.newList.splice(evt.oldIndex, 1)[0]
          this.newList.splice(evt.newIndex, 0, tempIndex)

          // 发送请求，改变排序
          this.tableIsLoading = true
          scriptSort({ id_list: this.newList, page_num: this.listQuery.page_num, page_size: this.listQuery.page_size }).then(response => {
            this.showMessage(this, response)
            this.getScriptList()
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
