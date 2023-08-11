<template>

  <div>

    <!-- 结构树/接口列表 -->
    <el-tabs v-model="apiTab" class="table_padding table_api">

      <!-- 接口管理 -->
      <el-tab-pane name="api">
        <template slot="label">
          <span> 接口列表 </span>
          <el-popover class="el_popover_class" placement="top-start" trigger="hover">
            <div>点击添加接口</div>
            <el-button
              v-show="currentModuleId"
              slot="reference"
              type="text"
              style="margin-left: 10px"
              icon="el-icon-plus"
              @click="showAddApiDrawer()"
            />
          </el-popover>
        </template>

        <el-table
          ref="apiListTable"
          v-loading="tableLoadingIsShow"
          size="mini"
          show-overflow-tooltip
          element-loading-text="数据获取中"
          element-loading-spinner="el-icon-loading"
          :header-cell-style="{'text-align':'center'}"
          :data="api_list"
          row-key="id"
          stripe
          @cell-dblclick="cellDblclick"
        >
          <el-table-column prop="num" label="序号" align="center" min-width="5%">
            <template slot-scope="scope">
              <span> {{ (pageNum - 1) * pageSize + scope.$index + 1 }} </span>
            </template>
          </el-table-column>

          <el-table-column
            :show-overflow-tooltip="true"
            prop="addr"
            label="接口信息"
            align="center"
            min-width="50%"
          >
            <template slot-scope="scope">
              <div
                class="block"
                :class="`block_${scope.row.method.toLowerCase()}`"
                :style="{
                  'backgroundColor': scope.row.deprecated === true ? '#ebebeb' : '',
                  'textDecoration': scope.row.deprecated === true ? 'line-through' : ''
                }"
              >
                <span
                  class="block-method block_method_color"
                  :class="`block_method_${scope.row.method.toLowerCase()}`"
                  :style="{
                    'backgroundColor': scope.row.deprecated === true ? '#ebebeb' : ''
                  }"
                >
                  {{ scope.row.method }}
                </span>
                <span class="block-method block_url">{{ scope.row.addr }}</span>
                <span class="block-summary-description">{{ scope.row.name }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column
            :show-overflow-tooltip="true"
            prop="level"
            align="center"
            min-width="10%"
          >
            <template slot="header">
              <span> 重要级别 </span>
              <el-tooltip
                class="item"
                effect="dark"
                placement="top-start"
              >
                <div slot="content">
                  <div>标识接口的重要级别，根据重要级别筛选优先做自动化测试的接口</div>
                </div>
                <span><i style="color: #409EFF" class="el-icon-question" /></span>
              </el-tooltip>
            </template>
            <template slot-scope="scope">
              <div>
                <div style="width: 80%; margin-left:auto; margin-right:auto">
                  <el-select
                    :ref="`levelSelector${scope.row.id}`"
                    slot="prepend"
                    v-model="scope.row.level"
                    size="mini"
                    placeholder="选择重要程度"
                    filterable
                    class="select"
                    @change="selectApiLevel(scope.row)"
                  >
                    <el-option label="高" value="P0"><span style="color: #F56C6C">高</span></el-option>
                    <el-option label="中" value="P1"><span style="color: #E6A23C">中</span></el-option>
                    <el-option label="低" value="P2"><span style="color: #67C23A">低</span></el-option>
                  </el-select>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column align="center" min-width="10%">
            <template slot="header">
              <span>是否可用</span>
              <el-tooltip
                class="item"
                effect="dark"
                placement="top-start"
              >
                <div slot="content">
                  <div>标识接口是否被废弃</div>
                </div>
                <span><i style="color: #409EFF" class="el-icon-question" /></span>
              </el-tooltip>
            </template>
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.deprecated"
                :inactive-value="true"
                :active-value="false"
                @change="changeStatus(scope.row)"
              />
            </template>
          </el-table-column>

          <el-table-column
            :show-overflow-tooltip="true"
            prop="quote_count"
            align="center"
            min-width="10%"
          >
            <template slot="header">
              <span> 使用次数 </span>
              <el-tooltip
                class="item"
                effect="dark"
                placement="top-start"
              >
                <div slot="content">
                  <div>1: 统计有多少条用例里直接使用了此接口</div>
                  <div>2: 被设计为用例的步骤后，该用例被引用的，不纳入统计</div>
                  <div>3: 被使用过的接口，点击使用次数数值可查看使用明细</div>
                </div>
                <span><i style="color: #409EFF" class="el-icon-question" /></span>
              </el-tooltip>
            </template>
            <template slot-scope="scope">
              <el-tooltip class="item" effect="dark" placement="top-start">
                <div slot="content">
                  <div>{{ scope.row.quote_count > 0 ? '点击查看详情' : '未被使用过' }}</div>
                </div>
                <el-tag v-if="scope.row.quote_count" @click="getApiMsgBelongToStep(scope.row)">
                  {{ scope.row.quote_count }}
                </el-tag>
                <el-tag v-else type="info">0</el-tag>
              </el-tooltip>
            </template>
          </el-table-column>

          <el-table-column label="操作" align="center" min-width="15%">
            <template slot-scope="scope">

              <!-- 运行接口 -->
              <el-button
                type="text"
                size="mini"
                style="margin-left: 5px"
                :loading="scope.row.runButtonIsLoading"
                @click="clickRunApi(scope.row)"
              >运行
              </el-button>

              <!--修改接口-->
              <el-button
                type="text"
                size="mini"
                style="margin-left: 5px"
                @click="showEditForm(scope.row)"
              >修改
              </el-button>

              <!-- 复制接口 -->
              <el-popover
                :ref="scope.row.id"
                v-model="scope.row.copyPopoverIsShow"
                placement="top"
                popper-class="down-popover"
              >
                <p>复制此接口并生成新的接口?</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="cancelCopyPopover(scope.row)">取消</el-button>
                  <el-button type="primary" size="mini" @click="copyApi(scope.row)">确定</el-button>
                </div>
                <el-button
                  slot="reference"
                  type="text"
                  size="mini"
                  style="margin-left: 5px"
                >复制
                </el-button>
              </el-popover>

              <!-- 删除接口 -->
              <el-popover
                :ref="scope.row.id"
                v-model="scope.row.deletePopoverIsShow"
                placement="top"
                popper-class="down-popover"
              >
                <p>确定删除【{{ scope.row.name }}】?</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="mini" type="text" @click="cancelDeletePopover(scope.row)">取消</el-button>
                  <el-button type="primary" size="mini" @click="delApi(scope.row)">确定</el-button>
                </div>
                <el-button
                  slot="reference"
                  style="color: red; margin-left: 5px"
                  type="text"
                  size="mini"
                >删除
                </el-button>
              </el-popover>

            </template>
          </el-table-column>

        </el-table>

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
      :current-project-id="currentProjectId"
      :current-module-id="currentModuleId"
    />

    <showApiUseDrawer
      :marker="marker"
    />

  </div>
</template>

<script>
import Sortable from 'sortablejs'
import Pagination from '@/components/Pagination'
import apiDrawer from '@/views/apiTest/api/drawer'
import showApiUseDrawer from '@/components/business/api/apiUseDrawer.vue'

import { userList } from '@/apis/system/user'
import {
  apiList,
  apiMsgBelongToStep,
  apiMsgSort,
  changeApiLevel,
  changeApiStatus,
  deleteApi,
  runApi
} from '@/apis/apiTest/api'

export default {
  name: 'Index',
  components: {
    Pagination,
    apiDrawer,
    showApiUseDrawer
  },

  data() {
    return {

      tableLoadingIsShow: false, // 请求列表等待响应的状态
      isLoading: false, // 运行接口按钮的loading状态
      apiTab: 'api', //  tab页的显示
      tempApi: {}, // 接口新增/编辑临时数据

      currentModuleId: '',
      currentProjectId: '',

      // 接口数据列表
      pageNum: 1,
      pageSize: 20,
      api_total: 0,
      api_list: [],

      marker: 'apiList',

      colorDict: {
        'P0': '#F56C6C',
        'P1': '#E6A23C',
        'P2': '#67C23A'
      },

      // 拖拽排序参数
      sortable: null,
      oldList: [],
      newList: [],
      userList: [],
      userDict: {},
      currentApi: {}
    }
  },

  watch: {
    // 重新获取接口列表后，修改对应的重要等级背景色颜色
    'api_list': {
      deep: true, // 深度监听
      handler(newVal, oldVal) {
        this.$nextTick(function() {
          newVal.forEach(api => {
            this.changeSelectColor(api)
          })
        })
      }
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
    // 点击树时，请求对应的接口列表
    this.$bus.$on(this.$busEvents.treeIsChoice, (_type, moduleId, projectId) => {
      if (_type === 'module') {
        this.currentModuleId = moduleId
        this.currentProjectId = projectId
        this.getApiList()
      }
    })

    this.getUserList()

    // 接口提交成功，则重新请求接口列表
    this.$bus.$on(this.$busEvents.drawerIsCommit, (_type, _runUnit, runDict) => {
      if (_type === 'apiInfo') {
        this.getApiList()
      } else if (_type === 'selectRunEnv' && _runUnit === 'apiIndex') {
        this.runApis(runDict)
      }
    })
  },

  // 页面销毁的时候，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.treeIsChoice)
    this.$bus.$off(this.$busEvents.drawerIsCommit)
  },

  methods: {

    // 添加接口
    showAddApiDrawer(node, data) {
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'apiInfo', 'add')
    },

    // 获取接口使用情况
    getApiMsgBelongToStep(row) {
      this.tableLoadingIsShow = true
      apiMsgBelongToStep({ id: row.id }).then(response => {
        this.tableLoadingIsShow = false
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.drawerIsShow, 'apiUseIsShow', this.marker, response.data)
        }
      })
    },

    changeStatus(row) {
      this.tableLoadingIsShow = true
      changeApiStatus({
        id: row.id,
        deprecated: row.deprecated
      }).then(response => {
        this.tableLoadingIsShow = false
        this.showMessage(this, response)
      })
    },

    // 修改选择框颜色
    changeSelectColor(row) {
      this.$refs[`levelSelector${row.id}`].$el.children[0].children[0].style.backgroundColor = this.colorDict[row.level]
    },

    // 修改接口的重要等级
    selectApiLevel(row) {
      this.tableLoadingIsShow = true
      changeApiLevel({
        id: row.id,
        level: row.level
      }).then(response => {
        this.tableLoadingIsShow = false
        this.showMessage(this, response)

        // 修改选择框颜色
        this.changeSelectColor(row)
      })
    },

    // 双击单元格复制
    cellDblclick(row, column, cell, event) {
      const that = this
      const data = `${row.name}: ${row.addr}`
      this.$copyText(data).then(
        function(e) {
          that.$message.success('复制成功')
        }
      )
    },

    // 获取用户信息，同步请求
    async getUserList() {
      const response = await userList()
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
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'apiInfo', 'edit', this.tempApi)
    },

    // 删除接口
    delApi(row) {
      this.$set(row, 'deletePopoverIsShow', false)
      this.tableLoadingIsShow = true
      deleteApi({ 'id': row.id }).then(response => {
        this.tableLoadingIsShow = false
        if (this.showMessage(this, response)) {
          this.getApiList()
        }
      })
    },

    cancelDeletePopover(row) {
      this.$set(row, 'deletePopoverIsShow', false)
    },

    cancelCopyPopover(api) {
      this.$set(api, 'copyPopoverIsShow', false)
    },

    // 复制接口
    copyApi(api) {
      this.tempApi = api
      this.tempApi.id = ''
      this.tempApi.quote_count = 0
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'apiInfo', 'copy', JSON.parse(JSON.stringify(this.tempApi)))
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
        this.tableLoadingIsShow = false
        this.api_list = response.data.data
        this.api_total = response.data.total

        this.oldList = this.api_list.map(v => v.id)
        this.newList = this.oldList.slice()
      })
    },

    // 点击运行接口
    clickRunApi(row) {
      this.currentApi = row
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'selectRunEnv', 'apiIndex', false)
    },

    // 运行接口
    runApis(runConf) {
      this.$set(this.currentApi, 'runButtonIsLoading', true)
      runApi({
        projectId: this.currentApi.project_id,
        apis: [this.currentApi.id],
        env_list: runConf.runEnv
      }).then(response => {
        this.$set(this.currentApi, 'runButtonIsLoading', false)
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.drawerIsShow, 'process', response.data.batch_id)
        }
      })
    },

    // 拖拽排序
    setSort() {
      const el = this.$refs.apiListTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost',
        setData: function(dataTransfer) {
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
            pageSize: this.pageSize
          }).then(response => {
            this.tableLoadingIsShow = false
            this.showMessage(this, response)
          })
        }
      })
    }

  }
}
</script>

