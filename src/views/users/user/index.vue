<template>
  <div class="app-container">

    <!-- inline="true"，el-form-item不自动换行 -->
    <el-form label-width="65px" :inline="true">

      <el-form-item :label="'用户：'" size="mini">
        <el-input
          v-model="listQuery.name"
          :placeholder="'用户名'"
          style="width: 100%"
          class="filter-item"
          size="mini"
          @keyup.enter.native="handleFilter"
        />
      </el-form-item>

      <el-form-item :label="'账号：'" size="mini">
        <el-input
          v-model="listQuery.account"
          :placeholder="'账号'"
          style="width: 100%"
          class="filter-item"
          size="mini"
          @keyup.enter.native="handleFilter"
        />
      </el-form-item>

      <el-form-item :label="'状态：'" size="mini">
        <el-select
          v-model="listQuery.status"
          :placeholder="'状态'"
          clearable
          filterable
          default-first-option
          size="mini"
          class="filter-item"
        >
          <el-option v-for="status in status_list" :key="status.name" :label="status.name" :value="status.id" />
        </el-select>
      </el-form-item>

      <!--      <el-form-item :label="'角色：'" size="mini">-->
      <!--        <el-select-->
      <!--          v-model="listQuery.role_id"-->
      <!--          :placeholder="'角色'"-->
      <!--          clearable-->
      <!--          filterable-->
      <!--          default-first-option-->
      <!--          size="mini"-->
      <!--          class="filter-item"-->
      <!--        >-->
      <!--          <el-option v-for="role in role_list" :key="role.name" :label="role.name" :value="role.id"/>-->
      <!--        </el-select>-->
      <!--      </el-form-item>-->

      <el-button v-waves class="filter-item" type="primary" size="mini" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" type="primary" size="mini" @click="handleCreate">添加</el-button>
      <el-button class="filter-item" type="primary" size="mini" @click="handleInitListQuery">重置</el-button>

    </el-form>

    <!-- 表格栏 -->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="user_list"
      fit
      stripe
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column :label="'序号'" prop="id" align="center" min-width="10%">
        <template slot-scope="scope">
          <span> {{ (listQuery.pageNum - 1) * listQuery.pageSize + scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column :label="'用户名'" prop="name" align="center" min-width="20%">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'账号'" prop="account" align="center" min-width="20%">
        <template slot-scope="scope">
          <span>{{ scope.row.account }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" prop="status" label="启用状态" min-width="15%">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status === 1"
            :disabled="scope.row.changStatusIsDisabled"
            @change="changStatus(scope.row)"
          />
        </template>
      </el-table-column>

      <el-table-column :label="'创建时间'" prop="created_time" align="center" min-width="20%">
        <template slot-scope="scope">
          <span>{{ scope.row.created_time }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'操作'" align="center" min-width="15%">
        <template slot-scope="{row, $index}">

          <!--编辑用户-->
          <el-button
            type="text"
            size="mini"
            style="margin-right: 10px"
            @click="handleUpdate(row)"
          >修改
          </el-button>

          <!-- 删除账号 -->
          <!--          <el-popover-->
          <!--            :ref="row.id"-->
          <!--            placement="top"-->
          <!--            popper-class="down-popover"-->
          <!--            v-model="row.deletePopoverIsShow">-->
          <!--            <p>确定删除【{{ row.name }}】?</p>-->
          <!--            <div style="text-align: right; margin: 0">-->
          <!--              <el-button size="mini" type="text" @click="cancelDeletePopover(row)">取消</el-button>-->
          <!--              <el-button type="primary" size="mini" @click="delUser(row)">确定</el-button>-->
          <!--            </div>-->
          <!--            <el-button-->
          <!--              slot="reference"-->
          <!--              style="color: red"-->
          <!--              type="text"-->
          <!--              icon="el-icon-delete"-->
          <!--              :loading="row.deleteLoadingIsShow"-->
          <!--            ></el-button>-->
          <!--          </el-popover>-->

        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.pageNum"
      :limit.sync="listQuery.pageSize"
      @pagination="getUserList"
    />

    <!-- 新增/修改表单 -->
    <el-drawer
      :title=" drawerType === 'create' ? '新增用户' : '修改用户'"
      size="60%"
      :visible.sync="drawerIsShow"
      :direction="direction"
    >
      <el-form
        ref="dataForm"
        :model="tempUser"
        label-width="100px"
        style="min-width: 400px;margin-left: 20px;margin-right: 20px"
      >

        <!-- 用户信息 -->
        <el-form-item :label="'用户名'" prop="name" class="is-required" size="mini">
          <el-input v-model="tempUser.name" placeholder="2~12位" />
        </el-form-item>

        <el-form-item :label="'账号'" prop="name" class="is-required" size="mini">
          <el-input v-model="tempUser.account" placeholder="2~12位" />
        </el-form-item>

        <el-form-item v-if="drawerType === 'create'" :label="'密码'" prop="name" class="is-required" size="mini">
          <el-input v-model="tempUser.password" placeholder="4~18位，必填" />
        </el-form-item>

        <el-form-item v-else :label="'密码'" prop="name" size="mini">
          <el-input v-model="tempUser.password" placeholder="4~18位，若填写，则会修改为此密码，若不填写，则不修改" />
        </el-form-item>

        <el-form-item :label="'业务线'" class="is-required" size="mini">
          <businessView
            ref="businessView"
            :current-business="tempUser.business_id"
            :is-multiple="true"
            :select-width="'97%'"
          />
        </el-form-item>

        <el-form-item :label="'角色'" class="is-required" size="mini">
          <el-select
            v-model="tempUser.role_list"
            placeholder="请选择角色"
            multiple
            filterable
            style="width:100%"
          >
            <el-option
              v-for="role in role_list"
              :key="role.name"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>

      </el-form>
      <div class="demo-drawer__footer">
        <el-button size="mini" @click="drawerIsShow = false">取消</el-button>
        <el-button
          size="mini"
          type="primary"
          :loading="submitButtonIsLoading"
          @click="drawerType==='create' ? addUser() : changUser()"
        >保存
        </el-button>
      </div>

    </el-drawer>

  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'
import businessView from '@/components/Selector/business'

import { userList, deleteUser, postUser, putUser, getUser, userStatus, userRoles } from '@/apis/system/user'
import { roleList } from '@/apis/system/role'
import { businessList } from '@/apis/config/business'

export default {
  name: 'Index',
  components: {
    Pagination,
    businessView
  },
  directives: { waves },
  data() {
    return {
      // 查询对象
      listQuery: {
        pageNum: 1,
        pageSize: 20,
        detail: 1,
        name: undefined, // 用户名
        account: undefined, // 账号
        status: undefined // 账号状态
        // role_id: undefined // 角色
      },

      // 临时数据，添加、修改
      tempUser: {
        id: undefined,
        name: undefined,
        account: undefined,
        role_list: [],
        business_id: [],
        password: undefined
      },

      submitButtonIsLoading: false,
      commonBusiness: '',
      userDict: {},
      user_list: [], // 用户列表
      role_list: [], // 角色列表
      status_list: [{ 'id': 1, name: '启用' }, { 'id': 2, name: '冻结' }], // 状态列表
      business_list: [], // 业务线列表
      tableKey: 0, // 服务数据表格起始
      total: 0, // 服务数据表格总条数
      drawerIsShow: false, // 编辑框的显示状态
      drawerType: '', // dialog框状态，edit为编辑数据, create为新增数据
      direction: 'rtl', // 抽屉打开方式
      listLoading: true // 请求加载状态
    }
  },
  computed: {},

  watch: {},

  created() {
    this.getAllUserList(this.getUserList)
    this.initStatus() // 初始化用户状态
    this.getRoleList() // 初始化角色列表
    this.initTempUser() // 初始化临时数据
  },

  mounted() {
    // 获取业务线列表
    if (this.$busEvents.data.businessList.length < 1) {
      businessList().then(response => {
        this.$busEvents.data.businessList = response.data.data
        this.$busEvents.data.businessDict = {}
        this.$busEvents.data.businessList.forEach(business => {
          this.$busEvents.data.businessDict[business.id] = business.name
          if (business.code === 'common') {
            this.commonBusiness = business.id
          }
        })
      })
    }
  },

  methods: {

    // 获取所有用户信息，同步请求
    async getAllUserList(func) {
      const response = await userList({ 'detail': 1 })
      this.currentUserList = response.data.data
      response.data.data.forEach(user => {
        this.userDict[user.id] = user
      })
      if (func) {
        func()
      }
    },

    // 解析用户
    parseUser(userId) {
      return this.userDict[userId].name
    },

    // 初始化用户状态
    initStatus() {
      this.status_list = [{ 'id': 1, name: '启用' }, { 'id': 2, name: '冻结' }]
    },

    // 初始化临时服务数据
    initTempUser() {
      this.tempUser = {
        id: undefined,
        name: undefined,
        account: undefined,
        password: undefined,
        role_list: [],
        business_id: [this.commonBusiness]
      }
    },

    // 初始化临时模板数据，点击新增按钮触发
    handleCreate() {
      this.initTempUser()
      this.drawerType = 'create' // dialog框标识为创建
      this.drawerIsShow = true
    },

    //  初始化临时模板数据，点击修改按钮触发
    handleUpdate(row) {
      this.drawerType = 'edit' // dialog框标识为编辑

      this.tempUser.id = row.id
      this.tempUser.name = row.name
      this.tempUser.account = row.account
      this.tempUser.password = row.password
      this.tempUser.business_id = row.business_id
      userRoles({ id: row.id }).then(response => {
        this.tempUser.role_list = response.data
      })
      this.drawerIsShow = true
    },

    // 初始化查询数据
    handleInitListQuery() {
      this.listQuery = {
        pageNum: 1,
        pageSize: 20,
        name: undefined, // 服务名
        manager: undefined, // 负责人
        create_user: undefined // 创建人
      }
      this.getUserList()
    },

    // 获取角色列表
    getRoleList() {
      roleList().then(response => {
        this.role_list = response.data.data
      })
    },

    // 用户列表
    getUserList() {
      userList(this.listQuery).then(response => {
        this.user_list = response.data.data
        this.total = response.data.total
        this.listLoading = false
      })
    },

    // 新增用户
    addUser() {
      this.submitButtonIsLoading = true
      this.tempUser.business_id = this.$refs.businessView.business
      postUser(this.tempUser).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.drawerIsShow = false
          this.initTempUser() // 初始化临时数据模板
          this.getUserList() // 重新从后台获取服务列表
        }
      })
    },

    // 修改用户
    changUser() {
      this.submitButtonIsLoading = true
      this.tempUser.business_id = this.$refs.businessView.business
      putUser(this.tempUser).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.drawerIsShow = false
          this.initTempUser() // 初始化临时数据模板
          this.getUserList() // 重新从后台获取服务列表
        }
      })
    },

    cancelDeletePopover(row) {
      this.$set(row, 'deletePopoverIsShow', false)
    },

    // 删除用户
    delUser(row) {
      this.$set(row, 'deletePopoverIsShow', false)
      this.$set(row, 'deleteLoadingIsShow', true)
      deleteUser({ 'id': row.id }).then(response => {
        this.$set(row, 'deleteLoadingIsShow', false)
        if (this.showMessage(this, response)) {
          this.getUserList() // 重新从后台获取用户列表
        }
      })
    },

    // 启用禁用用户
    changStatus(row) {
      this.$set(row, 'changStatusIsDisabled', true)
      userStatus({ 'id': row.id }).then(response => {
        this.$set(row, 'changStatusIsDisabled', false)
        this.showMessage(this, response)
        this.getUserList()
      })
    },

    // 触发查询
    handleFilter() {
      this.listQuery.pageNum = 1
      this.getUserList()
    }

  }
}
</script>
