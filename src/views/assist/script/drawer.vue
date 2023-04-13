<template>
  <!-- 新增/修改函数文件表单 -->
  <el-drawer
    :title="tempScript.id ? '修改Python脚本' : '新增Python脚本'"
    size="85%"
    :append-to-body="true"
    :visible.sync="scriptDrawerIsShow"
    :direction="direction"
  >
    <el-form
      ref="dataForm"
      label-position="center"
      label-width="100px"
      style="min-width: 400px;margin-left: 20px;margin-right: 20px"
    >

      <!-- 脚本文件名 -->
      <el-form-item :label="'脚本文件名'" prop="name" class="is-required" size="mini" style="margin-bottom: 0">
        <el-input
          v-model="tempScript.name"
          size="mini"
          placeholder="支持大小写字母和下划线"
          :disabled="tempScript.id !== ''" />
      </el-form-item>

      <!-- 备注 -->
      <el-form-item :label="'备注'" prop="desc" style="margin-bottom: 8px">
        <el-input v-model="tempScript.desc" size="mini" type="textarea" :rows="1" :placeholder="'函数的描述、备注'" />
      </el-form-item>

      <el-form-item label="调试函数" size="mini">
        <el-input
          v-model="expression"
          placeholder="输入格式：${func(abc,123)}"
          type="textarea"
          :rows="1"
          style="width: 89%"
        />
        <el-button
          type="primary"
          style="margin-left: 5px"
          size="mini"
          :loading="deBugButtonIsLoading"
          @click="dialogIsShow = true"
        >调试
        </el-button>
        <el-popover class="el_popover_class" placement="top-start" trigger="hover">
          <div>1、输入运行表达式，调试自定义函数</div>
          <div>2、输入内容均为字符串，所以若要传字符串，不用加引号</div>
          <div>3、触发调试函数不会自动保存函数文件内容修改，若要保存，请自行点击保存按钮</div>
          <el-button slot="reference" type="text" icon="el-icon-question" />
        </el-popover>
      </el-form-item>

    </el-form>

    <el-collapse accordion style="margin-left: 20px">
      <el-collapse-item>
        <template slot="title">
          <div style="color:#409eff"> 点击查看说明</div>
        </template>
        <div style="margin-left: 20px">
          1、支持python3语法 <br>
          2、若使用了未安装的第三方库，则需联系管理员安装对应的库 <br>
          3、在执行自定义函数的时候，系统会强制在第一行加入一个参数：env <br>
          4、系统插入的env参数为运行时选择的环境，默认测试环境（test），其余为开发环境（dev）、uat环境（uat）、生产环境（production）
          <br>
          5、若自定义函数需要根据运行选中的环境进行调整，则可以使用此参数判断，然后给对应的变量赋值，如：SQL文件为操作数据库，则可以根据这个字段判断，根据不同环境给数据库信息赋值<br>
          <span
            style="color: red"
          >注：建议在本地把自定义函数调试通过后直接贴进来，不建议一开始就在此编辑器中编写和调试</span>
        </div>
      </el-collapse-item>
    </el-collapse>

    <el-container style="margin-left: 20px">
      <editor
        v-model="tempScript.script_data"
        :style="{'min-height': scriptEditHeight, 'font-size': '15px'}"
        lang="python"
        theme="monokai"
        :options="{enableSnippets:true, enableBasicAutocompletion: true, enableLiveAutocompletion: true}"
        @init="editorInit"
      />
    </el-container>

    <div class="demo-drawer__footer">
      <el-button size="mini" @click="scriptDrawerIsShow = false"> {{ '取消' }}</el-button>
      <el-button
        type="primary"
        size="mini"
        :loading="submitButtonIsLoading"
        @click="tempScript.id ? editScript(): creteScript()"
      >
        {{ '保存' }}
      </el-button>
    </div>

    <!-- 选择环境和运行模式 -->
    <el-dialog
      title="选择运行环境"
      append-to-body
      :visible.sync="dialogIsShow"
      :close-on-click-modal="false"
      width="50%"
    >

      <div>
        <label>选择环境：</label>
      </div>
      <div style="margin-top: 10px">
        <label>
          <span style="color: red">
            注：请确保此次运行中涉及到的所有服务都设置了当前选中环境的域名 <br>
            比如选择的测试环境，那么在运行的时候所有步骤都会找自己所在服务的测试环境的域名
          </span>
        </label>
      </div>
      <div style="margin-top: 10px">
        <el-radio v-for="(env) in runEnvList " :key="env.code" v-model="runEnv" :label="env.code">{{
          env.name
        }}
        </el-radio>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogIsShow = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="debugFunc">确 定</el-button>
      </span>

    </el-dialog>

    <!-- 展示调试结果 -->
    <el-drawer
      :title="debugResultMessage"
      size="70%"
      append-to-body
      :visible.sync="debugResultDrawerIsShow"
      :direction="direction"
    >
      <div class="demo-drawer__content" style="margin-left: 20px">
        <el-tabs v-model="activeName">
          <el-tab-pane label="执行结果" name="debugResult">
            <div>运行环境：{{ runEnvDict[runEnv] }}</div>
            <br>

            <div>运行表达式：{{ expression }}</div>
            <br>

            <div>执行结果：</div>
            <pre class="el-collapse-item-content" style="overflow: auto">{{
                debugResultDetail.result || '没有返回值或返回值为null'
            }}</pre>
          </el-tab-pane>

          <el-tab-pane label="执行脚本" name="script">
            <div v-if="debugResultDrawerIsShow">
              <el-container style="margin-left: 20px">
                <editor
                  v-model="debugResultDetail.script"
                  :style="{'min-height': scriptEditHeight, 'font-size': '15px'}"
                  lang="python"
                  theme="monokai"
                  :options="{enableSnippets:true, enableBasicAutocompletion: true, enableLiveAutocompletion: true}"
                  @init="editorInit"
                />
              </el-container>
            </div>
          </el-tab-pane>
        </el-tabs>

      </div>
    </el-drawer>

  </el-drawer>
