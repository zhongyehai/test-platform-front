<template>

  <div class="app-container">

    <el-form :inline="true">

      <h3 style="display:inline-block">选择要生成的项：</h3>

      <el-button
        v-show="makedUserValueList.length > 0"
        size="mini"
        type="primary"
        style="display:inline-block;float: right;margin: 10px;padding-left: 10px"
        @click.native="download()"
      >导出为EXCEL
      </el-button>

      <el-button
        type="primary"
        size="mini"
        style="display:inline-block;float: right;margin: 10px;padding-left: 10px"
        :loading="makeLoadingIsShow"
        @click.native="sendRequest()"
      >确定生成
      </el-button>

      <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>

      <el-checkbox-group v-model="checkedData" @change="handleCheckedCitiesChange">
        <el-checkbox v-for="key in allOptionKeys" :label="key" :key="key">{{ key }}</el-checkbox>
      </el-checkbox-group>

      <el-form-item label="生成条数：" label-width="100px" style="display:inline-block;margin-top: 15px">
        <el-input-number v-model="count" :min="1" :max="100" size="mini" label="生成条数"></el-input-number>
      </el-form-item>

    </el-form>

    <el-table :data="makedUserValueList" stripe :height="autoHeight">

      <af-table-column v-if="checkedData.length > 0" prop="id" label="序号">
        <template slot-scope="scope">
          <span>{{ scope.$index + 1 }}</span>
        </template>
      </af-table-column>

      <af-table-column :show-overflow-tooltip=true v-for="(key, index) in checkedData" :key="index" :label="key">
        <template slot-scope="scope">
          <span>{{ scope.row[index] }}</span>
        </template>
      </af-table-column>

    </el-table>

  </div>


</template>

<script>

import {makeUserInfoMapping, makeUser} from "@/apis/tools/makeUser";

export default {
  name: "makeUserInfo",
  data() {
    return {
      makeLoadingIsShow: false,
      isIndeterminate: true,
      // 全选状态
      checkAll: false,
      // 数量
      count: 1,
      // 用户选中的项
      checkedData: ["姓名", "身份证号", "手机号", "银行卡", "邮箱", "公司名", "地址"],
      // 所有项和对应的值
      allOptionsMapping: [],
      // 所有项的key
      allOptionKeys: [],
      // 接口返回的生成的用户信息
      makedUserDictList: [],
      // 接口返回的生成的用户信息的value
      makedUserValueList: [],
      // 获取表格能渲染的高度, 屏幕的70%
      autoHeight: window.innerHeight * 0.7,
    };
  },
  methods: {

    // 获取生成用户信息可选项映射关系
    getMakeUserInfoMapping() {
      makeUserInfoMapping().then(response => {
        this.allOptionsMapping = JSON.parse(response.data)
        this.allOptionKeys = Object.keys(this.allOptionsMapping)
      })
    },

    // 点击全选
    handleCheckAllChange(val) {
      this.checkedData = val ? this.allOptionKeys : [];
      this.isIndeterminate = false;
    },

    // 当选中选项时，全选按钮的状态变化
    handleCheckedCitiesChange(value) {
      let checkedCount = value.length;
      this.checkAll = checkedCount === this.allOptionKeys.length;
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.allOptionKeys.length;
    },

    // 由于字段顺序会发生改变,所以根据用户的选中顺序解析响应对象
    parseObject(objList) {

      this.makedUserValueList = []

      // 循环响应对象 [{}{}] => {}
      for (let i = 0; i < objList.length; i++) {
        let obj = objList[i]

        // 循环用户选中的key，从循环的响应对象中获取对应的value
        let valueList = []
        for (let i = 0; i < this.checkedData.length; i++) {
          valueList.push(obj[this.allOptionsMapping[this.checkedData[i]]])
        }

        this.makedUserValueList.push(valueList)
      }
    },

    // 点击确认生成
    sendRequest() {

      // 获取选中项对应的映射key
      var checkedOptionList = []
      for (let i = 0; i < this.checkedData.length; i++) {
        checkedOptionList.push(this.allOptionsMapping[this.checkedData[i]])
      }
      // 发送请求
      this.makeLoadingIsShow = true
      makeUser({'count': this.count, 'options': JSON.stringify(checkedOptionList)}).then(response => {
        this.makeLoadingIsShow = false
        this.makedUserDictList = response.data
        this.parseObject(this.makedUserDictList)
      })
    },

    // 导出为excel
    download() {
      import('@/vendor/Export2Excel').then(excel => {
        excel.export_json_to_excel({
          header: this.checkedData,  // 表头 [key1, key2]
          data: this.makedUserValueList,  // 数据 [[value1, value2], [value1, value2]]
          filename: '用户信息'
        })
      })
    }
  },

  mounted() {
    this.getMakeUserInfoMapping()
  }
}
</script>

<style scoped>

</style>
