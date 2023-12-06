<template>
  <div class="app-container">

    <el-form label-width="100px" :inline="true">

      <el-form-item :label="'队列类型：'" size="mini">
        <el-select
          v-model="listQuery.queue_type"
          :placeholder="'队列类型'"
          filterable
          default-first-option
          clearable
          size="mini"
          class="filter-item"
        >
          <el-option v-for="(value, key) in queue_type_dict" :key="key" :label="value" :value="key" />
        </el-select>
      </el-form-item>

      <el-form-item label="链接地址" size="mini">
        <el-input
          v-model="listQuery.host"
          class="input-with-select"
          placeholder="队列链接地址，支持模糊搜索"
          size="mini"
          clearable
          style="width: 100%"
        />
      </el-form-item>

      <el-button type="primary" size="mini" @click="getQueueLinkList()">搜索</el-button>

      <el-button
        type="primary"
        size="mini"
        style="margin-left: 10px"
        @click.native="sendEditEmit('add')"
      >新增链接
      </el-button>

    </el-form>

    <el-table
      ref="scriptTable"
      v-loading="tableIsLoading"
      size="mini"
      element-loading-text="正在排序中"
      element-loading-spinner="el-icon-loading"
      :data="queue_link_list.list"
      row-key="id"
      stripe
      @cell-dblclick="cellDblclick"
    >
      <el-table-column label="序号" align="center" min-width="5%">
        <template slot-scope="scope">
          <span> {{ (listQuery.page_num - 1) * listQuery.page_size + scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column show-overflow-tooltip align="center" prop="queue_type" label="类型" min-width="5%">
        <template slot-scope="scope">
          <span>{{ queue_type_dict[scope.row.queue_type] }}</span>
        </template>
      </el-table-column>

      <el-table-column show-overflow-tooltip align="center" prop="host" label="地址" min-width="20%">
        <template slot-scope="scope">
          <span>{{ scope.row.host }}</span>
        </template>
      </el-table-column>

      <el-table-column show-overflow-tooltip align="center" prop="port" label="端口" min-width="15%">
        <template slot-scope="scope">
          <span>{{ scope.row.port }}</span>
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

      <el-table-column label="操作" align="center" min-width="15%">
        <template slot-scope="scope">

          <!--修改文件信息-->
          <el-button
            type="text"
            size="mini"
            @click="showQueueManage(scope.row)"
          >队列列表
          </el-button>

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
            @click="sendEditEmit('copy', scope.row)"
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
              <el-button type="primary" size="mini" @click="delete_data(scope.row)">确定</el-button>
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
      v-show="queue_link_list.total>0"
      :total="queue_link_list.total"
      :page.sync="listQuery.page_num"
      :limit.sync="listQuery.page_size"
      @pagination="getQueueLinkList"
    />

    <QueueLinkDrawer :queue-type-dict="queue_type_dict" />
    <queueDrawer :user-dict="userDict" />

  </div>
</template>

<script>
import Sortable from 'sortablejs'
import QueueLinkDrawer from './queueLinkDrawer.vue'
import queueDrawer from './queueDrawer.vue'
import Pagination from '@/components/Pagination/index.vue'

import { userList } from '@/apis/system/user'
import { queueLinkList, copyQueue, deleteQueue, queueSort } from '@/apis/assist/queue'

export default {
  name: 'Script',
  components: {
    Pagination,
    QueueLinkDrawer,
    queueDrawer
  },
  data() {
    return {
      listQuery: {
        host: undefined,
        queue_type: undefined,
        page_num: 1,
        page_size: 20
      },

      queue_type_dict: { 'rocket_mq': 'MQ', 'redis': 'redis' },

      // 拖拽排序参数
      sortable: null,
      oldList: [],
      newList: [],
      userDict: {},
      queue_link_list: {
        list: [],
        total: 0
      },
      tableIsLoading: false
    }
  },

  mounted() {
    this.getUserList(this.getQueueLinkList)

    this.$bus.$on(this.$busEvents.drawerIsCommit, (_type, status) => {
      if (_type === 'queueLinkInfo') {
        this.getQueueLinkList()
      }
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsCommit)
  },

  methods: {

    // 双击单元格复制
    cellDblclick(row, column, cell, event) {
      const that = this
      const data = row[column.property]
      if (typeof (data) === 'string') {
        this.$copyText(data).then(
          function(e) {
            that.$message.success('复制成功')
          }
        )
      }
    },

    // 获取用户信息，同步请求
    async getUserList(func) {
      const response = await userList()
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

    getQueueLinkList() {
      this.tableIsLoading = true
      queueLinkList(this.listQuery).then(response => {
        this.tableIsLoading = false

        this.queue_link_list.list = response.data.data
        this.queue_link_list.total = response.data.total

        this.oldList = this.queue_link_list.list.map(v => v.id)
        this.newList = this.oldList.slice()
        this.$nextTick(() => {
          this.setSort()
        })
      })
    },

    copyFile(row) {
      this.$set(row, 'copyPopoverIsShow', false)
      copyQueue({ id: row.id }).then(response => {
        if (this.showMessage(this, response)) {
          this.getQueueLinkList()
        }
      })
    },

    showQueueManage(row) {
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'queueInfo', row)
    },

    sendEditEmit(status, row) {
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'queueLinkInfo', status, row)
    },

    cancelCopyPopover(row) {
      this.$set(row, 'copyPopoverIsShow', false)
    },

    cancelDeletePopover(row) {
      this.$set(row, 'deletePopoverIsShow', false)
    },

    delete_data(row) {
      this.$set(row, 'deletePopoverIsShow', false)
      this.$set(row, 'deleteLoadingIsShow', true)
      deleteQueue({ id: row.id }).then(response => {
        this.$set(row, 'deleteLoadingIsShow', false)
        if (this.showMessage(this, response)) {
          this.getQueueLinkList()
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
          const targetRow = this.queue_link_list.list.splice(evt.oldIndex, 1)[0]
          this.queue_link_list.list.splice(evt.newIndex, 0, targetRow)

          const tempIndex = this.newList.splice(evt.oldIndex, 1)[0]
          this.newList.splice(evt.newIndex, 0, tempIndex)

          // 发送请求，改变排序
          this.tableIsLoading = true
          queueSort({ id_list: this.newList, page_num: this.listQuery.page_num, page_size: this.listQuery.page_size }).then(response => {
            this.showMessage(this, response)
            this.getQueueLinkList()
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
