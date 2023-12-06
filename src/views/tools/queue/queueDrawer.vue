<template>

  <el-drawer
    title="队列管理"
    size="85%"
    :append-to-body="true"
    :visible.sync="drawerIsShow"
    :direction="direction"
  >
    <div style="margin-left: 20px; margin-right: 20px">
      <el-table
        ref="scriptTable"
        v-loading="tableIsLoading"
        size="mini"
        :data="queue_list.list"
        row-key="id"
        stripe
        @cell-dblclick="cellDblclick"
      >
        <el-table-column label="序号" align="center" min-width="5%">
          <template slot-scope="scope">
            <span> {{ (listQuery.page_num - 1) * listQuery.page_size + scope.$index + 1 }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip align="center" prop="queue_name" label="队列名" min-width="20%">
          <template slot-scope="scope">
            <span>{{ scope.row.queue_name }}</span>
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

            <el-button
              type="text"
              size="mini"
              @click="showMsgDrawer(scope.row)"
            >发消息
            </el-button>

            <el-button
              type="text"
              size="mini"
              style="margin-right: 5px"
              @click="showMsgLogDrawer(scope.row)"
            >发送记录
            </el-button>

            <el-button
              type="text"
              size="mini"
              @click="changeQueue('update', scope.row)"
            >修改
            </el-button>

            <el-button
              type="text"
              size="mini"
              style="margin-right: 5px"
              @click="changeQueue('copy', scope.row)"
            >复制
            </el-button>

            <!--            <el-popover-->
            <!--              :ref="scope.row.id"-->
            <!--              v-model="scope.row.deletePopoverIsShow"-->
            <!--              placement="top"-->
            <!--              popper-class="down-popover"-->
            <!--            >-->
            <!--              <p>确定删除【{{ scope.row.queue_name }}】?</p>-->
            <!--              <div style="text-align: right; margin: 0">-->
            <!--                <el-button size="mini" type="text" @click="cancelDeletePopover(scope.row)">取消</el-button>-->
            <!--                <el-button type="primary" size="mini" @click="delete_data(scope.row)">确定</el-button>-->
            <!--              </div>-->
            <!--              <el-button-->
            <!--                slot="reference"-->
            <!--                style="color: red"-->
            <!--                type="text"-->
            <!--                size="mini"-->
            <!--                :loading="scope.row.deleteLoadingIsShow"-->
            <!--              >删除</el-button>-->
            <!--            </el-popover>-->

          </template>
        </el-table-column>

      </el-table>
    </div>

    <div class="demo-drawer__footer">
      <el-button
        size="mini"
        type="primary"
        style="float: left"
        @click="editDrawerIsShow = true"
      >
        {{ '添加队列' }}
      </el-button>
    </div>

    <el-drawer
      :title="tempData.id ? '修改队列': '新增队列'"
      size="45%"
      :append-to-body="true"
      :visible.sync="editDrawerIsShow"
      :direction="direction"
    >
      <el-form
        ref="dataForm"
        label-position="center"
        label-width="80px"
        style="margin-left: 20px;margin-right: 20px"
      >
        <el-form-item :label="'队列名字'" prop="queue_name" class="is-required" size="mini">
          <el-input v-model="tempData.queue_name" size="mini" placeholder="队列名字" />
        </el-form-item>

        <el-form-item :label="'备注'" prop="desc" size="mini">
          <el-input v-model="tempData.desc" size="mini" type="textarea" :rows="1" :placeholder="'函数的描述、备注'" />
        </el-form-item>

      </el-form>

      <div class="demo-drawer__footer">

        <el-button
          size="mini"
          @click="editDrawerIsShow = false"
        > {{ '取消' }}</el-button>

        <el-button
          type="primary"
          size="mini"
          :loading="submitButtonIsLoading"
          @click="tempData.id ? editQueue(): createQueue()"
        >
          {{ '保存' }}
        </el-button>
      </div>
    </el-drawer>

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
          <el-input v-model="tempData.queue_name" disabled size="mini" placeholder="队列名字" />
        </el-form-item>

        <el-form-item :label="'备注'" prop="desc" size="mini">
          <el-input v-model="tempData.desc" size="mini" disabled type="textarea" :rows="1" :placeholder="'函数的描述、备注'" />
        </el-form-item>

        <el-form-item :label="'消息体'" prop="desc" class="is-required" size="mini">
          <el-input v-model="message" type="textarea" :rows="1" size="mini" />
        </el-form-item>

      </el-form>

      <div class="demo-drawer__footer">

        <el-button
          size="mini"
          @click="msgDrawerIsShow = false"
        > {{ '取消' }}</el-button>

        <el-button
          v-show="message"
          type="primary"
          size="mini"
          :loading="submitButtonIsLoading"
          @click="sendMsg()"
        >
          {{ '发送' }}
        </el-button>
      </div>
    </el-drawer>

    <queueMessageLogDrawer :user-dict="userDict" />

  </el-drawer>
</template>

<script>

import queueMessageLogDrawer from '@/views/tools/queue/queueMessageLogDrawer'

import {
  queueList,
  postQueue,
  putQueue,
  deleteQueue,
  sendMsgToQueue

} from '@/apis/assist/queue'

export default {
  name: 'Drawer',
  components: { queueMessageLogDrawer },
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
      editDrawerIsShow: false,
      msgDrawerIsShow: false,
      queue_link: {},
      // 拖拽排序参数
      sortable: null,
      queue_list: {
        list: [],
        total: 0
      },
      listQuery: {
        link_id: undefined,
        page_num: 1,
        page_size: 20
      },
      tempData: {
        id: undefined,
        link_id: undefined,
        queue_name: undefined,
        desc: undefined
      },
      message: ''
    }
  },

  mounted() {
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, data) => {
      if (_type === 'queueInfo') {
        this.queue_link = data
        this.listQuery.link_id = data.id
        this.tempData.link_id = data.id
        this.getQueueList()
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

    getQueueList() {
      this.tableIsLoading = true
      queueList(this.listQuery).then(response => {
        this.tableIsLoading = false
        this.queue_list.list = response.data.data
        this.queue_list.total = response.data.total
      })
    },

    // 解析用户
    parseUser(userId) {
      if (userId in Object.keys(this.userDict)) {
        return this.userDict[userId].name
      }
      return ' - '
    },

    changeQueue(_type, row) {
      const data = JSON.parse(JSON.stringify(row))
      if (_type === 'copy') {
        data.id = undefined
      }
      this.tempData = data
      this.editDrawerIsShow = true
    },

    delete_data(row) {
      this.$set(row, 'deletePopoverIsShow', false)
      this.$set(row, 'deleteLoadingIsShow', true)
      deleteQueue({ id: row.id }).then(response => {
        this.$set(row, 'deleteLoadingIsShow', false)
        if (this.showMessage(this, response)) {
          this.getQueueList()
        }
      })
    },

    createQueue() {
      this.submitButtonIsLoading = true
      postQueue(this.tempData).then(res => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, res)) {
          this.editDrawerIsShow = false
          this.getQueueList()
        }
      })
    },

    editQueue() {
      this.submitButtonIsLoading = true
      putQueue(this.tempData).then(res => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, res)) {
          this.editDrawerIsShow = false
          this.getQueueList()
        }
      })
    },

    showMsgLogDrawer(queue) {
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'queueLogInfo', queue)
    },

    showMsgDrawer(queue) {
      this.message = ''
      this.tempData = queue
      this.msgDrawerIsShow = true
    },

    sendMsg() {
      this.submitButtonIsLoading = true
      sendMsgToQueue({ id: this.tempData.id, message: this.message }).then(res => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, res)) {
          this.editDrawerIsShow = false
        }
      })
    }
  }

}
</script>

<style scoped>

</style>
