<template>
  <div>
    <el-drawer v-model="drawerIsShow" :title="formData.id ? '修改链接' : '新增链接'" size="60%">
      <el-form
          ref="ruleFormRef"
          :model="formData"
          :rules="formRules"
          label-width="80px">

        <el-form-item label="队列类型" prop="queue_type" class="is-required" size="small">
          <el-select
              v-model="formData.queue_type"
              :placeholder="'选择队列类型'"
              filterable
              default-first-option
              clearable
              style="width: 100%"
              size="small"
          >
            <el-option v-for="(value, key) in queueTypeDict" :key="key" :label="value" :value="key" />
          </el-select>
        </el-form-item>

        <el-form-item label="地址" prop="host" class="is-required" size="small">
          <el-input v-model="formData.host" size="small" placeholder="地址" />
        </el-form-item>

        <el-form-item label="端口" prop="port" class="is-required" size="small">
          <el-input v-model="formData.port" size="small" placeholder="端口" />
        </el-form-item>

        <el-form-item label="账号" prop="account" class="is-required" size="small">
          <el-input v-model="formData.account" size="small" placeholder="账号" />
        </el-form-item>

        <el-form-item label="密码" prop="password" class="is-required" size="small">
          <el-input v-model="formData.password" size="small" placeholder="密码" />
        </el-form-item>

        <el-form-item label="备注" prop="desc" size="small">
          <el-input v-model="formData.desc" size="small" type="textarea" :rows="1" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div slot="footer" class="dialog-footer">
          <el-button size="small" @click="drawerIsShow = false"> {{ '取消' }}</el-button>
          <el-button
              type="primary"
              size="small"
              :loading="submitButtonIsLoading"
              @click="submitForm"
          >
            {{ '保存' }}
          </el-button>
        </div>
      </template>

    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, ref} from "vue";
import {bus, busEvent} from "@/utils/bus-events";
import { GetQueue, PostQueueLink, PutQueueLink } from '@/api/tools/queue'

const props = defineProps({
  queueTypeDict: {
    default: {},
    type: Object
  }
})

onMounted(() => {
  bus.on(busEvent.drawerIsShow, onShowDrawerEvent);
})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsShow, onShowDrawerEvent);
})

const onShowDrawerEvent = (message: any) => {
  if (message.eventType === 'queue-link-info') {
    resetForm()
    if (message.content){
      getQueue(message.content.id, message.command)
    }
    drawerIsShow.value = true
  }
}

const getQueue = (dataId: number, command: string) => {
  GetQueue({id: dataId}).then(response => {
    formData.value = response.data
    if (command === 'copy'){
      formData.value.id = undefined
    }
  })
}

const sendEvent = () => {
  bus.emit(busEvent.drawerIsCommit, {eventType: 'queue-link-info'});
};

const drawerIsShow = ref(false)
let submitButtonIsLoading = ref(false)
const formData = ref({
  id: undefined,
  queue_type: '',
  host: '',
  port: 5672,
  account: '',
  password: '',
  desc: ''
})

const formRules = {
  queue_type: [
    {required: true, message: '请选择队列类型', trigger: 'blur'}
  ],
  host: [
    {required: true, message: '请输入队列的链接地址', trigger: 'blur'}
  ],
  port: [
    {required: true, message: '请输入队列链接地址的端口', trigger: 'blur'}
  ],
  account: [
    {required: true, message: '请输入账号', trigger: 'blur'}
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'}
  ],
}
const ruleFormRef = ref(null)
const resetForm = () => {
  formData.value = {
    id: undefined,
    queue_type: '',
    host: '',
    port: 5672,
    account: '',
    password: '',
    desc: ''
  }
  ruleFormRef.value && ruleFormRef.value.resetFields()
}

const submitForm = () => {
  if (formData.value.id) {
    changeData()
  } else {
    addData()
  }
}

const addData = () => {
  ruleFormRef.value.validate((valid) => {
    if (valid) {
      submitButtonIsLoading.value = true
      PostQueueLink(formData.value).then(response => {
        submitButtonIsLoading.value = false
        if (response) {
          sendEvent()
          drawerIsShow.value = false
        }
      })
    }
  })
}
const changeData = () => {
  ruleFormRef.value.validate((valid) => {
    if (valid) {
      submitButtonIsLoading.value = true
      PutQueueLink(formData.value).then(response => {
        submitButtonIsLoading.value = false
        if (response) {
          sendEvent()
          drawerIsShow.value = false
        }
      })
    }
  })
}

</script>


<style scoped lang="scss">

</style>
