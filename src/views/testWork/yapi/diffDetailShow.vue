<template>
  <div class="app-container">

    <div style="margin-bottom: 10px">
      <!-- 下载按钮 -->
      <el-tooltip class="item" effect="dark" content="下载后需用xmind8打开" placement="top-start">
        <el-button type="primary"
                   size="mini"
                   @click.native="exportDiffRecordAsXmind()">导出为xmind
        </el-button>
      </el-tooltip>

      <el-button type="primary"
                 size="mini"
                 style="margin-left: 20px"
                 @click.native="downloadXmidSetup()">下载xmind8安装包
      </el-button>
    </div>

    <!-- 脑图 -->
    <div v-show="mindIsShow" id="map" style="width: 100%; height: 1000px"></div>

  </div>
</template>

<script>
// 使用方法详见：https://inspiring-golick-3c01b9.netlify.app/
import MindElixir, {E} from "mind-elixir";

import {getDiffRecord, getDiffRecordAsXmind} from "@/apis/testWork/yapi";

export default {
  name: 'showDiffDetail',
  data() {
    return {

      mindIsShow: true,

      ME: null,
      diffData: {
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
        data: this.diffData,
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

    getDiffRecordData() {
      getDiffRecord({id: this.$route.query.id}).then((response) => {
        if (this.showMessage(this, response)) {
          this.diffData = response.data

          // 挂载分析图
          this.initMindElixir()
        }
      })
    },

    // 导出为xmind
    exportDiffRecordAsXmind() {
      getDiffRecordAsXmind({id: this.$route.query.id}).then(response => {
        let blob = new Blob([response], {
          type: 'application/vnd.ms-excel'      //将会被放入到blob中的数组内容的MIME类型
        });
        // 保存文件到本地
        let a = document.createElement('a')
        a.href = URL.createObjectURL(blob);  //生成一个url
        a.download = this.$route.query.name + '.xmind'
        a.click()
      })
    },

    // 下载xmind8安装包
    downloadXmidSetup() {
      window.open('https://dl2.xmind.cn/xmind-8-update9-windows.exe')
    }
  },

  mounted() {
    this.getDiffRecordData()
  },
}
</script>

<style>

</style>
