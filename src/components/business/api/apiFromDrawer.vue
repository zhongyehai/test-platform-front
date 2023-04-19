<template>

  <el-drawer
    title="接口归属信息"
    size="95%"
    :append-to-body="true"
    :visible.sync="drawerIsShow"
    :direction="direction"
  >

    <el-table
      ref="apiTable"
      :data="apiList"
      stripe
    >
      <el-table-column prop="num" align="center" label="序号" min-width="10%">
        <template slot-scope="scope">
          <span> {{ scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" prop="name" label="接口归属" align="center" min-width="40%">
        <template slot-scope="scope">
          <span>{{ scope.row.from }}</span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip="true" prop="name" label="接口信息" align="center" min-width="40%">
        <template slot-scope="scope">
          <div
            class="block"
            :class="`block_${scope.row.method.toLowerCase()}`"
            :style="{
              'backgroundColor': scope.row.deprecated === true ? '#ebebeb' : '',
              'textDecoration': scope.row.deprecated === true ? 'line-through' : ''
            }"
          >
            <span
              class="block-method block_method_color"
              :class="`block_method_${scope.row.method.toLowerCase()}`"
              :style="{
                'backgroundColor': scope.row.deprecated === true ? '#ebebeb' : ''
              }"
            >
              {{ scope.row.method }}
            </span>
            <span class="block-method block_url">{{ scope.row.addr }}</span>
            <span class="block-summary-description">{{ scope.row.name }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        :show-overflow-tooltip="true"
        prop="level"
        align="center"
        min-width="10%"
      >
        <template slot="header">
          <span> 重要级别 </span>
          <el-tooltip
            class="item"
            effect="dark"
            placement="top-start"
          >
            <div slot="content">
              <div>标识接口的重要级别，根据重要级别筛选优先做自动化测试的接口</div>
            </div>
            <span><i style="color: #409EFF" class="el-icon-question" /></span>
          </el-tooltip>
        </template>
        <template slot-scope="scope">
          <div>
            <div style="width: 80%; margin-left:auto; margin-right:auto">
              <el-select
                :ref="`levelSelector${scope.row.id}`"
                slot="prepend"
                v-model="scope.row.level"
                size="mini"
                placeholder="选择重要程度"
                filterable
                class="select"
                @change="selectApiLevel(scope.row)"
              >
                <el-option label="高" value="P0"><span style="color: #F56C6C">高</span></el-option>
                <el-option label="中" value="P1"><span style="color: #E6A23C">中</span></el-option>
                <el-option label="低" value="P2"><span style="color: #67C23A">低</span></el-option>
              </el-select>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column align="center" min-width="12%">
        <template slot="header">
          <span>是否可用</span>
          <el-tooltip
            class="item"
            effect="dark"
            placement="top-start"
          >
            <div slot="content">
              <div>标识接口是否被废弃</div>
            </div>
            <span><i style="color: #409EFF" class="el-icon-question" /></span>
          </el-tooltip>
        </template>
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.deprecated"
            :inactive-value="true"
            :active-value="false"
            @change="changeStatus(scope.row)"
          />
        </template>
      </el-table-column>

      <el-table-column
        :show-overflow-tooltip="true"
        prop="create_user"
        align="center"
        min-width="12%"
      >
        <template slot="header">
          <span> 使用次数 </span>
          <el-tooltip
            class="item"
            effect="dark"
            placement="top-start"
          >
            <div slot="content">
              <div>1: 统计有多少条用例里直接使用了此接口</div>
              <div>2: 被设计为用例的步骤后，该用例被引用的，不纳入统计</div>
            </div>
            <span><i style="color: #409EFF" class="el-icon-question" /></span>
          </el-tooltip>
        </template>
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" placement="top-start">
            <div slot="content">
              <div>{{ scope.row.quote_count > 0 ? '点击查看详情' : '未被使用过' }}</div>
            </div>
            <el-tag
              v-if="scope.row.quote_count"
              @click="getApiMsgBelongToStep(scope.row)"
            >
              {{ scope.row.quote_count }}
            </el-tag>
            <el-tag v-else type="info">0</el-tag>
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" min-width="15%">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="mini"
            style="margin-left: 5px"
            @click="showEditForm(scope.row)"
          >查看</el-button>

          <el-button
            v-if="caseId"
            type="text"
            size="mini"
            @click.native="addApiToStep(scope.row)"
          >转步骤</el-button>
        </template>
      </el-table-column>
    </el-table>

  </el-drawer>
</template>

<script>

import { apiMsgBelongToStep, changeApiLevel, changeApiStatus } from '@/apis/apiTest/api'

export default {
  name: 'ShowApiFromDrawer',
  components: {},
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'caseId',
    // eslint-disable-next-line vue/require-prop-types
    'marker'
  ],
  data() {
    return {
      drawerIsShow: false,
      direction: 'rtl', // 抽屉打开方式
      showCaseList: [],
      apiList: [],
      colorDict: {
        'P0': '#F56C6C',
        'P1': '#E6A23C',
        'P2': '#67C23A'
      }
    }
  },

  watch: {
    // 重新获取接口列表后，修改对应的重要等级背景色颜色
    'apiList': {
      deep: true, // 深度监听
      handler(newVal, oldVal) {
        this.$nextTick(function() {
          newVal.forEach(api => {
            this.changeSelectColor(api)
          })
        })
      }
    }
  },

  mounted() {
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, marker, apiList) => {
      if (_type === 'apiFromIsShow' && marker === this.marker) {
        this.apiList = apiList
        this.drawerIsShow = true
      }
    })
  },

  // 页面销毁的时候，关闭bus监听选中事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsShow)
  },

  methods: {

    getApiMsgBelongToStep(row) {
      apiMsgBelongToStep({ id: row.id }).then(response => {
        if (this.showMessage(this, response)) {
          this.$bus.$emit(this.$busEvents.drawerIsShow, 'apiUseIsShow', this.marker, response.data)
        }
      })
    },

    // 打开编辑框
    showEditForm(row) {
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'apiInfo', 'edit', JSON.parse(JSON.stringify(row)), 'showFrom')
    },

    // 深拷贝接口，添加到步骤列表
    addApiToStep(api) {
      // 把当前选中的接口，传给步骤编辑tab
      // 初始化步骤的默认值
      var new_api = JSON.parse(JSON.stringify(api))
      new_api['api_id'] = new_api['id']
      new_api['id'] = ''
      new_api['status'] = 1
      new_api['run_times'] = 1
      new_api['replace_host'] = false
      new_api['skip_if'] = { 'expect': null, 'comparator': '', 'data_type': '', 'check_value': null }
      this.$bus.$emit(this.$busEvents.drawerIsShow, 'stepInfo', 'add', new_api)
    },

    changeStatus(row) {
      changeApiStatus({
        id: row.id,
        deprecated: row.deprecated
      }).then(response => {
        this.showMessage(this, response)
      })
    },

    // 修改接口的重要等级
    selectApiLevel(row) {
      this.tableLoadingIsShow = true
      changeApiLevel({
        id: row.id,
        level: row.level
      }).then(response => {
        this.tableLoadingIsShow = false
        this.showMessage(this, response)

        // 修改选择框颜色
        this.changeSelectColor(row)
      })
    },

    // 修改选择框颜色
    changeSelectColor(row) {
      this.$refs[`levelSelector${row.id}`].$el.children[0].children[0].style.backgroundColor = this.colorDict[row.level]
    }

  }

}
</script>

