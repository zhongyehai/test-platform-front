<template>
  <div class="app-container">

    <el-form label-width="120px">
      <el-form-item :label="'选择服务：'" size="mini">
        <el-select
          v-model="currentProject"
          placeholder="请选择服务"
          size="mini"
          filterable
          default-first-option
          @change="getKYMByProject"
        >
          <el-option
            v-for="item in projectList"
            :key="item.key"
            :label="item.value"
            :value="item.key"
          >
          </el-option>
        </el-select>

        <el-button type="primary" @click.native="showDialog()" size="mini" style="margin-left: 20px">添加KYM分析
        </el-button>

        <el-button type="primary" :loading="saveLoading" @click.native="changeKYM()" size="mini"
                   style="margin-left: 20px">保存修改
        </el-button>

        <el-button
          v-show="currentProject"
          type="primary"
          size="mini"
          style="margin-left: 20px"
          @click.native="downloadXmidSetup()">下载xmind8安装包
        </el-button>

        <el-tooltip class="item" effect="dark" content="下载后需用xmind8打开" placement="top-start">
          <el-button
            v-show="currentProject"
            type="primary"
            @click.native="exportKymAsXmind()"
            size="mini"
            style="margin-left: 20px">导出为xmind
          </el-button>
        </el-tooltip>


      </el-form-item>
    </el-form>

    <!-- 脑图 -->
    <div id="map" style="width: 100%; height: 1000px"></div>

    <!-- 新增KYM分析 -->
    <el-dialog
      :close-on-click-modal="false"
      :title="'新增KYM分析'"
      :visible.sync="dialogIsShow"
      width="40%">
      <el-form
        ref="dataForm"
        label-position="right"
        label-width="90px"
        style="min-width: 400px;">
        <el-form-item :label="'服务名'" class="filter-item is-required" prop="name" size="mini">
          <el-input v-model="formProject" placeholder="服务名称"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogIsShow = false"> {{ '取消' }}</el-button>
        <el-button
          size="mini"
          type="primary"
          :loading="submitButtonIsLoading"
          @click=" addKYMProject() ">
          {{ '保存' }}
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
// 使用方法详见：https://inspiring-golick-3c01b9.netlify.app/
import MindElixir, {E} from "mind-elixir";

import {
  getProjectKYM,
  putProjectKYM,
  addKYM,
  KYMProjectList,
  getKymAsXmind,
  getDiffRecordAsXmind
} from "@/apis/testWork/kym";

export default {
  name: 'index',
  data() {
    return {

      // 服务列表
      projectList: [],

      // 默认展开的项
      activeNames: [],

      // 下拉框选中的服务
      currentProject: '',

      // form表单的服务名
      formProject: '',

      submitButtonIsLoading: false,

      // Dialog状态
      dialogIsShow: false,

      saveLoading: false,
      getLoading: false,

      ME: null,
      data: {
        "nodeData": {
          "topic": "新建服务",
          "root": true,
          "children": []
        }
      },
    }
  },

  methods: {

    initMindElixir() {
      this.ME = new MindElixir({
        el: "#map",
        direction: MindElixir.LEFT,
        data: this.data,
        draggable: true, // 启用拖动 default true
        contextMenu: true, // 启用右键菜单 default true
        toolBar: true, // 启用工具栏 default true
        nodeMenu: true, // 启用节点菜单 default true
        keypress: true, // 启用快捷键 default true
        locale: 'zh_CN', // 设置语言，支持[zh_CN,zh_TW,en,ja,pt]
        overflowHidden: false, // default false
        primaryLinkStyle: 2, // 线条形状，1为弧线，2为直线 default 1
        // primaryNodeVerticalGap: 15, //节点之间的垂直距离 default 25
        // primaryNodeHorizontalGap: 15, //节点之间的水平距离 default 65
      });
      this.ME.init();
      E('node-id')
    },

    // 点击修改按钮，启用编辑
    clickChangeButton(row) {
      this.$set(row, 'enabled', true)
    },

    // 新增服务
    addKYMProject() {
      this.submitButtonIsLoading = true
      addKYM({project: this.formProject}).then(response => {
        this.submitButtonIsLoading = false
        if (this.showMessage(this, response)) {
          this.dialogIsShow = false
          this.projectList.push({'key': this.formProject, 'value': this.formProject})

          this.currentProject = this.formProject
          this.data = response.data.kym

          // 挂载分析图
          this.initMindElixir()
        }
      })
    },

    // 获取服务列表
    getKYMProjectList() {
      KYMProjectList().then(response => {
        this.projectList = response.data
      })
    },

    // 获取指定服务的KYM
    getKYMByProject(value) {
      this.getLoading = true
      getProjectKYM({project: value}).then(response => {
        this.getLoading = false
        this.data = response.data.kym

        // 挂载分析图
        this.initMindElixir()

      })
    },

    // 递归去除parent
    filter(data) {
      data['parent'] = null
      if (data['children'] && data['children'].length > 0) {
        for (var index in data['children']) {
          this.filter(data['children'][index])
        }
      }
    },

    // 提交修改KYM
    changeKYM() {
      this.saveLoading = true
      this.filter(this.data['nodeData'])
      putProjectKYM({project: this.currentProject, kym: this.data}).then(response => {
        this.saveLoading = false
        if (this.showMessage(this, response)) {
          // 重新挂载分析图
          this.initMindElixir()
        }
      })
    },

    // 下载xmind8安装包
    downloadXmidSetup() {
      window.open('https://dl2.xmind.cn/xmind-8-update9-windows.exe')
    },

    // 导出为xmind
    exportKymAsXmind() {
      getKymAsXmind({project: this.currentProject}).then(response => {
        let blob = new Blob([response], {
          type: 'application/vnd.ms-excel'      //将会被放入到blob中的数组内容的MIME类型
        });
        // 保存文件到本地
        let a = document.createElement('a')
        a.href = URL.createObjectURL(blob);  //生成一个url
        a.download = this.currentProject + '.xmind'
        a.click()
      })
    },

    getData() {
      this.filter(this.data['nodeData'])
    },

    // 打开 dialog
    showDialog() {
      this.formProject = ''
      this.dialogIsShow = true
    }
  },

  mounted() {
    this.getKYMProjectList()
  },
}
</script>

<style>
.el-collapse-item-title {
  font-weight: 600;
  font-size: 15px;
  margin-left: 10px;
  color: #409eff
}
</style>
