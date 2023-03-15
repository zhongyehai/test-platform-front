<template>
  <!-- 新增/修改函数文件表单 -->
  <el-drawer
    :title="tempFunc.id ? '修改函数文件' : '新增函数文件'"
    size="60%"
    :wrapperClosable="false"
    :visible.sync="funcFileDrawerIsShow"
    :direction="direction">
    <el-form
      ref="dataForm"
      label-position="center"
      label-width="100px"
      style="min-width: 400px;margin-left: 20px;margin-right: 20px">

      <!-- 函数文件名 -->
      <el-form-item :label="'函数文件名'" prop="name" class="is-required" size="mini" style="margin-bottom: 0">
        <el-input size="mini" v-model="tempFunc.name"/>
      </el-form-item>

      <!-- 备注 -->
      <el-form-item :label="'备注'" prop="desc" style="margin-bottom: 8px">
        <el-input v-model="tempFunc.desc" size="mini" type="textarea" :rows="1" :placeholder="'函数的描述、备注'"/>
      </el-form-item>

      <el-form-item label="调试函数" size="mini">
        <el-input
          v-model="expression"
          placeholder="输入格式：${func(abc,123)}"
          type="textarea"
          :rows="1"
          style="width: 89%"
        ></el-input>
        <el-button
          type="primary"
          style="margin-left: 5px"
          size="mini"
          :loading="deBugButtonIsLoading"
          @click="debugFunc">调试
        </el-button>
        <el-popover class="el_popover_class" placement="top-start" trigger="hover">
          <div>1、输入运行表达式，调试自定义函数</div>
          <div>2、输入内容均为字符串，所以若要传字符串，不用加引号</div>
          <div>3、触发调试函数不会自动保存函数文件内容修改，若要保存，请自行点击保存按钮</div>
          <el-button slot="reference" type="text" icon="el-icon-question"></el-button>
        </el-popover>
      </el-form-item>

    </el-form>

    <el-collapse accordion style="margin-left: 20px">
      <el-collapse-item>
        <template slot="title">
          <div style="color:#409eff"> 点击查看说明</div>
        </template>
        <div style="margin-left: 20px">
          1、支持python3语法 <br/>
          2、若使用了未安装的第三方库，则需联系管理员安装对应的库 <br/>
          3、在执行自定义函数的时候，系统会强制在第一行加入一个参数：env <br/>
          4、系统插入的env参数为运行时选择的环境，默认测试环境（test），其余为开发环境（dev）、uat环境（uat）、生产环境（production）
          <br/>
          5、若自定义函数需要根据运行选中的环境进行调整，则可以使用此参数判断，然后给对应的变量赋值，如：SQL文件为操作数据库，则可以根据这个字段判断，根据不同环境给数据库信息赋值<br/>
          <span
            style="color: red">注：建议在本地把自定义函数调试通过后直接贴进来，不建议一开始就在此编辑器中编写和调试</span>
        </div>
      </el-collapse-item>
    </el-collapse>

    <el-container style="margin-left: 20px">
      <editor
        :style="{'min-height': funcFileEditHeight, 'font-size': '15px'}"
        v-model="tempFunc.func_data"
        @init="editorInit"
        lang="python"
        theme="monokai"
        :options="{enableSnippets:true, enableBasicAutocompletion: true, enableLiveAutocompletion: true}"
      >
      </editor>
    </el-container>

    <div class="demo-drawer__footer">
      <el-button size="mini" @click="funcFileDrawerIsShow = false"> {{ '取消' }}</el-button>
      <el-button
        type="primary"
        size="mini"
        :loading="submitButtonIsLoading"
        @click="tempFunc.id ? editFuncFile(): creteFuncFile()">
        {{ '保存' }}
      </el-button>
    </div>

    <!-- 展示调试结果 -->
    <el-drawer
      :title="debugResultMessage"
      size="40%"
      append-to-body
      :wrapperClosable="false"
      :visible.sync="debugResultDrawerIsShow"
      :direction="direction">
      <div class="demo-drawer__content" style="margin-left: 20px">
        <pre class="el-collapse-item-content" style="overflow: auto">{{ debugResultDetail || '没有返回值或返回值为null' }}</pre>
      </div>
    </el-drawer>

  </el-drawer>
