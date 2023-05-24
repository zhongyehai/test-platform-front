<template>
  <div style="margin-left: 20px; margin-right: 20px">
    <el-table
      ref="dataTable"
      :data="tempData"
      stripe
      size="mini"
      row-key="id"
    >

      <el-table-column label="序号" header-align="center" min-width="4%">
        <template slot-scope="scope">
          <div>{{ scope.$index + 1 }}</div>
        </template>
      </el-table-column>

      <el-table-column header-align="center" min-width="20%">
        <template slot="header">
          <span><span style="color: red">*</span>{{ addType === 'addr' ? '环境名字' : '账号名字' }}</span>
        </template>
        <template slot-scope="scope">
          <el-input v-model="scope.row.name" size="mini" type="textarea" :rows="1" />
        </template>
      </el-table-column>

      <el-table-column header-align="center" min-width="30%">
        <template slot="header">
          <span><span style="color: red">*</span>{{ addType === 'addr' ? '域名地址' : '账号' }}</span>
        </template>
        <template slot-scope="scope">
          <el-input v-model="scope.row.value" size="mini" type="textarea" :rows="1" />
        </template>
      </el-table-column>

      <el-table-column v-if="addType === 'account'" label="密码" header-align="center" min-width="30%">
        <template slot-scope="scope">
          <el-input v-model="scope.row.password" size="mini" type="textarea" :rows="1" />
        </template>
      </el-table-column>

      <el-table-column label="备注" header-align="center" min-width="20%">
        <template slot="header">
          <span>备注</span>
        </template>
        <template slot-scope="scope">
          <el-input v-model="scope.row.desc" size="mini" type="textarea" :rows="1" />
        </template>
      </el-table-column>

      <el-table-column label="操作" header-align="center" min-width="6%">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" placement="top-end" content="添加一行">
            <el-button
              v-show="scope.$index === 0 || scope.$index === tempData.length - 1"
              type="text"
              size="mini"
              icon="el-icon-plus"
              @click.native="addRow(true)"
            />
          </el-tooltip>
          <el-tooltip class="item" effect="dark" placement="top-end" content="删除当前行">
            <el-button
              v-show="isShowDelButton(scope.$index)"
              type="text"
              size="mini"
              icon="el-icon-minus"
              style="color: red"
              @click.native="delRow(scope.$index)"
            />
          </el-tooltip>
          <el-tooltip class="item" effect="dark" placement="top-end" content="清除数据">
            <el-button
              v-show="tempData.length === 1"
              type="text"
              size="mini"
              icon="el-icon-circle-close"
              style="color: red"
              @click.native="clearData()"
            />
          </el-tooltip>
        </template>
      </el-table-column>

    </el-table>
  </div>
</template>

<script>

import { postEnv } from '@/apis/testWork/env'

export default {
  name: 'Index',
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'addType', 'isShow'
  ],

  data() {
    return {
      direction: 'rtl', // 抽屉打开方式
      listLoading: false, // 加载状态
      submitButtonIsLoading: false,
      deleteButtonIsLoading: false,
      tempData: [{
        id: `${Date.now()}`,
        name: null,
        value: null,
        password: null,
        desc: null
      }]
    }
  },

  watch: {
    // 如果临时数据长度为0，则添加一行
    'isShow': {
      deep: true, // 深度监听
      handler(newVal, oldVal) {
        if (newVal) {
          this.tempData = [{
            id: `${Date.now()}`,
            name: null,
            value: null,
            password: null,
            desc: null
          }]
        }
      }
    }

  },

  methods: {

    addRow(isRow) {
      if (isRow) {
        this.tempData.push({
          id: `${Date.now()}`,
          name: null,
          value: null,
          password: null,
          desc: null
        })
      } else {
        this.tempData = [{
          id: `${Date.now()}`,
          name: null,
          value: null,
          password: null,
          desc: null
        }]
      }
    },

    // 是否显示删除按钮
    isShowDelButton(index) {
      return !(this.tempData.length === 1 && index === 0)
    },

    // 删除一行
    delRow(index) {
      this.tempData.splice(index, 1)
    },

    // 清除数据
    clearData() {
      this.tempData[0].name = null
      this.tempData[0].value = null
      this.tempData[0].password = null
      this.tempData[0].desc = null
    },

    // 添加环境
    addEnv() {
      this.submitButtonIsLoading = true
      postEnv(this.envTemplate).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.addDrawerIsShow = false
          this.getEnvList()
        }
      })
    }
  }
}
</script>

<style>

</style>
