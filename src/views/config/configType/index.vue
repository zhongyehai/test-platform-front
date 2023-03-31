<template>
  <div class="app-container">

    <el-form label-width="100px" :inline="true">

      <el-form-item :label="'类型名：'" size="mini">
        <el-input
          v-model="listQuery.name"
          class="input-with-select"
          placeholder="配置类型名，支持模糊搜索"
          size="mini"
          clearable
          style="width: 400px"
        />
      </el-form-item>

      <el-form-item :label="'创建人：'" size="mini">
        <el-select
          v-model="listQuery.create_user"
          :placeholder="'选择创建人'"
          filterable
          default-first-option
          clearable
          size="mini"
          class="filter-item"
        >
          <el-option v-for="user in currentUserList" :key="user.name" :label="user.name" :value="user.id" />
        </el-select>
      </el-form-item>

      <el-button
        type="primary"
        size="mini"
        @click="getConfigTypeList()"
      >
        搜索
      </el-button>

      <el-button
        class="filter-item"
        style="margin-left: 10px"
        type="primary"
        size="mini"
        @click="showAddConfigTypeDialog()"
      >
        添加配置类型
      </el-button>

    </el-form>

    <el-table
      ref="apiTree"
      v-loading="listLoading"
      :data="list"
      stripe
    >
      <el-table-column prop="id" label="编号" align="center" min-width="10%">
        <template slot-scope="scope">
          <span> {{ (listQuery.pageNum - 1) * listQuery.pageSize + scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" prop="name" align="center" label="参数类型" min-width="35%">
        <template slot-scope="scope">
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" prop="desc" align="center" label="备注" min-width="35%">
        <template slot-scope="scope">
          <span> {{ scope.row.desc }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" prop="create_user" align="center" label="创建者" min-width="10%">
        <template slot-scope="scope">
          <span>{{ parseUser(scope.row.create_user) }}</span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" prop="desc" align="center" label="操作" min-width="10%">
        <template slot-scope="scope">
          <el-tooltip
            class="item"
            effect="dark"
            content="修改"
            placement="top-start"
          >
            <el-button
              type="text"
              size="mini"
              icon="el-icon-edit"
              :disabled="roles !== '2'"
              @click.native="showAddConfigTypeDialog(scope.row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>

    </el-table>

    <!-- 新增/修改配置类型 -->
    <el-drawer
      :title=" drawerType === 'add' ? '新增配置类型' : '修改配置类型'"
      size="60%"
      :visible.sync="drawerIsShow"
      :direction="direction"
    >

      <el-form ref="dataForm" label-width="80px" style="margin-left: 20px;margin-right: 20px">

        <el-form-item :label="'配置类型'" class="is-required" size="mini">
          <el-input v-model="tempConfigType.name" :disabled="drawerType === 'edit'" size="mini" />
        </el-form-item>

        <el-form-item :label="'备注'" size="mini">
          <el-input v-model="tempConfigType.desc" type="textarea" autosize size="mini" />
        </el-form-item>

      </el-form>
      <div class="demo-drawer__footer">
        <el-button size="mini" @click="drawerIsShow = false"> {{ '取消' }}</el-button>
        <el-button
          type="primary"
          size="mini"
          :loading="submitButtonIsLoading"
          @click=" drawerType === 'add' ? addConfigType() : changConfigType()"
        >
          {{ '保存' }}
        </el-button>
      </div>
    </el-drawer>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.pageNum"
      :limit.sync="listQuery.pageSize"
      @pagination="getConfigTypeList"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { configTypeList, postConfigType, putConfigType, deleteConfigType, getConfigType } from '@/apis/config/configType'
import { userList } from '@/apis/system/user'

export default {
  name: 'Index',
  components: {
    Pagination
  },
  data() {
    return {
      listQuery: {
        pageNum: 1,
        pageSize: 20,
        create_user: '',
        name: ''
      },
      // 请求列表等待响应的状态
      listLoading: false,
      total: 0,
      list: [],
      drawerIsShow: false,
      drawerType: '',
      direction: 'rtl', // 抽屉打开方式
      submitButtonIsLoading: false,
      tempConfigType: {
        id: '',
        name: '',
        desc: ''
      },
      // 用户权限
      roles: localStorage.getItem('roles'),
      currentUserList: [],
      userDict: {}
    }
  },

  mounted() {
    this.getUserList(this.getConfigTypeList)
    // this.getConfigTypeList()
  },

  methods: {
    // 获取用户信息，同步请求
    async getUserList(func) {
      const response = await userList()
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

    showAddConfigTypeDialog(row) {
      if (row) {
        this.tempConfigType = row
        this.drawerType = 'edit'
      } else {
        this.tempConfigType = { name: '', desc: '' }
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
      configTypeList(this.listQuery).then(response => {
        this.listLoading = false
        this.list = response.data.data
        this.total = response.data.total
      })
    }
  }
}
</script>

<style scoped>

</style>
