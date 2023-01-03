<template>
  <div>

    <div v-if="selectType === 'radio'">
      <div style="margin-top: 10px">
        <el-radio
          v-model="business"
          :label="businessItem.id"
          v-for="businessItem in currentBusinessList" :key="businessItem.id">{{ businessItem.name }}
        </el-radio>
      </div>
    </div>

    <div v-else>
      <el-select
        v-model="business"
        :multiple="isMultiple"
        filterable
        default-first-option
        clearable
        size="mini"
        :style="selectStyle"
        placeholder="请选择业务线"
        class="filter-item">
        <el-option
          v-for="business in currentBusinessList"
          :key="business.id"
          :label="business.name"
          :value="business.id"
        ></el-option>
      </el-select>
      <el-popover
        class="el_popover_class"
        placement="top-start"
        trigger="hover">
        <div>
          <div>1、仅有当前业务线权限的用户才能看到此服务</div>
          <div>2、若要修改用户业务线权限，需登录管理员账号，在用户管理处修改</div>
        </div>
        <el-button slot="reference" type="text" icon="el-icon-question"></el-button>
      </el-popover>
    </div>

  </div>


</template>

<script>

import {businessList} from '@/apis/system/business'

export default {
  name: 'business',
  props: [
    'selectType',
    'isMultiple',
    'currentBusiness',
    'selectWidth'
  ],

  data() {
    return {
      business: '',
      selectStyle: {
        width: '98%'
      },
      currentBusinessList: []
    }
  },

  mounted() {
    this.getBusinessList()
  },

  created() {
    if (this.isMultiple){
      this.business = this.currentBusiness ? this.currentBusiness : [this.initBusiness()]
    }else {
      this.business = this.currentBusiness ? this.currentBusiness : this.initBusiness()
    }

    if (this.selectWidth) {
      this.selectStyle = {
        width: this.selectWidth
      }
    }
  },

  methods: {

    // 获取列表
    getBusinessList() {
      businessList().then(response => {
        this.currentBusinessList = response.data.data
        if (this.isMultiple){  // 可多选，数据类型为list
          if (!this.business || this.business.length < 1){
            this.business = [this.initBusiness()]
          }
        }else {
          if (!this.business){
            this.business = this.initBusiness()
          }
        }
      })
    },

    initBusiness(){
      // 如果能从localStorage中获取到用户的business，则从中取默认值，否则以业务线列表的第一个为默认值
      let userBusiness = localStorage.getItem('business');
      if (userBusiness){
        userBusiness = JSON.parse(userBusiness)
      }

      if(userBusiness && userBusiness.length > 0){
        return userBusiness[0]
      }else {
        return this.currentBusinessList[0].id
      }
    }
  },
  watch: {
    'currentBusiness': {
      deep: true,
      handler(newVal, oldVal) {
        if (newVal){
          this.business = newVal
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