</template>

<script>
import {postFuncFile, putFuncFile, debugFuncFile} from '@/apis/assist/funcFile'

export default {
  name: "drawer",
  components: {
    editor: require('vue2-ace-editor'),
  },
  data() {
    return {
      direction: 'rtl',  // 抽屉打开方式
      submitButtonIsLoading: false,
      funcFileDrawerIsShow: false,
      tempFunc: {
        id: '',
        name: '',
        desc: '',
        func_data: '',
      },

      deBugButtonIsLoading: false,
      saveButtonIsLoading: false,
      expression: '',  // 表达式
      debugResultDrawerIsShow: false,
      debugResultDetail: '',
      debugResultMessage: ''
    }
  },

  mounted() {
    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, status, data) => {
      if (_type === 'funcFileInfo') {
        if (status === 'add') {
          this.tempFunc.name = ''
          this.tempFunc.desc = ''
          this.tempFunc.id = ''
          this.tempFunc.func_data = ''
        } else if (status === 'update') {
          this.tempFunc.id = data.id
          this.tempFunc.name = data.name
          this.tempFunc.desc = data.desc
          this.tempFunc.func_data = data.func_data
        }
        this.funcFileDrawerIsShow = true
      }
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsShow)
  },

  methods: {

    showDetail(res){
      this.debugResultDetail = res.message.result
      this.debugResultMessage = res.message.msg
      this.debugResultDrawerIsShow = true
    },

    // 新增函数文件
    creteFuncFile() {
      this.submitButtonIsLoading = true
      postFuncFile(this.tempFunc).then(res => {
        this.submitButtonIsLoading = false
        if (res.message.msg) {
          this.showDetail(res)
        } else {
          if (this.showMessage(this, res)) {
            this.tempFunc.id = res.data.id
            this.$bus.$emit(this.$busEvents.drawerIsCommit, 'funcFileInfo')
            this.funcFileDrawerIsShow = false
          }
        }
      })
    },

    // 修改函数文件
    editFuncFile() {
      this.submitButtonIsLoading = true
      putFuncFile(this.tempFunc).then(res => {
        this.submitButtonIsLoading = false
        if (res.message.msg) {
          this.showDetail(res)
        } else {
          if (this.showMessage(this, res)) {
            this.$bus.$emit(this.$busEvents.drawerIsCommit, 'funcFileInfo')
            this.funcFileDrawerIsShow = false
          }
        }
      })
    },

    // 调试函数文件
    debugFunc() {

      // 先保存
      this.submitButtonIsLoading = true
      if (this.tempFunc.id) {
        putFuncFile(this.tempFunc).then(res => {
          this.submitButtonIsLoading = false
          if (res.message.msg) {
            this.showDetail(res)
          } else {
            if (this.showMessage(this, res)) {
              this.runDeBug()
            }
          }
        })
      } else {
        postFuncFile(this.tempFunc).then(res => {
          this.submitButtonIsLoading = false
          if (res.message.msg) {
            this.showDetail(res)
          } else {
            if (this.showMessage(this, res)) {
              this.tempFunc.id = res.data.id
              this.runDeBug()
            }
          }
        })
      }
    },

    runDeBug() {
      this.deBugButtonIsLoading = true
      debugFuncFile({'id': this.tempFunc.id, 'expression': this.expression}).then(res => {
        this.deBugButtonIsLoading = false
        this.debugResultDetail = res.result
        this.debugResultMessage = res.message
        this.debugResultDrawerIsShow = true
      })
    },

    editorInit() {
      require('brace/ext/language_tools');
      require('brace/mode/python');
      require('brace/theme/monokai');
      require('brace/snippets/python')
    }
  },

  computed: {
    // 实时获 取屏幕高度-150px 作为函数文件代码编辑器的高度
    funcFileEditHeight() {
      return `${window.innerHeight - 100}px`
    }
  },

}
</script>

<style scoped>

</style>
