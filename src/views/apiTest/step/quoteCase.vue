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
              :value="item.id"></el-option>
          </el-select>
        </el-form-item>
      </el-col>

      <!-- 选则用例集 -->
      <el-col :span="13">
        <el-form-item label="用例集">
          <el-cascader
            ref="caseSelector"
            filterable
            placeholder="选择用例集"
            size="mini"
            style="min-width: 100%"
            :options="currentCaseSetList"
            :props="{ checkStrictly: true }"
            v-model="selectedOptions"
            @change="getCaseList"
            clearable></el-cascader>
        </el-form-item>
      </el-col>
    </el-row>

    <!-- 用例列表 -->
    <el-row>
      <el-table ref="caseTable" :data="caseList" stripe>
        <el-table-column prop="num" label="序号" min-width="10%">
          <template slot-scope="scope">
            <span> {{ (quotePageNum - 1) * quotePageSize + scope.$index + 1 }} </span>
          </template>
        </el-table-column>

        <el-table-column :show-overflow-tooltip=true prop="name" label="用例名称" min-width="82%">
          <template slot-scope="scope">
            <span> {{ scope.row.name }} </span>
          </template>
        </el-table-column>

        <el-table-column label="操作" min-width="8%">
          <template slot-scope="scope">
            <el-tooltip
              class="item"
              effect="dark"
              content="引用此用例为步骤"
              placement="top-start">
              <el-button
                type="text"
                icon="el-icon-d-arrow-left"
                :loading="scope.row.addToQuoteLoadingIsShow"
                @click.native="addQuote(scope.row)">
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

import {projectList} from "@/apis/apiTest/project";
import {caseSetTree} from "@/apis/apiTest/caseSet";
import {caseList} from "@/apis/apiTest/case";

export default {
  name: "quoteCase",
  components: {Pagination},
  props: [
    "tempCase",
    "caseId"
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
      currentSetId: ''
    }
  },
  mounted() {
    // 获取服务列表
    this.getProjectList()
  },
  created() {
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

    // 获取服务列表
    getProjectList() {
      projectList().then(response => {
        this.currentProjectList = response.data.data
      })
    },

    // 选中服务，获取对应的用例集
    selectedProject(projectId) {
      caseSetTree({'project_id': projectId}).then(response => {
        this.currentCaseSetList = this.arrayToTree(response.data, null)
      })
    },

    // 选中用例集，获取对应的用例列表
    getCaseList(caseSetList) {
      if (caseSetList.length > 0) {
        this.currentSetId = caseSetList.slice(-1)[0]  // 取列表中的最后一个
      }
      caseList({
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
          this.$notify.error('不能自己引用自己');
          return
        }

        var new_api = JSON.parse(JSON.stringify(row))
        // 服务名 + 用例集... + 用例名
        var name = this.$refs.projectSelector.selected.label + '/' + this.$refs['caseSelector'].getCheckedNodes()[0].pathLabels.join('/')
        new_api['quote_case'] = new_api['id']
        new_api['id'] = ''
        new_api['case_id'] = this.caseId
        new_api['is_run'] = true
        new_api['run_times'] = 1
        new_api['name'] = `引用【${name}/${row.name}】`
        new_api['headers'] = [{"key": null, "remark": null, "value": null}]
        new_api['params'] = [{"key": null, "value": null}]
        new_api['data_form'] = [{"data_type": null, "key": null, "remark": null, "value": null}]
        new_api['data_json'] = {}
        new_api['extracts'] = [{"key": "", "remark": null, "value": ""}]
        new_api['validates'] = [{"key": "", "remark": null, "validate_type": "", "value": ""}]
        new_api['data_driver'] = []
        this.$bus.$emit(this.$busEvents.api.apiAddApiToStep, new_api, 'quote')
      } else {
        this.$bus.$emit(this.$busEvents.api.apiIsAddStepTriggerSaveCase, 'true')
      }
    }
  },
  watch: {}
}
</script>

<style scoped>

</style>
