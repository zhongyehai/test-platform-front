<template>

  <div class="app-container">

    <el-row>

      <!-- 第一列服务树 -->
      <el-col style="width: 20%; border:1px solid;border-color: #ffffff rgb(234, 234, 234) #ffffff #ffffff;">
        <el-tabs v-model="projectTab" class="table_padding table_project" :before-leave="beforeLeave">
          <el-tab-pane :label="projectTab" :name="projectTab">
            <div class="custom-tree-container">
              <div class="block">
                <el-input v-model="filterText" placeholder="输入关键字进行过滤" size="mini"></el-input>
                <el-scrollbar style="height:800px">
                  <el-tree
                    class="project-tree"
                    ref="tree"
                    :check-on-click-node="false"
                    :data="productTree"
                    :empty-text="'请先添加产品'"
                    :expand-on-click-node="false"
                    :filter-node-method="filterNode"
                    :highlight-current="true"
                    lazy
                    node-key="id"
                    @node-click="clickTree">
                    <div slot-scope="{ node, data }"
                         class="custom-tree-node"
                         @mouseenter="mouseenter(data)"
                         @mouseleave="mouseleave(data)">
                      <span> {{ data.name }} </span>
                      <span v-show="data.showMenu">
                        <el-dropdown
                          size="mini"
                          type="primary"
                          placement="top-start"
                          @visible-change="changeDropdownStatus"
                        >
                        <i
                          class="el-icon-more"
                          style="padding-left: 5px;color: #409EFF;transform: rotate(90deg)"
                        ></i>
                        <el-dropdown-menu slot="dropdown">

<!--                          <el-dropdown-item @click.native.stop="addWeekly(node, data)"-->
<!--                          >{{ "添加周报" }}-->
<!--                          </el-dropdown-item>-->

                          <el-dropdown-item
                            v-show="data.parent == null"
                            @click.native.stop="showModuleDialog('add', 'project', node, data)"
                          >{{ '添加项目' }}
                          </el-dropdown-item>

                          <el-dropdown-item
                            v-show="data.parent !== null"
                            @click.native.stop="showModuleDialog('edit', 'project', node, data)"
                          >{{ '修改' }}
                          </el-dropdown-item>

                          <el-dropdown-item
                            v-show="data.parent === null"
                            @click.native.stop="showModuleDialog('edit', 'product', node, data)"
                          >{{ '修改' }}
                          </el-dropdown-item>

                          <el-dropdown-item
                            @click.native.stop="clickDeleteChild(node, data)"
                          >{{ '删除' }}
                          </el-dropdown-item>

                        </el-dropdown-menu>
                      </el-dropdown>

                    </span>
                    </div>
                  </el-tree>
                </el-scrollbar>
              </div>

            </div>
          </el-tab-pane>


          <el-tab-pane key="addProduct">

           <span slot="label" style="padding-left: 50px">
             <el-button type="primary" size='mini'>添加产品</el-button>
           </span>

          </el-tab-pane>

        </el-tabs>

      </el-col>

      <!-- 第二列，周报管理组件 -->
      <el-col style="width: 79%; margin-left: 5px">
        <weeklyView
          :currentProductId="currentProductId"
          :currentProjectId="currentProjectId"
        ></weeklyView>
      </el-col>

    </el-row>

    <!-- 新增/修改产品表单 -->
    <el-drawer
      :title="productDrawerStatus === 'add'
      ? `新增${productDrawerType === 'product' ? '产品' : '项目'}`
      : `修改${productDrawerType === 'product' ? '产品' : '项目'}`"
      size="40%"
      :wrapperClosable="false"
      :visible.sync="productDrawerIsShow"
      :direction="direction">
      <el-form
        ref="dataForm"
        :model="tempDataForm"
        label-position="left"
        label-width="90px"
        style="min-width: 400px;margin-left: 20px;margin-right: 20px">

        <el-form-item v-show="productDrawerType === 'project'" label="所属上级" prop="parent" size="mini">
          <el-select
            style="width: 100%"
            v-model="tempDataForm.parent"
            size="mini"
            placeholder="选择项目"
            filterable
            default-first-option>
            <el-option v-for="item in productList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item
          :label="`${productDrawerType === 'product' ? '产品' : '项目' }名称`"
          class="filter-item is-required"
          prop="name"
          size="mini">
          <el-input v-model="tempDataForm.name" placeholder="同一节点下，产品/项目名称不可重复"/>
        </el-form-item>

        <el-form-item label="备注" prop="desc" size="mini">
          <el-input v-model="tempDataForm.desc" size="mini" type="textarea" :rows="20"></el-input>
        </el-form-item>

      </el-form>

      <div class="demo-drawer__footer">
        <el-button size="mini" @click="productDrawerIsShow = false"> {{ '取消' }}</el-button>
        <el-button
          size="mini"
          type="primary"
          :loading="isShowLoading"
          @click=" productDrawerStatus === 'add' ? addProduct() : changProduct() ">
          {{ '保存' }}
        </el-button>
      </div>
    </el-drawer>

  </div>


