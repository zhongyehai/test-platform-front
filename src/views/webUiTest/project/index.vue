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
      ref="projectTable"
      v-loading="listLoading"
      element-loading-text="正在排序中"
      element-loading-spinner="el-icon-loading"
      :data="project_list"
      row-key="id"
      stripe
      style="width: 100%;"
    >
      <el-table-column :label="'序号'" prop="id" align="center" min-width="10%">
        <template slot-scope="scope">
          <span> {{ (listQuery.pageNum - 1) * listQuery.pageSize + scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column :label="'项目名'" prop="name" align="center" min-width="40%" :show-overflow-tooltip=true>
        <template slot-scope="scope">
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>

<!--      <el-table-column :label="'测试环境'" prop="test" align="center" min-width="32%" :show-overflow-tooltip=true>-->
<!--        <template slot-scope="scope">-->
<!--          <div v-if="scope.row.test">-->
<!--            <span>{{ scope.row.test }}</span>-->
<!--          </div>-->
<!--          <div v-else>-->
<!--            <el-tag type="danger">请设置测试环境地址</el-tag>-->
<!--          </div>-->
<!--        </template>-->
<!--      </el-table-column>-->

      <el-table-column :label="'创建时间'" prop="created_time" align="center" min-width="20%">
        <template slot-scope="scope">
          <span>{{ scope.row.created_time }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'负责人'" prop="id" align="center" min-width="10%">
        <template slot-scope="scope">
          <span>{{ parseUser(scope.row.manager) }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'最后修改人'" prop="id" align="center" min-width="10%">
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

          <!--删除项目-->
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

    <!-- 项目信息抽屉 -->
    <projectDrawer
      :currentProject="currentProject"
      :currentUserList="currentUserList"
    ></projectDrawer>

    <!-- 项目环境抽屉 -->
    <projectEnvDrawer
      :env-mapping="envMapping"
      :dataTypeMapping="dataTypeMapping"
    ></projectEnvDrawer>
  </div>
</template>

<script>
import {deleteProject, projectList} from '@/apis/webUiTest/project'
import {userList} from '@/apis/system/user'
import Sortable from 'sortablejs'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'
import projectDrawer from '@/views/webUiTest/project/drawer'
import projectEnvDrawer from '@/views/webUiTest/project/envEditor'
import {getConfigByName} from "@/apis/config/config";
import {projectSort} from "@/apis/webUiTest/project";


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
      currentProject: {},        // 当前选中的服务
      currentUserList: [],        // 用户列表
      userDict: {},
      project_list: [],        // 服务列表
      tableKey: 0,        // 服务数据表格起始
      total: 0,      // 服务数据表格总条数
      downloadLoading: false,      // 下载表格状态
      listLoading: true,      // 请求加载状态
      envMapping: {},
      dataTypeMapping: [],
      sortable: null,
      oldList: [],
      newList: [],
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

    // 编辑环境
    showEditEnvForm(row) {
      this.$bus.$emit(this.$busEvents.ui.uiShowProjectEnvDrawer, row)
    },

    // 获取服务列表
    getProjectList() {
      this.listLoading = true
      projectList(this.listQuery).then(response => {
        this.project_list = response.data.data
        this.total = response.data.total

        this.oldList = this.project_list.map(v => v.id)
        this.newList = this.oldList.slice()
        this.$nextTick(() => {
          this.setSort()
        })
      })
      this.listLoading = false
    },

    cancelDeletePopover(row){
      this.$set(row, 'deletePopoverIsShow', false)
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
    }
  },

  mounted() {
    this.$bus.$on(this.$busEvents.ui.uiProjectDialogCommitSuccess, (status) => {
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
