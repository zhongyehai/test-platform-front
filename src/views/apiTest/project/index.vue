<template>
  <div class="app-container">
    <!-- 搜索、添加栏 -->
    <div class="filter-container">

      <!-- inline="true"，el-form-item不自动换行 -->
      <el-form label-width="100px" :inline="true">

        <el-form-item :label="'服务名：'" size="mini">
          <el-select
            ref="projectSelector"
            v-model="listQuery.projectId"
            :placeholder="'选择服务名'"
            filterable
            default-first-option
            clearable
            size="mini"
            class="filter-item">
            <el-option v-for="project in project_list" :key="project.id" :label="project.name" :value="project.id"/>
          </el-select>
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
      :key="tableKey"
      v-loading="listLoading"
      :data="project_list"
      fit
      stripe
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
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

      <el-table-column :label="'测试环境'" prop="test" align="center" min-width="32%" :show-overflow-tooltip=true>
        <template slot-scope="scope">
          <div v-if="scope.row.test">
            <span>{{ scope.row.test }}</span>
          </div>
          <div v-else>
            <el-tag type="danger">请设置测试环境地址</el-tag>
          </div>
        </template>
      </el-table-column>

      <el-table-column :label="'创建时间'" prop="created_time" align="center" min-width="14%">
        <template slot-scope="scope">
          <span>{{ scope.row.created_time }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'负责人'" prop="id" align="center" min-width="8%">
        <template slot-scope="scope">
          <span>{{ parseUser(scope.row.manager) }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'最后修改人'" prop="id" align="center" min-width="8%">
        <template slot-scope="scope">
          <span>{{ parseUser(scope.row.update_user) }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'操作'" align="center" min-width="10%" class-name="small-padding fixed-width">
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
            <p>从{{row.yapi_id ? 'yapi' : 'swagger'}}拉取此服务下的模块、接口信息?</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="cancelPull(row)">取消</el-button>
              <el-button type="primary" size="mini" @click="row.yapi_id ? pullByYapi(row) : pullBySwagger(row)">确定</el-button>
            </div>
            <el-button
              slot="reference"
              type="text"
              icon="el-icon-refresh"
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
    :env-mapping="envMapping"
    :dataTypeMapping="dataTypeMapping"
    ></projectEnvDrawer>
  </div>
</template>

<script>
import {deleteProject, projectList} from '@/apis/apiTest/project'
import {yapiPull, yapiPullProject} from '@/apis/assist/yapi'
import {swaggerPull} from '@/apis/assist/swagger'
import {userList} from '@/apis/system/user'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'
import projectDrawer from '@/views/apiTest/project/drawer'
import projectEnvDrawer from '@/views/apiTest/project/envEditor'
import {getConfigByName} from "@/apis/config/config";

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
        projectId: '',  // 服务id
        manager: '',  // 负责人
        create_user: '', // 创建人
      },
      currentProject: {},  // 当前选中的服务
      project_list: [],  // 服务列表
      tableKey: 0,  // 服务数据表格起始
      total: 0,  // 服务数据表格总条数
      dialogStatus: '',  // dialog框状态，edit 为编辑数据, create 为新增数据
      downloadLoading: false,  // 下载表格状态
      listLoading: true,  // 请求加载状态
      pullYapiProjectIsLoading: false,
      currentUserList: [],
      userDict: {},
      envMapping: {},
      dataTypeMapping: []
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
      if (func){
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
      this.$bus.$emit(this.$busEvents.api.apiShowProjectEnvDrawer, row)
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
      this.listLoading = true
      projectList(this.listQuery).then(response => {
        this.project_list = response.data.data
        this.total = response.data.total
      })
      this.listLoading = false
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

    cancelPull(row){
      this.$set(row, 'pullPopoverIsShow', false)
    },


    cancelDeletePopover(row){
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

    // 修改排序
    sortChange(data) {
      const {prop, order} = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },

    // 修改排序
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    }
  },
  mounted() {

    this.$bus.$on(this.$busEvents.api.apiProjectDrawerCommitSuccess, (status) => {
      this.getProjectList()
    })

    // 从后端获取数据类型映射
    getConfigByName({'name': 'data_type_mapping'}).then(response => {
      this.dataTypeMapping = JSON.parse(response.data.value)
    })

    // 获取环境配置
    getConfigByName({'name': 'run_test_env'}).then(response => {
      this.envMapping = JSON.parse(response.data.value)
    })

    // test环境修改后，前端页面也跟随修改域名
    this.$bus.$on(this.$busEvents.api.apiEnvIsCommit, (projectId, host, env) => {
      if (env === 'test'){
        try {
          this.project_list.forEach(row => {
            if (row.id === projectId) {
              this.$set(row, 'test', host)
              throw new Error('遍历结束')
            }
          })
        } catch (error) {
          if (error.message !== '遍历结束') throw error
        }
      }
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.api.apiProjectDrawerCommitSuccess)
    this.$bus.$off(this.$busEvents.api.apiEnvIsCommit)
  },

}
</script>

<style scoped>
body {
  margin: 0px
}
</style>
