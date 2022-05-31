<template>

  <!-- 新增/修改配置表单 -->
  <el-drawer
    :title=" drawerType === 'add' ? '新增配置' : '修改配置'"
    size="40%"
    :wrapperClosable="false"
    :visible.sync="drawerIsShow"
    :direction="direction">

    <el-form
      ref="dataForm"
      :model="tempConfig"
      :rules="rules"
      label-width="80px"
      style="min-width: 400px;margin-left: 20px;margin-right: 20px">

      <el-form-item :label="'配置类型'" prop="type" class="is-required" size="mini">
        <configTypeSelector
          ref="configTypeSelector"
          :configTypeList="configTypeList"
          :configType="tempConfig.type"
          :dialogType="drawerType"
        ></configTypeSelector>
      </el-form-item>

      <el-form-item :label="'配置名'" prop="name" class="is-required" size="mini">
        <el-input v-model="tempConfig.name" :disabled="drawerType === 'edit'"/>
      </el-form-item>

      <el-form-item :label="'配置值'" prop="value" class="is-required" size="mini">
        <el-input type="textarea" autosize v-model="tempConfig.value"/>
      </el-form-item>

      <el-form-item :label="'描述'" prop="desc" size="mini">
        <el-input v-model="tempConfig.desc"/>
      </el-form-item>

    </el-form>
    <div class="demo-drawer__footer">
      <el-button size="mini" @click="drawerIsShow = false"> {{ '取消' }}</el-button>
      <el-button
        type="primary"
        size="mini"
        :loading="submitButtonIsLoading"
        @click=" drawerType === 'add' ? addConfig() : changConfig() ">
        {{ '保存' }}
      </el-button>
    </div>
  </el-drawer>

</template>

<script>
import configTypeSelector from "@/components/Selector/configType";
import {postConfig, putConfig} from "@/apis/config/config";
import waves from '@/directive/waves'

export default {
  name: "drawer",
  components: {configTypeSelector},
  directives: {waves},
  props: ['configTypeList', 'configTypeDict'],
  data() {
    return {

      submitButtonIsLoading: false,

      // 配置新增/编辑临时数据
      tempConfig: {
        id: '',
        name: '',
        value: '',
        type: '',
        desc: '',
      },
      drawerIsShow: false,  // 抽屉的显示状态
      drawerType: 'add',  // 抽屉状态，edit为编辑数据, create为新增数据
      direction: 'rtl',  // 抽屉打开方式
      // 检验规则
      rules: {
        name: [{required: true, message: '请输入配置名称', trigger: 'blur'}]
      }
    }
  },

  created() {
  },

  mounted() {

    // 监听 bus 配置操作指令
    this.$bus.$on(this.$busEvents.config.configDrawerIsShow, (status, config) => {
      if (status === 'add') {
        this.initTempConfig()
      } else if (status === 'edit') {
        this.editTempConfig(config)
      }
      this.drawerIsShow = true
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.config.configDrawerIsShow)
  },

  methods: {
    // 点击新增配置时，初始化 dialog 数据
    initTempConfig() {
      this.drawerType = 'add'
      this.tempConfig.id = '';
      this.tempConfig.name = '';
      this.tempConfig.value = '';
      this.tempConfig.desc = '';
      this.tempConfig.type = '';
    },

    // 点击修改配置时，初始化 dialog 内容
    editTempConfig(config) {
      this.drawerType = 'edit'
      this.tempConfig.id = config.id;
      this.tempConfig.name = config.name;
      this.tempConfig.value = config.value;
      this.tempConfig.desc = config.desc;
      this.tempConfig.type = config.type;
    },

    getConfigToCommit() {
      return {
        id: this.tempConfig.id,
        name: this.tempConfig.name,
        value: this.tempConfig.value,
        desc: this.tempConfig.desc,
        type: this.$refs.configTypeSelector.tempConfigType,
      }
    },

    // 新增配置
    addConfig() {
      this.$refs['dataForm'].validate((valid) => {
        this.submitButtonIsLoading = true
        postConfig(this.getConfigToCommit()).then(response => {
          this.submitButtonIsLoading = false
          if (this.showMessage(this, response)) {
            this.sendIsCommitStatus()
          }
        })
      });
    },

    // 修改配置
    changConfig() {
      this.submitButtonIsLoading = true
      putConfig(this.getConfigToCommit()).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.sendIsCommitStatus()
        }
      })
    },

    // 向父组件发送form表单提交状态
    sendIsCommitStatus() {
      this.drawerIsShow = false
      this.$bus.$emit(this.$busEvents.config.configDrawerIsCommit, 'success')
    },
  },

  computed: {},

  watch: {}
}
</script>


<style scoped>

</style>