<style scoped>
.block_post {
  border: 1px solid #49cc90;
  background-color: rgba(73, 204, 144, .1)
}

.block_method_post {
  background-color: #49cc90;
}

.block_put {
  border: 1px solid #fca130;
  background-color: rgba(252, 161, 48, .1)
}

.block_method_put {
  background-color: #fca130;
}

.block_get {
  border: 1px solid #61affe;
  background-color: rgba(97, 175, 254, .1)
}

.block_method_get {
  background-color: #61affe;
}

.block_delete {
  border: 1px solid #f93e3e;
  background-color: rgba(249, 62, 62, .1)
}

.block_method_delete {
  background-color: #f93e3e;
}

.block_patch {
  border: 1px solid #50e3c2;
  background-color: rgba(80, 227, 194, .1)
}

.block_method_patch {
  background-color: #50e3c2;
}

.block_head {
  border: 1px solid #e6a23c;
  background-color: rgba(230, 162, 60, .1)
}

.block_method_head {
  background-color: #e6a23c;
}

.block_options {
  border: 1px solid #409eff;
  background-color: rgba(64, 158, 255, .1)
}

.block_method_options {
  background-color: #409eff;
}

.block {
  position: relative;
  border-radius: 4px;
  /*height: 48px;*/
  overflow: hidden;
  padding: 5px;
  display: flex;
  align-items: center;
}

.block_url {
  word-break: normal;
  width: auto;
  display: block;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow: hidden;
  -webkit-box-flex: 1;
  -ms-flex: 1;
  font-family: Open Sans, sans-serif;
  color: #3b4151;
}

.block_name {
  padding-left: 5px;
  word-break: normal;
  width: auto;
  display: block;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow: hidden;
  -webkit-box-flex: 1;
  -ms-flex: 1;
  font-family: Open Sans, sans-serif;
  color: #3b4151;
}

.block_method_color {
  cursor: pointer;
  color: #fff;
}

.block-method {
  font-size: 14px;
  font-weight: 600;
  min-width: 50px;
  padding: 0px 10px;
  text-align: center;
  border-radius: 5px;
  text-shadow: 0 1px 0 rgba(0, 0, 0, .1);
  font-family: Titillium Web, sans-serif;
}

.block-summary-description {
  word-break: normal;
  width: auto;
  display: block;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow: hidden;
  -webkit-box-flex: 1;
  -ms-flex: 1;
  font-family: Open Sans, sans-serif;
  color: #3b4151;
}
</style>
