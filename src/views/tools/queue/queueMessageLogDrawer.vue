<template>

  <el-drawer
    title="消息发送记录"
    size="70%"
    :append-to-body="true"
    :visible.sync="drawerIsShow"
    :direction="direction"
  >
    <div style="margin-left: 20px; margin-right: 20px">
      <el-table
        ref="scriptTable"
        v-loading="tableIsLoading"
        size="mini"
        :data="queue_log_list.list"
        row-key="id"
        stripe
        @cell-dblclick="cellDblclick"
      >
        <el-table-column label="序号" align="center" min-width="10%">
          <template slot-scope="scope">
            <span> {{ (listQuery.page_num - 1) * listQuery.page_size + scope.$index + 1 }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip align="center" prop="message" label="消息内容" min-width="50%">
          <template slot-scope="scope">
            <span>{{ scope.row.message }}</span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip align="center" prop="create_time" label="发送时间" min-width="15%">
          <template slot-scope="scope">
            <span>{{ scope.row.create_time }}</span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip align="center" prop="create_user" label="发送人" min-width="10%">
          <template slot-scope="scope">
            <span>{{ parseUser(scope.row.create_user) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" align="center" min-width="10%">
          <template slot-scope="scope">

            <el-button
              type="text"
              size="mini"
              @click="showMsgDrawer(scope.row)"
            >再次发送
            </el-button>
          </template>
        </el-table-column>

      </el-table>

      <pagination
        v-show="queue_log_list.total>0"
        :total="queue_log_list.total"
        :page.sync="listQuery.page_num"
        :limit.sync="listQuery.page_size"
        @pagination="getQueueLogList"
      />

    </div>

    <el-drawer
      title="发送消息"
      size="45%"
      :append-to-body="true"
      :visible.sync="msgDrawerIsShow"
      :direction="direction"
    >
      <el-form
        ref="dataForm"
        label-position="center"
        label-width="80px"
        style="margin-left: 20px;margin-right: 20px"
      >
        <el-form-item :label="'队列名字'" prop="queue_name" size="mini">
          <el-input v-model="tempQueue.queue_name" disabled size="mini" placeholder="队列名字" />
        </el-form-item>

        <el-form-item :label="'备注'" prop="desc" size="mini">
          <el-input v-model="tempQueue.desc" size="mini" disabled type="textarea" :rows="1" :placeholder="'函数的描述、备注'" />
        </el-form-item>

        <el-form-item :label="'消息体'" prop="desc" class="is-required" size="mini">
          <el-input v-model="tempData.message" type="textarea" :rows="1" size="mini" />
        </el-form-item>

      </el-form>

      <div class="demo-drawer__footer">

        <el-button
          size="mini"
          @click="msgDrawerIsShow = false"
        > {{ '取消' }}</el-button>

        <el-button
          v-show="tempData.message"
          type="primary"
          size="mini"
          :loading="submitButtonIsLoading"
          @click="sendMsg()"
        >
          {{ '发送' }}
        </el-button>
      </div>
    </el-drawer>

  </el-drawer>
</template>

<script>

import { queueLogList, sendMsgToQueue } from '@/apis/assist/queue'
import Pagination from '@/components/Pagination/index.vue'

export default {
  name: 'Drawer',
  components: { Pagination },
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'userDict'
  ],
  data() {
    return {
      direction: 'rtl', // 抽屉打开方式
      dialogIsShow: false,
      submitButtonIsLoading: false,
      tableIsLoading: false,
      drawerIsShow: false,
      msgDrawerIsShow: false,
      queue_log_list: {
        list: [],
        total: 0
      },
      listQuery: {
        queue_id: undefined,
        page_num: 1,
        page_size: 20
      },
      tempQueue: {},
      tempData: {}
    }
  },

  mounted() {
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, queue) => {
      if (_type === 'queueLogInfo') {
        this.listQuery.queue_id = queue.id
        this.tempQueue = queue
        this.getQueueLogList()
        this.drawerIsShow = true
      }
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsShow)
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

    getQueueLogList() {
      this.tableIsLoading = true
      queueLogList(this.listQuery).then(response => {
        this.tableIsLoading = false
        this.queue_log_list.list = response.data.data
        this.queue_log_list.total = response.data.total
      })
    },

    // 解析用户
    parseUser(userId) {
      if (userId in Object.keys(this.userDict)) {
        return this.userDict[userId].name
      }
      return ' - '
    },

    showMsgDrawer(queue) {
      this.tempData = JSON.parse(JSON.stringify(queue))
      this.msgDrawerIsShow = true
    },

    sendMsg() {
      this.submitButtonIsLoading = true
      sendMsgToQueue({ id: this.tempData.queue_id, message: this.tempData.message }).then(res => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, res)) {
          this.editDrawerIsShow = false
          this.getQueueLogList()
        }
      })
    }
  }

}
</script>

<style scoped>

</style>
