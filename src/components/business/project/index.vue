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
            v-show="dataType === 'api'"
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
      @cell-dblclick="cellDblclick"
    >
      <el-table-column
        v-for="field in fieldData"
        :key="field.fieldName"
        :label="field.label"
        :min-width="field.minWidth"
        :prop="field.fieldName"
        align="center"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <template v-if="field.fieldName === 'index'">
            <span> {{ (listQuery.pageNum - 1) * listQuery.pageSize + scope.$index + 1 }} </span>
          </template>
          <template v-else-if="field.fieldName === 'name'">
            <span> {{ scope.row.name }} </span>
          </template>
          <template v-else-if="field.fieldName === 'swagger'">
            <div v-if="scope.row.swagger">
              <span>{{ scope.row.swagger }}</span>
            </div>
            <div v-else>
              <el-tag type="warning">未设置</el-tag>
            </div>
          </template>
          <template v-else-if="field.fieldName === 'pullStatus'">
            <el-tag :type="pullStatusTagType[scope.row.last_pull_status]">
              {{ pullStatusContent[scope.row.last_pull_status] }}
            </el-tag>
          </template>
          <template v-else-if="field.fieldName === 'manager'">
            <span>{{ parseUser(scope.row.manager) }}</span>
          </template>
          <template v-else-if="field.fieldName === 'update_user'">
            <span>{{ parseUser(scope.row.update_user) }}</span>
          </template>
          <template v-else-if="field.fieldName === 'created_time'">
            <span>{{ scope.row.created_time }}</span>
          </template>
        </template>
      </el-table-column>

      <el-table-column :label="'操作'" align="center" min-width="20%" class-name="small-padding fixed-width">
        <template slot-scope="{row, $index}">

          <!-- 从yapi拉取此服务下的模块、接口信息 -->
          <el-button
            v-show="row.yapi_id || row.swagger"
            slot="reference"
            type="text"
            size="mini"
            @click="clickPullButton(row)"
          >拉取</el-button>

          <!-- 编辑服务 -->
          <el-button
            type="text"
            size="mini"
            @click="showEditForm(row)">修改
          </el-button>

          <!-- 编辑服务环境 -->
          <el-button
            type="text"
            size="mini"
            style="margin-right: 10px"
            @click="showEditEnvForm(row)">环境
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
              :loading="row.deleteButtonIsLoading"
            >删除</el-button>
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

    <!-- 接口拉取参数选择 -->
    <pullDrawerView></pullDrawerView>

    <!-- 服务信息抽屉 -->
    <projectDrawer
      :dataType="dataType"
      :currentProject="currentProject"
      :currentUserList="currentUserList"
    ></projectDrawer>

    <!-- 服务环境抽屉 -->
    <projectEnvDrawer
      :dataType="dataType"
    ></projectEnvDrawer>
  </div>
</template>

<script>
import {
  deleteProject as apiDeleteProject,
  projectList as apiProjectList,
  projectSort as apiProjectSort
} from '@/apis/apiTest/project'
import {
  deleteProject as webUiDeleteProject,
  projectList as webUiProjectList,
  projectSort as webUiProjectSort
} from '@/apis/webUiTest/project'
import {
  deleteProject as appUiDeleteProject,
  projectList as appUiProjectList,
  projectSort as appUiProjectSort
} from '@/apis/appUiTest/project'
import {yapiPullProject} from '@/apis/assist/yapi'
import {userList} from '@/apis/system/user'
import Sortable from 'sortablejs'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination/index.vue'
import projectDrawer from '@/components/business/project/drawer.vue'
import pullDrawerView from '@/components/business/project/pullDrawer.vue'
import projectEnvDrawer from '@/components/business/project/envEditor.vue'
import {getConfigByName} from "@/apis/config/config";
import {swaggerPullStatusMappingContent, swaggerPullStatusMappingTagType} from "@/utils/mapping";

