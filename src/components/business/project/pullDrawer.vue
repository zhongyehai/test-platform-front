<template>

  <el-dialog
    title="选择需要拉取的字段"
    :visible.sync="pullDialogIsShow"
    width="50%"
  >

    <div style="margin-bottom: 20px">
      {{ `从${pullProject.yapi_id ? 'yapi' : 'swagger'}拉取此服务下的模块、接口及接口的以下字段` }}
    </div>

    <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">全选</el-checkbox>
    <div style="margin: 15px 0;" />
    <el-checkbox-group v-model="checkedOptions" @change="handleCheckedCitiesChange">
      <el-checkbox v-for="(value, key) in apiOptions" :key="key" :label="key">{{ value }}</el-checkbox>
    </el-checkbox-group>
    <span slot="footer" class="dialog-footer">
      <el-button size="mini" @click="pullDialogIsShow = false">取 消</el-button>
      <el-button
        type="primary"
        size="mini"
        :loading="pullButtonIsLoading"
        @click="pullProject.yapi_id ? pullByYapi(pullProject) : pullBySwagger(pullProject)"
      >确定</el-button>
    </span>
  </el-dialog>

</template>

<script>
import { yapiPull } from '@/apis/assist/yapi'
import { swaggerPull } from '@/apis/assist/swagger'

export default {
  name: 'Project',
  // eslint-disable-next-line vue/require-prop-types
  props: ['dataType'],
  data() {
    return {
      apiOptions: {
        headers: '请求头',
        query: '查询字符串',
        json: '请求体-json',
        form: '请求体-form',
        response: '响应体'
      },
      pullProject: { yapi_id: '' },
      pullDialogIsShow: false,
      pullButtonIsLoading: false,
      checkAll: false,
      checkedOptions: ['query', 'json', 'form', 'response'],
      isIndeterminate: true
    }
  },
  mounted() {
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, project) => {
      if (_type === 'pullProjectData') {
        this.pullProject = project
        this.checkedOptions = ['query', 'json', 'form', 'response']
        this.pullDialogIsShow = true
      }
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsShow)
  },

  methods: {

    // 全选
    handleCheckAllChange(val) {
      this.checkedOptions = val ? Object.keys(this.apiOptions) : []
      this.isIndeterminate = false
    },

    // 点击选择
    handleCheckedCitiesChange(value) {
      const checkedCount = value.length
      this.checkAll = checkedCount === this.apiOptions.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.apiOptions.length
    },

    // 从yapi同步服务信息
    pullByYapi(row) {
      this.pullButtonIsLoading = true
      yapiPull({ id: row.id, options: this.checkedOptions }).then(response => {
        this.pullButtonIsLoading = false
        this.showMessage(this, response)
        this.sendSuccess()
      })
    },

    clickPullButton(row) {
      this.pullProject = row
      this.pullDialogIsShow = true
    },

    // 从swagger同步服务信息
    pullBySwagger(row) {
      this.pullButtonIsLoading = true
      swaggerPull({ id: row.id, options: this.checkedOptions }).then(response => {
        this.pullButtonIsLoading = false
        this.showMessage(this, response)
        this.sendSuccess()
      })
    },

    sendSuccess() {
      this.$bus.$emit(this.$busEvents.drawerIsCommit, 'pullProjectData')
      this.pullDialogIsShow = false
    }

  }

}
</script>

<style scoped>

</style>
