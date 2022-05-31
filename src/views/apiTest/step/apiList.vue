<template>
  <div>

    <el-form label-width="60px">
      <el-row>
        <el-form-item :label="'查询'" size="mini" style="margin-bottom: 5px">
          <el-input
            v-model="queryAddr"
            class="input-with-select"
            placeholder="请输入接口地址，如 /mock/{projectSystemId}"
            size="mini"
            style="width: 85%">
          </el-input>
          <el-button
            v-show="queryAddr"
            type="primary"
            size="mini"
            style="margin-left: 10px"
            @click.native="getApiMsgBelongTo()"
          >查询
          </el-button>
        </el-form-item>
      </el-row>

      <el-row>

        <!-- 服务选择 -->
        <el-col :span="11">
          <el-form-item label="服务" style="margin-bottom: 5px">
            <projectSelectorView
              ref="projectSelectorView"
              :busEmitEventName="$busEvents.api.apiProjectSelectorChoiceProject"
            ></projectSelectorView>
          </el-form-item>
        </el-col>

        <!-- 选则用例集 -->
        <el-col :span="13">
          <el-form-item label="模块" style="margin-bottom: 5px">
            <el-cascader
              placeholder="选择模块"
              filterable
              size="mini"
              style="min-width: 100%"
              :options="tempModuleList"
              :props="{ checkStrictly: true }"
              v-model="selectedOptions"
              @change="getCaseList"
              clearable></el-cascader>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- 接口列表 -->
    <div>

      <el-table
        ref="apiTable"
        :data="apiList.data"
        stripe
      >
        <el-table-column prop="num" label="序号" min-width="10%">
          <template slot-scope="scope">
            <span> {{ (pageNum - 1) * pageSize + scope.$index + 1 }} </span>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip=true prop="name" label="接口名称" min-width="37%"></el-table-column>
        <el-table-column :show-overflow-tooltip=true prop="addr" label="接口地址" min-width="45%"></el-table-column>
        <el-table-column align="center" label="操作" min-width="8%">
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
        v-show="apiList.total>0"
        :total="apiList.total"
        :page.sync="pageNum"
        :limit.sync="pageSize"
        @pagination="getApiList"/>

    </div>

  </div>

</template>

<script>
import projectSelectorView from "@/components/Selector/project";
import moduleSelectorView from "@/components/Selector/module";
import editStepView from "@/views/apiTest/step/editStep";
import Pagination from '@/components/Pagination'

import {apiList, apiMsgBelongTo} from "@/apis/apiTest/api";
import {moduleList} from "@/apis/apiTest/module";

export default {
  name: 'apiList',
  props: [
    'projectId',
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
      currentProjectId: '',
      moduleId: '',
      caseId: '',

      apiList: {
        total: 0,
        data: []
      },
      pageNum: 0,
      pageSize: 10,
      queryAddr: ''

    }
  },

  mounted() {

    // 监听选中服务
    this.$bus.$on(this.$busEvents.api.apiProjectSelectorChoiceProject, (project) => {
      this.currentProjectId = project
      this.getModulesByProjectId(project.id)
    })

    // 获取模块对应的接口列表
    this.$bus.$on(this.$busEvents.api.apiModuleSelectorChoiceModule, (moduleId) => {
      this.moduleId = moduleId
      this.getApiListByModuleId()
    })
  },

  created() {
    this.caseId = this.currentCaseId
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.api.apiModuleSelectorChoiceModule)
  },

  methods: {

    // 获取接口归属
    getApiMsgBelongTo() {
      apiMsgBelongTo({addr: this.queryAddr}).then(response => {
        this.showMessage(this, response)
        // console.log(JSON.stringify(response.message))
      })
    },

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

    // 获取服务id对应的模块列表
    getModulesByProjectId(project_id) {
      moduleList({'projectId': project_id}).then(response => {
        this.tempModuleList = this.arrayToTree(response.data.data, null)
      })
    },

    getCaseList(selectedModuleList) {
      if (selectedModuleList.length > 0) {
        this.moduleId = selectedModuleList.slice(-1)[0]  // 取列表中的最后一个
        apiList({
          'moduleId': this.moduleId,
          'pageNum': this.pageNum,
          'pageSize': this.pageSize
        }).then(response => {
          this.apiList.data = response.data.data ? response.data.data : []
          this.apiList.total = response.data.total ? response.data.total : 0
        })
      }
    },

    // 根据模块id内容获取接口列表
    getApiListByModuleId() {
      apiList({
        'moduleId': this.moduleId,
        'pageNum': this.pageNum,
        'pageSize': this.pageSize
      }).then(response => {
        this.apiList.data = response.data.data ? response.data.data : []
        this.apiList.total = response.data.total ? response.data.total : 0
      })
    },

    // 切换页数
    getApiList(value) {
      this.getApiListByModuleId()
    },

    // 深拷贝接口，添加到步骤列表
    addApiToStep(api) {

      // 如果有用例id，则添加步骤，否则先保存用例
      if (this.caseId) {
        // 把当前选中的接口，传给步骤编辑tab
        // 初始化步骤的默认值
        var new_api = JSON.parse(JSON.stringify(api))
        new_api['api_id'] = new_api['id']
        new_api['id'] = ''
        new_api['is_run'] = true
        new_api['run_times'] = 1
        new_api['replace_host'] = false
        new_api['projectName'] = this.$refs.projectSelectorView.$refs.projectSelectorView.selected.label
        new_api['apiName'] = new_api.name
        this.$bus.$emit(this.$busEvents.api.apiAddApiToStep, new_api)
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
