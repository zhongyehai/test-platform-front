<template>
  <div class="app-container">

    <div class="filter-container">

      <!-- inline="true"，el-form-item不自动换行 -->
      <el-form label-width="80px" :inline="true">

        <el-form-item :label="'业务线'" size="mini">
          <el-select
            v-model="selectBusiness"
            filterable
            multiple
            placeholder="业务线"
            size="mini"
            @change="getEnvList"
          >
            <el-option
              v-for="business in $busEvents.data.businessList"
              :key="business.id"
              :label="business.name"
              :value="business.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="'环境名'" size="mini">
          <el-input
            v-model="inputName"
            placeholder="请输入环境名关键字"
            size="mini"
            clearable
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item :label="'域名地址'" size="mini">
          <el-input
            v-model="inputAddr"
            placeholder="请输入域名地址关键字"
            size="mini"
            clearable
            style="width: 350px"
          />
        </el-form-item>

        <el-button type="primary" size="mini" @click.native="doQuery('')">查询</el-button>
        <el-button type="primary" size="mini" @click.native="initQuery('')">重置</el-button>
        <el-button type="primary" size="mini" @click.native="showDrawer('')">添加环境</el-button>
      </el-form>

    </div>

    <el-table
      ref="apiTree"
      v-loading="listLoading"
      :data="currentEnvList"
      stripe
    >
      <el-table-column prop="id" label="编号" align="center" min-width="10%">
        <template slot-scope="scope">
          <span> {{ (pageNum - 1) * pageSize + scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" align="center" label="业务线" min-width="15%">
        <template slot-scope="scope">
          <span> {{ $busEvents.data.businessDict[scope.row.business] }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" align="center" label="环境名" min-width="15%">
        <template slot-scope="scope">
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" align="center" label="环境域名" min-width="30%">
        <template slot-scope="scope">
          <a :href="scope.row.value" target="_blank" style="color: #3a8ee6">
            {{ scope.row.value }}
          </a>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" align="center" prop="desc" label="备注" min-width="15%">
        <template slot-scope="scope">
          <span> {{ scope.row.desc }} </span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" min-width="15%">
        <template slot-scope="scope">

          <!--修改环境信息-->
          <el-button
            type="text"
            size="mini"
            style="margin-right: 10px"
            @click="showDrawer(scope.row)"
          >修改
          </el-button>

          <!--修改环境信息-->
          <el-button
            type="text"
            size="mini"
            style="margin-right: 10px"
            @click="showAccountDrawer(scope.row)"
          >账号列表
          </el-button>

          <!-- 删除环境 -->
          <el-popover
            :ref="scope.row.id"
            v-model="scope.row.deletePopoverIsShow"
            placement="top"
            popper-class="down-popover"
          >
            <p>确定删除【{{ scope.row.name }}】?</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="cancelDeletePopover(scope.row)">取消</el-button>
              <el-button type="primary" size="mini" @click="delEnv(scope.row)">确定</el-button>
            </div>
            <el-button
              slot="reference"
              style="color: red"
              type="text"
              size="mini"
              :loading="scope.row.deleteButtonIsLoading"
            >删除
            </el-button>
          </el-popover>

        </template>
      </el-table-column>
    </el-table>

    <!-- 修改环境表单 -->
    <el-drawer
      title="修改环境"
      size="60%"
      :visible.sync="editDrawerIsShow"
      :direction="direction"
    >

      <el-form
        ref="dataForm"
        :model="envTemplate"
        label-position="right"
        label-width="90px"
        style="min-width: 400px;margin-left: 20px;margin-right: 20px"
      >

        <el-form-item class="filter-item is-required" :label="'业务线'" size="mini">
          <el-select
            v-model="envTemplate.business"
            filterable
            allow-create
            default-first-option
            placeholder="业务线"
            size="mini"
            style="width:100%"
          >
            <el-option
              v-for="business in $busEvents.data.businessList"
              :key="business.id"
              :label="business.name"
              :value="business.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="'环境名字'" class="filter-item is-required" size="mini">
          <el-input v-model="envTemplate.name" placeholder="环境名字，不可重复" />
        </el-form-item>

        <el-form-item :label="'域名地址'" class="filter-item is-required" size="mini">
          <el-input v-model="envTemplate.value" placeholder="域名地址" />
        </el-form-item>

        <el-form-item :label="'备注'" class="filter-item" prop="desc" size="mini">
          <el-input v-model="envTemplate.desc" type="textarea" autosize size="mini" placeholder="备注" />
        </el-form-item>
      </el-form>
      <div class="demo-drawer__footer">
        <el-button size="mini" @click="editDrawerIsShow = false"> {{ '取消' }}</el-button>
        <el-button
          size="mini"
          type="primary"
          :loading="submitButtonIsLoading"
          @click="changeEnv()"
        >
          {{ '保存' }}
        </el-button>
      </div>
    </el-drawer>

    <el-drawer
      title="新增环境"
      size="70%"
      :wrapper-closable="false"
      :visible.sync="addDrawerIsShow"
      :direction="direction"
    >

      <el-form
        ref="dataForm"
        :model="envTemplate"
        label-position="right"
        label-width="70px"
        style="min-width: 400px;margin-left: 20px;margin-right: 20px"
      >

        <el-form-item class="filter-item is-required" :label="'业务线'" size="mini">
          <el-select
            v-model="envTemplate.business"
            filterable
            allow-create
            default-first-option
            placeholder="选择业务线"
            size="mini"
            style="width:100%"
          >
            <el-option
              v-for="business in $busEvents.data.businessList"
              :key="business.id"
              :label="business.name"
              :value="business.id"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <addTable
        ref="addTable"
        :is-show="addDrawerIsShow"
        :add-type="'addr'"
      />
      <div class="demo-drawer__footer">
        <el-button size="mini" @click="editDrawerIsShow = false"> {{ '取消' }}</el-button>
        <el-button
          size="mini"
          type="primary"
          :loading="submitButtonIsLoading"
          @click="addEnv()"
        >
          {{ '保存' }}
        </el-button>
      </div>
    </el-drawer>

    <!-- 分页组件 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="pageNum"
      :limit.sync="pageSize"
      @pagination="getEnvList"
    />

    <accountManage />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import addTable from '@/views/testWork/env/addTable.vue'
import accountManage from './account'

import {
  envList,
  postEnv,
  putEnv,
  deleteEnv
} from '@/apis/testWork/env'
import { businessList } from '@/apis/config/business'

export default {
  name: 'Index',
  components: {
    Pagination,
    addTable,
    accountManage
  },
  data() {
    return {
      direction: 'rtl', // 抽屉打开方式
      listLoading: false, // 加载状态
      submitButtonIsLoading: false,
      deleteButtonIsLoading: false,
      editDrawerIsShow: false, // 抽屉是否展示
      addDrawerIsShow: false, // 抽屉是否展示
      selectBusiness: [], // 选中的业务线
      inputAddr: '', // 输入的域名地址
      inputName: '', // 输入的环境名字
      businessList: [], // 业务线列表
      currentEnvList: [], // 环境资源列表
      envTemplate: {
        id: '',
        business: '',
        name: '',
        source_type: 'addr',
        value: '',
        desc: ''
      },
      total: 0,
      pageNum: 1,
      pageSize: 20
    }
  },

  mounted() {
    // 获取业务线
    if (this.$busEvents.data.businessList.length < 1) {
      businessList().then(response => {
        this.$busEvents.data.businessList = response.data.data
        this.$busEvents.data.businessDict = {}
        this.$busEvents.data.businessList.forEach(business => {
          this.$busEvents.data.businessDict[business.id] = business.name
        })
        this.getEnvList()
      })
    }
  },

  methods: {

    // 获取环境列表
    getEnvList() {
      envList({
        'pageNum': this.pageNum,
        'pageSize': this.pageSize,
        'source_type': 'addr',
        'value': this.inputAddr,
        'name': this.inputName,
        'business': this.selectBusiness
      }).then(response => {
        this.currentEnvList = response.data.data
        this.total = response.data.total
      })
    },

    // 执行查询
    doQuery() {
      this.pageNum = 1
      this.pageSize = 20
      this.getEnvList()
    },

    // 重置
    initQuery() {
      this.pageNum = 1
      this.pageSize = 20
      this.selectBusiness = []
      this.inputAddr = ''
      this.inputName = ''
      this.getEnvList()
    },

    // 初始化新环境
    initNewEnv() {
      this.envTemplate.id = ''
      this.envTemplate.business = this.selectBusiness.length > 0 ? this.selectBusiness[0] : ''
      this.envTemplate.name = ''
      this.envTemplate.value = ''
      this.envTemplate.desc = ''
    },

    // 打开抽屉
    showDrawer(row) {
      if (row) { // 修改
        this.envTemplate = JSON.parse(JSON.stringify(row))
        this.editDrawerIsShow = true
      } else { // 增加
        this.initNewEnv()
        this.addDrawerIsShow = true
      }
    },

    // 打开账号管理
    showAccountDrawer(row) {
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'showEnvAccount', row)
    },

    // 添加环境
    addEnv() {
      this.submitButtonIsLoading = true
      this.envTemplate.data_list = this.$refs.addTable.tempData
      postEnv(this.envTemplate).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.addDrawerIsShow = false
          this.getEnvList()
        }
      })
    },

    // 修改环境
    changeEnv() {
      this.submitButtonIsLoading = true
      putEnv(this.envTemplate).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.editDrawerIsShow = false
          this.getEnvList()
        }
      })
    },

    cancelDeletePopover(row) {
      this.$set(row, 'deletePopoverIsShow', false)
    },

    // 删除环境
    delEnv(row) {
      this.$set(row, 'deletePopoverIsShow', false)
      this.$set(row, 'deleteButtonIsLoading', true)
      deleteEnv({ 'id': row.id }).then(response => {
        this.$set(row, 'deleteButtonIsLoading', false)
        if (this.showMessage(this, response)) {
          this.getEnvList()
        }
      })
    }
  }
}
</script>

<style>

</style>
