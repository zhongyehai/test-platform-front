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
          @keyup.enter.native="handleFilter"/>
      </el-form-item>

      <el-form-item :label="'账号：'" size="mini">
        <el-input
          v-model="listQuery.account"
          :placeholder="'账号'"
          style="width: 100%"
          class="filter-item"
          size="mini"
          @keyup.enter.native="handleFilter"/>
      </el-form-item>

      <el-form-item :label="'状态：'" size="mini">
        <el-select
          v-model="listQuery.status"
          :placeholder="'状态'"
          clearable
          filterable
          default-first-option
          size="mini"
          class="filter-item">
          <el-option v-for="status in status_list" :key="status.name" :label="status.name" :value="status.id"/>
        </el-select>
      </el-form-item>

      <el-form-item :label="'角色：'" size="mini">
        <el-select
          v-model="listQuery.role_id"
          :placeholder="'角色'"
          clearable
          filterable
          default-first-option
          size="mini"
          class="filter-item">
          <el-option v-for="role in role_list" :key="role.name" :label="role.name" :value="role.id"/>
        </el-select>
      </el-form-item>

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

      <el-table-column :label="'用户名'" prop="id" align="center" min-width="20%">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'账号'" prop="id" align="center" min-width="20%">
        <template slot-scope="scope">
          <span>{{ scope.row.account }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'角色'" prop="id" align="center" min-width="10%">
        <template slot-scope="scope">
          <span>{{ scope.row.role_id === 1 ? '测试人员' : '管理人员' }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="启用状态" min-width="15%">
        <template slot-scope="scope">
          <el-switch
            :disabled="scope.row.changStatusIsDisabled"
            v-model="scope.row.status === 1"
            @change="changStatus(scope.row)"></el-switch>
        </template>
      </el-table-column>

      <el-table-column :label="'创建人'" prop="id" align="center" min-width="12%">
        <template slot-scope="scope">
          <span>{{ parseUser(scope.row.create_user) }}</span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="create_user" label="最后修改人" min-width="15%">
        <template slot-scope="scope">
          <span>{{ parseUser(scope.row.update_user) }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'操作'" align="center" min-width="10%" class-name="small-padding fixed-width">
        <template slot-scope="{row, $index}">

          <!--编辑用户-->
          <el-button
            type="text"
            style="margin-right: 10px"
            icon="el-icon-edit"
            @click="handleUpdate(row)"></el-button>

          <!-- 删除账号 -->
          <el-popconfirm
            placement="top"
            hide-icon
            style="margin-right: 10px"
            :title="`确定删除【${row.name}】?`"
            confirm-button-text='确认'
            cancel-button-text='取消'
            @onConfirm="delUser(row)"
          >
            <el-button
              slot="reference"
              type="text"
              style="color: red"
              icon="el-icon-delete"
              :loading="row.deleteLoadingIsShow"
            ></el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.pageNum"
      :limit.sync="listQuery.pageSize"
      @pagination="getUserList"/>

    <!-- 新增/修改表单 -->
    <el-drawer
      :title=" drawerType === 'add' ? '新增服务' : '修改服务'"
      size="40%"
      :wrapperClosable="false"
      :visible.sync="drawerIsShow"
      :direction="direction">
      <el-form
        ref="dataForm"
        :model="tempUser"
        label-width="100px"
        style="min-width: 400px;margin-left: 20px;margin-right: 20px">

        <!-- 用户信息 -->
        <el-form-item :label="'用户名'" prop="name" class="is-required" size="mini">
          <el-input v-model="tempUser.name" placeholder="2~12位"/>
        </el-form-item>
        <el-form-item :label="'账号'" prop="name" class="is-required" size="mini">
          <el-input v-model="tempUser.account" placeholder="2~12位"/>
        </el-form-item>
        <el-form-item :label="'密码'" prop="name" class="is-required" size="mini">
          <el-input v-model="tempUser.password" placeholder="6~18位"/>
        </el-form-item>
        <el-form-item :label="'角色'" class="is-required" size="mini">
          <el-select v-model="tempUser.role_id" placeholder="请选择角色" style="width:100%">
            <el-option
              v-for="role in role_list"
              :key="role.name"
              :label="role.name"
              :value="role.id"/>
          </el-select>
        </el-form-item>

      </el-form>
      <div class="demo-drawer__footer">
        <el-button size="mini" @click="drawerIsShow = false">取消</el-button>
        <el-button
          size="mini"
          type="primary"
          :loading="submitButtonIsLoading"
          @click="drawerType==='create'?addUser():changUser()">保存
        </el-button>
      </div>

    </el-drawer>

  </div>
</template>

<script>
import {userList, deleteUser, postUser, putUser, getUser, roleList, userStatus} from '@/apis/user/user'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'

export default {
  name: 'index',
  components: {Pagination},
  directives: {waves},
  data() {
    return {
      // 查询对象
      listQuery: {
        pageNum: 1,
        pageSize: 20,
        detail: 1,
        name: undefined,  // 用户名
        account: undefined,  // 账号
        status: undefined, // 账号状态
        role_id: undefined // 角色
      },

      // 临时数据，添加、修改
      tempUser: {
        id: undefined,
        name: undefined,
        account: undefined,
        role_id: undefined,
        password: undefined,
      },

      submitButtonIsLoading: false,
      userDict: {},

      user_list: [],  // 用户列表
      role_list: [{'id': 1, name: '启用'}, {'id': 2, name: '冻结'}],  // 角色列表
      status_list: [],  // 状态列表
      tableKey: 0,  // 服务数据表格起始
      total: 0,  // 服务数据表格总条数
      drawerIsShow: false,  // 编辑框的显示状态
      drawerType: '',   // dialog框状态，edit为编辑数据, create为新增数据
      direction: 'rtl',  // 抽屉打开方式
      listLoading: true,  // 请求加载状态
    }
  },

  created() {
    this.getAllUserList(this.getUserList)
    this.initStatus()  // 初始化用户状态
    this.getRoleList()  // 初始化角色列表
    // this.getUserList()  // 初始化用户列表
    this.initTempUser()  // 初始化临时数据
  },
  mounted() {

  },
  methods: {

    // 获取所有用户信息，同步请求
    async getAllUserList(func) {
      let response = await userList({'detail': 1})
      this.currentUserList = response.data.data
      response.data.data.forEach(user => {
        this.userDict[user.id] = user
      })
      if (func){
        func()
      }
    },

    // 解析用户
    parseUser(userId) {
      return this.userDict[userId].name
    },

    // 初始化用户状态
    initStatus() {
      this.status_list = [{'id': 1, name: '启用'}, {'id': 2, name: '冻结'}]
    },

    // 初始化临时服务数据
    initTempUser() {
      this.tempUser = {
        id: undefined,
        name: undefined,
        account: undefined,
        password: undefined,
        role_id: undefined
      }
    },

    // 初始化临时模板数据，点击新增按钮触发
    handleCreate() {
      this.initTempUser()
      this.drawerType = 'create'  // dialog框标识为创建
      this.drawerIsShow = true
    },

    //  初始化临时模板数据，点击修改按钮触发
    handleUpdate(row) {
      this.drawerType = 'edit'  // dialog框标识为编辑
      this.tempUser.id = row.id
      this.tempUser.name = row.name
      this.tempUser.account = row.account
      this.tempUser.password = row.password
      this.tempUser.role_id = row.role_id
      this.drawerIsShow = true
    },

    // 初始化查询数据
    handleInitListQuery() {
      this.listQuery = {
        pageNum: 1,
        pageSize: 20,
        name: undefined,  // 服务名
        manager: undefined,  // 负责人
        create_user: undefined, // 创建人
      }
      this.getUserList()
    },

    // 获取角色列表
    getRoleList() {
      roleList().then(response => {
        this.role_list = response.data
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
      postUser(this.tempUser).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.drawerIsShow = false
          this.initTempUser(); // 初始化临时数据模板
          this.getUserList(); // 重新从后台获取服务列表
        }
      })
    },

    // 修改用户
    changUser() {
      this.submitButtonIsLoading = true
      putUser(this.tempUser).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.drawerIsShow = false
          this.initTempUser(); // 初始化临时数据模板
          this.getUserList(); // 重新从后台获取服务列表
        }
      })
    },

    // 删除用户
    delUser(row) {
      this.$set(row, 'deleteLoadingIsShow', true)
      deleteUser({"id": row.id}).then(response => {
        this.$set(row, 'deleteLoadingIsShow', false)
        if (this.showMessage(this, response)) {
          this.getUserList(); // 重新从后台获取用户列表
        }
      })
    },

    // 启用禁用用户
    changStatus(row) {
      this.$set(row, 'changStatusIsDisabled', true)
      userStatus({'id': row.id}).then(response => {
        this.$set(row, 'changStatusIsDisabled', false)
        this.showMessage(this, response)
        this.getUserList()
      })
    },

    // 触发查询
    handleFilter() {
      this.listQuery.pageNum = 1
      this.getUserList()
    },

  },
  computed: {},

  watch: {},
}
</script>
