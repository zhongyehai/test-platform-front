<template>

  <div style="margin-top: 10px">
    <el-checkbox
      v-model="checkAll"
      :indeterminate="isIndeterminate"
      @change="handleCheckAllChange"
    >全选
    </el-checkbox>
    <div style="margin-top: 10px;" />
    <el-checkbox-group v-model="selectedDataList" @change="handleCheckedItemChange">
      <el-checkbox
        v-for="(data) in dataList"
        :key="data.id"
        :label="getItem === 'code' ? data.code : data.id"
      >{{ data.name }}
      </el-checkbox>
    </el-checkbox-group>
  </div>

</template>

<script>

export default {
  name: 'SelectRunEnv',
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'dataList', 'getItem'
  ],
  data() {
    return {
      dialogIsShow: false,

      allItemList: [], // 全选数据，根据传入的要获取的项判断
      selectedDataList: [], // [{}, {}]

      checkAll: false,
      isIndeterminate: true

    }
  },
  watch: {
    'dataList': {
      deep: true,
      handler(newVal, oldVal) {
        if (newVal) {
          this.initData()
        }
      }
    }
  },

  mounted() {
    console.log('this.dataList: ', this.dataList)
    this.initData()
  },

  methods: {

    // 初始化数据
    initData() {
      this.selectedDataList = []
      this.dataList.forEach(data => {
        this.allItemList.push(this.getItem === 'code' ? data.code : data.id) // 全选数据
      })
    },

    // 点全选
    handleCheckAllChange(val) {
      this.selectedDataList = val ? this.allItemList : []
      this.isIndeterminate = false
    },

    // 当选中选项时，全选按钮的状态变化
    handleCheckedItemChange(value) {
      const checkedCount = value.length
      this.checkAll = checkedCount === this.allItemList.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.allItemList.length
    }
  }
}
</script>

<style scoped>

</style>
