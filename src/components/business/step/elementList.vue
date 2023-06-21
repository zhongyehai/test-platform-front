<template>
  <div>

    <el-form label-width="40px">

      <el-row>

        <!-- 项目选择 -->
        <el-col :span="8">
          <el-form-item :label="titleType" style="margin-bottom: 5px">
            <el-select
              ref="projectSelectorView"
              v-model="projectId"
              :placeholder="`请选择${titleType}`"
              size="mini"
              style="min-width: 100%"
              filterable
              default-first-option
              @change="getModuleList"
            >
              <el-option
                v-for="(item) in tempProjectList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <!-- 选择模块 -->
        <el-col :span="8">
          <el-form-item label="模块" style="margin-left: 5px; margin-bottom: 5px">
            <el-cascader
              v-model="selectedOptions"
              placeholder="选择模块"
              filterable
              size="mini"
              style="min-width: 100%"
              :options="tempModuleList"
              :props="{ checkStrictly: true }"
              clearable
              @change="getPageList"
            />
          </el-form-item>
        </el-col>

        <!-- 选择模块 -->
        <el-col :span="8">
          <el-form-item label="页面" style="margin-left: 5px; margin-bottom: 5px">
            <el-select
              ref="pageSelectorView"
              v-model="pageId"
              placeholder="选择页面"
              size="mini"
              style="min-width: 100%"
              filterable
              default-first-option
              @change="getElementListByPageId"
            >
              <el-option v-for="(item) in tempPageList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- 元素列表 -->
    <div>

      <el-table
        ref="apiTable"
        v-loading="tableLoadingIsShow"
        :data="elementList.data"
        element-loading-text="正在获取数据..."
        element-loading-spinner="el-icon-loading"
        stripe
        @cell-dblclick="cellDblclick"
      >
        <el-table-column prop="num" label="序号" align="center" min-width="10%">
          <template slot-scope="scope">
            <span> {{ (pageNum - 1) * pageSize + scope.$index + 1 }} </span>
          </template>
        </el-table-column>

        <el-table-column :show-overflow-tooltip="true" prop="name" align="center" label="元素名称" min-width="20%">
          <template slot-scope="scope">
            <span> {{ scope.row.name }} </span>
          </template>
        </el-table-column>

        <el-table-column :show-overflow-tooltip="true" prop="by" align="center" label="定位方式" min-width="20%">
          <template slot-scope="scope">
            <span> {{ parseFindBy(scope.row.by) }} </span>
          </template>
        </el-table-column>

        <el-table-column :show-overflow-tooltip="true" prop="element" align="center" label="定位元素" min-width="20%">
          <template slot-scope="scope">
            <span> {{ scope.row.element }} </span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="操作" min-width="10%">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click.native="addElementToStep(scope.row)">转步骤</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination
        v-show="elementList.total>0"
        :total="elementList.total"
        :page.sync="pageNum"
        :limit.sync="pageSize"
        @pagination="getElementListByPageId"
      />

    </div>

  </div>

</template>

<script>
import Pagination from '@/components/Pagination'

import { moduleList as appUiModuleList } from '@/apis/appUiTest/module'
import { pageList as appUiPageList } from '@/apis/appUiTest/page'
import { elementList as appUiElementList } from '@/apis/appUiTest/element'
import { projectList as appUiProjectList } from '@/apis/appUiTest/project'

import { moduleList as webUiModuleList } from '@/apis/webUiTest/module'
import { pageList as webUiPageList } from '@/apis/webUiTest/page'
import { elementList as webUiElementList } from '@/apis/webUiTest/element'
import { projectList as webUiProjectList } from '@/apis/webUiTest/project'

