<template>
  <div class="app-container">

    <!-- inline="true"，el-form-item不自动换行 -->
    <el-form label-width="80px" :inline="true">

      <el-form-item :label="'权限名'" size="mini">
        <el-input
          v-model="listQuery.name"
          :placeholder="'权限名'"
          style="width: 100%"
          class="filter-item"
          size="mini"
        />
      </el-form-item>

      <el-form-item :label="'权限地址'" size="mini">
        <el-input
          v-model="listQuery.source_addr"
          :placeholder="'权限名'"
          style="width: 100%"
          class="filter-item"
          size="mini"
        />
      </el-form-item>

      <el-button class="filter-item" type="primary" size="mini" @click="handleFilter">搜索</el-button>
      <el-button class="filter-item" type="primary" size="mini" @click="handleCreate">添加</el-button>
      <el-button class="filter-item" type="primary" size="mini" @click="handleInitListQuery">重置</el-button>

    </el-form>

    <el-tabs v-model="activeName" @tab-click="handleFilter">
      <el-tab-pane label="前端权限" name="front" />
      <el-tab-pane label="后端权限" name="api" />
    </el-tabs>

    <!-- 表格栏 -->
    <el-table
      ref="listTable"
      v-loading="tableLoadingIsShow"
      size="mini"
      element-loading-text="正在排序中"
      element-loading-spinner="el-icon-loading"
      :data="permission_list"
      fit
      stripe
      row-key="id"
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column :label="'序号'" prop="id" align="center" min-width="6%" size="mini">
        <template slot-scope="scope">
          <span> {{ (listQuery.page_num - 1) * listQuery.page_size + scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column :label="'权限类型'" prop="source_addr" align="center" min-width="8%" size="mini">
        <template slot-scope="scope">
          <span>{{ source_type_dict[scope.row.source_type] }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'权限名'" prop="name" align="center" min-width="25%" size="mini">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'权限地址'" prop="source_addr" align="center" min-width="20%" size="mini">
        <template slot-scope="scope">
          <span>{{ scope.row.source_addr }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'备注'" prop="desc" align="center" min-width="10%" size="mini">
        <template slot-scope="scope">
          <span>{{ scope.row.desc }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'创建时间'" prop="create_time" align="center" min-width="15%" size="mini">
        <template slot-scope="scope">
          <span>{{ scope.row.create_time }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="'操作'" align="center" min-width="10%" size="mini">
        <template slot-scope="scope">

          <!--复制权限-->
          <el-button
            type="text"
            size="mini"
            @click="handleCreate(scope.row)"
          >复制
          </el-button>

          <!--编辑权限-->
          <el-button
            type="text"
            size="mini"
            style="margin-right: 10px"
            @click="handleUpdate(scope.row)"
          >修改
          </el-button>

          <!-- 删除权限 -->
          <el-popover
            :ref="scope.row.id"
            v-model="scope.row.deletePopoverIsShow"
            placement="top"
            popper-class="down-popover"
          >
            <p>确定删除【{{ scope.row.name }}】?</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="cancelDeletePopover(scope.row)">取消</el-button>
              <el-button type="primary" size="mini" @click="delPermission(scope.row)">确定</el-button>
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
      :page.sync="listQuery.page_num"
      :limit.sync="listQuery.page_size"
      @pagination="getPermissionList"
    />

    <!-- 新增/修改表单 -->
    <el-drawer
      :title=" drawerType === 'create' ? '新增权限' : '修改权限'"
      size="60%"
      :visible.sync="drawerIsShow"
      :direction="direction"
    >
      <el-form
        ref="dataForm"
        :model="tempPermission"
        label-width="100px"
        style="min-width: 400px;margin-left: 20px;margin-right: 20px"
      >
        <el-form-item label="权限类型" class="is-required" size="mini">
          <el-select
            v-model="tempPermission.source_type"
            placeholder="权限类型"
            style="width:100%"
            @change="selectSourceType"
          >
            <el-option
              v-for="(value, key) in source_type_dict"
              :key="key"
              :label="value"
              :value="key"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="权限分类" class="is-required" size="mini">
          <el-select v-model="tempPermission.source_class" placeholder="权限分类" style="width:100%">
            <el-option
              v-for="source_class in sourceClass"
              :key="source_class.key"
              :label="source_class.value"
              :value="source_class.key"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="'权限名'" prop="name" class="is-required" size="mini">
          <el-input v-model="tempPermission.name" :placeholder="'权限名'" />
        </el-form-item>

        <el-form-item :label="'权限地址'" class="is-required" size="mini">
          <el-input
            v-model="tempPermission.source_addr"
            :placeholder="'权限地址'"
            style="width: 100%"
            class="filter-item"
            size="mini"
          />
        </el-form-item>

        <el-form-item :label="'备注'" prop="desc" size="mini">
          <el-input v-model="tempPermission.desc" type="textarea" />
        </el-form-item>
      </el-form>

      <div class="demo-drawer__footer">
        <el-button size="mini" @click="drawerIsShow = false">取消</el-button>
        <el-button
          size="mini"
          type="primary"
          :loading="submitButtonIsLoading"
          @click="drawerType==='create' ? addPermission() : changPermission()"
        >保存
        </el-button>
      </div>

    </el-drawer>

  </div>
</template>

<script>
import Sortable from 'sortablejs'

import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'

import {
  getPermission,
  permissionType,
  permissionList,
  deletePermission,
  postPermission,
  putPermission, permissionSort
} from '@/apis/system/permission'

export default {
  name: 'Permission',
  components: {
    Pagination
  },
  directives: { waves },
  data() {
    return {
      activeName: 'front',
      sourceClass: [
        { 'key': 'menu', 'value': '菜单' },
        { 'key': 'addr', 'value': '地址' },
        { 'key': 'button', 'value': '按钮' }
      ],
      // 查询对象
      listQuery: {
        page_num: 1,
        page_size: 20,
        detail: true,
        name: undefined,
        source_addr: undefined
      },
      // 临时数据，添加、修改
      tempPermission: {
        id: undefined,
        name: undefined,
        desc: undefined,
        source_addr: undefined,
        source_class: undefined,
        source_type: undefined
      },
      source_type_dict: {},
      permission_list: [],
      submitButtonIsLoading: false,
      total: 0, // 服务数据表格总条数
      drawerIsShow: false, // 编辑框的显示状态
      drawerType: '', // dialog框状态，edit为编辑数据, create为新增数据
      direction: 'rtl', // 抽屉打开方式
      tableLoadingIsShow: false, // 请求加载状态

      // 拖拽排序参数
      sortable: null,
      oldList: [],
      newList: []
    }
  },
  computed: {},

  watch: {},

  created() {
    this.getPermissionList()
    this.initTempPermission() // 初始化临时数据

    this.oldList = this.permission_list.map(v => v.id)
    this.newList = this.oldList.slice()
    this.$nextTick(() => {
      this.setSort()
    })
  },

  mounted() {
    permissionType().then(response => {
      this.source_type_dict = response.data
    })
  },

  methods: {

    selectSourceType() {
      if (this.tempPermission.source_type === 'api') {
        this.sourceClass = [
          { 'key': 'GET', 'value': 'GET请求' },
          { 'key': 'POST', 'value': 'POST请求' },
          { 'key': 'PUT', 'value': 'PUT请求' },
          { 'key': 'DELETE', 'value': 'DELETE请求' }
        ]
      } else {
        this.sourceClass = [
          { 'key': 'menu', 'value': '菜单' },
          { 'key': 'addr', 'value': '地址' },
          { 'key': 'button', 'value': '按钮' }
        ]
      }
      this.tempPermission.source_class = this.sourceClass[0].key
    },
    // 权限列表
    getPermissionList() {
      this.listQuery.source_type = this.activeName
      this.tableLoadingIsShow = true
      permissionList(this.listQuery).then(response => {
        this.tableLoadingIsShow = false
        this.permission_list = response.data.data
        this.total = response.data.total

        this.oldList = this.permission_list.map(v => v.id)
        this.newList = this.oldList.slice()
      })
    },

    // 初始化临时服务数据
    initTempPermission(row) {
      this.tempPermission = {
        id: undefined,
        name: row ? row.name : undefined,
        desc: row ? row.desc : undefined,
        source_addr: row ? row.source_addr : undefined,
        source_class: row ? row.source_class : this.sourceClass[0].key,
        source_type: this.activeName
      }
    },

    // 初始化临时模板数据，点击新增按钮触发
    handleCreate(row) {
      this.initTempPermission(row)
      this.drawerType = 'create' // dialog框标识为创建
      this.drawerIsShow = true
    },

    //  初始化临时模板数据，点击修改按钮触发
    handleUpdate(row) {
      this.drawerType = 'edit' // dialog框标识为编辑
      getPermission({id: row.id}).then(response => {
        this.tempPermission = response.data
      })
      this.drawerIsShow = true
    },

    // 重置查询数据
    handleInitListQuery() {
      this.listQuery = {
        page_num: 1,
        page_size: 20,
        name: undefined,
        source_type: undefined,
        source_class: undefined,
        source_addr: undefined
      }
      this.getPermissionList()
    },

    // 新增权限
    addPermission() {
      this.submitButtonIsLoading = true
      postPermission(this.tempPermission).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.drawerIsShow = false
          this.initTempPermission() // 初始化临时数据模板
          this.getPermissionList() // 重新从后台获取服务列表
        }
      })
    },

    // 修改权限
    changPermission() {
      this.submitButtonIsLoading = true
      putPermission(this.tempPermission).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.drawerIsShow = false
          this.initTempPermission() // 初始化临时数据模板
          this.getPermissionList() // 重新从后台获取服务列表
        }
      })
    },

    cancelDeletePopover(row) {
      this.$set(row, 'deletePopoverIsShow', false)
    },

    // 删除权限
    delPermission(row) {
      this.$set(row, 'deletePopoverIsShow', false)
      this.$set(row, 'deleteLoadingIsShow', true)
      deletePermission({ 'id': row.id }).then(response => {
        this.$set(row, 'deleteLoadingIsShow', false)
        if (this.showMessage(this, response)) {
          this.getPermissionList() // 重新从后台获取权限列表
        }
      })
    },

    // 条件触发查询
    handleFilter() {
      this.listQuery.page_num = 1
      this.getPermissionList()
    },

    // 拖拽排序
    setSort() {
      const el = this.$refs.listTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost',
        setData: function(dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.permission_list.splice(evt.oldIndex, 1)[0]
          this.permission_list.splice(evt.newIndex, 0, targetRow)
          const tempIndex = this.newList.splice(evt.oldIndex, 1)[0]
          this.newList.splice(evt.newIndex, 0, tempIndex)

          // 发送请求，改变排序
          this.tableLoadingIsShow = true
          permissionSort({ id_list: this.newList, page_num: this.listQuery.page_num, page_size: this.listQuery.page_size}).then(response => {
            this.showMessage(this, response)
            this.getPermissionList()
            this.tableLoadingIsShow = false
          })
        }
      })
    }

  }
}
</script>
