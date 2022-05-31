<template>
  <div class="app-container">

    <el-table
      ref="apiTree"
      v-loading="listLoading"
      :data="currentDataList"
      stripe
      style="width: 100%"
    >
      <el-table-column :show-overflow-tooltip=true label="数据id" width="100">
        <template slot-scope="scope">
          <span> {{ scope.row.id }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="asset_code" width="100">
        <template slot-scope="scope">
          <span> {{ scope.row.asset_code }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="payment_no" width="120">
        <template slot-scope="scope">
          <span> {{ scope.row.payment_no }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="bill_code" width="100">
        <template slot-scope="scope">
          <span> {{ scope.row.bill_code }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="batch_no" width="100">
        <template slot-scope="scope">
          <span> {{ scope.row.batch_no }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="batch_code" width="100">
        <template slot-scope="scope">
          <span> {{ scope.row.batch_code }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="confirm_date" width="120">
        <template slot-scope="scope">
          <span> {{ scope.row.confirm_date }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="product_id" width="100">
        <template slot-scope="scope">
          <span> {{ scope.row.product_id }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="product_name" width="120">
        <template slot-scope="scope">
          <span> {{ scope.row.product_name }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="supplier_org_id" width="130">
        <template slot-scope="scope">
          <span> {{ scope.row.supplier_org_id }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="supplier_org_name" width="150">
        <template slot-scope="scope">
          <span> {{ scope.row.supplier_org_name }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="project_org_id" width="120">
        <template slot-scope="scope">
          <span> {{ scope.row.project_org_id }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="project_org_name" width="150">
        <template slot-scope="scope">
          <span> {{ scope.row.project_org_name }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="purchaser_org_name" width="170">
        <template slot-scope="scope">
          <span> {{ scope.row.purchaser_org_name }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="purchaser_org_id" width="140">
        <template slot-scope="scope">
          <span> {{ scope.row.purchaser_org_id }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="finance_money" width="130">
        <template slot-scope="scope">
          <span> {{ scope.row.finance_money }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="file_upload" width="100">
        <template slot-scope="scope">
          <span> {{ scope.row.file_upload }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="pledge_init" width="100">
        <template slot-scope="scope">
          <span> {{ scope.row.pledge_init }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="agreement_create" width="150">
        <template slot-scope="scope">
          <span> {{ scope.row.agreement_create }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="document_collect_status" width="200">
        <template slot-scope="scope">
          <span> {{ scope.row.document_collect_status }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="access_audit_status" width="160">
        <template slot-scope="scope">
          <span> {{ scope.row.access_audit_status }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="filter_compare_status" width="170">
        <template slot-scope="scope">
          <span> {{ scope.row.filter_compare_status }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="six_order_match_status" width="190">
        <template slot-scope="scope">
          <span> {{ scope.row.six_order_match_status }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="pledge_init_status" width="150">
        <template slot-scope="scope">
          <span> {{ scope.row.pledge_init_status }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="agreement_audit_status" width="190">
        <template slot-scope="scope">
          <span> {{ scope.row.agreement_audit_status }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="pledge_status" width="120">
        <template slot-scope="scope">
          <span> {{ scope.row.pledge_status }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="exception_status" width="150">
        <template slot-scope="scope">
          <span> {{ scope.row.exception_status }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="eliminate_apply_status" width="180">
        <template slot-scope="scope">
          <span> {{ scope.row.eliminate_apply_status }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="revoke_status" width="120">
        <template slot-scope="scope">
          <span> {{ scope.row.revoke_status }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="enable_flag" width="100">
        <template slot-scope="scope">
          <span> {{ scope.row.enable_flag }} </span>
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<script>
import Pagination from '@/components/Pagination'

import {getDataPool} from "@/apis/testWork/dataPool";

export default {
  name: 'dataPool',
  components: {Pagination},
  data() {
    return {
      // 加载状态
      listLoading: false,

      // 数据列表
      currentDataList: []
    }
  },

  methods: {

    // 获取数据池数据
    getDataPoolData() {
      getDataPool().then(response => {
        this.currentDataList = response.data
      })
    }
  },

  mounted() {
    this.getDataPoolData()
  },
}
</script>

<style>

</style>