export default {
  name: 'Project',
  props: ["dataType"],
  components: {
    Pagination,
    projectDrawer,
    pullDrawerView,
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
      fieldData: [
        {fieldName: 'index', label: '序号', minWidth: '8%'},
        {fieldName: 'name', label: this.dataType === 'appUi' ? 'APP名' : '项目名', minWidth: '20%'},
        {fieldName: 'created_time', label: '创建时间', minWidth: '10%'},
        {fieldName: 'manager', label: '负责人', minWidth: '10%'},
        {fieldName: 'update_user', label: '最后修改人', minWidth: '10%'}
      ],
      currentProject: {},  // 当前选中的服务
      project_list: [],  // 服务列表
      total: 0,  // 服务数据表格总条数
      tableIsLoading: true,  // 请求加载状态
      pullYapiProjectIsLoading: false,
      currentUserList: [],
      userDict: {},
      sortable: null,
      oldList: [],
      newList: [],

      pullStatusContent: swaggerPullStatusMappingContent,
      pullStatusTagType: swaggerPullStatusMappingTagType,
      deleteProjectUrl: '',
      projectListUrl: '',
      projectSortUrl: ''
    }
  },

  created() {

    if (this.dataType === "api") {
      this.deleteProjectUrl = apiDeleteProject
      this.projectListUrl = apiProjectList
      this.projectSortUrl = apiProjectSort
      this.fieldData = [
        {fieldName: 'index', label: '序号', minWidth: '8%'},
        {fieldName: 'name', label: '服务名', minWidth: '20%'},
        {fieldName: 'swagger', label: 'swagger地址', minWidth: '32%'},
        {fieldName: 'pullStatus', label: '最新拉取状态', minWidth: '10%'},
        {fieldName: 'manager', label: '负责人', minWidth: '10%'},
        {fieldName: 'update_user', label: '最后修改人', minWidth: '15%'}
      ]
    } else if (this.dataType === "webUi") {
      this.deleteProjectUrl = webUiDeleteProject
      this.projectListUrl = webUiProjectList
      this.projectSortUrl = webUiProjectSort
    } else {
      this.deleteProjectUrl = appUiDeleteProject
      this.projectListUrl = appUiProjectList
      this.projectSortUrl = appUiProjectSort
    }

    this.getUserList(this.getProjectList)  // 先获取用户数据
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
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'projectInfo', 'edit', row)
    },

    // 编辑环境
    showEditEnvForm(row) {
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'env', row)
    },

    // 双击单元格复制
    cellDblclick(row, column, cell, event) {
      let that = this, data = row[column.property]
      if (typeof (data) == 'string') {
        this.$copyText(data).then(
          function (e) {
            that.$message.success("复制成功")
          }
        )
      }
    },

    clickPullButton(row) {
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'pullProjectData', row)
    },

    // 从yapi拉取服务列表
    pullYapiProject(row) {
      this.pullYapiProjectIsLoading = true
      yapiPullProject({}).then(response => {
        this.pullYapiProjectIsLoading = false
        if (this.showMessage(this, response)) {
          this.getProjectList()
        }
      })
    },

    // 获取服务列表
    getProjectList() {
      this.tableIsLoading = true
      this.projectListUrl(this.listQuery).then(response => {
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
      this.deleteProjectUrl({"id": row.id}).then(response => {
        this.$set(row, 'deleteButtonIsLoading', false)
        if (this.showMessage(this, response)) {
          this.getProjectList(); // 重新从后台获取服务列表
        }
      })
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
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'projectInfo', 'add')
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
          this.projectSortUrl({
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

    this.$bus.$on(this.$busEvents.drawerIsCommit, (_type) => {
      if (['projectInfo', 'pullProjectData'].indexOf(_type) !== -1) {
        this.getProjectList()
      }
    })

    // 从后端获取数据类型映射
    getConfigByName({'name': 'data_type_mapping'}).then(response => {
      this.$busEvents.data.dataTypeMappingList = JSON.parse(response.data.value)
    })

  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsCommit)
  },

}
</script>

<style scoped>

</style>
