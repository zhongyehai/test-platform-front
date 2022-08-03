<template>

  <div>

    <!-- 结构树/接口列表 -->
    <el-tabs v-model="apiTab" class="table_padding table_api">

      <!-- 模块管理 -->
      <el-tab-pane label="接口列表" name="api">

        <el-table
          ref="apiListTable"
          v-loading="tableLoadingIsShow"
          element-loading-text="正在排序中"
          element-loading-spinner="el-icon-loading"
          :data="api_list"
          row-key="id"
          stripe
        >
          <el-table-column prop="num" label="序号" min-width="7%">
            <template slot-scope="scope">
              <span> {{ (pageNum - 1) * pageSize + scope.$index + 1 }} </span>
            </template>
          </el-table-column>

          <el-table-column :show-overflow-tooltip=true prop="name" label="接口名称" min-width="20%">
            <template slot-scope="scope">
              <span> {{ scope.row.name }} </span>
            </template>
          </el-table-column>

          <el-table-column
            :show-overflow-tooltip=true
            prop="addr"
            label="接口地址"
            min-width="47%"
          ></el-table-column>

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

          <el-table-column label="接口操作" min-width="14%">
            <template slot-scope="scope">

              <!-- 运行接口 -->
              <el-button
                type="text"
                slot="reference"
                icon="el-icon-video-play"
                :loading="scope.row.isLoading"
                @click="clickRunApi(scope.row)"
              ></el-button>

              <!--修改接口-->
              <el-button
                type="text"
                style="margin-right: 8px"
                icon="el-icon-edit"
                @click="showEditForm(scope.row)">
              </el-button>

              <!-- 复制接口 -->
              <el-popover
                :ref="scope.row.id"
                placement="top"
                style="margin-right: 10px"
                popper-class="down-popover"
                v-model="scope.row.copyPopoverIsShow">
                <p>复制此接口并生成新的接口?</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="cancelCopyPopover(scope.row)">取消</el-button>
                  <el-button type="primary" size="mini" @click="copyApi(scope.row)">确定</el-button>
                </div>
                <el-button
                  slot="reference"
                  type="text"
                  icon="el-icon-document-copy"
                ></el-button>
              </el-popover>

              <!-- 删除接口 -->
              <el-popover
                :ref="scope.row.id"
                placement="top"
                popper-class="down-popover"
                v-model="scope.row.deletePopoverIsShow">
                <p>确定删除【{{ scope.row.name }}】?</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="cancelDeletePopover(scope.row)">取消</el-button>
                  <el-button type="primary" size="mini" @click="delApi(scope.row)">确定</el-button>
                </div>
                <el-button
                  slot="reference"
                  style="color: red"
                  type="text"
                  icon="el-icon-delete"
                  :loading="scope.row.isShowDeleteLoading"
                ></el-button>
              </el-popover>

            </template>
          </el-table-column>

        </el-table>

        <selectRunEnv
          :callBackEvent="callBackEvent"
          :event="runEvent"
        ></selectRunEnv>

        <pagination
          v-show="api_total>0"
          :total="api_total"
          :page.sync="pageNum"
          :limit.sync="pageSize"
          @pagination="getApiList"
        />
      </el-tab-pane>

    </el-tabs>

    <apiDrawer
      :currentProjectId="currentProjectId"
      :currentModuleId="currentModuleId"
    ></apiDrawer>

  </div>
</template>

<script>
import Sortable from 'sortablejs'
import Pagination from '@/components/Pagination'

import apiDrawer from '@/views/apiTest/api/drawer'
import selectRunEnv from '@/components/selectRunEnv'  // 环境选择组件

import {userList} from '@/apis/user/user'
import {apiList, deleteApi, runApi, apiMsgSort} from '@/apis/apiTest/api'
import {reportIsDone} from "@/apis/apiTest/report";
import {runTestTimeOutMessage} from "@/utils/message";
import {getRunTimeout} from "@/utils/getConfig";

