<template>
  <div class="app-container">

    <el-form label-width="80px" :inline="true">

      <el-form-item :label="'业务线：'" size="mini">
        <el-input
          v-model="listQuery.name"
          class="input-with-select"
          placeholder="业务线，支持模糊搜索"
          size="mini"
          clearable
          style="width: 200px"
        />
      </el-form-item>

      <el-form-item :label="'code：'" size="mini">
        <el-input
          v-model="listQuery.code"
          class="input-with-select"
          placeholder="业务线code，支持模糊搜索"
          size="mini"
          clearable
          style="width: 200px"
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
        @click="getBusinessList()"
      >
        搜索
      </el-button>

      <el-button
        class="filter-item"
        style="margin-left: 10px"
        type="primary"
        size="mini"
        @click="showAddBusinessDialog()"
      >
        添加业务线
      </el-button>

      <el-button
        class="filter-item"
        style="margin-left: 10px"
        type="primary"
        size="mini"
        @click.native="showBusinessToUserDrawer()"
      >绑定管理</el-button>

    </el-form>

    <el-table
      ref="apiTree"
      v-loading="listLoading"
      size="mini"
      :data="list"
      stripe
    >
      <el-table-column prop="id" label="编号" align="center" min-width="10%">
        <template slot-scope="scope">
          <span> {{ (listQuery.page_num - 1) * listQuery.page_size + scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column show-overflow-tooltip prop="name" align="center" label="业务线" min-width="35%">
        <template slot-scope="scope">
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>

      <el-table-column show-overflow-tooltip prop="code" align="center" label="code" min-width="15%">
        <template slot-scope="scope">
          <span> {{ scope.row.code }} </span>
        </template>
      </el-table-column>

      <el-table-column show-overflow-tooltip prop="desc" align="center" label="备注" min-width="20%">
        <template slot-scope="scope">
          <span> {{ scope.row.desc }} </span>
        </template>
      </el-table-column>

      <el-table-column show-overflow-tooltip prop="create_user" align="center" label="创建者" min-width="10%">
        <template slot-scope="scope">
          <span>{{ parseUser(scope.row.create_user) }}</span>
        </template>
      </el-table-column>

      <el-table-column show-overflow-tooltip prop="desc" align="center" label="操作" min-width="10%">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="mini"
            @click.native="showAddBusinessDialog(scope.row)"
          >修改
          </el-button>
        </template>
      </el-table-column>

    </el-table>

    <!-- 新增/修改配置类型 -->
    <el-drawer
      :title=" drawerType === 'add' ? '新增业务线' : '修改业务线'"
      size="60%"
      :visible.sync="drawerIsShow"
      :direction="direction"
    >

      <el-form ref="dataForm" label-width="80px" style="margin-left: 20px;margin-right: 20px">

        <el-form-item :label="'业务线名'" class="is-required" size="mini">
          <el-input v-model="tempBusiness.name" size="mini" />
        </el-form-item>

        <el-form-item :label="'code'" class="is-required" size="mini">
          <el-input v-model="tempBusiness.code" :disabled="drawerType === 'edit'" size="mini" />
        </el-form-item>

        <el-form-item :label="'关联环境'" class="is-required" size="mini">
          <el-radio v-model="tempBusiness.bind_env" label="human">手动关联</el-radio>
          <el-radio v-model="tempBusiness.bind_env" label="auto">自动关联</el-radio>
          <el-popover class="el_popover_class" placement="top-start" trigger="hover">
            <div>此业务线与运行环境的关联机制</div>
            <div>1、手动关联：新增运行环境后，需手动将此运行环境与此业务线关联</div>
            <div>2、自动关联：新增运行环境时，新增的运行环境将自动与此业务线关联</div>
            <div>注：不管此处选的是什么机制，对于已存在的运行环境，若此业务线需要关联，都需要进行一次手动关联</div>
            <el-button slot="reference" type="text" icon="el-icon-question" />
          </el-popover>
        </el-form-item>

        <el-form-item :label="'统计通知'" class="is-required" size="mini">
          <el-radio v-model="tempBusiness.receive_type" label="0">不接收</el-radio>
          <el-radio v-model="tempBusiness.receive_type" label="ding_ding">钉钉</el-radio>
          <el-radio v-model="tempBusiness.receive_type" label="we_chat">企业微信</el-radio>
          <el-popover class="el_popover_class" placement="top-start" trigger="hover">
            <div>1、设置接收该业务线自动化测试阶段统计通知方式（周统计、月统计）</div>
            <div>2、钉钉群为关键词模式，关键词为“测试”、“报告”、“统计”</div>
            <el-button slot="reference" type="text" icon="el-icon-question" />
          </el-popover>
        </el-form-item>

        <el-form-item v-show="tempBusiness.receive_type !== '0'" :label="'webhook'" class="is-required" size="mini">
          <oneColumnRow
            ref="oneColumnRow"
            :current-data="tempBusiness.webhook_list"
          />
        </el-form-item>

        <el-form-item :label="'备注'" size="mini">
          <el-input v-model="tempBusiness.desc" type="textarea" autosize size="mini" />
        </el-form-item>

        <el-form-item :label="'运行环境'" size="mini">
          <el-select
            v-model="tempBusiness.env_list"
            :placeholder="'选择运行环境'"
            filterable
            multiple
            default-first-option
            clearable
            style="width: 97%"
            size="mini"
            class="filter-item"
            @change="handleCheckedItemChange"
          >
            <div style="margin-left: 20px; margin-bottom: 10px">
              <el-checkbox
                v-model="checkAll"
                :indeterminate="isIndeterminate"
                @change="handleCheckAllChange"
              >全选
              </el-checkbox>
            </div>
            <el-option v-for="env in run_env_list" :key="env.id" :label="`${env.group}_${env.name}`" :value="env.id" />
          </el-select>
          <el-popover
            class="el_popover_class"
            placement="top-start"
            trigger="hover"
          >
            <div>
              <div>属于此业务线的项目，执行测试时，只能跑此处选择的环境</div>
            </div>
            <el-button slot="reference" type="text" icon="el-icon-question" />
          </el-popover>
        </el-form-item>

      </el-form>
      <div class="demo-drawer__footer">
        <el-button size="mini" @click="drawerIsShow = false"> {{ '取消' }}</el-button>
        <el-button
          type="primary"
          size="mini"
          :loading="submitButtonIsLoading"
          @click=" drawerType === 'add' ? addBusiness() : changBusiness()"
        >
          {{ '保存' }}
        </el-button>
      </div>
    </el-drawer>

    <businessToUser />

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page_num"
      :limit.sync="listQuery.page_size"
      @pagination="getBusinessList"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination/index.vue'
import oneColumnRow from '@/components/Inputs/oneColumnRow.vue'
import businessToUser from './businessToUser.vue'
import { getBusiness, businessList, postBusiness, putBusiness } from '@/apis/config/business'
import { userList } from '@/apis/system/user'
import { runEnvList } from '@/apis/config/runEnv'
import * as types from '@/store/types'

export default {
  name: 'Index',
  components: {
    Pagination,
    businessToUser,
    oneColumnRow
  },
  data() {
    return {
      listQuery: {
        page_num: 1,
        page_size: 20,
        detail: true,
        create_user: undefined,
        name: undefined,
        code: undefined
      },

      // 请求列表等待响应的状态
      listLoading: false,
      total: 0,
      list: [],
      drawerIsShow: false,
      drawerType: '',
      direction: 'rtl', // 抽屉打开方式
      submitButtonIsLoading: false,
      run_env_list: [],
      run_env_id_list: [],
      tempBusiness: {
        id: undefined,
        name: undefined,
        code: undefined,
        bind_env: 'human',
        receive_type: '0',
        webhook_list: [],
        env_list: [],
        desc: undefined
      },
      currentUserList: [],
      userDict: {},

      checkAll: false,
      isIndeterminate: true
    }
  },

  mounted() {
    runEnvList({ page_num: 1, page_size: 9999 }).then(response => {
      this.run_env_list = response.data.data
      this.run_env_list.forEach(env => {
        this.run_env_id_list.push(env.id)
      })
    })

    this.getUserList(this.getBusinessList)
    // this.getBusinessList()
  },

  methods: {

    // 点击全选
    handleCheckAllChange(val) {
      this.tempBusiness.env_list = val ? this.run_env_id_list : []
      this.isIndeterminate = false
    },

    // 当选中选项时，全选按钮的状态变化
    handleCheckedItemChange(value) {
      const checkedCount = value.length
      this.checkAll = checkedCount === this.run_env_list.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.run_env_list.length
    },

    showBusinessToUserDrawer() {
      this.$bus.$emit(
        this.$busEvents.drawerIsShow,
        'businessToUser',
        JSON.parse(JSON.stringify(this.list)),
        JSON.parse(JSON.stringify(this.currentUserList))
      )
    },

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

    showAddBusinessDialog(row) {
      if (row) {
        getBusiness({ id: row.id }).then(response => {
          this.tempBusiness = response.data
          this.drawerType = 'edit'
        })
      } else {
        this.tempBusiness = {
          id: undefined,
          name: undefined,
          code: undefined,
          bind_env: 'human',
          receive_type: '0',
          webhook_list: [],
          env_list: [],
          desc: undefined
        }
        this.drawerType = 'add'
      }
      this.drawerIsShow = true
    },

    // 增加配置类型
    addBusiness() {
      this.tempBusiness.webhook_list = this.$refs.oneColumnRow.getData()
      this.submitButtonIsLoading = true
      postBusiness(this.tempBusiness).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          // 保存新的token和权限
          this.$store.commit(types.token, response.data.token)
          localStorage.setItem('business', JSON.stringify(response.data.business_id))

          this.drawerIsShow = false
          this.getBusinessList()
        }
      })
    },

    // 修改配置类型
    changBusiness() {
      this.tempBusiness.webhook_list = this.$refs.oneColumnRow.getData()
      this.submitButtonIsLoading = true
      putBusiness(this.tempBusiness).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.drawerIsShow = false
          this.getBusinessList()
        }
      })
    },

    // 获取业务线列表
    getBusinessList() {
      this.listLoading = true
      businessList(this.listQuery).then(response => {
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
