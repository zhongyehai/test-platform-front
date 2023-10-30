<template>
  <el-form label-width="60px">

    <el-row>

      <!-- 服务选择 -->
      <el-col :span="11">
        <el-form-item :label="titleType">
          <el-select
            ref="projectSelector"
            v-model="projectSelectedId"
            :placeholder="`选择${titleType}`"
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
            style="width: 97%"
            :options="currentCaseSuiteList"
            :props="{ checkStrictly: true }"
            clearable
            @change="getCaseList"
          />
          <el-popover
            class="el_popover_class"
            placement="top-start"
            trigger="hover"
          >
            <div>
              <div>1、若选择的服务是当前服务，可引用类型为<span style="color: red">基础用例集</span>和<span style="color: red">引用用例集</span>的用例集</div>
              <div>2、若选择的服务不是当前服务，只可引用类型为<span style="color: red">引用用例集</span>的用例集</div>
            </div>
            <el-button slot="reference" type="text" icon="el-icon-question" />
          </el-popover>
        </el-form-item>
      </el-col>
    </el-row>

    <!-- 用例列表 -->
    <el-row>
      <el-table
        ref="caseTable"
        v-loading="tableLoadingIsShow"
        size="mini"
        row-key="row_id"
        :data="caseList"
        element-loading-text="正在获取数据..."
        element-loading-spinner="el-icon-loading"
        :expand-row-keys="expands"
        stripe
        lazy
        :load="getStep"
        :tree-props="{ children: 'children', hasChildren: 'hasStep' }"
        @expand-change="changeExpandStatus"
        @cell-dblclick="cellDblclick"
      >

        <el-table-column show-overflow-tooltip prop="name" label="用例名称" align="left" min-width="65%">
          <template slot-scope="scope">
            <el-tag
              size="small"
              :type="scope.row.suite_id ? 'danger': scope.row.quote_case ? 'warning' : 'success'"
            >
              {{ scope.row.suite_id ? '用例' : scope.row.quote_case ? '引用用例' : '步骤' }}
            </el-tag>
            <span> {{ scope.row.name }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip prop="desc" align="left" label="描述" min-width="20%">
          <template slot-scope="scope">
            <el-popover
              v-show="scope.row.suite_id || scope.row.quote_case"
              :ref="scope.row.id"
              trigger="hover"
              placement="bottom-start"
              style="margin-right: 10px"
              popper-class="down-popover"
            >
              <showCaseDesc
                :case-desc="scope.row.desc"
                :case-skip-if="scope.row.skip_if"
                :case-variables="scope.row.variables"
                :case-extracts="scope.row.output"
              />
              <span slot="reference"> {{ scope.row.desc || '-' }} </span>
            </el-popover>
          </template>
        </el-table-column>

        <el-table-column label="操作" align="left" min-width="10%">
          <template slot-scope="scope">

            <!-- 复制用例 -->
            <el-popover
              :ref="scope.row.id"
              v-model="scope.row.copyStepPopoverIsShow"
              placement="top"
              style="margin-right: 10px"
              popper-class="down-popover"
            >
              <p>复制【当前步骤】并在当【前用用例】下生成新的步骤?</p>
              <div style="text-align: right; margin: 0">
                <el-button size="mini" type="text" @click="cancelCopyStepPopover(scope.row)">取消</el-button>
                <el-button type="primary" size="mini" @click="copyCaseStepAsStep(scope.row)">确定</el-button>
              </div>
              <el-button
                slot="reference"
                type="text"
                size="mini"
                :loading="scope.row.copyIsLoading"
              >拉取
              </el-button>
            </el-popover>

            <!-- 步骤不展示引用用例按钮 -->
            <el-tooltip
              v-show="scope.row.suite_id || scope.row.quote_case"
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
import showCaseDesc from '@/components/business/case/showCaseDesc'

import { projectList as apiProjectList } from '@/apis/apiTest/project'
import { caseSuiteList as apiCaseSuiteTree } from '@/apis/apiTest/suite'
import { caseList as apiCaseList, copyCaseStep as apiCopyCaseStep } from '@/apis/apiTest/case'
import { stepCopy as apiStepCopy, stepList as apiStepList } from '@/apis/apiTest/step'

import { projectList as webUiProjectList } from '@/apis/webUiTest/project'
import { caseSuiteList as webUiCaseSuiteTree } from '@/apis/webUiTest/suite'
import { caseList as webUiCaseList, copyCaseStep as webUiCopyCaseStep } from '@/apis/webUiTest/case'
import { stepCopy as webUiStepCopy, stepList as webUiStepList } from '@/apis/webUiTest/step'

import { projectList as appUiProjectList } from '@/apis/appUiTest/project'
import { caseSuiteList as appUiCaseSuiteTree } from '@/apis/appUiTest/suite'
import { caseList as appUiCaseList, copyCaseStep as appUiCopyCaseStep } from '@/apis/appUiTest/case'
import { stepCopy as appUiStepCopy, stepList as appUiStepList } from '@/apis/appUiTest/step'

export default {
  name: 'QuoteCase',
  components: {
    showCaseDesc,
    Pagination
  },
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'dataType', 'projectId', 'caseId'
  ],
  data() {
    return {
      titleType: this.dataType === 'api' ? '服务' : this.dataType === 'webUi' ? '项目' : 'APP',
      selectedOptions: [],
      tableLoadingIsShow: false,
      projectSelectedId: '',
      currentProjectList: [],
      currentCaseSuiteList: [],
      quotePageNum: 1,
      quotePageSize: 20,
      caseList: [],
      caseTotal: 0,
      currentSetId: '',

      expands: [], // 要展开的行数据的id

      projectListUrl: '',
      caseSuiteTreeUrl: '',
      caseListUrl: '',
      copyCaseStepUrl: '',
      stepCopyUrl: '',
      stepListUrl: ''
    }
  },
  watch: {},

  mounted() {
    this.getProjectList() // 获取服务列表
  },

  created() {
    if (this.dataType === 'api') {
      this.projectListUrl = apiProjectList
      this.caseSuiteTreeUrl = apiCaseSuiteTree
      this.caseListUrl = apiCaseList
      this.copyCaseStepUrl = apiCopyCaseStep
      this.stepListUrl = apiStepList
      this.stepCopyUrl = apiStepCopy
    } else if (this.dataType === 'webUi') {
      this.projectListUrl = webUiProjectList
      this.caseSuiteTreeUrl = webUiCaseSuiteTree
      this.caseListUrl = webUiCaseList
      this.copyCaseStepUrl = webUiCopyCaseStep
      this.stepListUrl = webUiStepList
      this.stepCopyUrl = webUiStepCopy
    } else {
      this.projectListUrl = appUiProjectList
      this.caseSuiteTreeUrl = appUiCaseSuiteTree
      this.caseListUrl = appUiCaseList
      this.copyCaseStepUrl = appUiCopyCaseStep
      this.stepListUrl = appUiStepList
      this.stepCopyUrl = appUiStepCopy
    }
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

    cancelCopyStepPopover(row) {
      this.$set(row, 'copyStepPopoverIsShow', false)
    },

    // 第一次点击展开引用用例
    getStep(row, treeNode, resolve) {
      if (this.expands.indexOf(row.row_id) === -1) {
        // 获取用例/引用用例的步骤列表
        const request_id = row.quote_case ? row.quote_case : row.id
        this.stepListUrl({ caseId: request_id }).then(response => {
          this.expands.push(row.row_id)
          const data_list = []
          response.data.data.forEach(step => {
            step['row_id'] = `step_${step.id}`
            data_list.push(step)
          })
          resolve(data_list)
        })
      }
    },

    // 点击打开或者收起引用用例
    changeExpandStatus(row, status) {
      if (status === false) {
        this.expands.pop(row.id)
      } else {
        if (this.expands.indexOf(row.id) === -1) {
          this.expands.push(row.id)
        }
      }
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

    // 获取服务列表
    getProjectList() {
      this.projectListUrl().then(response => {
        this.currentProjectList = response.data.data
      })
    },

    // 选中服务，获取对应的用例集
    selectedProject(projectId) {
      // 如果是访问的当前服务的用例集，则获取基础用例集和引用用例集，否则获取引用用例集
      const suite_type = this.projectSelectedId === this.projectId ? ['base', 'quote'] : ['quote']
      this.caseSuiteTreeUrl({
        'pageNum': 1,
        'pageSize': 9999,
        'project_id': projectId,
        'suite_type': suite_type
      }).then(response => {
        this.currentCaseSuiteList = this.arrayToTree(response.data.data, null)
      })
    },

    // 选中用例集，获取对应的用例列表
    getCaseList(caseSuiteList) {
      if (caseSuiteList.length > 0) {
        this.currentSetId = caseSuiteList.slice(-1)[0] // 取列表中的最后一个
      }
      this.tableLoadingIsShow = true
      this.caseListUrl({
        pageNum: this.quotePageNum,
        pageSize: this.quotePageSize,
        suiteId: this.currentSetId,
        status: 1,
        getHasStep: true
      }).then(response => {
        this.tableLoadingIsShow = false
        this.caseList = []
        this.expands = []
        response.data.data.forEach(caseData => {
          caseData['row_id'] = `case_${caseData.id}`
          this.caseList.push(caseData)
        })
        this.caseTotal = response.data.total
      })
    },

    // 引用用例
    addQuote(row) {
      // 如果有用例id，则添加步骤，否则先保存用例
      if (row.id === this.caseId) {
        this.$notify.error('不能自己引用自己')
        return
      }

      var new_api = JSON.parse(JSON.stringify(row))
      // 服务名 + 用例集... + 用例名
      // var name = this.$refs.projectSelector.selected.label + '/' + this.$refs['caseSelector'].getCheckedNodes()[0].pathLabels.join('/')
      // new_api['name'] = `${name}/${row.name}`
      new_api['quote_case'] = new_api['quote_case'] ? new_api['quote_case'] : new_api['id'] // 有可能是引用用例下的引用
      new_api['id'] = ''
      new_api['case_id'] = this.caseId
      new_api['status'] = 1
      new_api['run_times'] = 1
      new_api['name'] = row.name
      new_api['headers'] = [{ 'key': null, 'remark': null, 'value': null }]
      new_api['params'] = [{ 'key': null, 'value': null }]
      new_api['data_form'] = [{ 'data_type': null, 'key': null, 'remark': null, 'value': null }]
      new_api['data_json'] = {}
      new_api['extracts'] = [{ 'key': '', 'remark': null, 'value': '' }]
      new_api['validates'] = [{ 'key': '', 'remark': null, 'validate_type': '', 'value': '' }]
      new_api['data_driver'] = []
      this.$bus.$emit(this.$busEvents.quoteCaseToStep, new_api, null)
    },

    // 复制指定用例的步骤为当前用例的步骤
    copyCaseStepAsStep(from) {
      this.$set(from, 'copyStepPopoverIsShow', false)
      this.$set(from, 'copyIsLoading', true)
      if (from.suite_id) { // 复制用例下的步骤
        this.copyCaseStepUrl({ source: from.id, to: this.caseId }).then(response => {
          this.$set(from, 'copyIsLoading', false)
          if (this.showMessage(this, response)) {
            this.$bus.$emit(this.$busEvents.drawerIsCommit, 'stepInfo') // 复制完成，重新请求步骤列表
            this.$bus.$emit(this.$busEvents.quoteCaseToStep, null, 'pullStep') // 复制完成，重新获取用例的变量
          }
        })
      } else { // 复制具体步骤
        this.stepCopyUrl({ 'id': from.id, 'caseId': this.caseId }).then(response => {
          this.$set(from, 'copyIsLoading', false)
          if (this.showMessage(this, response)) {
            this.$bus.$emit(this.$busEvents.drawerIsCommit, 'stepInfo') // 复制完成，重新请求步骤列表
            this.$bus.$emit(this.$busEvents.quoteCaseToStep, null, 'pullStep') // 复制完成，重新获取用例的变量
          }
        })
      }
    }
  }
}
</script>

<style scoped>

</style>
