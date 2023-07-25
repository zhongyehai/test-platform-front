<template>
  <div class="app-container">

    <div class="filter-container">
      <el-form label-width="70px" :inline="true">

        <el-form-item :label="'选择环境'" size="mini">
          <el-select
            v-model="listQuery.env"
            :placeholder="'选择环境'"
            clearable
            filterable
            size="mini"
            class="filter-item"
            style="width: 100%"
          >
            <el-option v-for="env in runEnvList" :key="env.code" :label="env.name" :value="env.code" />
          </el-select>
        </el-form-item>

        <el-form-item :label="'手机号'" size="mini">
          <el-input
            v-model="listQuery.mobile"
            class="input-with-select"
            placeholder="支持模糊搜索"
            size="mini"
            clearable
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item :label="'流水号'" size="mini">
          <el-input
            v-model="listQuery.business_order_no"
            placeholder="支持模糊搜索"
            size="mini"
            clearable
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item :label="'业务状态'" size="mini">
          <el-select
            v-model="listQuery.business_status"
            :placeholder="'选择业务状态'"
            clearable
            filterable
            size="mini"
            class="filter-item"
          >
            <el-option v-for="status in businessStatusList" :key="status" :label="status" :value="status" />
          </el-select>
        </el-form-item>

        <el-form-item :label="'使用状态'" size="mini">
          <el-select
            v-model="listQuery.use_status"
            :placeholder="'选择使用状态'"
            clearable
            filterable
            default-first-option
            size="mini"
            class="filter-item"
          >
            <el-option v-for="(value, key) in useStatusList" :key="key" :label="value" :value="key" />
          </el-select>
        </el-form-item>

        <el-button type="primary" size="mini" @click="getDataPoolList()">搜索</el-button>
        <el-button class="filter-item" style="margin-left: 10px;" type="primary" size="mini" @click="addConfig">
          添加数据
        </el-button>

      </el-form>
    </div>

    <el-table
      ref="apiTree"
      size="mini"
      highlight-current-row
      :data="dataPoolList"
      stripe
    >
      <el-table-column prop="id" label="编号" align="center" min-width="5%">
        <template slot-scope="scope">
          <span> {{ (listQuery.pageNum - 1) * listQuery.pageSize + scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" prop="env" align="center" label="环境" min-width="10%">
        <template slot-scope="scope">
          <span> {{ runEnvDict[scope.row.env] }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" prop="mobile" align="center" label="手机号" min-width="10%">
        <template slot-scope="scope">
          <span> {{ scope.row.mobile }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" prop="password" align="center" label="密码" min-width="10%">
        <template slot-scope="scope">
          <span> {{ scope.row.password }} </span>
        </template>
      </el-table-column>

      <el-table-column
        :show-overflow-tooltip="true"
        prop="business_order_no"
        align="center"
        label="订单号"
        min-width="15%"
      >
        <template slot-scope="scope">
          <span> {{ scope.row.business_order_no }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" prop="amount" align="center" label="金额" min-width="10%">
        <template slot-scope="scope">
          <span> {{ scope.row.amount }} </span>
        </template>
      </el-table-column>

      <el-table-column
        :show-overflow-tooltip="true"
        prop="business_status"
        align="center"
        label="业务状态"
        min-width="10%"
      >
        <template slot-scope="scope">
          <span> {{ scope.row.business_status }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" prop="use_status" align="center" label="使用状态" min-width="10%">
        <template slot-scope="scope">
          <el-tag
            size="mini"
            :type="scope.row.use_status === 'not_used' ? 'success' :
              scope.row.use_status === 'used' ? 'danger' : ''"
          >{{ useStatusList[scope.row.use_status] }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" prop="desc" align="center" label="描述" min-width="10%">
        <template slot-scope="scope">
          <span>{{ scope.row.desc }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" min-width="5%">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="mini"
            @click.native="editConfig(scope.row)"
          >修改</el-button>
        </template>
      </el-table-column>

    </el-table>

    <pagination
      v-show="dataPoolList.length>0"
      :total="dataPoolList.length"
      :page.sync="listQuery.pageNum"
      :limit.sync="listQuery.pageSize"
      @pagination="getDataPoolList"
    />

    <dataPoolDrawer
      :run-env-list="runEnvList"
      :use-status-list="useStatusList"
      :business-status-list="businessStatusList"
    />
  </div>
</template>

<script>

import Pagination from '@/components/Pagination'
import dataPoolDrawer from './drawer'

import { runEnvList } from '@/apis/config/runEnv'
import { dataPoolList, dataPoolBusinessStatus, dataPoolUseStatus } from '@/apis/assist/dataPool'

export default {
  name: 'DataPool',
  components: {
    Pagination,
    dataPoolDrawer
  },
  data() {
    return {
      listQuery: {
        pageNum: 1,
        pageSize: 20,
        env: undefined,
        mobile: undefined,
        business_order_no: undefined,
        business_status: undefined,
        use_status: undefined
      },
      businessStatusList: [],
      useStatusList: [],
      runEnvList: [],
      runEnvDict: {},
      dataPoolList: [] // 数据池列表
    }
  },

  mounted() {
    // 业务状态
    dataPoolBusinessStatus().then(res => {
      this.businessStatusList = res.data
    })

    // 使用状态
    dataPoolUseStatus().then(res => {
      this.useStatusList = res.data
    })

    // 运行环境
    runEnvList().then(response => {
      this.runEnvList = response.data.data
      this.runEnvList.forEach(env => {
        this.runEnvDict[env.code] = env.name
      })
    })

    this.getDataPoolList()

    this.$bus.$on(this.$busEvents.drawerIsCommit, (_type) => {
      if (_type === 'dataPool') {
        this.getDataPoolList()
      }
    })
  },

  // 页面销毁前，关闭bus监听服务选中事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsCommit)
  },

  methods: {

    // 获取数据池列表
    getDataPoolList() {
      dataPoolList(this.listQuery).then(response => {
        this.dataPoolList = response.data.data
      })
    },

    // 点击编辑参数，把被点击的用例信息赋值给临时模板
    editConfig(row) {
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'dataPool', 'edit', JSON.parse(JSON.stringify(row)))
    },

    // 添加参数
    addConfig() {
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'dataPool', 'add')
    }
  }
}
</script>

<style scoped>

</style>

