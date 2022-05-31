<template>
  <div>

    <el-form label-width="40px">

      <el-row>

        <!-- 项目选择 -->
        <el-col :span="8">
          <el-form-item label="项目" style="margin-bottom: 5px">
            <el-select
              ref="projectSelectorView"
              v-model="projectId"
              placeholder="请选择项目"
              size="mini"
              style="min-width: 100%"
              filterable
              default-first-option
              @change="getModuleList">
              <el-option v-for="(item) in tempProjectList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <!-- 选择模块 -->
        <el-col :span="8">
          <el-form-item label="模块" style="margin-left: 5px; margin-bottom: 5px">
            <el-cascader
              placeholder="选择模块"
              filterable
              size="mini"
              style="min-width: 100%"
              :options="tempModuleList"
              :props="{ checkStrictly: true }"
              v-model="selectedOptions"
              @change="getPageList"
              clearable></el-cascader>
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
              <el-option v-for="(item) in tempPageList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- 元素列表 -->
    <div>

      <el-table
        ref="apiTable"
        :data="elementList.data"
        stripe
      >
        <el-table-column prop="num" label="序号" min-width="10%">
          <template slot-scope="scope">
            <span> {{ (pageNum - 1) * pageSize + scope.$index + 1 }} </span>
          </template>
        </el-table-column>

        <el-table-column :show-overflow-tooltip=true prop="name" label="元素名称" min-width="20%">
          <template slot-scope="scope">
            <span> {{ scope.row.name }} </span>
          </template>
        </el-table-column>

        <el-table-column :show-overflow-tooltip=true prop="addr" label="定位方式" min-width="20%">
          <template slot-scope="scope">
            <span> {{ parseFindBy(scope.row.by) }} </span>
          </template>
        </el-table-column>

        <el-table-column :show-overflow-tooltip=true prop="addr" label="定位元素" min-width="20%">
          <template slot-scope="scope">
            <span> {{ scope.row.element }} </span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="操作" min-width="10%">
          <template slot-scope="scope">
            <el-tooltip
              class="item"
              effect="dark"
              content="添加为步骤"
              placement="top-start">
              <el-button
                type="text"
                icon="el-icon-d-arrow-left"
                @click.native="addApiToStep(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination
        v-show="elementList.total>0"
        :total="elementList.total"
        :page.sync="pageNum"
        :limit.sync="pageSize"
        @pagination="getElementListByPageId"/>

    </div>

  </div>

</template>

<script>
import projectSelectorView from "@/components/Selector/project";
import moduleSelectorView from "@/components/Selector/module";
import editStepView from "@/views/apiTest/step/editStep";
import Pagination from '@/components/Pagination'


import {moduleList} from "@/apis/uiTest/module";
import {pageList} from "@/apis/uiTest/page";
import {elementList} from "@/apis/uiTest/element";
import {projectList} from "@/apis/uiTest/project";

export default {
  name: 'elementList',
  props: [
    // 'projectId',
    'dialogIsShow',
    'currentCaseId'
  ],
  components: {
    Pagination,
    projectSelectorView,
    moduleSelectorView,
    editStepView,
  },
  data() {
    return {
      selectedOptions: [],

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
      pageSize: 10

    }
  },

  mounted() {
    this.getProjectList()  // 项目列表
  },

  created() {
    this.caseId = this.currentCaseId
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
  },

  methods: {

    // 递归把列表转为树行结构
    arrayToTree(arr, parentId) {
      //  arr 是返回的数据  parendId 父id
      let temp = [];
      let treeArr = arr;
      treeArr.forEach((item, index) => {
        if (item.parent == parentId) {
          if (this.arrayToTree(treeArr, treeArr[index].id).length > 0) {
            // 递归调用此函数
            treeArr[index].children = this.arrayToTree(treeArr, treeArr[index].id);
          }
          treeArr[index].value = treeArr[index].id
          treeArr[index].label = treeArr[index].name
          temp.push(treeArr[index]);
        }
      });
      return temp;
    },

    // 获取项目列表
    getProjectList() {
      projectList().then(response => {
        this.tempProjectList = response.data.data
      })
    },

    parseFindBy(by){
      return this.$busEvents.data.findElementOptionDict[by]
    },

    getModuleList(projectId){
      this.projectId = projectId
      this.getModulesByProjectId(projectId)
    },

    // 获取项目id对应的模块列表
    getModulesByProjectId(project_id) {
      moduleList({'projectId': project_id}).then(response => {
        this.tempModuleList = this.arrayToTree(response.data.data, null)
      })
    },

    getPageList(selectedModuleList) {
      if (selectedModuleList.length > 0) {
        this.moduleId = selectedModuleList.slice(-1)[0]  // 取列表中的最后一个
        pageList({
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
      pageList({
        'moduleId': this.moduleId,
        'pageNum': this.pageNum,
        'pageSize': this.pageSize
      }).then(response => {
        this.tempPageList = response.data.data ? response.data.data : []
      })
    },

    // 根据模块id内容获取元素列表
    getElementListByPageId() {
      elementList({
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
    addApiToStep(element) {

      // 如果有用例id，则添加步骤，否则先保存用例
      if (this.caseId) {
        // 把当前选中的元素，传给步骤编辑tab
        // 初始化步骤的默认值
        var new_element = JSON.parse(JSON.stringify(element))
        new_element['projectName'] = this.$refs.projectSelectorView.selected.label
        new_element['pageName'] = this.$refs.pageSelectorView.selected.label
        new_element['page_id'] = this.$refs.pageSelectorView.selected.value
        this.$bus.$emit(this.$busEvents.ui.uiShowStepDrawer, 'add', new_element)
      } else {
        this.$bus.$emit(this.$busEvents.api.apiIsAddStepTriggerSaveCase, 'true')
      }
    }
  },
  watch: {

    'currentCaseId': {
      handler(newVal, oldVal) {
        this.caseId = newVal
      }
    }

  }
}
</script>

<style scoped>

</style>
