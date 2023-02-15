<template>

  <el-drawer
    :title=" drawerType === 'add' ? '新增数据' : '修改数据'"
    size="40%"
    :wrapperClosable="false"
    :visible.sync="drawerIsShow"
    :direction="direction">

    <el-form
      ref="dataForm"
      :model="tempData"
      label-width="100px"
      style="min-width: 400px;margin-left: 20px;margin-right: 20px">

      <el-form-item label="环境：" size="mini" class="is-required">
        <el-select
          v-model="tempData.env"
          placeholder="选择环境"
          clearable
          filterable
          style="width: 100%"
          size="mini"
          class="filter-item"
        >
          <el-option v-for="env in runEnvList" :key="env.code" :label="env.name" :value="env.code"/>
        </el-select>
      </el-form-item>

      <el-form-item label="手机号" size="mini">
        <el-input v-model="tempData.mobile"/>
      </el-form-item>

      <el-form-item label="密码" size="mini">
        <el-input v-model="tempData.password"/>
      </el-form-item>

      <el-form-item label="流水号" size="mini" class="is-required">
        <el-input v-model="tempData.business_order_no"/>
      </el-form-item>

      <el-form-item label="业务状态" size="mini">
        <el-select
          v-model="tempData.business_status"
          style="width: 100%"
          :placeholder="'选择业务状态'"
          clearable
          filterable
          size="mini"
          class="filter-item"
        >
          <el-option v-for="status in businessStatusList" :key="status" :label="status" :value="status"/>
        </el-select>
      </el-form-item>

      <el-form-item label="使用状态" size="mini">
        <el-select
          v-model="tempData.use_status"
          style="width: 100%"
          :placeholder="'选择使用状态'"
          clearable
          filterable
          default-first-option
          size="mini"
          class="filter-item"
        >
          <el-option v-for="(value, key) in useStatusList" :key="key" :label="value" :value="key"/>
        </el-select>
      </el-form-item>

      <el-form-item :label="'描述'" prop="desc" size="mini">
        <el-input type="textarea" autosize v-model="tempData.desc"/>
      </el-form-item>

    </el-form>
    <div class="demo-drawer__footer">
      <el-button size="mini" @click="drawerIsShow = false"> {{ '取消' }}</el-button>
      <el-button
        type="primary"
        size="mini"
        :loading="submitButtonIsLoading"
        @click=" drawerType === 'add' ? addData() : changData() ">
        {{ '保存' }}
      </el-button>
    </div>
  </el-drawer>

</template>

<script>
import {dataPool, postDataPool, putDataPool} from '@/apis/assist/dataPool'

import waves from '@/directive/waves'

export default {
  name: "drawer",
  directives: {waves},
  props: [
    'businessStatusList', 'useStatusList', 'runEnvList'
  ],
  data() {
    return {

      submitButtonIsLoading: false,

      // 配置新增/编辑临时数据
      tempData: {
        id: undefined,
        env: undefined,
        mobile: undefined,
        password: undefined,
        amount: undefined,
        desc: undefined,
        use_status: undefined,
        business_status: undefined,
        business_order_no: undefined
      },
      drawerIsShow: false,  // 抽屉的显示状态
      drawerType: 'add',  // 抽屉状态，edit为编辑数据, create为新增数据
      direction: 'rtl',  // 抽屉打开方式
    }
  },

  mounted() {

    // 监听 bus 配置操作指令
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, status, data) => {
      if (_type === 'dataPool'){
        if (status === 'add') {
          this.drawerType = 'add'
          this.tempData.id = '';
          this.tempData.env = '';
          this.tempData.mobile = '';
          this.tempData.password = '';
          this.tempData.amount = '';
          this.tempData.desc = '';
          this.tempData.use_status = '';
          this.tempData.business_status = '';
          this.tempData.business_order_no = '';
        } else if (status === 'edit') {
          this.drawerType = 'edit'
          this.tempData.id = data.id;
          this.tempData.env = data.env;
          this.tempData.mobile = data.mobile;
          this.tempData.password = data.password;
          this.tempData.amount = data.amount;
          this.tempData.desc = data.desc;
          this.tempData.use_status = data.use_status;
          this.tempData.business_status = data.business_status;
          this.tempData.business_order_no = data.business_order_no;
        }
        this.drawerIsShow = true
      }
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsShow)
  },

  methods: {

    addData() {
      this.submitButtonIsLoading = true
      postDataPool(this.tempData).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.sendIsCommitStatus()
        }
      })
    },

    changData() {
      this.submitButtonIsLoading = true
      putDataPool(this.tempData).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.sendIsCommitStatus()
        }
      })
    },

    // 向父组件发送form表单提交状态
    sendIsCommitStatus() {
      this.drawerIsShow = false
      this.$bus.$emit(this.$busEvents.drawerIsCommit, 'dataPool')
    },
  }
}
</script>


<style scoped>

</style>