</template>

<script>
import waves from "@/directive/waves";
import weeklyView from '@/views/testWork/weekly/weekly.vue' // 周报管理组件
import {arrayToTree, ellipsis} from "@/utils/parseData"

import {deleteWeeklyConfig, postWeeklyConfig, putWeeklyConfig, weeklyConfigList} from "@/apis/testWork/weekly";

export default {
  name: 'index',
  components: {weeklyView},
  directives: {waves},
  data() {
    return {
      direction: 'rtl',  // 抽屉打开方式
      projectTab: '产品树',  // 服务tab的title
      filterText: '',  // 查询关键字
      productTree: [],  // 产品树
      // 表单
      tempDataForm: {
        id: '',
        name: '',
        desc: '',
        parent: null
      },
      productDrawerIsShow: false,  // 产品编辑框是否展示
      productDrawerStatus: '',  // 展示为新增或修改
      productDrawerType: 'product',  // 展示类型为产品或者项目
      isShowLoading: false, // 编辑框提交Loading
      currentProductId: '',  // 当前选中的产品id
      currentProjectId: '',  // 当前选中的项目id
      currentDataId: '',  // 当前选中的模块id，用于数据传递，获取接口列表
      currentParent: {}, // 当前选中的模块，用于提交新增、修改
      currentLabel: '',  // 当前鼠标滑入的节点名，方便展示
      productList: ''  // 产品列表
    }
  },

  created() {
    this.getProductList()
  },

  methods: {

    initTempDataForm(){
      this.tempDataForm.id = ''
      this.tempDataForm.name = ''
      this.tempDataForm.desc = ''
      this.tempDataForm.parent = ''
    },

    // 获取产品列表
    getProductList(param) {
      let data = param ? param : {parent: 'all'}
      weeklyConfigList(data).then(response => {
        this.productTree = arrayToTree(response.data.data, null)
      })
    },

    // el-dropdown 的展开/隐藏状态
    changeDropdownStatus(status) {
      this.dropdownStatus = status
    },

    // 点击树
    clickTree(data, node, element) {
      this.currentDataId = data.id

      if (data.parent) {
        // 如果是点击项目，则把选中的产品置为空
        this.currentProjectId = data.id
        this.currentProductId = null
      } else {
        // 如果是点击产品，则把选中的项目置为空
        this.currentProductId = data.id
        this.currentProjectId = null
      }
      this.$bus.$emit(this.$busEvents.testWork.clickProductTree, {
        product_id: this.currentProductId,
        project_id: this.currentProjectId
      })

      this.$refs.tree.store.nodesMap[data.id].expanded = !this.$refs.tree.store.nodesMap[data.id].expanded // 展开/收缩节点
    },

    // 添加产品
    beforeLeave() {
      this.initTempDataForm()
      this.currentParent = {}
      this.showModuleDialog('add', 'product')
      return false
    },

    // 鼠标滑入的时候，设置一个值，代表展示菜单
    mouseenter(data) {
      this.currentParent = data
      this.currentLabel = JSON.parse(JSON.stringify(data.name))
      data.name = ellipsis(data.name, 10)
      this.$set(data, 'showMenu', true);
    },

    // 鼠标滑出的时候，把可展示菜单的标识去掉
    mouseleave(data) {
      data.name = this.currentLabel
      this.$set(data, 'showMenu', false);
    },

    // 产品/项目编辑框
    showModuleDialog(command, _type, node, data) {
      this.productDrawerStatus = command
      this.productDrawerType = _type
      if (command === 'edit'){
        data = JSON.parse(JSON.stringify(data))
      }
      if (_type === 'project'){
        this.tempDataForm.parent = command === 'edit' ? data.parent : data.id
        // 获取产品列表
        weeklyConfigList({parent: ''}).then(response => {
          this.productList = response.data.data
        })
      }else {
        this.tempDataForm.parent = null
      }
      this.tempDataForm.name = command === 'edit' ? data.name : ''
      this.tempDataForm.desc = command === 'edit' ? data.desc : ''
      this.tempDataForm.id = command === 'edit' ? data.id : ''

      this.productDrawerIsShow = true
    },

    // 添加
    addProduct() {
      this.isShowLoading = true
      postWeeklyConfig({
        id: '',
        name: this.tempDataForm.name,
        desc: this.tempDataForm.desc,
        parent: this.tempDataForm.parent
      }).then(response => {
        this.isShowLoading = false
        if (this.showMessage(this, response)) {
          this.productDrawerIsShow = false

          // 把当前添加的节点加入到父节点下
          if (this.currentParent.id) {
            if (!this.currentParent.children) {
              this.$set(this.currentParent, 'children', [])
            }
            this.currentParent.children.push(response.data)
            this.$refs.tree.store.nodesMap[this.currentParent.id].expanded = true  // 展开节点
          } else {
            this.productTree.push(response.data)
          }
          // this.sendModuleTreeIsDone(this.productTree)
        }
      })
    },

    // 修改模块
    changProduct() {
      this.isShowLoading = true
      putWeeklyConfig({
        id: this.currentParent.id,
        name: this.tempDataForm.name,
        desc: this.tempDataForm.desc,
        parent: this.tempDataForm.parent,
      }).then(response => {
        this.isShowLoading = false
        if (this.showMessage(this, response)) {
          this.productDrawerIsShow = false
          this.currentParent.name = response.data.name
          // this.sendModuleTreeIsDone(this.productTree)
        }
      })
    },

    // 关键字查询模块
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },

    // 点击删除节点
    clickDeleteChild(node, data) {
      this.confirmBox(this.deleteChild, data, data.name)
    },

    // 删除节点
    deleteChild(data) {
      deleteWeeklyConfig({'id': data.id}).then(response => {
        if (this.showMessage(this, response)) {
          this.$refs.tree.remove(data)
          // this.sendModuleTreeIsDone(this.tempDataForm)
        }
      })
    },

    // 添加周报
    addWeekly(node, data) {
      this.$bus.$emit(this.$busEvents.testWork.weeklyDrawerStatus, 'add')
    }
  },

  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    }
  },
};
</script>

<style scoped>
.el-scrollbar .el-scrollbar__wrap {
  overflow-x: hidden;
}

.el-tree > .el-tree-node {
  height: 900px;
  min-width: 100%;
  display: inline-block;
}

.project-tree {
  width: 100%;
  height: 100%;
  /*overflow: scroll;*/
}

.project-tree > .el-tree-node {
  display: inline-block;
  min-width: 100%;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

</style>
