<template>
  <div class="app-container">
    <el-form inline style="margin-left: 20px">
      <el-form-item :label="'测试类型'" prop="hit_type" size="mini" style="margin-right: 40px">
        <el-select
          style="width: 100%"
          v-model="queryData.test_type"
          placeholder="测试类型"
          size="mini"
          filterable
          clearable
          default-first-option
        >
          <el-option
            v-for="item in runTestTypeList"
            :key="item.key"
            :label="item.label"
            :value="item.key"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item :label="'问题类型'" prop="hit_type" size="mini">
        <el-select
          v-model="queryData.hit_type"
          filterable
          clearable
          allow-create
          default-first-option
          placeholder="问题类型，可手动输入"
          size="mini"
          style="width:100%">
          <el-option
            v-for="item in hitTypeList"
            :key="item.key"
            :label="item.value"
            :value="item.key"
          >
          </el-option>
        </el-select>
      </el-form-item>

      <el-button
        type="primary"
        size="mini"
        style="margin-left: 10px"
        @click.native="getHitList()"
      >查询
      </el-button>

      <el-button
        type="primary"
        size="mini"
        style="margin-left: 10px"
        @click.native="showHitDrawer('add')"
      >新增问题记录
      </el-button>
    </el-form>

    <el-table
      ref="hitTable"
      v-loading="tableIsLoading"
      :data="hitListData"
      row-key="id"
      stripe
    >
      <el-table-column label="序号" align="center" min-width="10%">
        <template slot-scope="scope">
          <span> {{ (queryData.pageNum - 1) * queryData.pageSize + scope.$index + 1 }} </span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true align="center" prop="date" label="触发日期" min-width="10%">
        <template slot-scope="scope">
          <span>{{ scope.row.date }}</span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true align="center" prop="test_type" label="测试类型" min-width="10%">
        <template slot-scope="scope">
          <span>{{ runTestTypeDict[scope.row.test_type] }}</span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true align="center" prop="hit_type" label="问题类型" min-width="20%">
        <template slot-scope="scope">
          <span>{{ scope.row.hit_type }}</span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true align="center" prop="hit_type" label="问题详情" min-width="30%">
        <template slot-scope="scope">
          <span>{{ scope.row.hit_detail }}</span>
        </template>
      </el-table-column>

      <el-table-column :show-overflow-tooltip=true align="center" prop="hit_type" label="报告id" min-width="10%">
        <template slot-scope="scope">
          <span>{{ scope.row.report_id }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" min-width="10%">
        <template slot-scope="scope">

          <!--查看报告-->
          <el-button
            type="text"
            size="mini"
            icon="el-icon-view"
            @click="showReport(scope.row)">
          </el-button>

          <!--修改问题记录-->
          <el-button
            type="text"
            size="mini"
            icon="el-icon-edit"
            style="margin-right: 8px"
            @click="showHitDrawer('update', scope.row)">
          </el-button>

          <!-- 删除问题记录 -->
          <el-popover
            :ref="scope.row.id"
            placement="top"
            popper-class="down-popover"
            v-model="scope.row.deletePopoverIsShow">
            <p>确定删除此数据?</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="cancelDeletePopover(scope.row)">取消</el-button>
              <el-button type="primary" size="mini" @click="delHit(scope.row)">确定</el-button>
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

    <pagination
      v-show="hitListTotal>0"
      :total="hitListTotal"
      :page.sync="queryData.pageNum"
      :limit.sync="queryData.pageSize"
      @pagination="getHitList"
    />

    <hitDrawer
      :runTestTypeList="runTestTypeList"
      :currentHitTypeList="hitTypeList"
    ></hitDrawer>

  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import hitDrawer from "@/views/assist/hits/drawer";

import {deleteHit, getHitTypeList, hitList} from '@/apis/assist/hit'
import {getConfigByName} from "@/apis/config/config";

export default {
  name: "funcFile",
  components: {
    Pagination,
    hitDrawer
  },
  data() {
    return {
      // 拖拽排序参数
      sortable: null,
      oldList: [],
      newList: [],
      hitTypeList: [],
      hitListData: [],
      hitListTotal: 0,
      runTestTypeDict: {},
      runTestTypeList: [],
      tableIsLoading: false,
      queryData: {
        test_type: '',
        hit_type: '',
        pageSize: 20,
        pageNum: 1
      }
    }
  },

  methods: {

    getRunType(){
      getConfigByName({name: 'test_type'}).then(response => {
        this.runTestTypeList = JSON.parse(response.data.value)
        this.runTestTypeList.forEach(rType =>{
          this.runTestTypeDict[rType["key"]] = rType["label"]
        })
      })
    },

    initHitTypeList(){
      getHitTypeList().then(response => {
        this.hitTypeList = response.data
      })
    },

    getHitList() {
      this.tableIsLoading = true
      hitList(this.queryData).then(response => {
        this.tableIsLoading = false
        this.hitListData = response.data.data
        this.hitListTotal = response.data.total
      })
    },

    // 新增问题记录
    showHitDrawer(status, row) {
      this.$bus.$emit(this.$busEvents.data.drawerIsShow, status, row)
    },

    // 查看报告
    showReport(row){
      let baseDir = ''
      if (row.test_type === 'api'){
        baseDir = 'apiTest'
      }else if (row.test_type === 'web_ui'){
        baseDir = 'webUiTest'
      }else {
        baseDir = 'appUiTest'
      }
      window.open(`#/${baseDir}/reportShow?id=${row.report_id}`, '_blank')
    },

    cancelDeletePopover(row){
      this.$set(row, 'deletePopoverIsShow', false)
    },

    delHit(row) {
      this.$set(row, 'deletePopoverIsShow', false)
      this.$set(row, 'deleteLoadingIsShow', true)
      deleteHit({'id': row.id}).then(response => {
        this.$set(row, 'deleteLoadingIsShow', false)
        if (this.showMessage(this, response)) {
          this.getHitList()
        }
      })
    },

  },

  mounted() {
    this.initHitTypeList()

    this.getRunType()

    this.getHitList()

    // 修改成功，重新请求列表
    this.$bus.$on(this.$busEvents.data.drawerIsCommit, (status) => {
      this.getHitList()
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.data.drawerIsCommit)
  },

}
</script>

<style scoped>

</style>
