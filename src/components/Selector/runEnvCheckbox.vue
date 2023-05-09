<template>

  <div style="margin-top: 10px">
    <el-checkbox
      v-model="checkAll"
      :indeterminate="isIndeterminate"
      @change="handleCheckAllChange"
    >全选
    </el-checkbox>
    <div style="margin-top: 10px;" />
    <el-checkbox-group v-model="selectedEnvDataList" @change="handleCheckedItemChange">
      <div v-for="(envDataList, groupName, index) in envGroupDataDict" :key="index">
        {{ envDataList }}
        {{ groupName }}
        <div style="margin: 15px 0;" />
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

<script>

export default {
  name: 'SelectRunEnv',
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'envList', 'getItem'
  ],
  data() {
    return {
      dialogIsShow: false,

      envGroupList: [], // ['qa', 'dev']
      allEnvItemList: [], // 全选数据，根据传入的要获取的项判断
      selectedEnvDataList: [], // ['envCode1', 'envCode2']
      envGroupDataDict: {
        // dev: [{'envCode': 'envName'}],
        // test: [{'envCode': 'envName'}]
      },

      checkAll: false,
      isIndeterminate: true

    }
  },
  watch: {
    'envList': {
      deep: true,
      handler(newVal, oldVal) {
        if (newVal) {
          this.initData()
        }
      }
    }
  },

  mounted() {
    this.initData()
  },

  methods: {

    // 初始化数据
    initData() {
      this.selectedEnvDataList = []
      this.envGroupDataDict = {}
      this.envList.forEach(env => {
        this.allEnvItemList.push(this.getItem === 'code' ? env.code : env.id) // 全选数据

        // 把环境数据分组
        if (!(env.group in this.envGroupDataDict)) {
          this.envGroupDataDict[env.group] = []
        }
        this.envGroupDataDict[env.group].push(env)
      })
    },

    // 点全选
    handleCheckAllChange(val) {
      this.selectedEnvDataList = val ? this.allEnvItemList : []
      this.isIndeterminate = false
    },

    // 当选中选项时，全选按钮的状态变化
    handleCheckedItemChange(value) {
      const checkedCount = value.length
      this.checkAll = checkedCount === this.allEnvItemList.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.allEnvItemList.length
    }
  }
}
</script>

<style scoped>

</style>
