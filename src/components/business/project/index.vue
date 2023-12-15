<template>
  <div class="app-container">
    <!-- 搜索、添加栏 -->
    <div class="filter-container">

      <!-- inline="true"，el-form-item不自动换行 -->
      <el-form label-width="60px" :inline="true">

        <el-form-item :label="`${titleType}`" size="mini">
          <el-input
            v-model="listQuery.name"
            class="input-with-select"
            :placeholder="`${titleType}名，支持关键字查询`"
            size="mini"
            clearable
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item label="业务线" size="mini">
          <el-select
            v-model="listQuery.business_id"
            :placeholder="'选择业务线'"
            filterable
            default-first-option
            clearable
            size="mini"
            class="filter-item"
            @clear="clearBusinessId"
          >
            <el-option
              v-for="business in $busEvents.data.businessList"
              :key="business.id"
              :label="business.name"
              :value="business.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="负责人" size="mini">
          <el-select
            v-model="listQuery.manager"
            :placeholder="'选择负责人'"
            filterable
            default-first-option
            clearable
            size="mini"
            class="filter-item"
          >
            <el-option v-for="user in currentUserList" :key="user.name" :label="user.name" :value="user.id" />
          </el-select>
        </el-form-item>

        <el-button
          v-waves
          type="primary"
          size="mini"
          @click="handleFilter"
        >
          {{ '搜索' }}
        </el-button>

        <el-button
          type="primary"
          size="mini"
          @click="addProject"
        >
          {{ '添加' }}
        </el-button>

        <el-button
          type="primary"
          size="mini"
          @click="handleInitListQuery"
        >
          {{ '重置' }}
        </el-button>

        <!--        <el-tooltip-->
        <!--          class="item"-->
        <!--          effect="dark"-->
        <!--          content="从yapi拉取项目列表"-->
        <!--          placement="top-start"-->
        <!--        >-->
        <!--          <el-button-->
        <!--            v-show="dataType === 'api'"-->
        <!--            disabled-->
        <!--            type="primary"-->
        <!--            size="mini"-->
        <!--            :loading="pullYapiProjectIsLoading"-->
        <!--            @click="pullYapiProject"-->
        <!--          >-->
        <!--            {{ '从yapi拉取' }}-->
        <!--          </el-button>-->
        <!--        </el-tooltip>-->
      </el-form>
    </div>

    <!-- 表格栏 -->
    <el-table
      ref="projectTable"
      v-loading="tableIsLoading"
      size="mini"
      element-loading-text="数据获取中"
      element-loading-spinner="el-icon-loading"
      :data="project_list"
      row-key="id"
      stripe
      style="width: 100%;"
      @cell-dblclick="cellDblclick"
    >
      <el-table-column prop="num" label="序号" align="center" min-width="8%">
        <template slot-scope="scope">
          <span> {{ (listQuery.page_num - 1) * listQuery.page_size + scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column show-overflow-tooltip prop="name" align="center" :label="`${titleType}名称`" min-width="20%">
        <template slot-scope="scope">
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>

      <el-table-column
        v-if="dataType === 'api'"
        show-overflow-tooltip
        align="center"
        label="swagger"
        prop="swagger"
        min-width="35%"
      >
        <template slot-scope="scope">
          <div v-if="scope.row.swagger">
            <span>{{ scope.row.swagger }}</span>
          </div>
          <div v-else>
            <el-tag type="warning">未设置</el-tag>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        v-if="dataType === 'api'"
        show-overflow-tooltip
        align="center"
        label="拉取状态"
        min-width="10%"
      >
        <template slot-scope="scope">
          <el-tooltip
            v-if="scope.row.last_pull_status !== 1"
            content="点击查看详情"
            class="item"
            effect="dark"
            placement="top-start"
          >
            <el-tag
              :type="pullStatusTagType[scope.row.last_pull_status]"
              @click="getSwaggerPullLog(scope.row)"
            >
              {{ pullStatusContent[scope.row.last_pull_status] }}
            </el-tag>
          </el-tooltip>

          <el-tag
            v-else
            :type="pullStatusTagType[scope.row.last_pull_status]"
            @click="getSwaggerPullLog(scope.row)"
          >
            {{ pullStatusContent[scope.row.last_pull_status] }}
          </el-tag>

        </template>
      </el-table-column>

      <el-table-column show-overflow-tooltip align="center" label="业务线" min-width="10%">
        <template slot-scope="scope">
          <span>{{ $busEvents.data.businessDict[scope.row.business_id] }}</span>
        </template>
      </el-table-column>

      <el-table-column show-overflow-tooltip align="center" label="负责人" min-width="10%">
        <template slot-scope="scope">
          <span>{{ parseUser(scope.row.manager) }}</span>
        </template>
      </el-table-column>

      <el-table-column v-if="dataType === 'appUi'" show-overflow-tooltip align="center" label="app_package" min-width="15%">
        <template slot-scope="scope">
          <span>{{ scope.row.app_package }}</span>
        </template>
      </el-table-column>

      <el-table-column show-overflow-tooltip align="center" label="最后修改" min-width="10%">
        <template slot-scope="scope">
          <span>{{ parseUser(scope.row.update_user) }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'操作'" align="center" min-width="20%" class-name="small-padding fixed-width">
        <template slot-scope="{row}">

          <!-- 从yapi拉取此服务下的模块、接口信息 -->
          <el-button
            v-show="row.yapi_id || row.swagger"
            slot="reference"
            type="text"
            size="mini"
            @click="clickPullButton(row)"
          >拉取
          </el-button>

          <!-- 编辑服务 -->
          <el-button
            type="text"
            size="mini"
            @click="showEditForm(row)"
          >修改
          </el-button>

          <!-- 编辑服务环境 -->
          <el-button
            type="text"
            size="mini"
            style="margin-right: 10px"
            @click="showEditEnvForm(row)"
          >环境
          </el-button>

          <!--删除服务-->
          <el-popover
            :ref="row.id"
            v-model="row.deletePopoverIsShow"
            placement="top"
            popper-class="down-popover"
          >
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
            >删除
            </el-button>
          </el-popover>

        </template>
      </el-table-column>

    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page_num"
      :limit.sync="listQuery.page_size"
      @pagination="getProjectList"
    />

    <!-- 接口拉取参数选择 -->
    <pullDrawerView />

    <!-- 服务信息抽屉 -->
    <projectDrawer
      :data-type="dataType"
      :current-project="currentProject"
      :current-user-list="currentUserList"
    />

    <!-- 服务环境抽屉 -->
    <projectEnvDrawer
      :data-type="dataType"
    />

    <!-- swagger拉取记录 -->
    <showSwaggerPullLog />
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
import { yapiPullProject } from '@/apis/assist/yapi'
import { userList } from '@/apis/system/user'
import Sortable from 'sortablejs'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination/index.vue'
import projectDrawer from '@/components/business/project/drawer.vue'
import pullDrawerView from '@/components/business/project/selectPullOptionsDrawer.vue'
import projectEnvDrawer from '@/components/business/project/envEditor.vue'
import showSwaggerPullLog from '@/components/business/project/showSwaggerPullLog.vue'
import { getConfigByCode } from '@/apis/config/config'
import { businessList } from '@/apis/config/business'
import { swaggerPullStatusMappingContent, swaggerPullStatusMappingTagType } from '@/utils/mapping'

export default {
  name: 'Project',
  components: {
    Pagination,
    projectDrawer,
    pullDrawerView,
    projectEnvDrawer,
    showSwaggerPullLog
  },
  directives: { waves },
  // eslint-disable-next-line vue/require-prop-types
  props: ['dataType'],
  data() {
    return {
      titleType: this.dataType === 'api' ? '服务' : this.dataType === 'webUi' ? '项目' : 'APP',
      // 查询对象
      listQuery: {
        detail: true,
        page_num: 1,
        page_size: 20,
        name: undefined, // 服务名
        manager: undefined, // 负责人
        business_id: undefined, // 业务线
        create_user: undefined // 创建人
      },
      currentProject: {}, // 当前选中的服务
      project_list: [], // 服务列表
      total: 0, // 服务数据表格总条数
      tableIsLoading: false, // 请求加载状态
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
    if (this.dataType === 'api') {
      this.deleteProjectUrl = apiDeleteProject
      this.projectListUrl = apiProjectList
      this.projectSortUrl = apiProjectSort
    } else if (this.dataType === 'webUi') {
      this.deleteProjectUrl = webUiDeleteProject
      this.projectListUrl = webUiProjectList
      this.projectSortUrl = webUiProjectSort
    } else {
      this.deleteProjectUrl = appUiDeleteProject
      this.projectListUrl = appUiProjectList
      this.projectSortUrl = appUiProjectSort
    }

    this.getUserList(this.getProjectList) // 先获取用户数据
  },
  mounted() {
    // 获取业务线
    if (this.$busEvents.data.businessList.length < 1) {
      businessList().then(response => {
        this.$busEvents.data.businessList = response.data.data
        this.$busEvents.data.businessDict = {}
        this.$busEvents.data.businessList.forEach(business => {
          this.$busEvents.data.businessDict[business.id] = business.name
        })
      })
    }

    this.$bus.$on(this.$busEvents.drawerIsCommit, (_type) => {
      if (['projectInfo', 'pullProjectData'].indexOf(_type) !== -1) {
        this.getProjectList()
      }
    })

    // 从后端获取数据类型映射
    getConfigByCode({ code: 'data_type_mapping' }).then(response => {
      this.$busEvents.data.dataTypeMappingList = response.data
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsCommit)
  },

  methods: {
    // 获取用户信息，同步请求
    async getUserList(func) {
      const response = await userList()
      this.currentUserList = response.data.data
      response.data.data.forEach(user => {
        this.userDict[user.id] = user
      })
      if (func) {
        func()
      }
    },

    clearBusinessId() {
      this.listQuery.business_id = undefined
    },

    // 解析用户
    parseUser(userId) {
      return this.userDict[userId].name
    },

    // 获取服务的拉取日志
    getSwaggerPullLog(project) {
      if (project.last_pull_status !== 1) {
        this.$bus.$emit(this.$busEvents.drawerIsShow, 'showSwaggerPullLog', project, this.userDict)
      }
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
        this.tableIsLoading = false
        this.project_list = response.data.data
        this.total = response.data.total

        this.oldList = this.project_list.map(v => v.id)
        this.newList = this.oldList.slice()
        this.$nextTick(() => {
          this.setSort()
        })
      })
    },

    // 删除服务
    delProject(row) {
      this.$set(row, 'deletePopoverIsShow', false)
      this.tableIsLoading = true
      this.deleteProjectUrl({ 'id': row.id }).then(response => {
        this.tableIsLoading = false
        if (this.showMessage(this, response)) {
          this.getProjectList() // 重新从后台获取服务列表
        }
      })
    },

    cancelDeletePopover(row) {
      this.$set(row, 'deletePopoverIsShow', false)
    },

    // 触发查询
    handleFilter() {
      this.listQuery.page_num = 1
      this.getProjectList()
    },

    // 点击添加服务
    addProject() {
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'projectInfo', 'add')
    },

    // 初始化查询数据
    handleInitListQuery() {
      this.listQuery = {
        page_num: 1,
        page_size: 20,
        projectId: '', // 服务id
        manager: '', // 负责人
        create_user: '' // 创建人
      }
      this.getProjectList()
    },

    // 拖拽排序
    setSort() {
      const el = this.$refs.projectTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost',
        setData: function(dataTransfer) {
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
            id_list: this.newList, page_num: this.listQuery.page_num, page_size: this.listQuery.page_size
          }).then(response => {
            this.tableIsLoading = false
            this.showMessage(this, response)
            this.getProjectList()
          })
        }
      })
    }
  }

}
</script>

<style scoped>

</style>
