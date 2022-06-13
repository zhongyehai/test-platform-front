<template>
  <div class="app-container">

    <el-form label-width="120px">
      <el-form-item :label="'选择环境：'" size="mini">
        <el-select
          v-model="currentEnv"
          placeholder="请选择环境"
          size="mini"
          filterable
          default-first-option
          @change="getAutoTestUserData()"
        >
          <el-option
            v-for="item in envList"
            :key="item"
            :label="item"
            :value="item"
          >
          </el-option>
        </el-select>

      </el-form-item>
    </el-form>

    <el-table
      ref="apiTree"
      v-loading="listLoading"
      :data="currentDataList"
      stripe
      style="width: 100%"
    >
      <el-table-column :show-overflow-tooltip=true label="数据id" min-width="8%">
        <template slot-scope="scope">
          <span> {{ scope.row.id }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="手机号" min-width="10%">
        <template slot-scope="scope">
          <span> {{ scope.row.mobile }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="密码" min-width="22%">
        <template slot-scope="scope">
          <span> {{ scope.row.password }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="token" min-width="25%">
        <template slot-scope="scope">
          <span> {{ scope.row.u_token }} </span>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip=true label="公司名称" min-width="25%">
        <template slot-scope="scope">
          <span> {{ scope.row.company_name }} </span>
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

import {getEnvList, getAutoTestUser} from "@/apis/testWork/dataPool";

export default {
  name: 'dataPool',
  components: {Pagination},
  data() {
    return {
      listLoading: false,  // 加载状态
      currentDataList: [],  // 数据列表
      currentEnv: 'test',  // 选择的环境
      envList: []  // 环境列表
    }
  },

  methods: {

    // 获取环境列表
    getAllEnv(){
      getEnvList().then(response => {
        this.envList = response.data
      })
    },

    // 获取数据池数据
    getAutoTestUserData() {
      getAutoTestUser({'env': this.currentEnv}).then(response => {
        this.currentDataList = response.data
      })
    }
  },

  mounted() {
    this.getAllEnv()
    this.getAutoTestUserData()
  },
}
</script>

<style>

</style>
