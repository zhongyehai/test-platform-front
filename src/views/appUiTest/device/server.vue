<template>
  <div class="app-container">

    <el-table
      ref="taskTable"
      v-loading="tableLoadingIsShow"
      element-loading-text="正在排序中"
      element-loading-spinner="el-icon-loading"
      :data="dataList"
      row-key="id"
      stripe
    >
      <el-table-column prop="num" label="序号" align="center" min-width="10%">
        <template slot-scope="scope">
          <span> {{ (pageNum - 1) * pageSize + scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" prop="name" align="center" label="服务器名称" min-width="25%">
        <template slot-scope="scope">
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" prop="os" align="center" label="服务器系统类型" min-width="10%">
        <template slot-scope="scope">
          <span> {{ scope.row.os }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" prop="ip" align="center" label="服务器ip地址" min-width="15%">
        <template slot-scope="scope">
          <span> {{ scope.row.ip }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" prop="port" align="center" label="服务器端口" min-width="10%">
        <template slot-scope="scope">
          <span> {{ scope.row.port }} </span>
        </template>
      </el-table-column>

      <el-table-column
        :show-overflow-tooltip="true"
        prop="status"
        align="center"
        label="最近一次访问状态"
        min-width="15%"
      >
        <template slot-scope="scope">
          <el-tag size="small" :type="statusTagTypeMapping[scope.row.status]">
            {{ statusContentMapping[scope.row.status] }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" min-width="15%">
        <template slot-scope="scope">

          <!-- 访问服务器 -->
          <el-button
            slot="reference"
            type="text"
            size="mini"
            :loading="scope.row.isShowRunLoading"
            @click="runServer(scope.row)"
          >访问</el-button>

          <!-- 修改服务器 -->
          <el-button
            type="text"
            size="mini"
            style="margin-right: 10px"
            @click.native="showDrawer(scope.row)"
          >修改</el-button>

          <!-- 复制服务器 -->
          <el-popover
            :ref="scope.row.id"
            v-model="scope.row.copyPopoverIsShow"
            placement="top"
            style="margin-right: 10px"
            popper-class="down-popover"
          >
            <p>复制此服务器并生成新的服务器?</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="cancelCopyServerPopover(scope.row)">取消</el-button>
              <el-button type="primary" size="mini" @click="serverCopy(scope.row)">确定</el-button>
            </div>
            <el-button
              slot="reference"
              type="text"
              size="mini"
              :loading="scope.row.copyButtonIsLoading"
            >复制</el-button>
          </el-popover>

          <!-- 删除服务器 -->
          <el-popover
            :ref="scope.row.id"
            v-model="scope.row.deletePopoverIsShow"
            placement="top"
            popper-class="down-popover"
          >
            <p>确定删除【{{ scope.row.name }}】?</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="cancelDeleteServerPopover(scope.row)">取消</el-button>
              <el-button type="primary" size="mini" @click="removeServer(scope.row)">确定</el-button>
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

    <el-drawer
      :title="tempData.id ? '修改服务器' : '新增服务器'"
      size="65%"
      :visible.sync="drawerIsShow"
      :direction="direction"
    >

      <el-form label-width="100px" style="margin-left: 20px;margin-right: 20px">

        <el-form-item label="别名" class="is-required" size="mini">
          <el-input v-model="tempData.name" size="mini" placeholder="服务器名字" />
        </el-form-item>

        <el-form-item label="系统类型" class="is-required" size="mini">
          <el-select
            v-model="tempData.os"
            filterable
            default-first-option
            clearable
            size="mini"
            style="width:100%"
            placeholder="请选择appium服务所在电脑的系统类型"
            class="filter-item"
          >
            <el-option
              v-for="osType in serverOsMapping"
              :key="osType"
              :label="osType"
              :value="osType"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="服务器ip" class="is-required" size="mini">
          <el-input
            v-model="tempData.ip"
            size="mini"
            style="width: 98%"
            placeholder="服务器ip，如 196.128.123.123"
          />
          <el-popover
            class="el_popover_class"
            placement="top-start"
            trigger="hover"
          >
            <div>
              <div>请填写ip地址，勿填写http</div>
              <div>如：地址为http://192.168.0.1，请填写：192.168.0.1</div>
            </div>
            <el-button slot="reference" type="text" icon="el-icon-question" />
          </el-popover>
        </el-form-item>

        <el-form-item label="服务器端口" class="is-required" size="mini">
          <el-input v-model="tempData.port" size="mini" placeholder="服务器端口" />
        </el-form-item>

      </el-form>

      <div class="demo-drawer__footer">
        <el-button size="mini" @click="drawerIsShow = false">取 消</el-button>
        <el-button
          type="primary"
          size="mini"
          :loading="submitButtonIsLoading"
          @click.native="tempData.id ? changeServer() : addServer()"
        >保存
        </el-button>
      </div>

    </el-drawer>

    <pagination
      v-show="dataTotal>0"
      :total="dataTotal"
      :page.sync="pageNum"
      :limit.sync="pageSize"
      @pagination="getServerList"
    />
  </div>
</template>

<script>
import Sortable from 'sortablejs'
import Pagination from '@/components/Pagination'

import {
  serverList,
  postServer,
  putServer,
  runEnvServer,
  deleteServer,
  sortServer,
  copyServer
} from '@/apis/appUiTest/device'
import { getConfigByName } from '@/apis/config/config'
import { appiumServerRequestStatusMappingContent, appiumServerRequestStatusMappingTagType } from '@/utils/mapping'

export default {
  name: 'Index',
  components: { Pagination },
  data() {
    return {
      tableLoadingIsShow: false,
      dataList: [],
      dataTotal: 0,
      pageNum: 0,
      pageSize: 20,

      // 拖拽排序参数
      sortable: null,
      oldList: [],
      newList: [],

      tempData: {
        id: '',
        num: '',
        name: '',
        os: '',
        ip: '',
        port: '4723'
      },

      direction: 'rtl', // 抽屉打开方式
      submitButtonIsLoading: false,
      drawerIsShow: false,

      serverOsMapping: [],

      statusContentMapping: appiumServerRequestStatusMappingContent,
      statusTagTypeMapping: appiumServerRequestStatusMappingTagType
    }
  },

  mounted() {
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type) => {
      if (_type === 'appServer') {
        this.showDrawer()
      }
    })

    getConfigByName({ 'name': 'server_os_mapping' }).then(response => {
      this.serverOsMapping = JSON.parse(response.data)
    })

    this.getServerList()
  },

  created() {
    this.oldList = this.dataList.map(v => v.id)
    this.newList = this.oldList.slice()
    this.$nextTick(() => {
      this.setSort()
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsShow)
  },

  methods: {

    // 复制用例
    runServer(row) {
      this.$set(row, 'isShowRunLoading', true)
      runEnvServer({ 'id': row.id }).then(response => {
        this.$set(row, 'isShowRunLoading', false)
        this.showMessage(this, response)
        this.getServerList()
      })
    },

    // 获取服务器列表
    getServerList() {
      serverList({
        pageNum: this.pageNum,
        pageSize: this.pageSize
      }).then(response => {
        this.dataList = response.data.data
        this.dataTotal = response.data.total

        this.oldList = this.dataList.map(v => v.id)
        this.newList = this.oldList.slice()
      })
    },

    // 打开编辑框
    showDrawer(row) {
      this.drawerIsShow = true
      this.initTempData(row)
    },

    // 初始化编辑框数据
    initTempData(row) {
      if (row) {
        this.tempData = JSON.parse(JSON.stringify(row))
      } else {
        this.tempData.id = ''
        this.tempData.num = ''
        this.tempData.name = ''
        this.tempData.os = ''
        this.tempData.ip = ''
        this.tempData.port = '4723'
      }
    },

    // 新增服务
    addServer() {
      this.submitButtonIsLoading = true
      postServer(this.tempData).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.drawerIsShow = false
          this.getServerList()
        }
      })
    },

    // 编辑服务
    changeServer() {
      this.submitButtonIsLoading = true
      putServer(this.tempData).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.drawerIsShow = false
          this.getServerList()
        }
      })
    },

    // 删除服务
    removeServer(row) {
      deleteServer().then(response => {
        this.$set(row, 'deletePopoverIsShow', false)
        this.$set(row, 'deleteLoadingIsShow', true)
        deleteServer({ id: row.id }).then(response => {
          this.$set(row, 'deleteLoadingIsShow', false)
          if (this.showMessage(this, response)) {
            this.getServerList()
          }
        })
      })
    },

    // 复制服务
    serverCopy(row) {
      this.$set(row, 'copyPopoverIsShow', false)
      this.$set(row, 'copyButtonIsLoading', true)
      copyServer({ 'id': row.id }).then(response => {
        this.$set(row, 'copyButtonIsLoading', false)
        if (this.showMessage(this, response)) {
          this.dataList.push(response.data)
          this.showDrawer(response.data)
        }
      })
    },

    cancelCopyServerPopover(task) {
      this.$set(task, 'copyPopoverIsShow', false)
    },

    cancelDeleteServerPopover(task) {
      this.$set(task, 'deletePopoverIsShow', false)
    },

    // 拖拽排序
    setSort() {
      const el = this.$refs.taskTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost',
        setData: function(dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.dataList.splice(evt.oldIndex, 1)[0]
          this.dataList.splice(evt.newIndex, 0, targetRow)

          const tempIndex = this.newList.splice(evt.oldIndex, 1)[0]
          this.newList.splice(evt.newIndex, 0, tempIndex)

          // 发送请求，改变排序
          this.tableLoadingIsShow = true
          sortServer({
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

<style scoped>

</style>
