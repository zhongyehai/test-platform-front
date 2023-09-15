<template>
  <el-table :data="caseVariables" :height="tableHeight" stripe style="width: 100%" size="mini">
    <el-table-column show-overflow-tooltip prop="num" label="序号" size="mini" width="50">
      <template slot-scope="scope">
        <span> {{ scope.$index + 1 }} </span>
      </template>
    </el-table-column>

    <el-table-column show-overflow-tooltip prop="key" label="key" size="mini" width="200">
      <template slot-scope="scope">
        <span> {{ scope.row.key }} </span>
      </template>
    </el-table-column>

    <el-table-column show-overflow-tooltip prop="value" label="value" size="mini" width="400">
      <template slot-scope="scope">
        <el-input
          v-if="canEdite"
          v-model="scope.row.value"
          size="mini"
          type="textarea"
          :rows="1"
        />
        <span v-else> {{ scope.row.value }} </span>

      </template>
    </el-table-column>

    <el-table-column show-overflow-tooltip prop="value" label="数据类型" size="mini" width="180">
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

    <el-table-column show-overflow-tooltip prop="remark" label="备注" size="mini" width="450">
      <template slot-scope="scope">
        <span> {{ scope.row.remark }} </span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>

export default {
  name: 'ShowCaseDesc',
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'dataType', 'caseVariables', 'canEdite'
  ],

  data() {
    return {
      activeName: 'caseInfo',
      tableHeight: '500'
    }
  },

  mounted() {
    this.tableHeight = window.innerHeight * 0.90
  }
}
</script>

<style scoped>

</style>
