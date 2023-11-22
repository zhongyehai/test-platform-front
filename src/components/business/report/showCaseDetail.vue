<template>
  <div>
    <el-collapse v-model="defaultShowDetailInfo">
      <el-collapse-item name="error_msg">
        <template slot="title">
          <div class="el-collapse-item-title"> {{ '错误信息：' }}</div>
        </template>
        <pre class="el-collapse-item-content" style="overflow: auto; color: #FA6E86">{{ reportCaseData.error_msg }}</pre>
      </el-collapse-item>

      <el-collapse-item name="caseInfo">
        <template slot="title">
          <div class="el-collapse-item-title"> {{ '用例信息：' }}</div>
        </template>
        <el-descriptions class="margin-top" :column="2" border>
          <el-descriptions-item>
            <template slot="label"> 用例名 </template>
            {{ reportCaseData.name }}
          </el-descriptions-item>

          <el-descriptions-item>
            <template slot="label"> 执行结果 </template>
            <el-tag
              size="small"
              :type="resultTagMapping[reportCaseData.result]"
            >{{ resultMapping[reportCaseData.result] }}</el-tag>
          </el-descriptions-item>

          <el-descriptions-item>
            <template slot="label"> 开始时间 </template>
            {{ reportCaseData.summary.time.start_at }}
          </el-descriptions-item>

          <el-descriptions-item>
            <template slot="label"> 结束时间 </template>
            {{ reportCaseData.summary.time.end_at }}
          </el-descriptions-item>

          <el-descriptions-item>
            <template slot="label">
              <span> 执行用例耗时 </span>
              <el-tooltip class="item" effect="dark" placement="top-start">
                <div slot="content">
                  <div>执行此用例耗费的时间，不包含数据解析、数据写库时间</div>
                </div>
                <span><i style="color: #409EFF" class="el-icon-question" /></span>
              </el-tooltip>
            </template>
            {{ reportCaseData.summary.time.case_duration }} 秒
          </el-descriptions-item>

          <el-descriptions-item>
            <template slot="label">
              <span> 执行步骤总耗时 </span>
              <el-tooltip class="item" effect="dark" placement="top-start">
                <div slot="content">
                  <div>执行此用例下的所有步骤的总耗时</div>
                </div>
                <span><i style="color: #409EFF" class="el-icon-question" /></span>
              </el-tooltip>
            </template>
            {{ reportCaseData.summary.time.step_duration }} 毫秒
          </el-descriptions-item>

          <el-descriptions-item>
            <template slot="label">
              <span> 执行测试总共耗时 </span>
              <el-tooltip class="item" effect="dark" placement="top-start">
                <div slot="content">
                  <div>包含数据解析、数据写库时间</div>
                </div>
                <span><i style="color: #409EFF" class="el-icon-question" /></span>
              </el-tooltip>
            </template>
            {{ reportCaseData.summary.time.all_duration }} 秒
          </el-descriptions-item>

        </el-descriptions>
      </el-collapse-item>

      <el-collapse-item name="stepInfo">
        <template slot="title">
          <div class="el-collapse-item-title"> {{ '步骤统计：' }}</div>
        </template>
        <el-descriptions class="margin-top" :column="3" border>

          <el-descriptions-item>
            <template slot="label"> 通过数量 </template>
            <el-tag
              size="small"
              :type="resultTagMapping['success']"
            >{{ reportCaseData.summary.stat.success }}</el-tag>
          </el-descriptions-item>

          <el-descriptions-item>
            <template slot="label"> 不通过数量 </template>
            <el-tag
              size="small"
              :type="resultTagMapping['fail']"
            >{{ reportCaseData.summary.stat.fail }}</el-tag>
          </el-descriptions-item>

          <el-descriptions-item>
            <template slot="label"> 错误数量 </template>
            <el-tag
              size="small"
              :type="resultTagMapping['error']"
            >{{ reportCaseData.summary.stat.error }}</el-tag>
          </el-descriptions-item>

          <el-descriptions-item>
            <template slot="label"> 跳过数量 </template>
            <el-tag
              size="small"
              :type="resultTagMapping['skip']"
            >{{ reportCaseData.summary.stat.skip }}</el-tag>
          </el-descriptions-item>

          <el-descriptions-item>
            <template slot="label"> 总数 </template>
            <el-tag
              size="small"
            >{{ reportCaseData.summary.stat.total }}</el-tag>
          </el-descriptions-item>

        </el-descriptions>
      </el-collapse-item>

      <el-collapse-item name="variables">
        <template slot="title">
          <div class="el-collapse-item-title"> {{ '变量信息：' }}</div>
        </template>

        <el-table
          :data="reportCaseData.case_data.variables"
          size="mini"
          stripe
        >
          <el-table-column prop="num" label="序号" align="center" min-width="10%">
            <template slot-scope="scope">
              <span> {{ scope.$index + 1 }} </span>
            </template>
          </el-table-column>

          <el-table-column show-overflow-tooltip prop="key" label="变量名称" align="center" min-width="45%">
            <template slot-scope="scope">
              <span>
                {{ scope.row.key }}
              </span>
            </template>
          </el-table-column>

          <el-table-column show-overflow-tooltip prop="value" label="变量值" align="center" min-width="45%">
            <template slot-scope="scope">
              <span>
                {{ scope.row.value }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </el-collapse-item>

      <el-collapse-item name="headers">
        <template slot="title">
          <div class="el-collapse-item-title"> {{ '头部信息：' }}</div>
        </template>
        <el-table
          :data="reportCaseData.case_data.headers"
          size="mini"
          stripe
        >
          <el-table-column prop="num" label="序号" align="center" min-width="10%">
            <template slot-scope="scope">
              <span> {{ scope.$index + 1 }} </span>
            </template>
          </el-table-column>

          <el-table-column show-overflow-tooltip prop="key" label="key" align="center" min-width="45%">
            <template slot-scope="scope">
              <span>
                {{ scope.row.key }}
              </span>
            </template>
          </el-table-column>

          <el-table-column show-overflow-tooltip prop="value" label="value" align="center" min-width="45%">
            <template slot-scope="scope">
              <span>
                {{ scope.row.value }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </el-collapse-item>

      <el-collapse-item name="skipIf">
        <template slot="title">
          <div class="el-collapse-item-title"> {{ '跳过条件：' }}</div>
        </template>
        <skipIfView
          ref="skipIfView"
          :data-type="dataType"
          :skip-if-data="reportCaseData.case_data.skip_if"
          :env-list="[]"
          :use-type="'case'"
        />
      </el-collapse-item>

    </el-collapse>
  </div>
</template>

<script>

import skipIfView from '@/components/Inputs/skipIf.vue'

export default {
  name: 'ShowCase',
  components: {
    skipIfView
  },
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'dataType', 'reportCaseData'
  ],

  data() {
    return {
      defaultShowDetailInfo: ['caseInfo', 'stepInfo', this.reportCaseData.error_msg ? 'error_msg' : ''],
      resultMapping: {
        'waite': '等待',
        'running': '执行中',
        'fail': '不通过',
        'success': '通过',
        'skip': '跳过',
        'error': '报错'
      },
      resultTagMapping: {
        'waite': 'info',
        'running': '',
        'fail': 'danger',
        'success': 'success',
        'skip': 'info',
        'error': 'warning'
      }
    }
  },

  methods: {

  }
}

</script>

<style scoped>
.el-collapse-item-title {
  font-weight: 600;
  font-size: 15px;
  margin-left: 10px;
  color: #409eff
}
</style>
