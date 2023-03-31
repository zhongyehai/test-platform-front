<template>
  <el-form label-width="60px">

    <el-row>

      <!-- 服务选择 -->
      <el-col :span="11">
        <el-form-item label="服务">
          <el-select
            ref="projectSelector"
            v-model="projectSelectedId"
            placeholder="选择服务"
            size="mini"
            filterable
            default-first-option
            style="min-width: 100%"
            @change="selectedProject"
          >
            <el-option
              v-for="(item) in currentProjectList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-col>

      <!-- 选则用例集 -->
      <el-col :span="13">
        <el-form-item label="用例集">
          <el-cascader
            ref="caseSelector"
            v-model="selectedOptions"
            filterable
            placeholder="选择用例集"
            size="mini"
            style="min-width: 100%"
            :options="currentCaseSetList"
            :props="{ checkStrictly: true }"
            clearable
            @change="getCaseList"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <!-- 用例列表 -->
    <el-row>
      <el-table ref="caseTable" :data="caseList" stripe>
        <el-table-column prop="num" label="序号" align="center" min-width="10%">
          <template slot-scope="scope">
            <span> {{ (quotePageNum - 1) * quotePageSize + scope.$index + 1 }} </span>
          </template>
        </el-table-column>

        <el-table-column :show-overflow-tooltip="true" prop="name" label="用例名称" align="center" min-width="65%">
          <template slot-scope="scope">
            <span> {{ scope.row.name }} </span>
          </template>
        </el-table-column>

        <el-table-column label="操作" align="center" min-width="25%">
          <template slot-scope="scope">

            <!-- 复制用例 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="完全复制此用例的步骤为当前用例的步骤"
              placement="top-start"
            >
              <el-button
                type="text"
                size="mini"
                @click.native="copyCaseStepAsStep(scope.row)"
              >拉取
              </el-button>
            </el-tooltip>

            <!-- 引用用例 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="引用此用例为当前用例的步骤"
              placement="top-start"
            >
              <el-button
                type="text"
                size="mini"
                @click.native="addQuote(scope.row)"
              >引用
              </el-button>
            </el-tooltip>

            <!-- 查看用例详情 -->
            <el-button
              slot="reference"
              type="text"
              size="mini"
              style="margin-right: 5px"
              @click="showCaseRemark(scope.row.id)"
            >详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="caseTotal>0"
        :total="caseTotal"
        :page.sync="quotePageNum"
        :limit.sync="quotePageSize"
        @pagination="getCaseList"
      />
    </el-row>
  </el-form>
</template>

<script>
import Pagination from '@/components/Pagination'

import { projectList as apiProjectList } from '@/apis/apiTest/project'
import { caseSetTree as apiCaseSetTree } from '@/apis/apiTest/caseSet'
import { caseList as apiCaseList, copyCaseStep as apiCopyCaseStep } from '@/apis/apiTest/case'

import { projectList as webUiProjectList } from '@/apis/webUiTest/project'
import { caseSetTree as webUiCaseSetTree } from '@/apis/webUiTest/caseSet'
import { caseList as webUiCaseList, copyCaseStep as webUiCopyCaseStep } from '@/apis/webUiTest/case'

import { projectList as appUiProjectList } from '@/apis/appUiTest/project'
import { caseSetTree as appUiCaseSetTree } from '@/apis/appUiTest/caseSet'
import { caseList as appUiCaseList, copyCaseStep as appUiCopyCaseStep } from '@/apis/appUiTest/case'

