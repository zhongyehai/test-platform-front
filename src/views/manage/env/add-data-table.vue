<template>
  <div class="layout-container">

    <div style="margin: 10px">
      <el-table
          :data="tableDataList"
          style="width: 100%"
          stripe
          :height="tableHeight"
          row-key="id">

        <el-table-column prop="id" label="序号" align="center" min-width="4%">
          <template #default="scope">
            <div>{{ scope.$index + 1 }}</div>
          </template>
        </el-table-column>

        <el-table-column show-overflow-tooltip align="center" min-width="20%">
          <template #header>
            <span><span style="color: red">*</span>{{ addType === 'addr' ? '环境名字' : '账号名字' }}</span>
          </template>
          <template #default="scope">
            <el-input v-model="scope.row.name" size="small" type="textarea" :rows="1" />
          </template>
        </el-table-column>

        <el-table-column header-align="center" min-width="30%">
          <template #header>
            <span><span style="color: red">*</span>{{ addType === 'addr' ? '域名地址' : '账号' }}</span>
          </template>
          <template #default="scope">
            <el-input v-model="scope.row.value" size="small" type="textarea" :rows="1" />
          </template>
        </el-table-column>

        <el-table-column v-if="addType === 'account'" label="密码" header-align="center" min-width="30%">
          <template #default="scope">
            <el-input v-model="scope.row.password" size="small" type="textarea" :rows="1" />
          </template>
        </el-table-column>

        <el-table-column label="备注" header-align="center" min-width="20%">
          <template #header>
            <span>备注</span>
          </template>
          <template #default="scope">
            <el-input v-model="scope.row.desc" size="small" type="textarea" :rows="1" />
          </template>
        </el-table-column>


        <el-table-column fixed="right" show-overflow-tooltip prop="desc" align="center" label="操作" min-width="15%">
          <template #default="scope">

            <el-tooltip class="item" effect="dark" placement="top-end" content="添加一行">
              <el-button
                  v-show="scope.$index === 0 || scope.$index === tableDataList.length - 1"
                  type="text"
                  size="small"
                  @click.native="addRow(true)"
              ><i class="iconfont icon-testadd"></i></el-button>
            </el-tooltip>

            <el-tooltip class="item" effect="dark" placement="top-end" content="删除当前行">
              <el-button
                  v-show="isShowDelButton(scope.$index)"
                  type="text"
                  size="small"
                  style="color: red"
                  @click.native="delRow(scope.$index)"
              ><i class="iconfont icon-testreduce"></i></el-button>
            </el-tooltip>

            <el-tooltip class="item" effect="dark" placement="top-end" content="清除数据">
              <el-button
                  v-show="tableDataList.length === 1"
                  type="text"
                  size="small"
                  style="color: red"
                  @click.native="clearData()"
              ><i class="iconfont icon-testdelete1"></i></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

    </div>

  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, onBeforeUnmount} from "vue";

import {bus, busEvent} from "@/utils/bus-events";
const tableDataList = ref([{ id: `${Date.now()}`, name: null, value: null, password: null, desc: null }])
const tableHeight = localStorage.getItem('tableHeight')
const props = defineProps({
  addType: {
    default: '',
    type: String
  }
})

const addRow = (isRow: undefined) => {
  if (isRow) {
    tableDataList.value.push({ id: `${Date.now()}`, name: null, value: null, password: null, desc: null })
  } else {
    tableDataList.value = [{ id: `${Date.now()}`, name: null, value: null, password: null, desc: null }]
  }
}

const isShowDelButton = (index: number) => {
  return !(tableDataList.value.length === 1 && index === 0)
}

const delRow = (index: number) => {
  tableDataList.value.splice(index, 1)
}

const clearData = () => {
  tableDataList.value[0].key = null
}

defineExpose({
  tableDataList
})
</script>

<style scoped lang="scss">

</style>