<style scoped>
.block_post {
  border: 1px solid #49cc90;
  background-color: rgba(73, 204, 144, .1)
}

.block_method_post {
  background-color: #49cc90;
}

.block_put {
  border: 1px solid #fca130;
  background-color: rgba(252, 161, 48, .1)
}

.block_method_put {
  background-color: #fca130;
}

.block_get {
  border: 1px solid #61affe;
  background-color: rgba(97, 175, 254, .1)
}

.block_method_get {
  background-color: #61affe;
}

.block_delete {
  border: 1px solid #f93e3e;
  background-color: rgba(249, 62, 62, .1)
}

.block_method_delete {
  background-color: #f93e3e;
}

.block_patch {
  border: 1px solid #50e3c2;
  background-color: rgba(80, 227, 194, .1)
}

.block_method_patch {
  background-color: #50e3c2;
}

.block_head {
  border: 1px solid #e6a23c;
  background-color: rgba(230, 162, 60, .1)
}

.block_method_head {
  background-color: #e6a23c;
}

.block_options {
  border: 1px solid #409eff;
  background-color: rgba(64, 158, 255, .1)
}

.block_method_options {
  background-color: #409eff;
}

.block {
  position: relative;
  border-radius: 4px;
  /*height: 48px;*/
  overflow: hidden;
  padding: 5px;
  display: flex;
  align-items: center;
}

.block_url {
  word-break: normal;
  width: auto;
  display: block;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow: hidden;
  -webkit-box-flex: 1;
  -ms-flex: 1;
  font-family: Open Sans, sans-serif;
  color: #3b4151;
}

.block_name {
  padding-left: 5px;
  word-break: normal;
  width: auto;
  display: block;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow: hidden;
  -webkit-box-flex: 1;
  -ms-flex: 1;
  font-family: Open Sans, sans-serif;
  color: #3b4151;
}

.block_method_color {
  cursor: pointer;
  color: #fff;
}

.block-method {
  font-size: 14px;
  font-weight: 600;
  min-width: 50px;
  padding: 0px 10px;
  text-align: center;
  border-radius: 5px;
  text-shadow: 0 1px 0 rgba(0, 0, 0, .1);
  font-family: Titillium Web, sans-serif;
}

.block-summary-description {
  word-break: normal;
  width: auto;
  display: block;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow: hidden;
  -webkit-box-flex: 1;
  -ms-flex: 1;
  font-family: Open Sans, sans-serif;
  color: #3b4151;
}
</style>
