<template>
  <div style="margin-top: 10px">
    <el-checkbox
        v-model="checkAll"
        :indeterminate="isIndeterminate"
        @change="handleCheckAllChange"
    >全选
    </el-checkbox>

    <el-checkbox-group v-model="selectedEnvDataList" @change="handleCheckedItemChange">
      <div v-for="(envDataList, groupName, index) in envGroupDataDict" :key="index">
        {{ envDataList }}
        {{ groupName }}
        <div style="margin: 15px 0;"/>
        <el-checkbox disabled>{{ groupName }}</el-checkbox>
        <br>
        <el-checkbox
            v-for="(env) in envDataList"
            :key="env.id"
            :label="getItem === 'code' ? env.code : env.id"
        >{{ env.name }}
        </el-checkbox>
      </div>
    </el-checkbox-group>

  </div>
</template>

<script setup lang="ts">
import {ref, watch, onMounted} from "vue";

const props = defineProps({
  runEnvList: {
    default: [],
    type: Array
  },
  getItem: {
    default: 'code',
    type: String,
  },
})

const allEnvItemList = ref([])  // 全选数据，根据传入的要获取的项判断
const selectedEnvDataList = ref([])  // ['envCode1', 'envCode2']
const envGroupDataDict = ref({})  // {dev: [{'envCode': 'envName'}], test: [{'envCode': 'envName'}]}
const checkAll = ref(false)
const isIndeterminate = ref(true)


const handleCheckAllChange = (val: any) => {
  selectedEnvDataList.value = val ? allEnvItemList.value : []
  isIndeterminate.value = false
}

const handleCheckedItemChange = (value: string | any[]) => {
  const checkedCount = value.length
  checkAll.value = checkedCount === allEnvItemList.value.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < allEnvItemList.value.length
}

const initData = () => {
  selectedEnvDataList.value = []
  envGroupDataDict.value = {}
  props.runEnvList.forEach((env: any) => {
    let item: string = props.getItem === 'code' ? env.code : env.id
    allEnvItemList.value.push(item) // 全选数据

    // 把环境数据分组
    if (!(env.group in envGroupDataDict.value)) {
      envGroupDataDict.value[env.group] = []
    }
    envGroupDataDict.value[env.group].push(env)
  })
}

onMounted(() => {
  initData()
})

watch(() => props.runEnvList, (newValue, oldValue) => {
      if (newValue) {
        initData()
      }
    }
)

// 把选择的值暴露出来，给父组件引用
defineExpose({
  selectedEnvDataList
})
</script>

<style scoped lang="scss">

</style>
