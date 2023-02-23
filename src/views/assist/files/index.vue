<template>
  <div class="app-container">

    <el-form label-width="120px">
      <el-form-item :label="'选择文件类型：'" size="mini">
        <el-select
          v-model="fileType"
          placeholder="请选择文件类型"
          size="mini"
          filterable
          default-first-option
          @change="selectType"
        >
          <el-option
            v-for="item in fileTypeList"
            :key="item.key"
            :label="item.value"
            :value="item.key"
          >
          </el-option>
        </el-select>

        <el-tooltip class="item" effect="dark" content="可覆盖已存在的文件" placement="right-end" style="margin-left: 20px">
          <el-button type="primary" @click.native="openFileUploadDialog" size="mini">上传文件</el-button>
        </el-tooltip>

      </el-form-item>
    </el-form>

    <el-table
      ref="apiTree"
      v-loading="listLoading"
      :data="fileList"
      stripe
    >
      <el-table-column prop="id" label="编号" align="center" min-width="5%">
        <template slot-scope="scope">
          <span> {{ (pageNum - 1) * pageSize + scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="name" align="center" label="文件名" min-width="40%">
        <template slot-scope="scope">
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true prop="size" align="center" label="文件大小" min-width="10%">
        <template slot-scope="scope">
          <span> {{ scope.row.size }} 字节</span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true align="center" prop="lastVisitTime" label="最近一次使用时间" min-width="15%">
        <template slot-scope="scope">
          <span> {{ scope.row.lastVisitTime }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true align="center" prop="LastModifiedTime" label="最后一次更新时间" min-width="15%">
        <template slot-scope="scope">
          <span> {{ scope.row.LastModifiedTime }} </span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" min-width="10%">
        <template slot-scope="scope">
          <!-- 下载文件 -->
          <el-button
            type="text"
            size="mini"
            style="margin-right: 10px"
            icon="el-icon-download"
            :loading="scope.row.downloadLoadingIsShow"
            @click.native="downloadFile(scope.row)"
          ></el-button>

          <!-- 删除文件 -->
          <el-popover
            :ref="scope.row.id"
            placement="top"
            popper-class="down-popover"
            v-model="scope.row.deletePopoverIsShow">
            <p>确定删除【{{ scope.row.name }}】?</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="cancelDeletePopover(scope.row)">取消</el-button>
              <el-button type="primary" size="mini" @click="delFile(scope.row)">确定</el-button>
            </div>
            <el-button
              slot="reference"
              style="color: red"
              type="text"
              size="mini"
              icon="el-icon-delete"
              :loading="scope.row.deleteLoadingIsShow"
            ></el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="pageNum"
      :limit.sync="pageSize"
      @pagination="getFileList"
    />

    <uploadFileView></uploadFileView>

  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import uploadFileView from "@/components/file/uploadFile";
import {fileList, fileDelete, fileDownload} from "@/apis/assist/file";

export default {
  name: 'index',
  components: {Pagination, uploadFileView},
  data() {
    return {
      // 加载状态
      listLoading: false,

      // 文件列类型
      fileType: 'case',

      // 文件类型列表
      fileTypeList: [
        {'key': 'case', 'value': '用例文件'},
        {'key': 'cfca', 'value': 'CFCA证书文件'},
        {'key': 'callBack', 'value': '回调文件'},
        {'key': 'temp', 'value': '临时文件'},
        {'key': 'driver', 'value': '浏览器驱动文件'}
      ],

      // 文件列表
      fileList: [],

      total: 0,
      pageNum: 1,
      pageSize: 20
    }
  },

  methods: {

    // 获取文件列表
    getFileList() {
      fileList({'pageNum': this.pageNum, 'pageSize': this.pageSize, 'fileType': this.fileType}).then(response => {
        this.fileList = response.data.data
        this.total = response.data.total
      })
    },

    // 选中事件
    selectType(value) {
      this.pageNum = 1
      this.pageSize = 20
      this.getFileList()
    },

    // 下载文件
    downloadFile(row) {
      this.$set(row, 'downloadLoadingIsShow', true)
      fileDownload({'name': row.name, 'fileType': this.fileType}).then(response => {
        this.$set(row, 'downloadLoadingIsShow', false)
        let blob = new Blob([response], {
          type: 'application/vnd.ms-excel'      //将会被放入到blob中的数组内容的MIME类型
        });
        // 保存文件到本地
        let a = document.createElement('a')
        a.href = URL.createObjectURL(blob);  //生成一个url
        a.download = row.name
        a.click()
      })
    },

    cancelDeletePopover(row){
      this.$set(row, 'deletePopoverIsShow', false)
    },

    // 删除文件
    delFile(row) {
      this.$set(row, 'deletePopoverIsShow', false)
      this.$set(row, 'deleteLoadingIsShow', true)
      fileDelete({'name': row.name, 'fileType': this.fileType}).then(response => {
        this.$set(row, 'deleteLoadingIsShow', false)
        if (this.showMessage(this, response)) {
          this.getFileList()
        }
      })
    },

    // 打开文件上传窗口
    openFileUploadDialog() {
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'uploadFile', this.fileType)
    }
  },

  mounted() {

    // 监听 Dialog 打开事件
    this.$bus.$on(this.$busEvents.drawerIsCommit, (_type) => {
      if (_type === 'uploadFile'){
        this.getFileList()
      }
    })

    this.getFileList()
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsCommit)
  }
}
</script>

<style>

.list {
  max-height: 200px;
}
</style>
