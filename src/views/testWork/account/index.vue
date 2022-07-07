<template>
  <div class="app-container">

    <div class="filter-container">

      <!-- inline="true"，el-form-item不自动换行 -->
      <el-form label-width="100px" :inline="true">

        <el-form-item :label="'选择服务：'" size="mini">
          <el-select v-model="currentProject" filterable placeholder="请选择服务" size="mini">
            <el-option v-for="item in projectList" :key="item.key" :label="item.value" :value="item.key">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item :label="'选择环境：'" size="mini">
          <el-select v-model="currentEvent" placeholder="请选择环境" size="mini">
            <el-option v-for="(value, key) in eventList" :key="key" :label="value" :value="key">
            </el-option>
          </el-select>
        </el-form-item>

        <el-button type="primary" @click.native="doQuery('')" size="mini">查询</el-button>
        <el-button type="primary" @click.native="initQuery('')" size="mini">重置</el-button>
        <el-button type="primary" @click.native="showDialog('')" size="mini">添加账号</el-button>
      </el-form>

    </div>

    <el-table
      ref="apiTree"
      v-loading="listLoading"
      :data="currentAccountList"
      stripe
    >
      <el-table-column prop="id" label="编号" min-width="5%">
        <template slot-scope="scope">
          <span> {{ (pageNum - 1) * pageSize + scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="project" label="服务" min-width="20%">
        <template slot-scope="scope">
          <span> {{ scope.row.project }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="name" label="账户名" min-width="20%">
        <template slot-scope="scope">
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="account" label="账号" min-width="15%">
        <template slot-scope="scope">
          <span> {{ scope.row.account }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="password" label="密码" min-width="15%">
        <template slot-scope="scope">
          <span> {{ scope.row.password }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="desc" label="备注" min-width="15%">
        <template slot-scope="scope">
          <span> {{ scope.row.desc }} </span>
        </template>
      </el-table-column>

      <el-table-column :label="'创建人'" prop="id" align="center" min-width="15%">
        <template slot-scope="scope">
          <span>{{ parseUser(scope.row.create_user) }}</span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="create_user" label="最后修改人" min-width="10%">
        <template slot-scope="scope">
          <span>{{ parseUser(scope.row.update_user) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" min-width="10%">
        <template slot-scope="scope">

          <!--修改账号信息-->
          <el-button
            type="text"
            style="margin-right: 10px"
            icon="el-icon-edit"
            @click="showDialog(scope.row)">
          </el-button>

          <!-- 删除账号 -->
          <el-popconfirm
            placement="top"
            hide-icon
            style="margin-right: 10px"
            :title="`确定删除【${scope.row.name}】?`"
            confirm-button-text='确认'
            cancel-button-text='取消'
            @onConfirm="delAccount(scope.row)"
          >
            <el-button
              slot="reference"
              type="text"
              style="color: red"
              icon="el-icon-delete"
              :loading="scope.row.deleteButtonIsLoading"
            ></el-button>
          </el-popconfirm>

        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/修改账号表单 -->
    <el-drawer
      :title=" currentAccount.id ? '修改账号' : '新增账号' "
      size="40%"
      :wrapperClosable="false"
      :visible.sync="drawerIsShow"
      :direction="direction">

      <el-form
        ref="dataForm"
        :model="currentAccount"
        label-position="right"
        label-width="90px"
        style="min-width: 400px;margin-left: 20px;margin-right: 20px">

        <el-form-item class="filter-item is-required" :label="'服务名'" size="mini">
          <el-select
            v-model="currentAccount.project"
            filterable
            allow-create
            default-first-option
            placeholder="服务名，可手动输入"
            size="mini"
            style="width:100%">
            <el-option v-for="item in projectList" :key="item.key" :label="item.value" :value="item.key">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item class="filter-item is-required" :label="'环境'" size="mini">
          <el-select v-model="currentAccount.event" placeholder="请选择环境" size="mini" style="width:100%">
            <el-option v-for="(value, key) in eventList" :key="key" :label="value" :value="key">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item :label="'账户名称'" class="filter-item is-required" prop="name" size="mini">
          <el-input v-model="currentAccount.name" placeholder="账户名称"/>
        </el-form-item>

        <el-form-item :label="'登录账号'" class="filter-item is-required" prop="account" size="mini">
          <el-input v-model="currentAccount.account" placeholder="登录账号，不可重复"/>
        </el-form-item>

        <el-form-item :label="'登录密码'" class="filter-item is-required" prop="password" size="mini">
          <el-input v-model="currentAccount.password" placeholder="登录密码"/>
        </el-form-item>

        <el-form-item :label="'备注'" class="filter-item" prop="desc">
          <el-input type="textarea" v-model="currentAccount.desc" autosize size="mini" placeholder="备注"></el-input>
        </el-form-item>
      </el-form>
      <div class="demo-drawer__footer">
        <el-button size="mini" @click="drawerIsShow = false"> {{ '取消' }}</el-button>
        <el-button
          size="mini"
          type="primary"
          :loading="submitButtonIsLoading"
          @click=" currentAccount.id ? changeAccount() : addAccount() ">
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
      @pagination="getAccountList"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'

import {userList} from '@/apis/user/user'
import {getConfigByName} from "@/apis/config/config";
import {
  accountList,
  postAccount,
  putAccount,
  deleteAccount,
  accountProjectList
} from "@/apis/testWork/account";

export default {
  name: 'index',
  components: {Pagination},
  data() {
    return {
      direction: 'rtl',  // 抽屉打开方式
      listLoading: false,  // 加载状态
      submitButtonIsLoading: false,
      deleteButtonIsLoading: false,
      drawerIsShow: false,  // 抽屉是否展示
      currentEvent: 'test',  // 选中的环境
      currentProject: '',  // 选中的项目

      // 文件类型列表
      eventList: [],
      projectList: [],  // 项目列表
      currentAccountList: [],  // 账号列表
      // 账号
      currentAccount: {
        id: '',
        project: '',
        name: '',
        account: '',
        password: '',
        desc: '',
        event: ''
      },
      userList: [],
      userDict: {},
      total: 0,
      pageNum: 1,
      pageSize: 20
    }
  },

  methods: {

    // 获取环境配置
    initEnv() {
      getConfigByName({'name': 'run_test_env'}).then(response => {
        this.eventList = JSON.parse(response.data.value)
      })
    },

    // 获取用户信息，同步请求
    async getUserList(func) {
      let response = await userList()
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

    // 请求用户信息
    getAccountProjectList() {
      accountProjectList().then(response => {
        this.projectList = response.data
      })
    },

    // 获取账号列表
    getAccountList() {
      accountList({
        'pageNum': this.pageNum,
        'pageSize': this.pageSize,
        'event': this.currentEvent,
        'project': this.currentProject,
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
      this.currentProject = ''
      this.currentEvent = ''
      this.getAccountList()
    },

    // 在抽屉中新加的服务名添加到服务list中
    addProjectName(projectName) {
      for (let index in this.projectList) {
        if (projectName === this.projectList[index]['key']) {
          return
        }
      }
      this.projectList.push({key: projectName, value: projectName})
    },

    // 初始化新账号
    initNewAccount() {
      this.currentAccount.id = ''
      this.currentAccount.project = this.currentProject
      this.currentAccount.name = ''
      this.currentAccount.account = ''
      this.currentAccount.password = ''
      this.currentAccount.desc = ''
      this.currentAccount.event = this.currentEvent
    },

    // 打开抽屉
    showDialog(row) {
      if (row) {  // 修改
        this.currentAccount = JSON.parse(JSON.stringify(row))
      } else {  // 增加
        this.initNewAccount()
      }
      this.drawerIsShow = true
    },

    // 添加账号
    addAccount() {
      this.submitButtonIsLoading = true
      postAccount({
        project: this.currentAccount.project,
        name: this.currentAccount.name,
        account: this.currentAccount.account,
        password: this.currentAccount.password,
        desc: this.currentAccount.desc,
        event: this.currentEvent
      }).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          // 提交成功后，如果是新加的服务名，则加到服务名list中
          this.addProjectName(this.currentAccount.project)
          this.drawerIsShow = false
          this.getAccountList()
        }
      })
    },

    // 修改账号
    changeAccount() {
      this.submitButtonIsLoading = true
      putAccount({
        id: this.currentAccount.id,
        project: this.currentAccount.project,
        name: this.currentAccount.name,
        account: this.currentAccount.account,
        password: this.currentAccount.password,
        desc: this.currentAccount.desc,
        event: this.currentEvent
      }).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          // 提交成功后，如果是新加的服务名，则加到服务名list中
          this.addProjectName(this.currentAccount.project)
          this.drawerIsShow = false
          this.getAccountList()
        }
      })
    },

    // 删除账号
    delAccount(row) {
      this.$set(row, 'deleteButtonIsLoading', true)
      deleteAccount({'id': row.id}).then(response => {
        this.$set(row, 'deleteButtonIsLoading', false)
        if (this.showMessage(this, response)) {
          this.getAccountList()
        }
      })
    }
  },

  mounted() {
    this.initEnv()
    this.getUserList(this.getAccountList)
    this.getAccountProjectList()
    // this.getAccountList()
  },
}
</script>

<style>

</style>