export default {
  name: 'index',
  components: {
    Pagination,
    apiDrawer,
    selectRunEnv
  },

  // 接收父组件传参的key
  props: [
    'currentProjectId',
    'currentModuleId'
  ],
  data() {
    return {

      tableLoadingIsShow: false,  // 请求列表等待响应的状态
      isLoading: false,  // 运行接口按钮的loading状态
      apiTab: 'api',  //  tab页的显示
      tempApi: {},  // 接口新增/编辑临时数据

      // 接口数据列表
      pageNum: 1,
      pageSize: 20,
      api_total: 0,
      api_list: [],

      // 拖拽排序参数
      sortable: null,
      oldList: [],
      newList: [],
      userList: [],
      userDict: {},
      currentApi: {},
      runEvent: 'runApiEventOnIndex',
      callBackEvent: 'runApiOnIndex'
    }
  },

  created() {

    this.oldList = this.api_list.map(v => v.id)
    this.newList = this.oldList.slice()
    this.$nextTick(() => {
      this.setSort()
    })
  },

  mounted() {
    this.getUserList()

    // 监听 接口 Dialog 框 的提交状态，提交成功，则重新请求接口列表
    this.$bus.$on(this.$busEvents.api.apiApiDrawerCommitSuccess, () => {
      this.getApiList()
    })

    this.$bus.$on(this.callBackEvent, (runDict) => {
      this.runApis(runDict)
    })

    getRunTimeout(this)  // 初始化等待用例运行超时时间
  },

  // 页面销毁的时候，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.callBackEvent)
    this.$bus.$off(this.$busEvents.api.apiApiDrawerCommitSuccess)
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
      this.tempApi = JSON.parse(JSON.stringify(row))
      this.$bus.$emit(this.$busEvents.api.apiApiDrawerStatus, 'edit', this.tempApi)
    },

    // 删除接口
    delApi(row) {
      this.$set(row, 'deletePopoverIsShow', false)
      this.$set(row, 'isShowDeleteLoading', true)
      deleteApi({'id': row.id}).then(response => {
        this.$set(row, 'isShowDeleteLoading', false)
        if (this.showMessage(this, response)) {
          this.getApiList()
        }
      })
    },

    cancelDeletePopover(row){
      this.$set(row, 'deletePopoverIsShow', false)
    },

    cancelCopyPopover(api){
      this.$set(api, 'copyPopoverIsShow', false)
    },

    // 复制接口
    copyApi(api) {
      this.tempApi = api
      this.tempApi.id = ''
      this.$bus.$emit(this.$busEvents.api.apiApiDrawerStatus, 'copy', JSON.parse(JSON.stringify(this.tempApi)))
      this.$set(api, 'copyPopoverIsShow', false)
    },

    // 根据模块内容获取接口列表
    getApiList(params) {
      this.tableLoadingIsShow = true
      apiList({
        'moduleId': this.currentModuleId,
        'pageNum': this.pageNum,
        'pageSize': this.pageSize
      }).then(response => {
        this.api_list = response.data.data
        this.api_total = response.data.total

        this.oldList = this.api_list.map(v => v.id)
        this.newList = this.oldList.slice()
      })
      this.tableLoadingIsShow = false
    },

    // 点击运行接口
    clickRunApi(row){
      this.currentApi = row
      this.$bus.$emit(this.runEvent, false)
    },

    // 运行接口
    runApis(runData) {
      this.$set(this.currentApi, 'isLoading', true)
      runApi({
        'projectId': this.currentApi.project_id,
        'apis': [this.currentApi.id],
        env: runData.runEnv
      }).then(runResponse => {
        if (this.showMessage(this, runResponse)) {

          // 触发运行成功，每三秒查询一次，
          // 查询10次没出结果，则停止查询，提示用户去测试报告页查看
          // 已出结果，则停止查询，展示测试报告
          var that = this
          var runTimeoutCount = Number(this.$busEvents.runTimeout) * 1000 / 3000
          var queryCount = 1
          var timer = setInterval(function () {
            if (queryCount <= runTimeoutCount) {
              reportIsDone({'id': runResponse.data.report_id}).then(queryResponse => {
                if (queryResponse.data === 1) {
                  that.$set(that.currentApi, 'isLoading', false)
                  that.openReportById(runResponse.data.report_id)
                  clearInterval(timer)  // 关闭定时器
                }
              })
              queryCount += 1
            } else {
              that.$set(that.currentApi, 'isLoading', false)
              that.$notify(runTestTimeOutMessage(that));
              clearInterval(timer)  // 关闭定时器
            }
          }, 3000)
        }
      })
    },

    // 打开测试报告
    openReportById(reportId) {
      // console.log(`task.index.openReportById.reportId: ${JSON.stringify(reportId)}`)
      let {href} = this.$router.resolve({path: 'reportShow', query: {id: reportId}})
      window.open(href, '_blank')
    },

    // 拖拽排序
    setSort() {
      const el = this.$refs.apiListTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost',
        setData: function (dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.api_list.splice(evt.oldIndex, 1)[0]
          this.api_list.splice(evt.newIndex, 0, targetRow)
          const tempIndex = this.newList.splice(evt.oldIndex, 1)[0]
          this.newList.splice(evt.newIndex, 0, tempIndex)

          // 发送请求，改变排序
          this.tableLoadingIsShow = true
          apiMsgSort({
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

    // 监听父组件传过来的当前选中的模块，实时获取父组件传过来的模块信息对应下的接口列表
    'currentModuleId': {
      deep: true,  // 深度监听
      handler(newVal, oldVal) {
        if (newVal) {
          this.getApiList({
            'moduleId': newVal,
            'pageNum': this.pageNum,
            'pageSize': this.pageSize
          })
        } else {
          this.api_list = []
        }

      }
    }
  }
}
</script>

<style>

</style>
