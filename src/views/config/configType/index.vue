<template>
  <div class="app-container">

    <el-button
      class="filter-item"
      style="float: left;margin-left: 10px"
      type="primary"
      size="mini"
      @click="showAddConfigTypeDialog()">
      {{ '添加参数类型' }}
    </el-button>

    <el-table
      ref="apiTree"
      v-loading="listLoading"
      :data="list"
      stripe
    >
      <el-table-column prop="id" label="编号" min-width="10%">
        <template slot-scope="scope">
          <span> {{ (pageNum - 1) * pageSize + scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="name" label="参数类型" min-width="35%">
        <template slot-scope="scope">
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="desc" label="备注" min-width="35%">
        <template slot-scope="scope">
          <span> {{ scope.row.desc }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="create_user" label="创建者" min-width="10%">
        <template slot-scope="scope">
          <span>{{ parseUser(scope.row.create_user) }}</span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="desc" label="操作" min-width="10%">
        <template slot-scope="scope">
          <el-tooltip
            class="item"
            effect="dark"
            content="修改"
            placement="top-start">
          <el-button
            type="text"
            icon="el-icon-edit"
            :disabled="roles !== '2'"
            @click.native="showAddConfigTypeDialog(scope.row)"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>

    </el-table>


    <!-- 新增/修改配置类型 -->
    <el-drawer
      :title=" drawerType === 'add' ? '新增服务' : '修改服务'"
      size="40%"
      :wrapperClosable="false"
      :visible.sync="drawerIsShow"
      :direction="direction">

      <el-form ref="dataForm" label-width="80px" style="margin-left: 20px;margin-right: 20px">

        <el-form-item :label="'参数类型'" class="is-required">
          <el-input v-model="tempConfigType.name" :disabled="drawerType === 'edit'" size="mini"/>
        </el-form-item>

        <el-form-item :label="'备注'">
          <el-input v-model="tempConfigType.desc" type="textarea" autosize size="mini"/>
        </el-form-item>

      </el-form>
      <div class="demo-drawer__footer">
        <el-button size="mini" @click="drawerIsShow = false"> {{ '取消' }}</el-button>
        <el-button
          type="primary"
          size="mini"
          :loading="submitButtonIsLoading"
          @click=" drawerType === 'add' ? addConfigType() : changConfigType()">
          {{ '保存' }}
        </el-button>
      </div>
    </el-drawer>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="pageNum"
      :limit.sync="pageSize"
      @pagination="getConfigTypeList"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import {configTypeList, postConfigType, putConfigType, deleteConfigType, getConfigType} from "@/apis/config/configType";
import {userList} from "@/apis/user/user";

export default {
  name: "index",
  components: {
    Pagination
  },
  data() {
    return {
      // 请求列表等待响应的状态
      listLoading: false,
      total: 0,
      list: [],
      drawerIsShow: false,
      drawerType: '',
      direction: 'rtl',  // 抽屉打开方式
      submitButtonIsLoading: false,
      tempConfigType: {
        id: '',
        name: '',
        desc: ''
      },
      // 用户权限
      roles: localStorage.getItem('roles'),
      pageNum: 1,
      pageSize: 20,

      userList: [],
      userDict: {},
    }
  },

  methods: {
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

    showAddConfigTypeDialog(row) {
      if (row) {
        this.tempConfigType = row
        this.drawerType = 'edit'
      } else {
        this.tempConfigType = {name: '', desc: ''}
        this.drawerType = 'add'
      }
      this.drawerIsShow = true
    },

    // 增加配置类型
    addConfigType() {
      this.submitButtonIsLoading = true
      postConfigType(this.tempConfigType).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.drawerIsShow = false
          this.getConfigTypeList()
        }
      })
    },

    // 修改配置类型
    changConfigType() {
      this.submitButtonIsLoading = true
      putConfigType(this.tempConfigType).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.drawerIsShow = false
          this.getConfigTypeList()
        }
      })
    },

    // 获取配置类型列表
    getConfigTypeList() {
      this.listLoading = true
      configTypeList({'pageNum': this.pageNum, 'pageSize': this.pageSize}).then(response => {
        this.listLoading = false
        this.list = response.data.data
        this.total = response.data.total
      })
    }
  },

  mounted() {
    this.getUserList(this.getConfigTypeList)
    // this.getConfigTypeList()
  }
}
</script>

<style scoped>

</style>
