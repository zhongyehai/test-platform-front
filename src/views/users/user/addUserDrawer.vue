<template>
  <el-drawer
    title="新增用户"
    size="95%"
    :wrapper-closable="false"
    :append-to-body="true"
    :visible.sync="drawerIsShow"
    :direction="direction"
  >

    <div style="margin-left: 20px; margin-right: 20px">

      <el-table
        ref="dataTable"
        :data="tempData"
        stripe
        size="mini"
        row-key="id"
      >

        <el-table-column label="序号" header-align="center" min-width="4%">
          <template slot-scope="scope">
            <div>{{ scope.$index + 1 }}</div>
          </template>
        </el-table-column>

        <el-table-column header-align="center" min-width="15%">
          <template slot="header">
            <span><span style="color: red">*</span>用户名</span>
          </template>
          <template slot-scope="scope">
            <el-input v-model="scope.row.name" size="mini" type="textarea" :rows="1" />
          </template>
        </el-table-column>

        <el-table-column header-align="center" min-width="15%">
          <template slot="header">
            <span><span style="color: red">*</span>账号</span>
          </template>
          <template slot-scope="scope">
            <el-input v-model="scope.row.account" size="mini" type="textarea" :rows="1" />
          </template>
        </el-table-column>

        <el-table-column header-align="center" min-width="15%">
          <template slot="header">
            <span><span style="color: red">*</span>密码</span>
          </template>
          <template slot-scope="scope">
            <el-input v-model="scope.row.password" size="mini" type="textarea" :rows="1" />
          </template>
        </el-table-column>

        <el-table-column header-align="center" min-width="20%">
          <template slot="header">
            <span>
              <span style="color: red">*</span>
              业务线
              <el-popover class="el_popover_class" placement="top-start" trigger="hover">
                <div>
                  <div>1、仅有当前业务线权限的用户才能看到此服务</div>
                  <div>2、若要修改用户业务线权限，需登录管理员账号，在用户管理处修改</div>
                </div>
                <el-button slot="reference" type="text" icon="el-icon-question" />
              </el-popover>
            </span>
          </template>
          <template slot-scope="scope">
            <el-select
              v-model="scope.row.business_list"
              multiple
              filterable
              default-first-option
              clearable
              size="mini"
              style="width: 100%"
              placeholder="请选择业务线"
              class="filter-item"
            >
              <el-option
                v-for="businessItem in $busEvents.data.businessList"
                :key="businessItem.id"
                :label="businessItem.name"
                :value="businessItem.id"
              />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column header-align="center" min-width="20%">
          <template slot="header">
            <span><span style="color: red">*</span>角色</span>
          </template>
          <template slot-scope="scope">
            <el-select
              v-model="scope.row.role_list"
              size="mini"
              placeholder="请选择角色"
              multiple
              filterable
              style="width:100%"
            >
              <el-option
                v-for="role in roleList"
                :key="role.name"
                :label="role.name"
                :value="role.id"
              />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column label="操作" header-align="center" min-width="4%">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" placement="top-end" content="添加一行">
              <el-button
                v-show="scope.$index === 0 || scope.$index === tempData.length - 1"
                type="text"
                size="mini"
                icon="el-icon-plus"
                @click.native="addRow(true)"
              />
            </el-tooltip>
            <el-tooltip class="item" effect="dark" placement="top-end" content="删除当前行">
              <el-button
                v-show="isShowDelButton(scope.$index)"
                type="text"
                size="mini"
                icon="el-icon-minus"
                style="color: red"
                @click.native="delRow(scope.$index)"
              />
            </el-tooltip>
            <el-tooltip class="item" effect="dark" placement="top-end" content="清除数据">
              <el-button
                v-show="tempData.length === 1"
                type="text"
                size="mini"
                icon="el-icon-circle-close"
                style="color: red"
                @click.native="clearData()"
              />
            </el-tooltip>
          </template>
        </el-table-column>

      </el-table>
    </div>

    <div class="demo-drawer__footer">

      <el-button size="mini" @click=" drawerIsShow = false"> {{ '取消' }}</el-button>
      <el-button
        size="mini"
        type="primary"
        :loading="submitLoadingIsShow"
        @click="addUser()"
      >
        {{ '保存' }}
      </el-button>
    </div>

  </el-drawer>

</template>

<script>

import { postUser } from '@/apis/system/user'
export default {
  name: 'AddCaseDrawer',
  components: {

  },
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'roleList', 'businessList'
  ],
  data() {
    return {
      direction: 'rtl', // 抽屉打开方式
      drawerType: '',
      drawerIsShow: false,

      checkAll: false,
      isIndeterminate: true,

      tempData: [{
        id: `${Date.now()}`,
        name: null,
        account: null,
        password: null,
        role_list: [],
        business_list: []
      }],
      submitLoadingIsShow: false
    }
  },

  mounted() {
    // 监听 添加数据指令
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, command) => {
      if (_type === 'userInfo') {
        if (command === 'add') {
          this.initNewTempData()
          this.drawerIsShow = true
        }
      }
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsShow)
  },

  methods: {
    addRow() {
      this.tempData.push({
        id: `${Date.now()}`,
        name: null,
        account: null,
        password: null,
        role_list: [],
        business_list: []
      })
    },

    // 是否显示删除按钮
    isShowDelButton(index) {
      return !(this.tempData.length === 1 && index === 0)
    },

    // 删除一行
    delRow(index) {
      this.tempData.splice(index, 1)
    },

    // 清除数据
    clearData() {
      this.tempData[0].name = null
      this.tempData[0].account = null
      this.tempData[0].password = null
      this.tempData[0].role_list = []
      this.tempData[0].business_list = []
    },

    // 初始化新增数据模板
    initNewTempData() {
      this.tempData = [{
        id: `${Date.now()}`,
        name: null,
        account: null,
        password: null,
        role_list: [],
        business_list: []
      }]
    },

    // 新增数据
    addUser() {
      this.submitLoadingIsShow = true
      postUser({ user_list: this.tempData }).then(response => {
        this.submitLoadingIsShow = false
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.drawerIsCommit, 'userInfo')
          this.drawerIsShow = false
        }
      })
    }

  }
}
</script>

<style scoped>

</style>
