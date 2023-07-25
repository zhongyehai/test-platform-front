<template>

  <el-collapse v-model="defaultShowDetailInfo">
    <el-collapse-item name="caseInfo">
      <template slot="title">
        <div class="el-collapse-item-title"> {{ '用例信息：' }}</div>
      </template>
      <el-descriptions class="margin-top" :column="2" border>
        <el-descriptions-item>
          <template slot="label"> 用例名 </template>
          {{ caseData.name }}
        </el-descriptions-item>

        <el-descriptions-item>
          <template slot="label"> 执行状态 </template>
          <el-tag
            size="small"
            :type="resultTagMapping[caseData.result]"
          >{{ resultMapping[caseData.result] }}</el-tag>
        </el-descriptions-item>

        <el-descriptions-item>
          <template slot="label"> 错误信息 </template>
          {{ caseData.error_msg }}
        </el-descriptions-item>
      </el-descriptions>
    </el-collapse-item>

    <el-collapse-item name="variables">
      <template slot="title">
        <div class="el-collapse-item-title"> {{ '变量信息：' }}</div>
      </template>

      <el-table
        :data="caseData.case_data.variables"
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
        :data="caseData.case_data.headers"
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

  </el-collapse>

</template>

<script>

// import JsonViewer from 'vue-json-viewer'

export default {
  name: 'ShowCase',
  components: {
    // JsonViewer
  },
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'dataType', 'caseData'
  ],

  data() {
    return {
      defaultShowDetailInfo: ['caseInfo'],
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
