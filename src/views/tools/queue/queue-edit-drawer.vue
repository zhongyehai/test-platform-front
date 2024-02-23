<template>
  <div>
    <el-drawer v-model="drawerIsShow" :title="command === 'sendMsg' ? '发送消息' : formData.id ? '修改队列' : '新增队列'" size="60%">
      <el-form
          ref="ruleFormRef"
          :model="formData"
          :rules="formRules"
          label-width="80px">

        <el-form-item label="队列名字" prop="queue_name" class="is-required" size="small">
          <el-input v-model="formData.queue_name" :disabled="command === 'sendMsg'" size="small" placeholder="队列名字" />
        </el-form-item>

        <el-form-item label="备注" prop="desc" size="small">
          <el-input v-model="formData.desc" :disabled="command === 'sendMsg'" size="small" type="textarea" :rows="1" />
        </el-form-item>

        <el-form-item v-show="command === 'sendMsg'" label="消息体" class="is-required" prop="message" size="small">
          <el-input v-model="formData.message" type="textarea" :rows="1" size="small" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div slot="footer" class="dialog-footer">
          <el-button size="small" @click="drawerIsShow = false"> {{ '取消' }}</el-button>
          <el-button
              v-show="command !== 'sendMsg'"
              type="primary"
              size="small"
              :loading="submitButtonIsLoading"
              @click="submitForm"
          >保存</el-button>

          <el-button
              v-show="command === 'sendMsg' && formData.message"
              type="primary"
              size="small"
              :loading="submitButtonIsLoading"
              @click="submitForm"
          >发送</el-button>
        </div>
      </template>

    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import {onBeforeUnmount, onMounted, ref} from "vue";
import {bus, busEvent} from "@/utils/bus-events";
import {GetQueue, PostQueue, PutQueue, SendMsgToQueue} from '@/api/tools/queue'

const props = defineProps({
  queueLinkId: {
    default: undefined,
    type: Number
  }
})
const command = ref('add')
onMounted(() => {
  bus.on(busEvent.drawerIsShow, onShowDrawerEvent);
})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsShow, onShowDrawerEvent);
})

const onShowDrawerEvent = (message: any) => {
  if (message.eventType === 'queue-info') {
    command.value = message.command
    resetForm()
    if (message.content){
      getQueue(message.content, message.command)
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
  bus.emit(busEvent.drawerIsCommit, {eventType: 'queue-info'});
};

const validateMessage = (rule: any, value: any, callback: any) => {
  if (command.value === 'sendMsg'){
    if (!formData.value.message ) {
      callback(new Error('请输入消息内容'))
    }
  }
  callback()
}

const drawerIsShow = ref(false)
let submitButtonIsLoading = ref(false)
const formData = ref({
  id: undefined,
  link_id: '',
  queue_name: '',
  message: '',
  desc: ''
})

const formRules = {
  queue_name: [
    {required: true, message: '请输入队列名字', trigger: 'blur'}
  ],
  message: [
    {validator: validateMessage, trigger: 'blur'}
  ]
}
const ruleFormRef = ref(null)
const resetForm = () => {
  formData.value = {
    id: undefined,
    link_id: props.queueLinkId,
    message: '',
    queue_name: '',
    desc: ''
  }
  ruleFormRef.value && ruleFormRef.value.resetFields()
}

const submitForm = () => {
  if (command.value === 'sendMsg'){
    sendMsg()
  }else {
    if (formData.value.id) {
      changeData()
    } else {
      addData()
    }
  }
}

const addData = () => {
  ruleFormRef.value.validate((valid) => {
    if (valid) {
      submitButtonIsLoading.value = true
      PostQueue(formData.value).then(response => {
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
      PutQueue(formData.value).then(response => {
        submitButtonIsLoading.value = false
        if (response) {
          sendEvent()
          drawerIsShow.value = false
        }
      })
    }
  })
}
const sendMsg = () => {
  ruleFormRef.value.validate((valid) => {
    if (valid) {
      submitButtonIsLoading.value = true
      SendMsgToQueue({ id: formData.value.id, message: formData.value.message }).then(response => {
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
