<template>

  <el-table
    ref="dataTable"
    :data="tempData"
    stripe
    :show-header="false"
    size="mini"
    row-key="id">
    <el-table-column label="id" header-align="center" min-width="4%">
      <template slot-scope="scope">
        <div>{{ scope.$index + 1 }}</div>
      </template>
    </el-table-column>

    <el-table-column label="Key" header-align="center" min-width="20%">
      <template slot-scope="scope">
        <el-input v-model="scope.row.key" size="mini" type="textarea" autosize placeholder="key">
        </el-input>
      </template>
    </el-table-column>

    <el-table-column label="type" header-align="center" min-width="20%">
      <template slot-scope="scope">
        <el-select v-model="scope.row.data_type" size="mini" placeholder="选择数据类型" style="width: 100%">
          <el-option v-for="item in formDataTypes" :label="item.label" :key="item.value" :value="item.value">
          </el-option>
        </el-select>
      </template>
    </el-table-column>

    <el-table-column label="Value" header-align="center" min-width="30%">
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
            :disabled="['True', 'False'].indexOf(scope.row.data_type) !== -1"
            v-model="scope.row.value"
            :placeholder="
            scope.row.data_type === 'True' ? 'True' : scope.row.data_type === 'False' ? 'False' : 'value'"
            :id="'data_input' + scope.$index "
            type="textarea"
            :rows=1
            size="mini">
          </el-input>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="备注" header-align="center" min-width="20%">
      <template slot-scope="scope">
        <el-input v-model="scope.row.remark" size="mini" type="textarea" autosize placeholder="备注"></el-input>
      </template>
    </el-table-column>

    <el-table-column label="操作" header-align="center" min-width="6%">
      <template slot-scope="scope">
        <el-tooltip class="item" effect="dark" placement="top-end" content="添加一行">
          <el-button
            v-show="scope.$index === 0"
            type="text"
            size="mini"
            icon="el-icon-plus"
            @click.native="addRow(true)"></el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" placement="top-end" content="删除当前行">
          <el-button
            v-show="isShowDelButton(scope.$index)"
            type="text"
            size="mini"
            icon="el-icon-minus"
            style="color: red"
            @click.native="delRow(scope.$index)"></el-button>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" placement="top-end" content="清除数据">
          <el-button
            v-show="tempData.length === 1"
            type="text"
            size="mini"
            icon="el-icon-circle-close"
            style="color: red"
            @click.native="clearData()"
          >
          </el-button>
        </el-tooltip>
      </template>
    </el-table-column>

  </el-table>
</template>

<script>
import {fileCheck, fileUpload, uploadAddr} from "@/apis/assist/file";
import Sortable from "sortablejs";

export default {
  name: "dataForm",
  props: ['dataForm'],
  data() {
    return {
      formDataTypes: [{label: '', value: ''}],
      tempData: [],
      fileType: 'case',
      uploadAddr: uploadAddr
    }
  },

  methods: {

    initTempData(data) {
      if (data && data.length > 0) {
        this.tempData = this.dataForm
      } else {
        this.addRow()
      }
    },

    // 上传文件到服务器
    uploadFileToServer(form) {
      fileUpload(form).then((response) => {
          if (this.showMessage(this, response)) {
            this.tempData[this.currentTempApiDataFormIndex]['value'] = response['data']  // 修改页面上的文件名
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

    // 是否显示删除按钮
    isShowDelButton(index) {
      return !(this.tempData.length === 1 && index === 0)
    },

    // 添加一行
    addRow(isRow) {
      if (isRow){
        this.tempData.push({
          id: `${Date.now()}`,
          key: null,
          value: null,
          remark: null,
          data_type: 'str'
        })
      }else {
        this.tempData = [{
          id: `${Date.now()}`,
          key: null,
          value: null,
          remark: null,
          data_type: null
        }]
      }
    },

    // 删除一行
    delRow(index) {
      this.tempData.splice(index, 1);
    },

    // 清除数据
    clearData() {
      this.tempData[0].key = null
      this.tempData[0].value = null
      this.tempData[0].data_type = null
      this.tempData[0].remark = null
    },

    // 拖拽排序
    setSort() {
      const el = this.$refs.dataTable.$el.querySelectorAll('.el-table__body-wrapper > table > tbody')[0]
      this.sortable = Sortable.create(el, {
        ghostClass: 'sortable-ghost',
        setData: function (dataTransfer) {
          dataTransfer.setData('Text', '')
        },
        onEnd: evt => {
          const targetRow = this.tempData.splice(evt.oldIndex, 1)[0]
          this.tempData.splice(evt.newIndex, 0, targetRow)

          const tempIndex = this.newList.splice(evt.oldIndex, 1)[0]
          this.newList.splice(evt.newIndex, 0, tempIndex)
        }
      })
    },
  },

  mounted() {

    this.formDataTypes = this.$busEvents.data.dataTypeMappingList  // 从缓存获取数据类型映射
    this.formDataTypes.push({label: '文件', value: 'file'})

    this.initTempData(this.dataForm)
    this.oldList = this.tempData.map(v => v.id)
    this.newList = this.oldList.slice()
    this.$nextTick(() => {
      this.setSort()
    })
  },

  watch: {

    'dataForm': {
      handler(newVal, oldVal) {
        this.initTempData(newVal)
      }
    },
  }
}
</script>

<style scoped>

</style>
