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
      <el-table-column prop="num" label="序号" align="center" min-width="7%">
        <template slot-scope="scope">
          <span> {{ (pageNum - 1) * pageSize + scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="name" align="center" label="手机名称" min-width="25%">
        <template slot-scope="scope">
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="os" align="center" label="手机系统类型" min-width="25%">
        <template slot-scope="scope">
          <span> {{ scope.row.os }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="ip" align="center" label="手机系统版本" min-width="25%">
        <template slot-scope="scope">
          <span> {{ scope.row.os_version }} </span>
        </template>
      </el-table-column>


      <el-table-column align="center" label="操作" min-width="16%">
        <template slot-scope="scope">

          <!-- 修改手机 -->
          <el-button
            type="text"
            size="mini"
            icon="el-icon-edit"
            style="margin-right: 10px"
            @click.native="showDrawer(scope.row)"></el-button>

          <!-- 复制手机 -->
          <el-popover
            :ref="scope.row.id"
            placement="top"
            style="margin-right: 10px"
            popper-class="down-popover"
            v-model="scope.row.copyPopoverIsShow">
            <p>复制此手机并生成新的手机?</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="cancelCopyServerPopover(scope.row)">取消</el-button>
              <el-button type="primary" size="mini" @click="serverCopy(scope.row)">确定</el-button>
            </div>
            <el-button
              slot="reference"
              type="text"
              size="mini"
              icon="el-icon-document-copy"
              :loading="scope.row.copyButtonIsLoading"
            ></el-button>
          </el-popover>

          <!-- 删除手机 -->
          <el-popover
            :ref="scope.row.id"
            placement="top"
            popper-class="down-popover"
            v-model="scope.row.deletePopoverIsShow">
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
              icon="el-icon-delete"
              :loading="scope.row.deleteLoadingIsShow"
            ></el-button>
          </el-popover>

        </template>
      </el-table-column>
    </el-table>

    <el-drawer
      :title="tempData.id ? '修改手机' : '新增手机'"
      size="65%"
      :wrapperClosable="false"
      :visible.sync="drawerIsShow"
      :direction="direction">

      <el-form label-width="100px" style="margin-left: 20px;margin-right: 20px">

        <el-form-item label="别名" class="is-required">
          <el-input v-model="tempData.name" size="mini" placeholder="手机名字"></el-input>
        </el-form-item>

        <el-form-item label="系统类型" class="is-required">
          <el-select
            v-model="tempData.os"
            filterable
            default-first-option
            clearable
            size="mini"
            style="width:100%"
            placeholder="请选择执行app自动化的手机的系统类型"
            class="filter-item">
            <el-option
              v-for="osType in phoneOsMapping"
              :key="osType"
              :label="osType"
              :value="osType"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="系统版本" class="is-required">
          <el-input v-model="tempData.os_version" size="mini" placeholder="系统版本"></el-input>
        </el-form-item>

      </el-form>


      <div class="demo-drawer__footer">
        <el-button @click="drawerIsShow = false" size="mini">取 消</el-button>
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
      @pagination="gePhoneList"
    />
  </div>
</template>

<script>
import Sortable from 'sortablejs'
import projectTreeView from '@/components/uiTest/projectTree'
import Pagination from '@/components/Pagination'

import {phoneList, postPhone, putPhone, getServer, deletePhone, sortPhone, copyPhone} from '@/apis/appUiTest/env'
import {getConfigByName} from "@/apis/config/config";


export default {
  name: "index",
  components: {Pagination, projectTreeView},
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
        os_version: ''
      },

      direction: 'rtl',  // 抽屉打开方式
      submitButtonIsLoading: false,
      drawerIsShow: false,

      phoneOsMapping: []
    }
  },


  methods: {

    // 获取手机列表
    gePhoneList() {
      phoneList({
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
        this.tempData.os_version = ''
      }
    },

    // 新增服务
    addServer() {
      postPhone(this.tempData).then(response => {
        if (this.showMessage(this, response)) {
          this.drawerIsShow = false
          this.gePhoneList()
        }
      })
    },

    // 编辑服务
    changeServer() {
      putPhone(this.tempData).then(response => {
        if (this.showMessage(this, response)) {
          this.drawerIsShow = false
          this.gePhoneList()
        }
      })
    },

    // 删除服务
    removeServer(row) {
      deletePhone().then(response => {
        this.$set(row, 'deletePopoverIsShow', false)
        this.$set(row, 'deleteLoadingIsShow', true)
        deletePhone({id: row.id}).then(response => {
          this.$set(row, 'deleteLoadingIsShow', false)
          if (this.showMessage(this, response)) {
            this.gePhoneList()
          }
        })
      })
    },

    // 复制服务
    serverCopy(row) {
      this.$set(row, 'copyPopoverIsShow', false)
      this.$set(row, 'copyButtonIsLoading', true)
      copyPhone({'id': row.id}).then(response => {
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
        setData: function (dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.dataList.splice(evt.oldIndex, 1)[0]
          this.dataList.splice(evt.newIndex, 0, targetRow)

          const tempIndex = this.newList.splice(evt.oldIndex, 1)[0]
          this.newList.splice(evt.newIndex, 0, tempIndex)

          // 发送请求，改变排序
          this.tableLoadingIsShow = true
          sortPhone({
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

  mounted() {
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type) => {
      if (_type === 'appPhone'){
        this.showDrawer()
      }
    })

    getConfigByName({"name": "phone_os_mapping"}).then(response => {
      this.phoneOsMapping = JSON.parse(response.data.value)
    })

    this.gePhoneList()
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
}
</script>

<style scoped>

</style>
