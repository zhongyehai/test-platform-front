<template>
  <!-- 结构树/服务列表 -->
  <div class="tabs">
    <el-tabs v-model="projectTab">
      <el-tab-pane :label="title" name="project">
        <!-- 服务列表和操作 -->
        <el-scrollbar>
          <el-tree
            ref="pTree"
            class="filter-tree project-tree"
            highlight-current
            default-expand-all
            node-key="id"
            :data="projects.project_list"
            :props="defaultProps"
            @node-click="projectClick"
          >
            <span
              slot-scope="{ node, data }"
              class="custom-tree-node"
              @mouseenter="mouseenter(data)"
              @mouseleave="mouseleave(data)"
            >
              <span> {{ data.name }} </span>
              <span v-show="data.showMenu" style="margin-left: 10px">
                <el-button
                  size="mini"
                  type="text"
                  @click.stop="clickMenu(node, data)"
                >{{ menuName }}</el-button>
              </span>
            </span>
          </el-tree>
        </el-scrollbar>
        <!-- 服务列表分页 -->
        <el-pagination
          small
          :current-page="projects.currentPage"
          :page-size="pageSize"
          layout="prev, pager, next"
          :total="projects.project_total"
          @current-change="getCurrentPageProjectList"
        />

      </el-tab-pane>
    </el-tabs>

  </div>
</template>

<script>
import { projectList as apiProjectList } from '@/apis/apiTest/project'
import { projectList as webUiProjectList } from '@/apis/webUiTest/project'
import { projectList as appUiProjectList } from '@/apis/appUiTest/project'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'
import { dataTypeTitleMappingContent } from '@/utils/mapping'
import { phoneList, serverList } from '@/apis/appUiTest/device'
import { getConfigByName } from '@/apis/config/config'

export default {
  name: 'ProjectTree',
  directives: { waves },
  components: {
    Pagination
  },
  props: [
    'dataType',
    'menuName', // 菜单名
    'labelWidth' // 树名字显示长度
  ],

  data() {
    return {

      title: `${dataTypeTitleMappingContent[this.dataType]}列表`,
      projectTab: 'project', //  tab页的显示
      defaultProps: { children: 'children', label: 'name' }, // 树的显示规则详见element-ui

      // 初始化数据默认的数据
      pageNum: 1,
      pageSize: 25,

      // 服务列表数据
      projects: {
        project_total: 0,
        project_list: [],
        currentPage: null,
        currentProject: null
      },
      defaultSelectedProject: [], //  默认选中的标识，用于判断是否需要默认选中第一个
      treeClickCount: 0, // 定义点击次数, 默认0次，区分单击和双击
      currentProjectId: null, // 当前选中的服务
      currentLabel: '', // 当前鼠标滑入的节点名

      projectListUrl: ''
    }
  },

  // 当请求服务列表，返回的数据变了之后，默认点击第一条数据
  watch: {
    'defaultSelectedProject': function(newVal, oldVal) {
      if (newVal) {
        this.$nextTick(() => {
          document.querySelector('.el-tree-node__content').click()
        })
      }
    }
  },

  created() {
    if (this.dataType === 'api') {
      this.projectListUrl = apiProjectList
    } else if (this.dataType === 'webUi') {
      this.projectListUrl = webUiProjectList
      getConfigByName({ 'name': 'browser_name' }).then(response => {
        this.$busEvents.data.runBrowserNameDict = JSON.parse(response.data)
      })
    } else {
      this.projectListUrl = appUiProjectList
      serverList().then(response => {
        this.$busEvents.data.runServerList = response.data.data
      })
      phoneList().then(response => {
        this.$busEvents.data.runPhoneList = response.data.data
      })
    }

    // 初始化服务列表, 取20条数据
    this.getProjectList({ 'pageNum': this.pageNum, 'pageSize': this.pageSize })
  },

  methods: {

    // 鼠标滑入的时候，设置一个值，代表展示菜单
    mouseenter(data) {
      if (this.labelWidth) {
        this.currentLabel = JSON.parse(JSON.stringify(data.name))
        data.name = this.ellipsis(data.name, this.labelWidth)
      }
      this.$set(data, 'showMenu', true)
    },

    // 鼠标滑出的时候，把可展示菜单的标识去掉
    mouseleave(data) {
      if (this.labelWidth) {
        data.name = this.currentLabel
      }
      this.$set(data, 'showMenu', false)
    },

    ellipsis(value, len) {
      if (!value) return ''
      if (value.length > len) {
        return value.slice(0, len) + '...'
      }
      return value
    },

    // 获取该分页的服务列表
    getCurrentPageProjectList(pageNum) {
      this.projects.currentPage = pageNum
      this.getProjectList({
        'pageNum': pageNum,
        'pageSize': this.pageSize
      })
    },

    // 获取服务列表
    getProjectList(params = null) {
      this.projectListUrl(params).then(response => {
        this.projects.project_list = response.data.data
        this.projects.project_total = response.data.total

        // 把返回列表的第一条数据赋给默认选中的数据，做一个标识，看是否需要重新触发默认点击事件
        if (response.data.total > 0) {
          this.defaultSelectedProject.push(response.data.data[0].id)
        }
      })
    },

    // 点击服务时，提交单击的bus事件，当前选中的服务，当前所在页的服务列表
    projectClick(project) {
      this.$bus.$emit(this.$busEvents.treeIsChoice, 'project', project, this.projects.project_list)
      this.currentProjectId = project.id
    },

    // 点击菜单时，提交点击菜单触发的bus事件
    clickMenu(node, data) {
      // 如果当前任务列表的服务id不为当前点击的服务id，则请求当前点击的服务的任务列表
      if (this.currentProjectId !== data.id) {
        this.$bus.$emit(this.$busEvents.treeIsChoice, 'project', data)
      }
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'taskInfo', 'add', data)
      this.currentProjectId = data.id
    }
  }
}
</script>

<style scoped>
.project-tree {
  width: 100%;
  height: 80%;
  /*overflow: scroll;*/
}

.project-tree > .el-tree-node {
  display: inline-block;
  min-width: 100%;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>
