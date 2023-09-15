<template>
  <el-tabs v-model="activeName">
    <el-tab-pane label="用例信息" name="showCaseInfo">
      <div v-show="caseId" style="margin-bottom: 20px">
        <label>用例来源：</label>
        <el-button
          v-show="!caseFrom"
          v-loading="getCaseFromIsLoading"
          type="primary"
          size="mini"
          @click.native="getCaseFrom()"
        >查看
        </el-button>
        <div>{{ caseFrom }}</div>
      </div>

      <div style="margin-bottom: 20px">
        <label>用例描述：</label>
        <div>{{ caseDesc }}</div>
      </div>

      <!-- 跳过条件 -->
      <label>跳过条件：</label>
      <el-table :data="caseSkipIf" stripe style="width: 100%">

        <el-table-column prop="num" label="序号" size="mini" width="50">
          <template slot-scope="scope">
            <span> {{ scope.$index + 1 }} </span>
          </template>
        </el-table-column>

        <el-table-column prop="skip_type" label="跳过类型" size="mini" width="180">
          <template slot-scope="scope">
            <el-select v-model="scope.row.skip_type" style="width: 100%" size="mini" disabled>
              <el-option
                v-for="(item) in $busEvents.data.skipIfTypeMappingList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column prop="data_source" label="数据源" size="mini" width="180">
          <template slot-scope="scope">
            <el-select v-model="scope.row.data_source" style="width: 100%" size="mini" disabled>
              <el-option
                v-for="(item) in $busEvents.data.caseSkipIfDataSourceMapping"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column prop="check_value" label="数据值" size="mini" width="300">
          <template slot-scope="scope">
            <span> {{ scope.row.check_value || '-' }} </span>
          </template>
        </el-table-column>

        <el-table-column prop="comparator" label="判断方式" size="mini" width="180">
          <template slot-scope="scope">
            <span> {{ scope.row.comparator }} </span>
          </template>
        </el-table-column>

        <el-table-column prop="data_type" label="数据类型" size="mini" width="180">
          <template slot-scope="scope">
            <el-select v-model="scope.row.data_type" style="width: 100%" size="mini" disabled>
              <el-option
                v-for="(item) in $busEvents.data.dataTypeMappingList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column prop="expect" label="数据值" size="mini" width="300">
          <template slot-scope="scope">
            <span> {{ scope.row.expect }} </span>
          </template>
        </el-table-column>
      </el-table>
    </el-tab-pane>

    <!-- 用例入参 -->
    <el-tab-pane label="用例入参" name="showCaseVariables">
      <showCaseVariables
        :data-type="dataType"
        :case-variables="caseVariables"
        :can-edite="false"
      />
    </el-tab-pane>

    <!-- 用例出参 -->
    <el-tab-pane label="用例出参" name="showCaseExtracts">
      <el-table :data="caseExtracts" :height="tableHeight" stripe style="width: 100%">
        <el-table-column show-overflow-tooltip prop="num" label="序号" size="mini" width="50">
          <template slot-scope="scope">
            <span> {{ scope.$index + 1 }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip prop="key" label="key" size="mini" width="300">
          <template slot-scope="scope">
            <span> {{ scope.row.key }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip prop="remark" label="备注" size="mini" width="450">
          <template slot-scope="scope">
            <span> {{ scope.row.remark }} </span>
          </template>
        </el-table-column>
      </el-table>
    </el-tab-pane>

  </el-tabs>

</template>

<script>
import showCaseVariables from '@/components/business/case/showCaseVariables.vue'
import {
  caseFrom as apiCaseFrom
} from '@/apis/apiTest/case'
import {
  caseFrom as webUiCaseFrom
} from '@/apis/webUiTest/case'
import {
  caseFrom as appUiCaseFrom
} from '@/apis/appUiTest/case'
export default {
  name: 'ShowCaseDesc',
  components: {
    showCaseVariables
  },
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'dataType', 'caseDesc', 'caseSkipIf', 'caseVariables', 'caseExtracts', 'projectId', 'caseId'
  ],
  data() {
    return {
      activeName: 'showCaseInfo',
      tableHeight: '500',
      getCaseFromIsLoading: false,
      caseFrom: undefined,
      getCaseFromUrl: ''
    }
  },

  mounted() {
    this.tableHeight = window.innerHeight * 0.90
  },

  created() {
    if (this.dataType === 'api') {
      this.getCaseFromUrl = apiCaseFrom
    } else if (this.dataType === 'webUi') {
      this.getCaseFromUrl = webUiCaseFrom
    } else {
      this.getCaseFromUrl = appUiCaseFrom
    }
  },

  methods: {
    getCaseFrom() {
      this.getCaseFromIsLoading = true
      this.getCaseFromUrl({ id: this.caseId }).then(response => {
        this.getCaseFromIsLoading = false
        if (this.showMessage(this, response)) {
          this.caseFrom = response.data
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
