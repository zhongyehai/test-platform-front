<template>
  <div class="app-container">
    <div>
      <span style="color: red">*</span>
      数据来源：
      【<span style="color: red">接口自动化</span>】
      下用例集类型为
      【<span style="color: red">造数据用例集</span>】
      下状态为
      【<span style="color: red">已通过-要执行</span>】
      的
      【<span style="color: red">用例</span>】
    </div>

    <el-row>
      <el-col :span="3">
        <el-tabs v-model="businessListTab">
          <el-tab-pane :label="businessListTab" :name="businessListTab">
            <el-tabs v-model="businessActiveId" tab-position="left" :before-leave="getProjectList">
              <el-tab-pane
                v-for="(business) in $busEvents.data.businessList"
                :key="business.id"
                :name="business.id.toString()"
                :label="business.name"
              />
            </el-tabs>
          </el-tab-pane>
        </el-tabs>
      </el-col>

      <el-col :span="3">
        <el-tabs v-model="projectListTab">
          <el-tab-pane :label="projectListTab" :name="projectListTab">
            <el-tabs v-model="projectActiveId" tab-position="left" :before-leave="getCaseList">
              <el-tab-pane
                v-for="(project) in project_list"
                :key="project.id"
                :name="project.id.toString()"
                :label="project.name"
              />
            </el-tabs>
          </el-tab-pane>
        </el-tabs>
      </el-col>

      <el-col :span="18">
        <el-tabs v-model="caseListTab">
          <el-tab-pane :label="caseListTab" :name="caseListTab">
            <el-table
              ref="caseTable"
              element-loading-text="正在获取数据..."
              size="mini"
              element-loading-spinner="el-icon-loading"
              :data="case_list"
              stripe
            >
              <el-table-column prop="num" label="序号" align="left" min-width="8%">
                <template slot-scope="scope">
                  <span> {{ scope.$index + 1 }} </span>
                </template>
              </el-table-column>

              <el-table-column show-overflow-tooltip align="left" label="用例名称" min-width="64%">
                <template slot-scope="scope">
                  <span> {{ scope.row.name }} </span>
                </template>
              </el-table-column>

              <el-table-column show-overflow-tooltip align="left" label="用例描述" min-width="20%">
                <template slot-scope="scope">
                  <el-popover
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

                  <!-- 运行用例 -->
                  <el-button type="text" size="mini" @click="clickRunCase(scope.row)">运行 </el-button>

                  <!--修改用例-->
                  <el-button type="text" size="mini" @click="editCase(scope.row)">修改 </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>

    <selectRunEnv
      :data-type="'api'"
      :project-business-id="businessActiveId"
    />

    <runProcess
      :data-type="'api'"
    />

    <editCaseDrawer
      :data-type="'api'"
      :current-project-id="projectActiveId"
      :current-set-id="tempSuiteId"
    />

  </div>
</template>

<script>
import { Loading } from 'element-ui'

import runProcess from '@/components/runProcess.vue'
import selectRunEnv from '@/components/selectRunEnv.vue'
import showCaseDesc from '@/components/business/case/showCaseDesc.vue'

import { businessList } from '@/apis/config/business'
import { projectList } from '@/apis/apiTest/project'
import { assertCaseList, caseRun } from '@/apis/apiTest/case'
import editCaseDrawer from '@/components/business/case/editDrawer.vue'

export default {
  name: 'MakeBusinessData',
  components: {
    editCaseDrawer,
    showCaseDesc,
    selectRunEnv,
    runProcess
  },
  data() {
    return {
      tableLoadingIsShow: false,
      businessListTab: '业务线列表',
      projectListTab: '服务列表',
      caseListTab: '用例列表',
      businessId: '',
      businessActiveId: '',
      projectActiveId: '',
      tempSuiteId: '',
      project_list: [],
      case_list: []
    }
  },

  mounted() {
    // 获取业务线
    if (this.$busEvents.data.businessList.length < 1) {
      businessList().then(response => {
        this.$busEvents.data.businessList = response.data.data
        this.businessActiveId = response.data.data[0].id.toString()

        this.$busEvents.data.businessDict = {}
        this.$busEvents.data.businessList.forEach(business => {
          this.$busEvents.data.businessDict[business.id] = business.name
        })
      })
    }

    // 用例提交成功，请求用例列表
    this.$bus.$on(this.$busEvents.drawerIsCommit, (_type, _runUnit, runDict) => {
      if (_type === 'caseInfo') {
        this.getCaseList(this.projectActiveId)
      } else if (_type === 'selectRunEnv' && _runUnit === 'makeData') {
        this.runCase(runDict)
      }
    })
  },

  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsCommit)
  },

  methods: {

    getProjectList(activeName, oldActiveName) {
      if (activeName && activeName !== '0') {
        this.project_list = []
        this.case_list = []
        const loading = Loading.service({ text: '获取数据中', background: 'rgba(0, 0, 0, 0.8)' })
        projectList({ business_id: parseInt(activeName) }).then(response => {
          loading.close()
          if (response.data.total > 0) {
            this.project_list = response.data.data
            this.projectActiveId = response.data.data[0].id.toString()
          }
        })
      }
    },

    getCaseList(activeName, oldActiveName) {
      if (activeName && activeName !== '0') {
        const loading = Loading.service({ text: '获取数据中', background: 'rgba(0, 0, 0, 0.8)' })
        assertCaseList({ project_id: parseInt(activeName) }).then(response => {
          loading.close()
          this.case_list = response.data.data
        })
      }
    },

    // 编辑用例
    editCase(row) {
      this.tempCase = row
      this.tempSuiteId = row.suite_id
      this.$bus.$emit(
        this.$busEvents.drawerIsShow,
        'caseInfo',
        'edit',
        JSON.parse(JSON.stringify(this.tempCase))
      )
    },

    clickRunCase(row) {
      this.projectBusinessId = row.business_id
      if (row.id) {
        this.runCaseId = [row.id]
      } else {
        this.runCaseId = []
        this.selectedList.forEach(data => {
          this.runCaseId.push(data.id)
        })
      }
      this.$bus.$emit(
        this.$busEvents.drawerIsShow,
        'selectRunEnv',
        'makeData',
        false,
        parseInt(this.businessActiveId),
        {
          variables: JSON.parse(JSON.stringify(row.variables)),
          headers: row.headers ? JSON.parse(JSON.stringify(row.headers)) : undefined,
          skip_if: JSON.parse(JSON.stringify(row.skip_if))
        }
      )
    },

    // 运行用例
    runCase(runConf) {
      caseRun({
        case_id_list: this.runCaseId,
        env_list: runConf.runEnv,
        is_async: runConf.runType,
        browser: runConf.browser,
        server_id: runConf.runServer,
        phone_id: runConf.runPhone,
        no_reset: runConf.noReset,
        temp_variables: runConf.temp_variables,
        'trigger_type': 'page'
      }).then(response => {
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.drawerIsShow, 'process', response.data.batch_id, response.data.report_id)
        }
      })
    }
  }
}
</script>

<style scoped>

</style>

