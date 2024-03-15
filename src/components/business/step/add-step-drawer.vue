<template>
  <div>
    <el-drawer v-model="drawerIsShow" title="新增步骤" size="90%">

      <el-tabs v-model="activeName" style="margin-left: 20px">


        <!-- 选接口 -->
        <el-tab-pane v-if="testType === 'api'" label="接口列表" name="apiList">
          <selectApiView ref="selectApiViewRef" :test-type="testType" :case-id="caseId"/>
        </el-tab-pane>

        <!-- 选元素 -->
        <el-tab-pane v-if="testType !== 'api'" label="元素列表" name="apiList">
          <selectElementView ref="selectElementViewRef" :test-type="testType" :project-id="projectId" :case-id="caseId"/>
        </el-tab-pane>

        <!-- 引用用例 -->
        <el-tab-pane label="引用用例" name="quoteCase">
          <selectCaseView ref="quoteCaseRef" :test-type="testType" :project-id="projectId" :case-id="caseId" />
        </el-tab-pane>

      </el-tabs>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>

import {onBeforeUnmount, onMounted, ref} from "vue";
import {bus, busEvent} from "@/utils/bus-events";
import selectApiView from './api-test/select-api.vue'
import selectElementView from './ui-test/select-element.vue'
import selectCaseView from './select-case.vue'

const props = defineProps({
  testType: {
    default: '',
    type: String
  },
  projectId: {
    default: null,
    type: Number
  },
  caseId: {
    default: null,
    type: Number
  },
})
const activeName = ref('apiList')
const selectApiViewRef = ref(null)
const selectElementViewRef = ref(null)
const quoteCaseRef = ref(null)
const drawerIsShow = ref(false)

onMounted(() => {
  bus.on(busEvent.drawerIsShow, onShowDrawerEvent);
})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsShow, onShowDrawerEvent);
})

const onShowDrawerEvent = (message: any) => {
  if (message.eventType === 'select-step') {

    drawerIsShow.value = true
  }
}

</script>


<style scoped lang="scss">

</style>