</template>

<script>
import { postScript, putScript, debugScript, getScript } from '@/apis/assist/script'
import { runEnvList } from '@/apis/config/runEnv'

export default {
  name: 'Drawer',
  components: {
    editor: require('vue2-ace-editor')
  },
  data() {
    return {
      direction: 'rtl', // 抽屉打开方式
      dialogIsShow: false,
      submitButtonIsLoading: false,
      scriptDrawerIsShow: false,
      tempScript: {
        id: '',
        name: '',
        desc: '',
        script_data: ''
      },
      runEnv: '',
      runEnvList: [],
      runEnvDict: {},
      deBugButtonIsLoading: false,
      saveButtonIsLoading: false,
      expression: '', // 表达式
      debugResultDrawerIsShow: false,
      activeName: 'debugResult',
      debugResultDetail: '',
      debugResultMessage: ''
    }
  },

  computed: {
    // 实时获 取屏幕高度-150px 作为函数文件代码编辑器的高度
    scriptEditHeight() {
      return `${window.innerHeight - 100}px`
    }
  },

  mounted() {
    // 初始化运行环境
    runEnvList().then(response => {
      this.runEnvList = response.data.data
      if (this.runEnvList && this.runEnvList.length > 0) {
        this.runEnv = this.runEnvList[0].code
      }
      this.runEnvList.forEach(env => {
        this.runEnvDict[env.code] = env.name
      })
    })

    this.$bus.$on(this.$busEvents.drawerIsShow, (_type, status, data) => {
      if (_type === 'scriptInfo') {
        if (status === 'add') {
          this.tempScript.id = ''
          this.tempScript.script_data = ''
          this.tempScript.name = data ? data.name : ''
          this.tempScript.desc = data ? data.desc : ''
          if (data) {
            getScript({ id: data.id }).then(res => {
              this.tempScript.script_data = res.script_data
            })
          }
          this.tempScript.script_data = data ? data.script_data : ''
        } else if (status === 'update') {
          this.tempScript.id = data.id
          this.tempScript.name = data.name
          this.tempScript.desc = data.desc
          getScript({ id: data.id }).then(res => {
            this.tempScript.script_data = res.script_data
          })
        }
        this.scriptDrawerIsShow = true
      }
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsShow)
  },

  methods: {
    showDetail(res) {
      this.debugResultDetail = res.message.result
      this.debugResultMessage = res.message.msg
      this.activeName = 'debugResult'
      this.debugResultDrawerIsShow = true
    },

    // 新增函数文件
    creteScript() {
      this.submitButtonIsLoading = true
      postScript(this.tempScript).then(res => {
        this.submitButtonIsLoading = false
        if (res.message.msg) {
          this.showDetail(res)
        } else {
          if (this.showMessage(this, res)) {
            this.tempScript.id = res.data.id
            this.$bus.$emit(this.$busEvents.drawerIsCommit, 'scriptInfo')
            this.scriptDrawerIsShow = false
          }
        }
      })
    },

    // 修改函数文件
    editScript() {
      this.submitButtonIsLoading = true
      putScript(this.tempScript).then(res => {
        this.submitButtonIsLoading = false
        if (res.message.msg) {
          this.showDetail(res)
        } else {
          if (this.showMessage(this, res)) {
            this.$bus.$emit(this.$busEvents.drawerIsCommit, 'scriptInfo')
            this.scriptDrawerIsShow = false
          }
        }
      })
    },

    // 调试函数文件
    debugFunc() {
      // 先保存
      this.submitButtonIsLoading = true
      if (this.tempScript.id) {
        putScript(this.tempScript).then(res => {
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
        postScript(this.tempScript).then(res => {
          this.submitButtonIsLoading = false
          if (res.message.msg) {
            this.showDetail(res)
          } else {
            if (this.showMessage(this, res)) {
              this.tempScript.id = res.data.id
              this.runDeBug()
            }
          }
        })
      }
    },

    runDeBug() {
      this.deBugButtonIsLoading = true
      debugScript({
        'id': this.tempScript.id,
        'expression': this.expression,
        'env': this.runEnv
      }).then(res => {
        this.deBugButtonIsLoading = false
        this.dialogIsShow = false
        this.debugResultDetail = res.result
        this.debugResultMessage = res.message
        this.activeName = 'debugResult'
        this.debugResultDrawerIsShow = true
      })
    },

    editorInit() {
      require('brace/ext/language_tools')
      require('brace/mode/python')
      require('brace/theme/monokai')
      require('brace/snippets/python')
    }
  }

}
</script>

<style scoped>

</style>