export default {
  name: 'ElementList',
  components: {
    Pagination
  },
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'dataType', 'currentCaseId'
  ],
  data() {
    return {
      titleType: this.dataType === 'api' ? '服务' : this.dataType === 'webUi' ? '项目' : 'APP',
      selectedOptions: [],
      tableLoadingIsShow: false,
      tempModuleList: [],
      moduleId: '',
      pageId: '',
      caseId: '',
      projectId: '',
      tempProjectList: [],
      tempPageList: [],
      elementList: {
        total: 0,
        data: []
      },
      pageNum: 0,
      pageSize: 10,

      moduleListUrl: '',
      pageListUrl: '',
      elementListUrl: '',
      projectListUrl: ''
    }
  },
  watch: {

    'currentCaseId': {
      handler(newVal, oldVal) {
        this.caseId = newVal
      }
    }

  },

  mounted() {
    this.getProjectList() // 项目列表
  },

  created() {
    if (this.dataType === 'webUi') {
      this.moduleListUrl = webUiModuleList
      this.pageListUrl = webUiPageList
      this.elementListUrl = webUiElementList
      this.projectListUrl = webUiProjectList
    } else {
      this.moduleListUrl = appUiModuleList
      this.pageListUrl = appUiPageList
      this.elementListUrl = appUiElementList
      this.projectListUrl = appUiProjectList
    }
    this.caseId = this.currentCaseId
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
  },

  methods: {

    // 双击单元格复制
    cellDblclick(row, column, cell, event) {
      const that = this
      const data = row[column.property]
      this.$copyText(typeof (data) === 'string' ? data : JSON.stringify(data)).then(
        function(e) {
          that.$message.success('复制成功')
        }
      )
    },

    // 递归把列表转为树行结构
    arrayToTree(arr, parentId) {
      //  arr 是返回的数据  parendId 父id
      const temp = []
      const treeArr = arr
      treeArr.forEach((item, index) => {
        if (item.parent === parentId) {
          if (this.arrayToTree(treeArr, treeArr[index].id).length > 0) {
            // 递归调用此函数
            treeArr[index].children = this.arrayToTree(treeArr, treeArr[index].id)
          }
          treeArr[index].value = treeArr[index].id
          treeArr[index].label = treeArr[index].name
          temp.push(treeArr[index])
        }
      })
      return temp
    },

    // 获取项目列表
    getProjectList() {
      this.tableLoadingIsShow = true
      this.projectListUrl().then(response => {
        this.tableLoadingIsShow = false
        this.tempProjectList = response.data.data
      })
    },

    parseFindBy(by) {
      return this.$busEvents.data.findElementOptionDict[by]
    },

    getModuleList(projectId) {
      this.projectId = projectId
      this.getModulesByProjectId(projectId)
    },

    // 获取项目id对应的模块列表
    getModulesByProjectId(project_id) {
      this.moduleListUrl({ 'projectId': project_id }).then(response => {
        this.tempModuleList = this.arrayToTree(response.data.data, null)
      })
    },

    getPageList(selectedModuleList) {
      if (selectedModuleList.length > 0) {
        this.moduleId = selectedModuleList.slice(-1)[0] // 取列表中的最后一个
        this.pageListUrl({
          'moduleId': this.moduleId,
          'pageNum': this.pageNum,
          'pageSize': this.pageSize
        }).then(response => {
          this.tempPageList = response.data.data ? response.data.data : []
        })
      }
    },

    // 根据模块id内容获取元素列表
    getPageListByModuleId() {
      this.pageListUrl({
        'moduleId': this.moduleId,
        'pageNum': this.pageNum,
        'pageSize': this.pageSize
      }).then(response => {
        this.tempPageList = response.data.data ? response.data.data : []
      })
    },

    // 根据模块id内容获取元素列表
    getElementListByPageId() {
      this.elementListUrl({
        'pageId': this.pageId,
        'pageNum': this.pageNum,
        'pageSize': this.pageSize
      }).then(response => {
        this.elementList.data = response.data.data ? response.data.data : []
        this.elementList.total = response.data.total ? response.data.total : 0
      })
    },

    // // 切换页数
    // getApiList(value) {
    //   this.getPageListByModuleId()
    // },

    // 深拷贝元素，添加到步骤列表
    addElementToStep(element) {
      // 把当前选中的元素，传给步骤编辑tab
      // 初始化步骤的默认值
      var new_element = JSON.parse(JSON.stringify(element))
      new_element['projectName'] = this.$refs.projectSelectorView.selected.label
      new_element['pageName'] = this.$refs.pageSelectorView.selected.label
      new_element['page_id'] = this.$refs.pageSelectorView.selected.value
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'stepInfo', 'add', new_element)
    }
  }
}
</script>

<style scoped>

</style>
