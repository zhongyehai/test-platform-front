<template>

  <el-table
    :data="tempDataForm"
    size="mini"
    stripe
    :show-header="false"
    style="background-color: rgb(250, 250, 250)"
    :row-style="{'background-color': 'rgb(250, 250, 250)'}">

    <el-table-column label="Key" header-align="center" min-width="24%">
      <template slot-scope="scope">
        <el-input v-model="scope.row.key" size="mini" type="textarea" autosize placeholder="key">
        </el-input>
      </template>
    </el-table-column>

    <el-table-column label="type" header-align="center" min-width="20%">
      <template slot-scope="scope">
        <el-select v-model="scope.row.data_type" size="mini" placeholder="选择数据类型">
          <el-option v-for="item in formDataTypes" :label="item.label" :key="item.value" :value="item.value">
          </el-option>
        </el-select>
      </template>
    </el-table-column>

    <el-table-column label="Value" header-align="center" min-width="38%">
      <template slot-scope="scope">
        <!-- 文件 -->
        <div v-if="scope.row.data_type === 'file'">
          <el-row>
            <el-col :span="18">
              <el-input v-model="scope.row.value" size="mini" :disabled="true" placeholder="请上传文件">
              </el-input>
            </el-col>
            <el-col :span="2" style="padding-left:10px;">
              <el-upload
                class="upload-demo"
                :action="uploadAddr"
                :auto-upload="false"
                :show-file-list='false'
                :on-change="onChange">
                <el-button size="mini" type="primary" @click="changPageFileName(scope.$index)">选择文件</el-button>
              </el-upload>
            </el-col>
          </el-row>
        </div>

        <!-- 文本 -->
        <div v-else>
          <el-input
            v-model="scope.row.value"
            placeholder="value"
            :id="'data_input' + scope.$index "
            type="textarea"
            :rows=1
            size="mini"
            resize="none">
          </el-input>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="备注" header-align="center" min-width="12%">
      <template slot-scope="scope">
        <el-input v-model="scope.row.remark" size="mini" type="textarea" autosize placeholder="备注"></el-input>
      </template>
    </el-table-column>

    <el-table-column label="添加" header-align="center" min-width="4%">
      <template slot-scope="scope">
        <el-tooltip class="item" effect="dark" placement="top-end" content="添加一行">
          <el-button
            v-show="isShowAddButton(scope.$index)"
            type="text"
            size="mini"
            icon="el-icon-plus"
            @click.native="addRow(scope.$index)"></el-button>
        </el-tooltip>
      </template>
    </el-table-column>

    <el-table-column label="删除" header-align="center" min-width="4%">
      <template slot-scope="scope">
        <el-tooltip class="item" effect="dark" placement="top-end" content="删除当前行">
          <el-button
            v-show="isShowDelButton(scope.$index)"
            type="text"
            size="mini"
            icon="el-icon-minus"
            style="color: red"
            @click.native="delRow(scope.$index)"></el-button>
        </el-tooltip>
      </template>
    </el-table-column>

  </el-table>
</template>

<script>
import {fileCheck, fileUpload, uploadAddr} from "@/apis/testWork/file";

export default {
  name: "dataForm",
  props: ['dataForm'],
  data() {
    return {
      // form-data的类型，文本还是文件
      // formDataTypes: ['string', 'file'],
      formDataTypes: [{label: '字符串', value: 'string'}, {label: '文件', value: 'file'}],
      tempDataForm: '',
      fileType: 'case',
      uploadAddr: uploadAddr
    }
  },

  methods: {

    // 上传文件到服务器
    uploadFileToServer(form) {
      fileUpload(form).then((response) => {
          if (this.showMessage(this, response)) {
            this.tempDataForm[this.currentTempApiDataFormIndex]['value'] = response['data']  // 修改页面上的文件名
          }
        }
      )
    },

    // 选中文件事件, 检验文件是否已存在
    onChange(file) {
      // 检验文件是否已存在
      fileCheck({'fileType': this.fileType, 'name': file.name}).then(response => {

        let form = new FormData();
        form.append("file", file.raw);
        form.append("fileType", this.fileType);

        if (response.message.indexOf('已存在') !== -1) {

          // 确认是否覆盖已存在文件，不覆盖则不上传
          this.$confirm(`${response.message}，是否覆盖?`, '提示', {
            confirmButtonText: '覆盖',
            cancelButtonText: '不覆盖',
            type: 'warning'
          }).then(() => {
            this.uploadFileToServer(form)
          }).catch(() => {
          });
        } else {
          this.uploadFileToServer(form)
        }
      })
    },

    // 获取当前上传文件的数据的索引
    changPageFileName(index) {
      this.currentTempApiDataFormIndex = index;
    },

    // 是否显示添加按钮
    isShowAddButton(index) {
      return index === this.tempDataForm.length - 1
    },

    // 是否显示删除按钮
    isShowDelButton(index) {
      return !(this.tempDataForm.length === 1 && index === 0)
    },

    // 添加一行
    addRow() {
      this.tempDataForm.push({key: null, value: null, remark: null})
    },

    // 删除一行
    delRow(index) {
      this.tempDataForm.splice(index, 1);
    },
  },

  created() {
    this.tempDataForm = this.dataForm
  },

  watch: {

    'dataForm': {
      handler(newVal, oldVal) {
        this.tempDataForm = newVal
      }
    },
  }
}
</script>

<style scoped>

</style>
