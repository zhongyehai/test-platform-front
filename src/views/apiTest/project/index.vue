<template>
  <div class="app-container">
    <!-- 搜索、添加栏 -->
    <div class="filter-container">

      <!-- inline="true"，el-form-item不自动换行 -->
      <el-form label-width="100px" :inline="true">

        <el-form-item :label="'服务名：'" size="mini">
          <el-input
            v-model="listQuery.name"
            class="input-with-select"
            placeholder="服务名，支持关键字查询"
            size="mini"
            clearable
            style="width: 200px">
          </el-input>
        </el-form-item>

        <el-form-item :label="'创建人：'" size="mini">
          <el-select
            v-model="listQuery.create_user"
            :placeholder="'选择创建人'"
            filterable
            default-first-option
            clearable
            size="mini"
            class="filter-item">
            <el-option v-for="user in currentUserList" :key="user.name" :label="user.name" :value="user.id"/>
          </el-select>
        </el-form-item>

        <el-form-item :label="'负责人：'" size="mini">
          <el-select
            v-model="listQuery.manager"
            :placeholder="'选择负责人'"
            filterable
            default-first-option
            clearable
            size="mini"
            class="filter-item">
            <el-option v-for="user in currentUserList" :key="user.name" :label="user.name" :value="user.id"/>
          </el-select>
        </el-form-item>

        <el-button
          v-waves
          type="primary"
          size="mini"
          @click="handleFilter">
          {{ '搜索' }}
        </el-button>

        <el-button
          type="primary"
          size="mini"
          @click="addProject">
          {{ '添加' }}
        </el-button>

        <el-button
          type="primary"
          size="mini"
          @click="handleInitListQuery">
          {{ '重置' }}
        </el-button>

        <el-tooltip
          class="item"
          effect="dark"
          content="从yapi拉取项目列表"
          placement="top-start">
          <el-button
            disabled
            type="primary"
            size="mini"
            :loading="pullYapiProjectIsLoading"
            @click="pullYapiProject">
            {{ '从yapi拉取' }}
          </el-button>
        </el-tooltip>
      </el-form>
    </div>

    <!-- 表格栏 -->
    <el-table
      ref="projectTable"
      v-loading="tableIsLoading"
      element-loading-text="正在排序中"
      element-loading-spinner="el-icon-loading"
      :data="project_list"
      row-key="id"
      stripe
      style="width: 100%;"
    >
      <el-table-column :label="'序号'" prop="id" align="center" min-width="8%">
        <template slot-scope="scope">
          <span> {{ (listQuery.pageNum - 1) * listQuery.pageSize + scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column :label="'服务名'" prop="name" align="center" min-width="20%" :show-overflow-tooltip=true>
        <template slot-scope="scope">
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>

      <el-table-column :label="'swagger地址'" prop="test" align="center" min-width="32%" :show-overflow-tooltip=true>
        <template slot-scope="scope">
          <div v-if="scope.row.swagger">
            <span>{{ scope.row.swagger }}</span>
          </div>
          <div v-else>
            <el-tag type="warning">未设置</el-tag>
          </div>
        </template>
      </el-table-column>

      <el-table-column :label="'最新拉取状态'" prop="test" align="center" min-width="10%" :show-overflow-tooltip=true>
        <template slot-scope="scope">
          <el-tag :type="pullStatusTagType[scope.row.last_pull_status]">
            {{ pullStatusContent[scope.row.last_pull_status] }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column :label="'负责人'" prop="id" align="center" min-width="10%">
        <template slot-scope="scope">
          <span>{{ parseUser(scope.row.manager) }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'最后修改人'" prop="id" align="center" min-width="15%">
        <template slot-scope="scope">
          <span>{{ parseUser(scope.row.update_user) }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'操作'" align="center" min-width="15%" class-name="small-padding fixed-width">
        <template slot-scope="{row, $index}">

          <!-- 从yapi拉取此服务下的模块、接口信息 -->
          <el-popover
            v-show="row.yapi_id || row.swagger"
            :ref="row.id"
            placement="top"
            width="160"
            style="margin-right: 5px"
            popper-class="down-popover"
            v-model="row.pullPopoverIsShow">
            <p>从{{ row.yapi_id ? 'yapi' : 'swagger' }}拉取此服务下的模块、接口信息?</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="cancelPull(row)">取消</el-button>
              <el-button type="primary" size="mini" @click="row.yapi_id ? pullByYapi(row) : pullBySwagger(row)">确定
              </el-button>
            </div>
            <el-button
              slot="reference"
              type="text"
              size="mini"
              icon="el-icon-bottom-left"
              :loading="row.pullPopoverLoadingIsShow"
            ></el-button>
          </el-popover>

          <!-- 编辑服务 -->
          <el-button
            type="text"
            size="mini"
            icon="el-icon-edit"
            @click="showEditForm(row)">
          </el-button>

          <!-- 编辑服务环境 -->
          <el-button
            type="text"
            size="mini"
            style="margin-right: 5px"
            icon="el-icon-edit-outline"
            @click="showEditEnvForm(row)">
          </el-button>

          <!--删除服务-->
          <el-popover
            :ref="row.id"
            placement="top"
            popper-class="down-popover"
            v-model="row.deletePopoverIsShow">
            <p>确定删除【{{ row.name }}】?</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="cancelDeletePopover(row)">取消</el-button>
              <el-button type="primary" size="mini" @click="delProject(row)">确定</el-button>
            </div>
            <el-button
              slot="reference"
              style="color: red"
              type="text"
              size="mini"
              icon="el-icon-delete"
              :loading="row.deleteButtonIsLoading"
            ></el-button>
          </el-popover>

        </template>
      </el-table-column>

    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.pageNum"
      :limit.sync="listQuery.pageSize"
      @pagination="getProjectList"/>

    <!-- 服务信息抽屉 -->
    <projectDrawer
      :currentProject="currentProject"
      :currentUserList="currentUserList"
    ></projectDrawer>

    <!-- 服务环境抽屉 -->
    <projectEnvDrawer
      :envType="'api'"
      :dataTypeMapping="dataTypeMapping"
    ></projectEnvDrawer>
  </div>
</template>

<script>
import {deleteProject, projectList, projectSort} from '@/apis/apiTest/project'
import {yapiPull, yapiPullProject} from '@/apis/assist/yapi'
import {swaggerPull} from '@/apis/assist/swagger'
import {userList} from '@/apis/system/user'
import Sortable from 'sortablejs'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'
import projectDrawer from '@/views/apiTest/project/drawer'
import projectEnvDrawer from '@/components/projectEnvEditor/envEditor.vue'
import {getConfigByName} from "@/apis/config/config";
import {swaggerPullStatusMappingContent, swaggerPullStatusMappingTagType} from "@/utils/mapping";

export default {
  name: 'Project',
  components: {
    Pagination,
    projectDrawer,
    projectEnvDrawer
  },
  directives: {waves},
  data() {
    return {
      // 查询对象
      listQuery: {
        pageNum: 1,
        pageSize: 20,
        name: '',  // 服务名
        manager: '',  // 负责人
        create_user: '', // 创建人
      },
      currentProject: {},  // 当前选中的服务
      project_list: [],  // 服务列表
      total: 0,  // 服务数据表格总条数
      dialogStatus: '',  // dialog框状态，edit 为编辑数据, create 为新增数据
      downloadLoading: false,  // 下载表格状态
      tableIsLoading: true,  // 请求加载状态
      pullYapiProjectIsLoading: false,
      currentUserList: [],
      userDict: {},
      dataTypeMapping: [],
      sortable: null,
      oldList: [],
      newList: [],

      pullStatusContent: swaggerPullStatusMappingContent,
      pullStatusTagType: swaggerPullStatusMappingTagType
    }
  },

  created() {
    this.getUserList(this.getProjectList)  // 先获取用户数据
    // this.getProjectList()  // 获取服务列表

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

    // 编辑按钮
    showEditForm(row) {
      this.$bus.$emit(this.$busEvents.api.apiShowProjectDrawer, 'edit', row)
    },

    // 编辑环境
    showEditEnvForm(row) {
      this.$bus.$emit(this.$busEvents.showProjectEnvDrawer, row)
    },

    // 从yapi同步服务信息
    pullByYapi(row) {
      this.$set(row, 'pullPopoverIsShow', false)
      this.$set(row, 'pullPopoverLoadingIsShow', true)
      yapiPull({id: row.id}).then(response => {
        this.showMessage(this, response)
        this.$set(row, 'pullPopoverLoadingIsShow', false)
      })
    },

    // 从yapi同步服务信息
    pullYapiProject(row) {
      this.pullYapiProjectIsLoading = true
      yapiPullProject({}).then(response => {
        this.pullYapiProjectIsLoading = false
        if (this.showMessage(this, response)) {
          this.getProjectList()
        }
      })
    },

    // 从swagger同步服务信息
    pullBySwagger(row) {
      this.$set(row, 'pullPopoverIsShow', false)
      this.$set(row, 'pullPopoverLoadingIsShow', true)
      swaggerPull({id: row.id}).then(response => {
        this.showMessage(this, response)
        this.$set(row, 'pullPopoverLoadingIsShow', false)
      })
    },

    // 获取服务列表
    getProjectList() {
      this.tableIsLoading = true
      projectList(this.listQuery).then(response => {
        this.project_list = response.data.data
        this.total = response.data.total

        this.oldList = this.project_list.map(v => v.id)
        this.newList = this.oldList.slice()
        this.$nextTick(() => {
          this.setSort()
        })
      })
      this.tableIsLoading = false
    },

    // 删除服务
    delProject(row) {
      this.$set(row, 'deletePopoverIsShow', false)
      this.$set(row, 'deleteButtonIsLoading', true)
      deleteProject({"id": row.id}).then(response => {
        this.$set(row, 'deleteButtonIsLoading', false)
        if (this.showMessage(this, response)) {
          this.getProjectList(); // 重新从后台获取服务列表
        }
      })
    },

    cancelPull(row) {
      this.$set(row, 'pullPopoverIsShow', false)
    },

    cancelDeletePopover(row) {
      this.$set(row, 'deletePopoverIsShow', false)
    },

    // 触发查询
    handleFilter() {
      this.listQuery.pageNum = 1
      this.getProjectList()
    },

    // 点击添加服务
    addProject() {
      this.$bus.$emit(this.$busEvents.api.apiShowProjectDrawer, 'add')
    },

    // 初始化查询数据
    handleInitListQuery() {
      this.listQuery = {
        pageNum: 1,
        pageSize: 20,
        projectId: '',  // 服务id
        manager: '',  // 负责人
        create_user: '', // 创建人
      }
      this.getProjectList()
    },

    // 拖拽排序
    setSort() {
      const el = this.$refs.projectTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost',
        setData: function (dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.project_list.splice(evt.oldIndex, 1)[0]
          this.project_list.splice(evt.newIndex, 0, targetRow)

          const tempIndex = this.newList.splice(evt.oldIndex, 1)[0]
          this.newList.splice(evt.newIndex, 0, tempIndex)

          // 发送请求，改变排序
          this.tableIsLoading = true
          projectSort({
            List: this.newList,
            pageNum: this.listQuery.pageNum,
            pageSize: this.listQuery.pageSize,
          }).then(response => {
            this.showMessage(this, response)
            this.tableIsLoading = false
          })
        }
      })
    },
  },
  mounted() {

    this.$bus.$on(this.$busEvents.api.apiProjectDrawerCommitSuccess, (status) => {
      this.getProjectList()
    })

    // 从后端获取数据类型映射
    getConfigByName({'name': 'data_type_mapping'}).then(response => {
      this.dataTypeMapping = JSON.parse(response.data.value)
    })

  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.api.apiProjectDrawerCommitSuccess)
  },

}
</script>

<style scoped>
body {
  margin: 0px
}
</style>
