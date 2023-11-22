<template>

  <div class="app-container">

    <el-button
      v-show="makedUserDictList.length > 0"
      size="mini"
      type="primary"
      style="display:inline-block;float: right;margin: 10px;padding-left: 10px"
      @click.native="showDownloadAsContactOptionDialog()"
    >导出为通讯录文件
    </el-button>

    <el-button
      v-show="makedUserDictList.length > 0"
      size="mini"
      type="primary"
      style="display:inline-block;float: right;margin: 10px;padding-left: 10px"
      @click.native="downloadAsExcel()"
    >导出为EXCEL
    </el-button>

    <el-button
      type="primary"
      size="mini"
      style="margin: 10px;padding-left: 10px"
      @click.native="drawerIsShow=true"
    >选择要生成的项
    </el-button>

    <el-drawer
      title="选择具体项"
      size="75%"
      :visible.sync="drawerIsShow"
      :direction="direction"
    >

      <el-form>
        <el-form-item label="选择语言：" label-width="100px">
          <el-radio-group v-model="language">
            <el-radio
              v-for="(languageValue, languageKey) in languageDict"
              :key="languageKey"
              :label="languageKey"
            >{{ languageValue }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="选择项：" label-width="100px">
          <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">全选
          </el-checkbox>
          <el-checkbox-group v-model="checkedData" @change="handleCheckedCitiesChange">
            <el-checkbox v-for="(value, key) in allOptionsMapping" :key="key" :label="key">{{ value }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="生成条数：" label-width="100px" style="display:inline-block;margin-top: 15px">
          <el-input-number v-model="count" :min="1" :max="100" size="mini" label="生成条数" />
        </el-form-item>
      </el-form>

      <div class="demo-drawer__footer">
        <el-button size="mini" @click="drawerIsShow = false"> {{ '取消' }}</el-button>
        <el-button
          type="primary"
          size="mini"
          :loading="makeLoadingIsShow"
          @click.native="sendRequest()"
        >确定生成
        </el-button>
      </div>
    </el-drawer>

    <el-table
      :data="makedUserDictList"
      :height="autoHeight"
      size="mini"
      stripe
      @cell-dblclick="cellDblclick"
    >

      <el-table-column label="序号" width="50px">
        <template slot-scope="scope">
          <span>{{ scope.$index + 1 }}</span>
        </template>
      </el-table-column>

      <el-table-column
        v-for="optionKey in allSelectOptionKeys"
        :key="optionKey"
        show-overflow-tooltip
        :label="allOptionsMapping[optionKey]"
        :prop="optionKey"
        :min-width="`${allOptionKeys.length / allOptionsMapping.length}%`"
      >
        <template slot-scope="scope">
          <span>{{ scope.row[optionKey] }}</span>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      title="导出为通讯录选项"
      append-to-body
      :visible.sync="showDownloadAsContactOption"
      :close-on-click-modal="false"
      width="30%"
    >
      <el-form>
        <el-form-item label="导出条数：" label-width="100px" style="display:inline-block;margin-top: 15px">
          <el-input-number v-model="downloadAsContactCount" :min="1" :max="makedUserDictList.length" size="mini" />
          <span style="margin-left: 20px">共{{ makedUserDictList.length }}条数据</span>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button v-loading="downloadAsContactIsLoading" size="mini" type="primary" @click="downloadAsContact()">确 定</el-button>
      </span>
    </el-dialog>
  </div>

</template>

<script>
import { makeUser, exportAsContact } from '@/apis/tools/makeUser'
import { getConfigByCode } from '@/apis/config/config'

export default {
  name: 'MakeUserInfo',
  data() {
    return {
      drawerIsShow: true, // 抽屉的显示状态
      direction: 'rtl', // 抽屉打开方式

      showDownloadAsContactOption: false,
      downloadAsContactIsLoading: false,
      downloadAsContactCount: 0,

      makeLoadingIsShow: false,
      isIndeterminate: true,
      language: '',
      languageDict: undefined, // 语言
      checkAll: false, // 全选状态
      count: 1, // 数量
      checkedData: ['name', 'ssn', 'phone_number', 'credit_card_number', 'company_email', 'company', 'address'], // 用户选中的项
      allOptionsMapping: [], // 所有项和对应的值
      allOptionKeys: [], // 所有项的key
      allSelectOptionKeys: [], // 所有选中的key
      makedUserDictList: [], // 接口返回的生成的用户信息
      autoHeight: window.innerHeight * 0.7 // 获取表格能渲染的高度, 屏幕的70%
    }
  },

  mounted() {
    // 获取生成用户信息可选项映射关系
    getConfigByCode({ code: 'make_user_info_mapping' }).then(response => {
      this.allOptionsMapping = response.data
      this.allOptionKeys = Object.keys(this.allOptionsMapping)
    })

    // 获取语言映射关系
    getConfigByCode({ code: 'make_user_language_mapping' }).then(response => {
      this.languageDict = response.data
      this.language = Object.keys(this.languageDict)[0]
    })
  },
  methods: {

    // 点击全选
    handleCheckAllChange(val) {
      this.checkedData = val ? this.allOptionKeys : []
      this.isIndeterminate = false
    },

    // 当选中选项时，全选按钮的状态变化
    handleCheckedCitiesChange(value) {
      const checkedCount = value.length
      this.checkAll = checkedCount === this.allOptionKeys.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.allOptionKeys.length
    },

    // 导出的表头
    getExportHeadersList() {
      const exportHeadersList = []
      for (const index in this.allSelectOptionKeys) {
        const key = this.allSelectOptionKeys[index]
        exportHeadersList.push(this.allOptionsMapping[key])
      }
      return exportHeadersList
    },

    // 导出的内容
    getExportContentList() {
      const makedUserValueList = []

      for (const index in this.makedUserDictList) {
        const user = this.makedUserDictList[index]
        makedUserValueList.push(Object.values(user))
      }
      return makedUserValueList
    },

    // 点击确认生成
    sendRequest() {
      this.makeLoadingIsShow = true
      makeUser({
        'language': this.language,
        'count': this.count,
        'options': JSON.stringify(this.checkedData)
      }
      ).then(response => {
        this.makeLoadingIsShow = false
        this.makedUserDictList = response.data
        this.allSelectOptionKeys = this.checkedData // 方便渲染列表，把用户选中的项记录下来
        this.drawerIsShow = false
      })
    },

    // 双击复制
    cellDblclick(row, column, cell, event) {
      const that = this
      const data = row[column.property]
      if (typeof (data) === 'string') {
        this.$copyText(data).then(
          function(e) {
            that.$message.success('复制成功')
          }
        )
      }
    },

    // 导出为excel
    downloadAsExcel() {
      import('@/vendor/Export2Excel').then(excel => {
        excel.export_json_to_excel({
          header: this.getExportHeadersList(), // 表头
          data: this.getExportContentList(), // 数据 [[value1, value2], [value1, value2]]
          filename: '用户信息'
        })
      })
    },

    showDownloadAsContactOptionDialog() {
      this.showDownloadAsContactOption = true
      this.downloadAsContactCount = this.makedUserDictList.length
    },

    // 导出为通讯录文件
    downloadAsContact() {
      this.downloadAsContactIsLoading = true
      exportAsContact({
        'language': this.languageDict[this.language],
        'count': this.downloadAsContactCount,
        'data_list': this.makedUserDictList
      }).then(response => {
        this.downloadAsContactIsLoading = false
        this.showDownloadAsContactOption = false
        const blob = new Blob([response], {
          type: 'application/vnd.ms-excel' // 将会被放入到blob中的数组内容的MIME类型
        })
        // 保存文件到本地
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob) // 生成一个url
        a.download = '通讯录.vcf'
        a.click()
      })
    }
  }
}
</script>

<style scoped>

</style>
