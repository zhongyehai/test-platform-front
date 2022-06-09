<template>

  <div>

    <el-drawer
      title="编辑函数内容"
      size="60%"
      :wrapperClosable="false"
      :visible.sync="funcFileDrawerIsShow"
      :direction="direction">

      <el-form size="small">

        <el-form-item label="文件名" :label-width="'85px'" size="mini">
          <el-input v-model="funcFileName" disabled style="width: 90%"></el-input>
        </el-form-item>

        <el-form-item label="调试函数" :label-width="'85px'" size="mini">
          <el-input v-model="debugFuncData" placeholder="输入格式：${func(abc,123)}" type="textarea" :rows="1"
                    style="width: 80%"></el-input>
          <el-button
            type="primary"
            style="margin-left: 10px"
            size="mini"
            :loading="deBugButtonIsLoading"
            @click="debugFunc">调试
          </el-button>
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
            4、系统插入的env参数为运行时选择的环境，默认测试环境（test），其余为开发环境（dev）、uat环境（uat）、生产环境（production） <br/>
            5、若自定义函数需要根据运行选中的环境进行调整，则可以使用此参数判断，然后给对应的变量赋值，如：SQL文件为操作数据库，则可以根据这个字段判断，根据不同环境给数据库信息赋值<br/>
            注：建议在本地把自定义函数调试通过后直接贴进来，不建议一开始就在此编辑器中编写
          </div>
        </el-collapse-item>
      </el-collapse>

      <el-container>

        <editor
          :style="{'min-height': funcFileEditHeight, 'font-size': '15px'}"
          v-model="funcData"
          @init="editorInit"
          lang="python"
          theme="monokai"
          width="90%"
          :options="{enableSnippets:true, enableBasicAutocompletion: true, enableLiveAutocompletion: true}"
        >
        </editor>

      </el-container>

      <div class="demo-drawer__footer">

        <el-button size="mini" @click="funcFileDrawerIsShow = false"> {{ '取消' }}</el-button>

        <el-button
          type="primary"
          size="mini"
          :loading="saveButtonIsLoading"
          @click="saveFuncData()">
          {{ '保存' }}
        </el-button>
      </div>

    </el-drawer>

    <!-- 展示调试结果 -->
    <el-drawer
      :title="debugResultMessage"
      size="40%"
      :wrapperClosable="false"
      :visible.sync="debugResultDrawerIsShow"
      :direction="direction">
      <div class="demo-drawer__content" style="margin-left: 20px">
        <pre class="el-collapse-item-content" style="overflow: auto">{{ debugResultDetail }}</pre>
      </div>
    </el-drawer>

  </div>
</template>

<script>
import funcFileDrawer from "@/views/apiTest/funcFile/drawer";
import {debugFuncFile, saveFuncFileData} from "@/apis/apiTest/funcFile";

export default {
  name: "funcEditor",
  components: {
    funcFileDrawer,
    editor: require('vue2-ace-editor'),
  },
  data() {
    return {
      deBugButtonIsLoading: false,
      saveButtonIsLoading: false,
      funcFileDrawerIsShow: false,
      funcData: '',
      funcFileName: '',
      id: '',
      debugFuncData: '',
      direction: 'rtl',  // 抽屉打开方式
      debugResultDrawerIsShow: false,
      debugResultDetail: '',
      debugResultMessage: ''
    }
  },
  methods: {

    // 保存函数文件内容
    saveFuncData() {
      this.saveButtonIsLoading = true
      saveFuncFileData({'id': this.id, 'func_data': this.funcData}).then(res => {
        this.saveButtonIsLoading = false
        if (res.status === 200) {
          this.showMessage(this, res)
          this.$bus.$emit(this.$busEvents.api.apiEditFuncFileIsCommit, 'success')
          this.funcFileDrawerIsShow = false
        } else {
          this.debugResultDetail = res.message.result
          this.debugResultMessage = res.message.msg
          this.debugResultDrawerIsShow = true
        }
      })
    },

    // 调试函数文件
    debugFunc() {
      this.deBugButtonIsLoading = true
      debugFuncFile({'id': this.id, 'debug_data': this.debugFuncData}).then(response => {
        this.deBugButtonIsLoading = false

        this.debugResultDetail = response.result
        this.debugResultMessage = response.message
        this.debugResultDrawerIsShow = true

      })
    },

    editorInit() {
      require('brace/ext/language_tools');
      require('brace/mode/python');
      require('brace/theme/monokai');
      require('brace/snippets/python')
    },
  },

  computed: {
    // 实时获 取屏幕高度-150px 作为函数文件代码编辑器的高度
    funcFileEditHeight() {
      return `${window.innerHeight - 100}px`
    }
  },

  mounted() {

    // 点击编辑函数文件事件
    this.$bus.$on(this.$busEvents.api.apiEditFuncFileData, (funcFile) => {
      this.funcData = funcFile.func_data
      this.id = funcFile.id
      this.funcFileName = funcFile.name
      this.funcFileDrawerIsShow = true
    })

  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.api.apiEditFuncFileData)
  },

}
</script>

<style scoped>

</style>
