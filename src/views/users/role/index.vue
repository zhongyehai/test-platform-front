<template>
  <div class="app-container">

    <!-- inline="true"，el-form-item不自动换行 -->
    <el-form label-width="100px" :inline="true">

      <el-form-item :label="'角色：'" size="mini">
        <el-input
          v-model="listQuery.name"
          :placeholder="'角色名'"
          style="width: 100%"
          class="filter-item"
          size="mini"
        />
      </el-form-item>

      <el-button class="filter-item" type="primary" size="mini" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" type="primary" size="mini" @click="handleCreate">添加</el-button>
      <el-button class="filter-item" type="primary" size="mini" @click="handleInitListQuery">重置</el-button>

    </el-form>

    <!-- 表格栏 -->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="role_list"
      fit
      stripe
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column :label="'序号'" prop="id" align="center" min-width="10%" size="mini">
        <template slot-scope="scope">
          <span> {{ (listQuery.pageNum - 1) * listQuery.pageSize + scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column :label="'角色名'" prop="name" align="center" min-width="20%" size="mini">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column show-overflow-tooltip :label="'备注'" prop="desc" align="center" min-width="25%" size="mini">
        <template slot-scope="scope">
          <span>{{ scope.row.desc }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'创建时间'" prop="created_time" align="center" min-width="15%" size="mini">
        <template slot-scope="scope">
          <span>{{ scope.row.created_time }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'修改时间'" prop="created_time" align="center" min-width="15%" size="mini">
        <template slot-scope="scope">
          <span>{{ scope.row.update_time }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'操作'" align="center" min-width="15%" size="mini">
        <template slot-scope="scope">

          <!--编辑角色-->
          <el-button
            type="text"
            size="mini"
            style="margin-right: 10px"
            @click="handleUpdate(scope.row)"
          >修改
          </el-button>

          <!-- 删除角色 -->
          <el-popover
            :ref="scope.row.id"
            v-model="scope.row.deletePopoverIsShow"
            placement="top"
            popper-class="down-popover"
          >
            <p>确定删除【{{ scope.row.name }}】?</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="cancelDeletePopover(scope.row)">取消</el-button>
              <el-button type="primary" size="mini" @click="delRole(scope.row)">确定</el-button>
            </div>
            <el-button
              slot="reference"
              style="color: red"
              type="text"
              size="mini"
              :loading="scope.row.deleteLoadingIsShow"
            >删除
            </el-button>
          </el-popover>

        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.pageNum"
      :limit.sync="listQuery.pageSize"
      @pagination="getRoleList"
    />

    <!-- 新增/修改表单 -->
    <el-drawer
      :title=" drawerType === 'create' ? '新增角色' : '修改角色'"
      size="60%"
      :visible.sync="drawerIsShow"
      :direction="direction"
    >
      <el-form
        ref="dataForm"
        :model="tempRole"
        label-width="100px"
        style="min-width: 400px;margin-left: 20px;margin-right: 20px"
      >
        <!-- 角色信息 -->
        <el-form-item :label="'角色名'" prop="name" class="is-required" size="mini">
          <el-input v-model="tempRole.name" />
        </el-form-item>

        <el-form-item :label="'备注'" prop="desc" size="mini">
          <el-input v-model="tempRole.desc" type="textarea" />
        </el-form-item>

        <el-form-item :label="'继承角色'" size="mini">
          <el-select
            v-model="tempRole.extend_role"
            placeholder="请选择角色"
            multiple
            filterable
            style="width:97%"
          >
            <el-option
              v-for="role in role_list"
              :key="role.name"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
          <el-popover
            class="el_popover_class"
            placement="top-start"
            trigger="hover"
          >
            <div>
              <div>若此处选择了角色，则当前角色会拥有此处选中角色的权限</div>
            </div>
            <el-button slot="reference" type="text" icon="el-icon-question" />
          </el-popover>
        </el-form-item>

        <el-tabs v-model="activeName">
          <el-tab-pane label="前端权限" name="front">
            <div style="text-align: center">
              <!--                style="text-align: left; display: inline-block"-->
              <el-transfer
                v-model="tempRole_front_permission"
                :data="front_permission"
                filterable
                filter-placeholder="请输入权限名"
                :titles="['可选权限', '已有权限']"
                :props="{
                  key: 'id',
                  label: 'name'
                }"
              >
                <span slot-scope="{ option }">
                  <span>{{ option.name }}</span>
                </span>
              </el-transfer>
            </div>
          </el-tab-pane>
          <el-tab-pane label="后端权限" name="api">
            <div style="text-align: center">
              <el-transfer
                v-model="tempRole_api_permission"
                filterable
                filter-placeholder="请输入权限名"
                :titles="['可选权限', '已有权限']"
                :props="{
                  key: 'id',
                  label: 'name'
                }"
                :data="api_permission"
              >
                <span slot-scope="{ option }">
                  <span>{{ option.name }}</span>
                </span>
              </el-transfer>
            </div>
          </el-tab-pane>
        </el-tabs>

      </el-form>

      <div class="demo-drawer__footer">
        <el-button size="mini" @click="drawerIsShow = false">取消</el-button>
        <el-button
          size="mini"
          type="primary"
          :loading="submitButtonIsLoading"
          @click="drawerType==='create' ? addRole() : changRole()"
        >保存
        </el-button>
      </div>

    </el-drawer>

  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'

import {
  roleList,
  deleteRole,
  postRole,
  putRole,
  getRole
} from '@/apis/system/role'

import {
  permissionList
} from '@/apis/system/permission'

export default {
  name: 'Role',
  components: {
    Pagination
  },
  directives: { waves },
  data() {
    return {
      activeName: 'front',
      // 查询对象
      listQuery: {
        pageNum: 1,
        pageSize: 20,
        name: undefined
      },
      // 临时数据，添加、修改
      tempRole: {
        id: undefined,
        name: undefined,
        desc: undefined,
        extend_role: [],
        front_permission: [],
        api_permission: []
      },
      tempRole_front_permission: [],
      tempRole_api_permission: [],
      role_list: [],
      permission_list: [],
      front_permission: [],
      api_permission: [],
      submitButtonIsLoading: false,
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
    this.getRoleList()
    this.initTempRole() // 初始化临时数据
  },

  mounted() {
    permissionList().then(response => {
      this.permission_list = response.data.data
      this.permission_list.forEach(permission => {
        if (permission.source_type === 'api') {
          this.api_permission.push(permission)
        } else {
          this.front_permission.push(permission)
        }
      })
      this.listLoading = false
    })
  },

  methods: {

    // 角色列表
    getRoleList() {
      roleList(this.listQuery).then(response => {
        this.role_list = response.data.data
        this.listLoading = false
      })
    },

    // 初始化临时角色数据
    initTempRole() {
      this.tempRole = {
        id: undefined,
        name: undefined,
        desc: undefined,
        extend_role: [],
        permission: []
      }
    },

    // 初始化临时模板数据，点击新增按钮触发
    handleCreate() {
      this.initTempRole()
      this.drawerType = 'create' // dialog框标识为创建
      this.drawerIsShow = true
    },

    //  初始化临时模板数据，点击修改按钮触发
    handleUpdate(row) {
      this.drawerType = 'edit' // dialog框标识为编辑
      // 获取角色信息
      getRole({ id: row.id }).then(response => {
        this.tempRole.id = response.data.data.id
        this.tempRole.name = response.data.data.name
        this.tempRole.desc = response.data.data.desc
        this.tempRole.extend_role = response.data.data.extend_role
        this.tempRole_front_permission = response.data.front_permission
        this.tempRole_api_permission = response.data.api_permission
      })
      this.drawerIsShow = true
    },

    // 重置查询数据
    handleInitListQuery() {
      this.listQuery = {
        pageNum: 1,
        pageSize: 20,
        name: undefined
      }
      this.getRoleList()
    },

    // 新增角色
    addRole() {
      this.submitButtonIsLoading = true
      this.tempRole.front_permission = this.tempRole_front_permission
      this.tempRole.api_permission = this.tempRole_api_permission
      postRole(this.tempRole).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.drawerIsShow = false
          this.initTempRole() // 初始化临时数据模板
          this.getRoleList() // 重新从后台获取服务列表
        }
      })
    },

    // 修改角色
    changRole() {
      this.submitButtonIsLoading = true
      this.tempRole.front_permission = this.tempRole_front_permission
      this.tempRole.api_permission = this.tempRole_api_permission
      putRole(this.tempRole).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.drawerIsShow = false
          this.initTempRole() // 初始化临时数据模板
          this.getRoleList() // 重新从后台获取服务列表
        }
      })
    },

    cancelDeletePopover(row) {
      this.$set(row, 'deletePopoverIsShow', false)
    },

    // 删除角色
    delRole(row) {
      this.$set(row, 'deletePopoverIsShow', false)
      this.$set(row, 'deleteLoadingIsShow', true)
      deleteRole({ 'id': row.id }).then(response => {
        this.$set(row, 'deleteLoadingIsShow', false)
        if (this.showMessage(this, response)) {
          this.getRoleList() // 重新从后台获取角色列表
        }
      })
    },

    // 条件触发查询
    handleFilter() {
      this.listQuery.pageNum = 1
      this.getRoleList()
    }

  }
}
</script>

<style>
/*/deep/ .el-transfer-panel {*/
/*  width: 300px !important;*/
/*  height: 500px !important;*/
/*}*/

.el-transfer-panel {
  width: calc(35%);
  height: calc(100%);
  text-align: left;
  display: inline-block;

  /*border: 1px solid #ebeef5;*/
  /*border-radius: 4px;*/
  /*overflow: hidden;*/
  /*background: #fff;*/
  /*display: inline-block;*/
  /*vertical-align: middle;*/

  /*box-sizing: border-box;*/
  /*position: relative;*/
}

/*.transfer_class {*/
/*  text-align: left;*/
/*  display: inline-block;*/
/*}*/

/*穿梭框文字长度*/
.edit_dev >>> .el-transfer-panel {
  width: 350px;
}

</style>
