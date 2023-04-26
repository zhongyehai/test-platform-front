<template>
  <div>
    <el-select
      v-model="business"
      :multiple="isMultiple"
      filterable
      default-first-option
      clearable
      size="mini"
      :style="selectStyle"
      placeholder="请选择业务线"
      class="filter-item"
    >
      <div v-if="isMultiple" style="margin-left: 20px; margin-bottom: 10px">
        <el-checkbox
          v-model="checkAll"
          :indeterminate="isIndeterminate"
          @change="handleCheckAllChange"
        >全选
        </el-checkbox>
      </div>
      <el-option
        v-for="businessItem in $busEvents.data.businessList"
        :key="businessItem.id"
        :label="businessItem.name"
        :value="businessItem.id"
      />
    </el-select>
    <el-popover
      class="el_popover_class"
      placement="top-start"
      trigger="hover"
    >
      <div>
        <div>1、仅有当前业务线权限的用户才能看到此服务</div>
        <div>2、若要修改用户业务线权限，需登录管理员账号，在用户管理处修改</div>
      </div>
      <el-button slot="reference" type="text" icon="el-icon-question" />
    </el-popover>
  </div>

</template>

<script>

import { businessList } from '@/apis/config/business'

export default {
  name: 'Business',
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'isMultiple', 'currentBusiness', 'selectWidth'
  ],

  data() {
    return {
      business: '',
      selectStyle: {
        width: '98%'
      },
      businessIdList: [],
      checkAll: false,
      isIndeterminate: true
    }
  },
  watch: {
    'currentBusiness': {
      deep: true,
      handler(newVal, oldVal) {
        if (newVal) {
          this.business = newVal
        }
      }
    }
  },

  mounted() {
    // 获取业务线
    if (this.$busEvents.data.businessList.length < 1) {
      businessList().then(response => {
        this.$busEvents.data.businessList = response.data.data
        this.$busEvents.data.businessDict = {}
        this.$busEvents.data.businessList.forEach(business => {
          this.businessIdList.push(business.id)
          this.$busEvents.data.businessDict[business.id] = business.name
        })
        this.initBusinessDataType()
      })
    } else {
      this.initBusinessDataType()
    }
  },

  created() {
    if (this.isMultiple) {
      this.business = this.currentBusiness ? this.currentBusiness : [this.initSelectBusiness()]
    } else {
      this.business = this.currentBusiness ? this.currentBusiness : this.initSelectBusiness()
    }

    if (this.selectWidth) {
      this.selectStyle = {
        width: this.selectWidth
      }
    }
  },

  methods: {

    getBusinessList() {
      if (this.businessIdList.length < 1) {
        this.$busEvents.data.businessList.forEach(business => {
          this.businessIdList.push(business.id)
        })
      }
    },

    // 点击全选
    handleCheckAllChange(val) {
      this.getBusinessList()
      this.business = val ? this.businessIdList : []
      this.isIndeterminate = false
    },

    // 当选中选项时，全选按钮的状态变化
    handleCheckedItemChange(value) {
      const checkedCount = value.length
      this.checkAll = checkedCount === this.businessIdList.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.businessIdList.length
    },

    initBusinessDataType() {
      if (this.isMultiple) { // 可多选，数据类型为list
        if (!this.business || this.business.length < 1) {
          this.business = [this.initSelectBusiness()]
        }
      } else {
        if (!this.business) {
          this.business = this.initSelectBusiness()
        }
      }
    },

    // 如果能从localStorage中获取到用户的business，则从中取默认值，否则以业务线列表的第一个为默认值
    initSelectBusiness() {
      let userBusiness = localStorage.getItem('business')
      if (userBusiness) {
        userBusiness = JSON.parse(userBusiness)
      }

      if (userBusiness && userBusiness.length > 0) {
        return userBusiness[0]
      } else {
        return this.$busEvents.data.businessList[0].id
      }
    }
  }
}
</script>

<style scoped>

</style>
