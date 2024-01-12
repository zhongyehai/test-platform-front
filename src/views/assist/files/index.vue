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
          />
        </el-select>

        <el-tooltip class="item" effect="dark" content="可覆盖已存在的文件" placement="right-end" style="margin-left: 20px">
          <el-button type="primary" size="mini" @click.native="openFileUploadDialog">上传文件</el-button>
        </el-tooltip>

      </el-form-item>
    </el-form>

    <el-table
      ref="apiTree"
      v-loading="listLoading"
      size="mini"
      :data="fileList"
      stripe
    >
      <el-table-column prop="id" label="编号" align="center" min-width="5%">
        <template slot-scope="scope">
          <span> {{ (page_num - 1) * page_size + scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column show-overflow-tooltip prop="name" align="center" label="文件名" min-width="40%">
        <template slot-scope="scope">
          <span> {{ scope.row.name }} </span>
        </template>
      </el-table-column>

      <el-table-column show-overflow-tooltip prop="size" align="center" label="文件大小" min-width="10%">
        <template slot-scope="scope">
          <span> {{ scope.row.size }} 字节</span>
        </template>
      </el-table-column>

      <el-table-column show-overflow-tooltip align="center" prop="lastVisitTime" label="最近一次使用时间" min-width="15%">
        <template slot-scope="scope">
          <span> {{ scope.row.lastVisitTime }} </span>
        </template>
      </el-table-column>

      <el-table-column show-overflow-tooltip align="center" prop="LastModifiedTime" label="最后一次更新时间" min-width="15%">
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
            :loading="scope.row.downloadLoadingIsShow"
            @click.native="downloadFile(scope.row)"
          >下载</el-button>

          <!-- 删除文件 -->
          <el-popover
            :ref="scope.row.id"
            v-model="scope.row.deletePopoverIsShow"
            placement="top"
            popper-class="down-popover"
          >
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
              :loading="scope.row.deleteLoadingIsShow"
            >删除</el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="page_num"
      :limit.sync="page_size"
      @pagination="getFileList"
    />

    <uploadFileView />

  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import uploadFileView from '@/components/file/uploadFile'
import { fileList, fileDelete, fileDownload } from '@/apis/assist/file'

export default {
  name: 'Index',
  components: { Pagination, uploadFileView },
  data() {
    return {
      listLoading: false, // 加载状态
      fileType: 'case', // 文件列类型
      // 文件类型列表
      fileTypeList: [
        { 'key': 'case', 'value': '用例文件' },
        { 'key': 'callBack', 'value': '回调文件' },
        { 'key': 'temp', 'value': '临时文件' },
        { 'key': 'driver', 'value': '浏览器驱动文件' }
      ],
      fileList: [], // 文件列表
      total: 0,
      page_num: 1,
      page_size: 20
    }
  },

  mounted() {
    // 监听文件上传提交事件
    this.$bus.$on(this.$busEvents.drawerIsCommit, (_type) => {
      if (_type === 'uploadFile') {
        this.getFileList()
      }
    })

    this.getFileList()
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsCommit)
  },

  methods: {

    // 获取文件列表
    getFileList() {
      fileList({ page_num: this.page_num, page_size: this.page_size, file_type: this.fileType }).then(response => {
        this.fileList = response.data.data
        this.total = response.data.total
      })
    },

    // 选中事件
    selectType(value) {
      this.page_num = 1
      this.page_size = 20
      this.getFileList()
    },

    // 下载文件
    downloadFile(row) {
      this.$set(row, 'downloadLoadingIsShow', true)
      fileDownload({ file_name: row.name, file_type: this.fileType }).then(response => {
        this.$set(row, 'downloadLoadingIsShow', false)
        const blob = new Blob([response], {
          type: 'application/vnd.ms-excel' // 将会被放入到blob中的数组内容的MIME类型
        })
        // 保存文件到本地
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob) // 生成一个url
        a.download = row.name
        a.click()
      })
    },

    cancelDeletePopover(row) {
      this.$set(row, 'deletePopoverIsShow', false)
    },

    // 删除文件
    delFile(row) {
      this.$set(row, 'deletePopoverIsShow', false)
      this.$set(row, 'deleteLoadingIsShow', true)
      fileDelete({ file_name: row.name, file_type: this.fileType }).then(response => {
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
  }
}
</script>

<style>

.list {
  max-height: 200px;
}
</style>
