<template>
  <div class="app-container">

    <!-- 搜索、添加栏 -->
    <div class="filter-container">

      <!-- inline="true"，el-form-item不自动换行 -->
      <el-form label-width="100px" :inline="true">

        <el-form-item :label="'项目名：'" size="mini">
          <el-select
            ref="projectSelector"
            v-model="listQuery.projectId"
            :placeholder="'选择项目名'"
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

      </el-form>
    </div>
    <br>

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
      <el-table-column :label="'序号'" prop="id" align="center" min-width="5%">
        <template slot-scope="scope">
          <span> {{ (listQuery.pageNum - 1) * listQuery.pageSize + scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column :label="'服务名'" prop="name" align="center" min-width="17%" :show-overflow-tooltip=true>
        <template slot-scope="scope">
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>

      <el-table-column :label="'测试环境'" prop="test" align="center" min-width="28%" :show-overflow-tooltip=true>
        <template slot-scope="scope">
          <div v-if="scope.row.test">
            <span>{{ scope.row.test }}</span>
          </div>
          <div v-else>
            <el-tag type="danger">请设置测试环境地址</el-tag>
          </div>
        </template>
      </el-table-column>

      <el-table-column :label="'负责人'" prop="id" align="center" min-width="8%">
        <template slot-scope="scope">
          <span>{{ parseUser(scope.row.manager) }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'创建时间'" prop="created_time" align="center" min-width="14%">
        <template slot-scope="scope">
          <span>{{ scope.row.created_time }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'创建人'" prop="id" align="center" min-width="8%">
        <template slot-scope="scope">
          <span>{{ parseUser(scope.row.create_user) }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'最后修改人'" prop="id" align="center" min-width="8%">
        <template slot-scope="scope">
          <span>{{ parseUser(scope.row.update_user) }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'操作'" align="center" min-width="10%" class-name="small-padding fixed-width">
        <template slot-scope="{row, $index}">

          <!-- 编辑项目 -->
          <el-button
            type="text"
            size="mini"
            style="margin-right: 10px"
            icon="el-icon-edit"
            @click="showEditForm(row)">
          </el-button>

          <!--删除项目-->
          <el-popconfirm
            placement="top"
            hide-icon
            style="margin-right: 10px"
            :title="`确定删除【${row.name}】?`"
            confirm-button-text='确认'
            cancel-button-text='取消'
            @onConfirm="delProject(row)"
          >
            <el-button
              slot="reference"
              type="text"
              style="color: red"
              icon="el-icon-delete"
              :loading="row.deleteButtonIsLoading"
            ></el-button>
          </el-popconfirm>
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

    <!-- 抽屉 -->
    <projectDrawer
      :currentProject="currentProject"
      :currentUserList="currentUserList"
    ></projectDrawer>

  </div>
</template>

<script>
import {deleteProject, projectList} from '@/apis/uiTest/project'
import {userList} from '@/apis/user/user'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'
import projectDrawer from '@/views/uiTest/project/drawer'


export default {
  name: 'Project',
  components: {
    Pagination,
    projectDrawer
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

      // 当前选中的服务
      currentProject: {},

      // 用户列表
      currentUserList: [],
      userDict: {},

      // 服务列表
      project_list: [],

      // 服务数据表格起始
      tableKey: 0,

      // 服务数据表格总条数
      total: 0,

      // 下载表格状态
      downloadLoading: false,

      // 请求加载状态
      listLoading: true
    }
  },

  created() {
    this.getUserList(this.getProjectList)

    // this.getProjectList()  // 初始化服务列表
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
      this.$bus.$emit(this.$busEvents.ui.uiShowApiProjectDrawer, 'edit', row)
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
      this.$set(row, 'deleteButtonIsLoading', true)
      deleteProject({"id": row.id}).then(response => {
        this.$set(row, 'deleteButtonIsLoading', false)
        if (this.showMessage(this, response)) {
          this.getProjectList(); // 重新从后台获取服务列表
        }
      })
    },

    // 触发查询
    handleFilter() {
      this.listQuery.pageNum = 1
      this.getProjectList()
    },

    // 点击添加服务
    addProject() {
      this.$bus.$emit(this.$busEvents.ui.uiShowApiProjectDrawer, 'add')
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
    this.$bus.$on(this.$busEvents.ui.uiProjectDialogCommitSuccess, (status) => {
      this.getProjectList()
    })

    // test环境修改后，前端页面也跟随修改域名
    this.$bus.$on(this.$busEvents.ui.uiEnvIsCommit, (projectId, host, env) => {
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
    this.$bus.$off(this.$busEvents.ui.uiProjectDialogCommitSuccess)
    this.$bus.$off(this.$busEvents.ui.uiEnvIsCommit)
  },

}
</script>

<style scoped>
body {
  margin: 0px
}
</style>
