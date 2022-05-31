<template>
  <!-- 新增/修改函数文件表单 -->
  <el-drawer
    :title="tempFunc.id ? '修改函数文件' : '新增函数文件'"
    size="40%"
    :wrapperClosable="false"
    :visible.sync="funcFileDrawerIsShow"
    :direction="direction">
    <el-form
      ref="dataForm"
      label-position="center"
      label-width="100px"
      style="min-width: 400px;margin-left: 20px;margin-right: 20px">

      <!-- 函数文件名 -->
      <el-form-item :label="'函数文件名'" prop="name" class="is-required" size="mini">
        <el-input v-model="tempFunc.name"/>
      </el-form-item>

      <!-- 备注 -->
      <el-form-item :label="'备注'" prop="desc">
        <el-input v-model="tempFunc.desc" size="mini" type="textarea" :rows="20" :placeholder="'函数的描述、备注'"/>
      </el-form-item>
    </el-form>

    <div class="demo-drawer__footer">
      <el-button size="mini" @click="funcFileDrawerIsShow = false"> {{ '取消' }}</el-button>
      <el-button
        type="primary"
        size="mini"
        :loading="submitButtonIsLoading"
        @click="tempFunc.id ? editFuncFile(): creteFuncFile()">
        {{ '保存' }}
      </el-button>
    </div>

  </el-drawer>
</template>

<script>
import {postFuncFile, putFuncFile} from '@/apis/apiTest/funcFile'

export default {
  name: "drawer",
  data() {
    return {
      direction: 'rtl',  // 抽屉打开方式
      submitButtonIsLoading: false,
      funcFileDrawerIsShow: false,
      tempFunc: {
        id: '',
        name: '',
        desc: ''
      }
    }
  },

  mounted() {
    this.$bus.$on(this.$busEvents.api.apiAddFuncFileDrawerIsShow, (status, data) => {
      if (status === 'add') {
        this.tempFunc.name = ''
        this.tempFunc.desc = ''
      } else if (status === 'update') {
        this.tempFunc.id = data.id
        this.tempFunc.name = data.name
        this.tempFunc.desc = data.desc
      }
      this.funcFileDrawerIsShow = true
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.api.apiAddFuncFileDrawerIsShow)
  },

  methods: {
    // 新增函数文件
    creteFuncFile() {
      this.submitButtonIsLoading = true
      postFuncFile({'name': this.tempFunc.name, 'desc': this.tempFunc.desc}).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.api.apiAddFuncFileIsCommit, 'addFuncFileIsCommit')
          this.funcFileDrawerIsShow = false
        }
      })
    },

    // 修改函数文件
    editFuncFile() {
      this.submitButtonIsLoading = true
      putFuncFile({'id': this.tempFunc.id, 'name': this.tempFunc.name, 'desc': this.tempFunc.desc}).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.api.apiAddFuncFileIsCommit, 'addFuncFileIsCommit')
          this.funcFileDrawerIsShow = false
        }
      })
    }
  },
}
</script>

<style scoped>

</style>
