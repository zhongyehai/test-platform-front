<template>
  <el-drawer
    title="账号管理"
    size="75%"
    append-to-body
    :wrapper-closable="false"
    :visible.sync="accountManageDrawerIsShow"
    :direction="direction"
  >
    <div style="margin-left: 20px">

      <div class="filter-container">

        <!-- inline="true"，el-form-item不自动换行 -->
        <el-form label-width="60px" :inline="true">

          <el-form-item :label="'环境'" size="mini">
            <el-input v-model="parentName" disabled size="mini" clearable style="width: 200px" />
          </el-form-item>

          <el-form-item :label="'名字'" size="mini">
            <el-input v-model="inputName" placeholder="请输入账号名字" size="mini" clearable style="width: 200px" />
          </el-form-item>

          <el-form-item :label="'账号'" size="mini">
            <el-input v-model="inputAccount" placeholder="请输入账号" size="mini" clearable style="width: 200px" />
          </el-form-item>

          <el-button type="primary" size="mini" @click.native="doQuery('')">查询</el-button>
          <el-button type="primary" size="mini" @click.native="initQuery('')">重置</el-button>
          <el-button type="primary" size="mini" @click.native="showDrawer('')">添加账号</el-button>
        </el-form>

      </div>

      <el-table
        ref="apiTree"
        v-loading="listLoading"
        size="mini"
        :data="currentAccountList"
        stripe
      >
        <el-table-column prop="id" label="编号" align="center" min-width="10%">
          <template slot-scope="scope">
            <span> {{ (pageNum - 1) * pageSize + scope.$index + 1 }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip align="center" label="账号名" min-width="15%">
          <template slot-scope="scope">
            <span> {{ scope.row.name }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip align="center" label="账号" min-width="15%">
          <template slot-scope="scope">
            <span> {{ scope.row.value }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip align="center" label="密码" min-width="30%">
          <template slot-scope="scope">
            <span> {{ scope.row.password }} </span>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip align="center" prop="desc" label="备注" min-width="15%">
          <template slot-scope="scope">
            <span> {{ scope.row.desc }} </span>
          </template>
        </el-table-column>

        <el-table-column label="操作" align="center" min-width="15%">
          <template slot-scope="scope">

            <!--修改账号信息-->
            <el-button
              type="text"
              size="mini"
              style="margin-right: 10px"
              @click="showDrawer(scope.row)"
            >修改</el-button>

            <!-- 删除账号 -->
            <el-popover
              :ref="scope.row.id"
              v-model="scope.row.deletePopoverIsShow"
              placement="top"
              popper-class="down-popover"
            >
              <p>确定删除【{{ scope.row.name }}】?</p>
              <div style="text-align: right; margin: 0">
                <el-button size="mini" type="text" @click="cancelDeletePopover(scope.row)">取消</el-button>
                <el-button type="primary" size="mini" @click="delAccount(scope.row)">确定</el-button>
              </div>
              <el-button
                slot="reference"
                style="color: red"
                type="text"
                size="mini"
                :loading="scope.row.deleteButtonIsLoading"
              >删除</el-button>
            </el-popover>

          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="pageNum"
        :limit.sync="pageSize"
        @pagination="getAccountList"
      />
    </div>

    <!-- 修改账号表单 -->
    <el-drawer
      title="修改账号"
      size="60%"
      append-to-body
      :visible.sync="editAccountDrawerIsShow"
      :direction="direction"
    >

      <el-form
        ref="dataForm"
        :model="accountTemplate"
        label-position="right"
        label-width="90px"
        style="min-width: 400px;margin-left: 20px;margin-right: 20px"
      >

        <el-form-item :label="'账号名字'" class="filter-item is-required" size="mini">
          <el-input v-model="accountTemplate.name" placeholder="账号名字，不可重复" />
        </el-form-item>

        <el-form-item :label="'账号'" class="filter-item is-required" size="mini">
          <el-input v-model="accountTemplate.value" placeholder="账号，不可重复" />
        </el-form-item>

        <el-form-item :label="'密码'" class="filter-item" size="mini">
          <el-input v-model="accountTemplate.password" placeholder="密码" />
        </el-form-item>

        <el-form-item :label="'备注'" class="filter-item" prop="desc" size="mini">
          <el-input v-model="accountTemplate.desc" type="textarea" autosize size="mini" placeholder="备注" />
        </el-form-item>
      </el-form>
      <div class="demo-drawer__footer">
        <el-button size="mini" @click="editAccountDrawerIsShow = false"> {{ '取消' }}</el-button>
        <el-button
          size="mini"
          type="primary"
          :loading="submitButtonIsLoading"
          @click="changeAccount()"
        >
          {{ '保存' }}
        </el-button>
      </div>
    </el-drawer>

    <el-drawer
      title="新增账号"
      size="80%"
      append-to-body
      :wrapper-closable="false"
      :visible.sync="addAccountDrawerIsShow"
      :direction="direction"
    >

      <addTable
        ref="addTable"
        :is-show="addAccountDrawerIsShow"
        :add-type="'account'"
      />
      <div class="demo-drawer__footer">
        <el-button size="mini" @click="addAccountDrawerIsShow = false"> {{ '取消' }}</el-button>
        <el-button
          size="mini"
          type="primary"
          :loading="submitButtonIsLoading"
          @click="addAccount()"
        >
          {{ '保存' }}
        </el-button>
      </div>
    </el-drawer>

  </el-drawer>
</template>

<script>
import Pagination from '@/components/Pagination'

import {
  envList,
  postEnv,
  putEnv,
  deleteEnv
} from '@/apis/testWork/env'
import addTable from '@/views/testWork/env/addTable.vue'

export default {
  name: 'Index',
  components: { addTable, Pagination },
  data() {
    return {
      direction: 'rtl', // 抽屉打开方式
      listLoading: false, // 加载状态
      submitButtonIsLoading: false,
      deleteButtonIsLoading: false,
      editAccountDrawerIsShow: false, // 编辑账号抽屉是否展示
      addAccountDrawerIsShow: false, // 编辑账号抽屉是否展示
      accountManageDrawerIsShow: false, // 账号列表抽屉是否展示

      parentId: '', // 选中的账号
      parentName: '', // 选中的账号
      inputName: '', // 输入的名字
      inputAccount: '', // 输入的账号

      currentAccountList: [], // 账号资源列表
      accountTemplate: {
        id: '',
        parent: '',
        name: '',
        source_type: 'account',
        value: '',
        password: '',
        desc: ''
      },
      total: 0,
      pageNum: 1,
      pageSize: 20
    }
  },

  mounted() {
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, env) => {
      if (_type === 'showEnvAccount') {
        this.parentId = env.id
        this.parentName = env.name
        this.accountManageDrawerIsShow = true
        this.getAccountList()
      }
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsShow)
  },

  methods: {

    // 获取账号列表
    getAccountList() {
      envList({
        'pageNum': this.pageNum,
        'pageSize': this.pageSize,
        'parent': this.parentId,
        'name': this.inputName,
        'value': this.inputAccount
      }).then(response => {
        this.currentAccountList = response.data.data
        this.total = response.data.total
      })
    },

    // 执行查询
    doQuery() {
      this.pageNum = 1
      this.pageSize = 20
      this.getAccountList()
    },

    // 重置
    initQuery() {
      this.pageNum = 1
      this.pageSize = 20
      this.inputName = ''
      this.inputAccount = ''
      this.getAccountList()
    },

    // 初始化新账号
    initNewAccount() {
      this.accountTemplate.id = ''
      this.accountTemplate.parent = this.parentId
      this.accountTemplate.name = ''
      this.accountTemplate.value = ''
      this.accountTemplate.password = ''
      this.accountTemplate.desc = ''
    },

    // 打开抽屉
    showDrawer(row) {
      console.log()
      if (row) { // 修改
        this.accountTemplate = JSON.parse(JSON.stringify(row))
        this.editAccountDrawerIsShow = true
      } else { // 增加
        this.initNewAccount()
        this.addAccountDrawerIsShow = true
      }
    },

    // 添加账号
    addAccount() {
      this.submitButtonIsLoading = true
      this.accountTemplate.data_list = this.$refs.addTable.tempData
      postEnv(this.accountTemplate).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.addAccountDrawerIsShow = false
          this.getAccountList()
        }
      })
    },

    // 修改账号
    changeAccount() {
      this.submitButtonIsLoading = true
      putEnv(this.accountTemplate).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.editAccountDrawerIsShow = false
          this.getAccountList()
        }
      })
    },

    cancelDeletePopover(row) {
      this.$set(row, 'deletePopoverIsShow', false)
    },

    // 删除账号
    delAccount(row) {
      this.$set(row, 'deletePopoverIsShow', false)
      this.$set(row, 'deleteButtonIsLoading', true)
      deleteEnv({ 'id': row.id }).then(response => {
        this.$set(row, 'deleteButtonIsLoading', false)
        if (this.showMessage(this, response)) {
          this.getAccountList()
        }
      })
    }
  }
}
</script>

<style>

</style>
