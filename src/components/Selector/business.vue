<template>

  <el-select
    v-model="business"
    :multiple="isMultiple"
    filterable
    default-first-option
    clearable
    size="mini"
    style="width:98%"
    placeholder="请选择业务线"
    class="filter-item">
    <el-option
      v-for="business in currentBusinessList"
      :key="business.id"
      :label="business.name"
      :value="business.id"
    ></el-option>
  </el-select>

</template>

<script>

import {businessList} from '@/apis/system/business'

export default {
  name: 'business',
  props: [
    'isMultiple',
    'currentBusiness'
  ],

  data() {
    return {
      business: '',
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
