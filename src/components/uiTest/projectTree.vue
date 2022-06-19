<template>
  <!-- 结构树/项目列表 -->
  <div class="tabs">
    <el-tabs v-model="projectTab">
      <el-tab-pane label="项目列表" name="project">
        <!-- 项目列表和操作 -->
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
              class="custom-tree-node"
              slot-scope="{ node, data }"
              @mouseenter="mouseenter(data)"
              @mouseleave="mouseleave(data)">
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
        <!-- 项目列表分页 -->
        <el-pagination
          small
          @current-change="getCurrentPageProjectList"
          :current-page="projects.currentPage"
          :page-size="pageSize"
          layout="prev, pager, next"
          :total="projects.project_total"
        >
        </el-pagination>

      </el-tab-pane>
    </el-tabs>

  </div>
</template>

<script>
import {projectList} from '@/apis/uiTest/project'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'

export default {
  name: 'projectTree',
  directives: {waves},
  components: {
    Pagination
  },
  props: [
    'busEventClickTree',
    'busEventClickMenu',
    'menuName',  // 菜单名
    'labelWidth' // 树名字显示长度
  ],

  data() {
    return {
      //  tab页的显示
      projectTab: 'project',

      // 树的显示规则详见element-ui
      defaultProps: {children: 'children', label: 'name'},

      // 初始化数据默认的数据
      pageNum: 1,
      pageSize: 25,

      // 项目列表数据
      projects: {
        project_total: 0,
        project_list: [],
        currentPage: null,
        currentProject: null
      },

      //  默认选中的标识，用于判断是否需要默认选中第一个
      defaultSelectedProject: [],

      // 定义点击次数, 默认0次，区分单击和双击
      treeClickCount: 0,

      // 当前选中的项目
      currentProjectId: null,

      // 当前鼠标滑入的节点名
      currentLabel: '',
    }
  },

  created() {
    // 初始化项目列表, 取20条数据
    this.getProjectList({'pageNum': this.pageNum, 'pageSize': this.pageSize})
  },

  methods: {

    // 鼠标滑入的时候，设置一个值，代表展示菜单
    mouseenter(data) {
      if (this.labelWidth) {
        this.currentLabel = JSON.parse(JSON.stringify(data.name))
        data.name = this.ellipsis(data.name, this.labelWidth)
      }
      this.$set(data, 'showMenu', true);
    },

    // 鼠标滑出的时候，把可展示菜单的标识去掉
    mouseleave(data) {
      if (this.labelWidth) {
        data.name = this.currentLabel
      }
      this.$set(data, 'showMenu', false);
    },

    ellipsis(value, len) {
      if (!value) return ''
      if (value.length > len) {
        return value.slice(0, len) + '...'
      }
      return value
    },

    // 获取该分页的项目列表
    getCurrentPageProjectList(pageNum) {
      this.projects.currentPage = pageNum
      this.getProjectList({
        'pageNum': pageNum,
        'pageSize': this.pageSize
      })
    },

    // 获取项目列表
    getProjectList(params = null) {
      projectList(params).then(response => {
        this.projects.project_list = response.data.data
        this.projects.project_total = response.data.total

        // 把返回列表的第一条数据赋给默认选中的数据，做一个标识，看是否需要重新触发默认点击事件
        if (response.data.total > 0) {
          this.defaultSelectedProject.push(response.data.data[0].id)
        }
      })
    },

    // 点击项目时，提交单击的bus事件，当前选中的项目，当前所在页的项目列表
    projectClick(project) {
      if (this.busEventClickTree) {
        this.$bus.$emit(this.busEventClickTree, project, this.projects.project_list)
      }
      this.currentProjectId = project.id
    },

    // 点击菜单时，提交点击菜单触发的bus事件
    clickMenu(node, data) {
      if (this.busEventClickMenu) {
        // 如果当前任务列表的项目id不为当前点击的项目id，则请求当前点击的项目的任务列表
        if (this.busEventClickTree && this.currentProjectId !== data.id) {
          this.$bus.$emit(this.busEventClickTree, data)
        }
        this.$bus.$emit(this.busEventClickMenu, 'add', data)
      }
      this.currentProjectId = data.id
    }
  },

  // 当请求项目列表，返回的数据变了之后，默认点击第一条数据
  watch: {
    'defaultSelectedProject': function (newVal, oldVal) {
      if (newVal) {
        this.$nextTick(() => {
          document.querySelector('.el-tree-node__content').click()
        })
      }
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
