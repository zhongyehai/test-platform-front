<template>

  <el-drawer
    :title="tempData.id ? '修改队列链接' : '新增队列链接'"
    size="45%"
    :append-to-body="true"
    :visible.sync="drawerIsShow"
    :direction="direction"
  >
    <el-form
      ref="dataForm"
      label-position="center"
      label-width="80px"
      style="margin-left: 20px;margin-right: 20px"
    >

      <el-form-item :label="'队列类型'" prop="name" class="is-required" size="mini">
        <el-select
          v-model="tempData.queue_type"
          :placeholder="'选择队列类型'"
          filterable
          default-first-option
          clearable
          style="width: 100%"
          size="mini"
          class="filter-item"
        >
          <el-option v-for="(value, key) in queueTypeDict" :key="key" :label="value" :value="key" />
        </el-select>
      </el-form-item>

      <el-form-item :label="'地址'" prop="name" class="is-required" size="mini">
        <el-input v-model="tempData.host" size="mini" placeholder="地址" />
      </el-form-item>

      <el-form-item :label="'端口'" prop="name" class="is-required" size="mini">
        <el-input v-model="tempData.port" size="mini" placeholder="端口" />
      </el-form-item>

      <el-form-item :label="'账号'" prop="name" class="is-required" size="mini">
        <el-input v-model="tempData.account" size="mini" placeholder="账号" />
      </el-form-item>

      <el-form-item :label="'密码'" prop="name" class="is-required" size="mini">
        <el-input v-model="tempData.password" size="mini" placeholder="密码" />
      </el-form-item>

      <el-form-item :label="'备注'" prop="desc" size="mini">
        <el-input v-model="tempData.desc" size="mini" type="textarea" :rows="1" :placeholder="'函数的描述、备注'" />
      </el-form-item>

    </el-form>

    <div class="demo-drawer__footer">
      <el-button size="mini" @click="drawerIsShow = false"> {{ '取消' }}</el-button>
      <el-button
        type="primary"
        size="mini"
        :loading="submitButtonIsLoading"
        @click="tempData.id ? editQueueLink(): createQueueLink()"
      >
        {{ '保存' }}
      </el-button>
    </div>

  </el-drawer>
</template>

<script>

import { getQueue, postQueueLink, putQueueLink } from '@/apis/assist/queue'

export default {
  name: 'Drawer',
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'queueTypeDict'
  ],
  data() {
    return {
      direction: 'rtl', // 抽屉打开方式
      dialogIsShow: false,
      submitButtonIsLoading: false,
      drawerIsShow: false,
      tempData: {
        id: '',
        queue_type: '',
        host: '',
        port: 5672,
        account: '',
        password: '',
        desc: ''
      }
    }
  },

  mounted() {
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, status, data) => {
      if (_type === 'queueLinkInfo') {
        if (status === 'add') {
          this.tempData.id = ''
          this.tempData.queue_type = ''
          this.tempData.host = ''
          this.tempData.port = 5672
          this.tempData.account = ''
          this.tempData.password = ''
          this.tempData.desc = ''
        } else {
          getQueue({ id: data.id }).then(response => {
            this.tempData = response.data
            if (status === 'copy') {
              this.tempData.id = undefined
            }
          })
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
    createQueueLink() {
      this.submitButtonIsLoading = true
      postQueueLink(this.tempData).then(res => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, res)) {
          // this.tempData.id = res.data.id
          this.$bus.$emit(this.$busEvents.drawerIsCommit, 'queueLinkInfo')
          this.drawerIsShow = false
        }
      })
    },

    editQueueLink() {
      this.submitButtonIsLoading = true
      putQueueLink(this.tempData).then(res => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, res)) {
          this.$bus.$emit(this.$busEvents.drawerIsCommit, 'queueLinkInfo')
          this.drawerIsShow = false
        }
      })
    }
  }

}
</script>

<style scoped>

</style>
