<template>
  <div>
    <el-drawer v-model="drawerIsShow" :title="formData.id ? '修改业务线' : '新增业务线'" size="60%">
      <el-form
          ref="ruleFormRef"
          :model="formData"
          :rules="formRules"
          label-width="100px">

        <el-form-item label="业务线名" prop="name" class="is-required" size="small">
          <el-input v-model="formData.name" size="small"/>
        </el-form-item>

        <el-form-item label="业务线code" prop="code" class="is-required" size="small">
          <el-input v-model="formData.code" :disabled="!!formData.id" size="small"/>
        </el-form-item>

        <el-form-item label="关联环境" prop="bind_env" class="is-required" size="small">
          <el-radio v-model="formData.bind_env" label="human">手动关联</el-radio>
          <el-radio v-model="formData.bind_env" label="auto">自动关联</el-radio>
          <el-popover class="el_popover_class" placement="top-start" trigger="hover">
            <div>此业务线与运行环境的关联机制</div>
            <div>1、手动关联：新增运行环境后，需手动将此运行环境与此业务线关联</div>
            <div>2、自动关联：新增运行环境时，新增的运行环境将自动与此业务线关联</div>
            <div>注：不管此处选的是什么机制，对于已存在的运行环境，若此业务线需要关联，都需要进行一次手动关联</div>
            <el-button slot="reference" type="text" icon="el-icon-question"/>
          </el-popover>
        </el-form-item>

        <el-form-item label="统计通知" prop="receive_type" class="is-required" size="small">
          <el-radio v-model="formData.receive_type" label="not_receive">不接收</el-radio>
          <el-radio v-model="formData.receive_type" label="ding_ding">钉钉</el-radio>
          <el-radio v-model="formData.receive_type" label="we_chat">企业微信</el-radio>
          <el-popover class="el_popover_class" placement="top-start" trigger="hover">
            <div>1、设置接收该业务线自动化测试阶段统计通知方式（周统计、月统计）</div>
            <div>2、钉钉群为关键词模式，关键词为“测试”、“报告”、“统计”</div>
            <el-button slot="reference" type="text" icon="el-icon-question"/>
          </el-popover>
        </el-form-item>

        <el-form-item
            prop="webhook_list"
            v-show="formData.receive_type !== 'not_receive'"
            label="webhook"
            class="is-required" size="small">
          <webhookInput
              ref="webhookInputRef"
              :current-data="formData.webhook_list"
          />
        </el-form-item>

        <el-form-item label="备注" prop="desc" size="small">
          <el-input v-model="formData.desc" type="textarea" autosize size="small"/>
        </el-form-item>

        <el-form-item label="运行环境" prop="env_list" size="small">
          <el-select
              v-model="formData.env_list"
              :placeholder="'选择运行环境'"
              filterable
              multiple
              default-first-option
              clearable
              style="width: 100%"
              size="small"
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
            <el-option v-for="env in runEnvList" :key="env.id" :label="`${env.group}_${env.name}`" :value="env.id"/>
          </el-select>
          <el-popover
              class="el_popover_class"
              placement="top-start"
              trigger="hover"
          >
            <div>
              <div>属于此业务线的项目，执行测试时，只能跑此处选择的环境</div>
            </div>
            <el-button slot="reference" type="text" icon="el-icon-question"/>
          </el-popover>
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
import webhookInput from '@/components/input/one-column-row.vue'
import {GetRunEnvList} from "@/api/config/run-env";
import {GetBusiness, PostBusiness, PutBusiness} from "@/api/config/business";

const props = defineProps({
  userList: {
    default: [],
    type: Array,
  }
})

onMounted(() => {
  bus.on(busEvent.drawerIsShow, onShowDrawerEvent);
})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsShow, onShowDrawerEvent);
})

const onShowDrawerEvent = (message: any) => {
  if (message.eventType === 'config-business') {
    getRunEnvList()
    resetForm()
    if (message.content){
      getBusiness(message.content.id)
    }
    drawerIsShow.value = true
  }
}

const getRunEnvList = () => {
  runEnvIdList.value = []
  GetRunEnvList({page_num: 1, page_size: 99999}).then(response => {
    runEnvList.value = response.data.data
    runEnvList.value.forEach(env => {
      runEnvIdList.value.push(env.id)
    })
  })
}

const getBusiness = (dataId: number) => {
  GetBusiness({id: dataId}).then(response => {
    formData.value = response.data
  })
}

const sendEvent = () => {
  bus.emit(busEvent.drawerIsCommit, {eventType: 'config-business'});
};

const drawerIsShow = ref(false)
let submitButtonIsLoading = ref(false)
let webhookInputRef = ref(null)
const runEnvList = ref([])
const runEnvIdList = ref([])
const checkAll = ref(false)
const isIndeterminate = ref(false)
const formData = ref({
  id: undefined,
  name: undefined,
  code: undefined,
  bind_env: 'auto',
  receive_type: 'not_receive',
  webhook_list: [],
  env_list: [],
  desc: undefined
})
const validateWebhookList = (rule: any, value: any, callback: any) => {
  if (formData.value.receive_type !== 'not_receive'){
    const webhookListData = webhookInputRef.value.getData()
    if (!webhookListData || webhookListData.length === 0 ) {
      callback(new Error('请输入通知地址'))
    }
  }
  callback()
}
const formRules = {
  name: [
    {required: true, message: '请输入业务线名字', trigger: 'blur'}
  ],
  code: [
    {required: true, message: '请输入业务线code', trigger: 'blur'}
  ],
  bind_env: [
    {required: true, message: '请选择关联环境的方式', trigger: 'blur'}
  ],
  receive_type: [
    {required: true, message: '请选择接收统计信息的方式', trigger: 'blur'}
  ],
  webhook_list: [
    {validator: validateWebhookList, trigger: 'blur'}
  ],
  env_list: [
    {required: true, message: '请选择运行环境', trigger: 'blur'}
  ],
}
const ruleFormRef = ref(null)
const resetForm = () => {
  formData.value = {
    id: undefined,
    name: undefined,
    code: undefined,
    bind_env: 'auto',
    receive_type: 'not_receive',
    webhook_list: [],
    env_list: [],
    desc: undefined
  }
  ruleFormRef.value && ruleFormRef.value.resetFields();
}

const handleCheckAllChange = (val: any) => {
  formData.value.env_list = val ? runEnvIdList.value : []
  isIndeterminate.value = false
}

const handleCheckedItemChange = (value: string | any[]) => {
  const checkedCount = value.length
  checkAll.value = checkedCount === runEnvList.value.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < runEnvList.value.length
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
      formData.value.webhook_list = webhookInputRef.value.getData()
      submitButtonIsLoading.value = true
      PostBusiness(formData.value).then(response => {
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
      formData.value.webhook_list = webhookInputRef.value.getData()
      submitButtonIsLoading.value = true
      PutBusiness(formData.value).then(response => {
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