export default {
  name: 'QuoteCase',
  components: { Pagination },
  props: [
    'dataType',
    'tempCase',
    'caseId'
  ],
  data() {
    return {
      selectedOptions: [],

      projectSelectedId: '',
      currentProjectList: [],
      currentCaseSetList: [],
      quotePageNum: 1,
      quotePageSize: 10,
      caseList: [],
      caseTotal: 0,
      currentSetId: '',

      projectListUrl: '',
      caseSetTreeUrl: '',
      caseListUrl: '',
      copyCaseStepUrl: ''
    }
  },
  watch: {},

  mounted() {
    this.getProjectList() // 获取服务列表
  },

  created() {
    if (this.dataType === 'api') {
      this.projectListUrl = apiProjectList
      this.caseSetTreeUrl = apiCaseSetTree
      this.caseListUrl = apiCaseList
      this.copyCaseStepUrl = apiCopyCaseStep
    } else if (this.dataType === 'webUi') {
      this.projectListUrl = webUiProjectList
      this.caseSetTreeUrl = webUiCaseSetTree
      this.caseListUrl = webUiCaseList
      this.copyCaseStepUrl = webUiCopyCaseStep
    } else {
      this.projectListUrl = appUiProjectList
      this.caseSetTreeUrl = appUiCaseSetTree
      this.caseListUrl = appUiCaseList
      this.copyCaseStepUrl = appUiCopyCaseStep
    }
  },

  methods: {

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

    // 获取服务列表
    getProjectList() {
      this.projectListUrl().then(response => {
        this.currentProjectList = response.data.data
      })
    },

    // 选中服务，获取对应的用例集
    selectedProject(projectId) {
      this.caseSetTreeUrl({ 'project_id': projectId }).then(response => {
        this.currentCaseSetList = this.arrayToTree(response.data, null)
      })
    },

    // 选中用例集，获取对应的用例列表
    getCaseList(caseSetList) {
      if (caseSetList.length > 0) {
        this.currentSetId = caseSetList.slice(-1)[0] // 取列表中的最后一个
      }
      this.caseListUrl({
        pageNum: this.quotePageNum,
        pageSize: this.quotePageSize,
        setId: this.currentSetId
      }).then(response => {
        this.caseList = response.data.data
        this.caseTotal = response.data.total
      })
    },

    // 引用用例
    addQuote(row) {
      // 如果有用例id，则添加步骤，否则先保存用例
      if (this.caseId) {
        // 不能自己引用自己
        if (row.id === this.caseId) {
          this.$notify.error('不能自己引用自己')
          return
        }

        var new_api = JSON.parse(JSON.stringify(row))
        // 服务名 + 用例集... + 用例名
        var name = this.$refs.projectSelector.selected.label + '/' + this.$refs['caseSelector'].getCheckedNodes()[0].pathLabels.join('/')
        new_api['quote_case'] = new_api['id']
        new_api['id'] = ''
        new_api['case_id'] = this.caseId
        new_api['status'] = 1
        new_api['run_times'] = 1
        new_api['name'] = `引用【${name}/${row.name}】`
        new_api['headers'] = [{ 'key': null, 'remark': null, 'value': null }]
        new_api['params'] = [{ 'key': null, 'value': null }]
        new_api['data_form'] = [{ 'data_type': null, 'key': null, 'remark': null, 'value': null }]
        new_api['data_json'] = {}
        new_api['extracts'] = [{ 'key': '', 'remark': null, 'value': '' }]
        new_api['validates'] = [{ 'key': '', 'remark': null, 'validate_type': '', 'value': '' }]
        new_api['data_driver'] = []
        this.$bus.$emit(this.$busEvents.quoteCaseToStep, new_api, null)
      } else {
        this.$bus.$emit(this.$busEvents.drawerIsCommit, 'stepTrigger')
      }
    },

    // 复制指定用例的步骤为当前用例的步骤
    copyCaseStepAsStep(fromCase) {
      if (this.caseId) {
        this.copyCaseStepUrl({ source: fromCase.id, to: this.caseId }).then(response => {
          if (this.showMessage(this, response)) {
            this.$bus.$emit(this.$busEvents.drawerIsCommit, 'stepInfo')
            this.$bus.$emit(this.$busEvents.quoteCaseToStep, null, 'quoteCaseToStepSuccess') // 重新请求用例更新变量
          }
        })
      } else {
        this.$bus.$emit(this.$busEvents.drawerIsCommit, 'stepTrigger')
      }
    },

    showCaseRemark(caseId) {
      this.$bus.$emit(this.$busEvents.drawerIsCommit, 'showStepList', caseId)
    }
  }
}
</script>

<style scoped>

</style>
