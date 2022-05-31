<template>
  <div class="app-container">

    <el-table
      ref="apiTree"
      v-loading="listLoading"
      :data="currentDataList"
      stripe
      style="width: 100%"
    >
      <el-table-column :show-overflow-tooltip=true label="数据id" min-width="10%">
        <template slot-scope="scope">
          <span> {{ scope.row.id }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="手机号" min-width="10%">
        <template slot-scope="scope">
          <span> {{ scope.row.mobile }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="密码" min-width="35%">
        <template slot-scope="scope">
          <span> {{ scope.row.password }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="token" min-width="35%">
        <template slot-scope="scope">
          <span> {{ scope.row.u_token }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="角色" min-width="10%">
        <template slot-scope="scope">
          <span> {{ scope.row.role }} </span>
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<script>
import Pagination from '@/components/Pagination'

import {getAutoTestUser} from "@/apis/testWork/dataPool";

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
    getAutoTestUserData() {
      getAutoTestUser().then(response => {
        this.currentDataList = response.data
      })
    }
  },

  mounted() {
    this.getAutoTestUserData()
  },
}
</script>

<style>

</style>
