<template>
  <!-- 新增/修改函数文件表单 -->
  <el-drawer
    :title="tempScript.id ? '修改Python脚本' : '新增Python脚本'"
    size="85%"
    :wrapper-closable="false"
    :append-to-body="true"
    :visible.sync="scriptDrawerIsShow"
    :direction="direction"
  >
    <el-form
      ref="dataForm"
      label-position="center"
      label-width="80px"
      style="margin-left: 20px;margin-right: 20px"
    >
      <el-row>
        <el-col :span="8">
          <!-- 脚本类型 -->
          <el-form-item :label="'脚本类型'" prop="name" class="is-required" size="mini">
            <el-select
              v-model="tempScript.script_type"
              :placeholder="'选择脚本类型'"
              filterable
              default-first-option
              clearable
              style="width: 90%"
              size="mini"
              class="filter-item"
              @change="selectScriptType()"
            >
              <el-option v-for="(value, key) in scriptTypeDict" :key="key" :label="value" :value="key" />
            </el-select>
            <el-popover class="el_popover_class" placement="top-start" trigger="hover">
              <div>1、输入运行表达式，调试自定义函数</div>
              <div>2、输入内容均为字符串，所以若要传字符串，不用加引号</div>
              <div>3、触发调试函数不会自动保存函数文件内容修改，若要保存，请自行点击保存按钮</div>
              <el-button slot="reference" type="text" icon="el-icon-question" />
            </el-popover>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <!-- 脚本文件名 -->
          <el-form-item :label="'脚本名'" prop="name" class="is-required" size="mini">
            <el-input
              v-model="tempScript.name"
              size="mini"
              placeholder="支持大小写字母和下划线"
              :disabled="tempScript.id !== ''"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <!-- 备注 -->
          <el-form-item :label="'备注'" prop="desc" size="mini">
            <el-input v-model="tempScript.desc" size="mini" type="textarea" :rows="1" :placeholder="'函数的描述、备注'" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="8">
          <el-form-item v-show="tempScript.script_data" label="查找代码" size="mini">
            <el-input
              v-model="findStr"
              placeholder="输入具体代码"
              style="width: 80%"
            />
            <el-button
              type="primary"
              style="margin-left: 5px"
              size="mini"
              @click="findCode()"
            >查找
            </el-button>
          </el-form-item>

        </el-col>

        <el-col :span="16">
          <el-form-item v-show="tempScript.script_type !== 'mock'" label="调试函数" size="mini">
            <el-input
              v-model="expression"
              placeholder="输入格式：${func(abc,123)}"
              type="textarea"
              :rows="1"
              style="width: 90%"
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

        </el-col>
      </el-row>

    </el-form>

    <el-container style="margin-left: 20px;margin-right: 20px">
      <aceEditor
        ref="editor"
        v-model="tempScript.script_data"
        :style="{'min-height': scriptEditHeight, 'font-size': '15px'}"
        lang="python"
        theme="monokai"
        :options="{
          enableBasicAutocompletion: true, //启动代码补全功能
          enableSnippets: true, //启动代码段
          enableLiveAutocompletion: true, //启用实时自动完成
          showPrintMargin: false //去除编辑器里的竖线
        }"
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
            <br>

            <div>运行表达式：{{ expression }}</div>
            <br>
            <br>

            <div>执行结果：</div>
            <pre class="el-collapse-item-content" style="overflow: auto">{{
                debugResultDetail.result || debugResultDetail
            }}</pre>
            <br>
            <br>

            <div>脚本print内容：</div>
            <pre class="el-collapse-item-content" style="overflow: auto">{{
                debugResultDetail.script_print || '没有print内容'
            }}</pre>
          </el-tab-pane>

          <el-tab-pane label="执行脚本" name="script">
            <div v-if="debugResultDrawerIsShow">
              <el-container style="margin-left: 20px">
                <aceEditor
                  v-model="debugResultDetail.script"
                  :style="{'min-height': scriptEditHeight, 'font-size': '15px'}"
                  lang="python"
                  theme="monokai"
                  :options="{
                    enableBasicAutocompletion: true, //启动代码补全功能
                    enableSnippets: true, //启动代码段
                    enableLiveAutocompletion: true, //启用实时自动完成
                    showPrintMargin: false //去除编辑器里的竖线
                  }"
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
// 引入vue2-ace-editor
import aceEditor from 'vue2-ace-editor'

import { postScript, putScript, debugScript, getScript } from '@/apis/assist/script'
import { runEnvList } from '@/apis/config/runEnv'

export default {
  name: 'Drawer',
  components: {
    aceEditor
  },
  props: [
    // eslint-disable-next-line vue/require-prop-types
    'scriptTypeDict', 'useFrom'
  ],
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
        script_data: '',
        script_type: ''
      },
      findStr: '',
      runEnv: '',
      runEnvList: [],
      runEnvDict: {},
      deBugButtonIsLoading: false,
      saveButtonIsLoading: false,
      expression: '', // 表达式
      debugResultDrawerIsShow: false,
      activeName: 'debugResult',
      scriptPrintLog: '',
      debugResultDetail: '',
      debugResultMessage: '',
      addTestScriptMsg: '\n# 1、支持python3.9及以下语法 \n' +
        '# 2、若使用了未安装的第三方库，则需联系管理员安装对应的库 \n' +
        '# 3、在执行自定义函数的时候，系统会强制在第一行加入一个参数：env \n' +
        '# 4、系统插入的env参数为运行时选择的环境对应的code，详见配置管理-运行环境，默认为debug \n' +
        '# 5、若自定义函数需要根据运行选中的环境进行调整，则可以使用此参数判断，然后给对应的变量赋值\n' +
        '#   如：当前文件为操作数据库，则可以根据这个env判断，连哪个库，操作哪些表 \n' +
        '# 注：建议在本地把自定义函数调试通过后直接贴进来，不建议一开始就在此编辑器中编写和调试 \n' +
        'import sys\n' +
        'this = sys.modules[__name__]\n\n' +
        'if hasattr(this, "env") is False:\n' +
        '    setattr(this, "env", "debug")  # 运行环境code\n\n',
      addMockScriptMsg: '\n# 1、支持python3.9及以下语法 \n' +
        '# 2、若使用了未安装的第三方库，则需联系管理员安装对应的库 \n' +
        '# 3、在执行自定义函数的时候，系统会强制写入请求路径、头部参数、查询字符串参数、body参数 \n' +
        '#     不用再次声明变量，可直接使用，以下是样例： \n' +
        '#        path = "请求路径" \n' +
        '#        query = {} \n' +
        '#        headers = {} \n' +
        '#        body = {} \n' +
        '# 4、最后的result的值为mock返回值，可自己随意定义 \n' +
        '# 5、支持get、post、put、delete \n' +
        '# 6、访问 【域名 + /api/tools/mock/脚本名字】即可获取到 result 对应的值 \n\n\n' +
        'import sys\n' +
        'this = sys.modules[__name__]\n\n' +
        'if hasattr(this, "path") is False:\n' +
        '    setattr(this, "path", "http://localhost:8023")\n\n' +
        'if hasattr(this, "query") is False:\n' +
        '    setattr(this, "query", {})\n\n' +
        'if hasattr(this, "headers") is False:\n' +
        '    setattr(this, "headers", {})\n\n' +
        'if hasattr(this, "body") is False:\n' +
        '    setattr(this, "body", {})\n' +
        '\n\n\n\n\n' +
        'result = {"code": 200, "msg": "操作成功"} \n'
    }
  },

  computed: {
    // 实时获 取屏幕高度-150px 作为函数文件代码编辑器的高度
    scriptEditHeight() {
      return `${window.innerHeight * 0.755}px`
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
          this.tempScript.name = data ? data.name : ''
          this.tempScript.desc = data ? data.desc : ''
          this.tempScript.script_type = data ? data.script_type : 'test'
          if (data) {
            getScript({ id: data.id }).then(res => {
              this.tempScript.script_data = res.script_data
            })
          } else {
            this.tempScript.script_data = this.addTestScriptMsg
          }
        } else if (status === 'update') {
          this.tempScript.id = data.id
          this.tempScript.name = data.name
          this.tempScript.desc = data.desc
          this.tempScript.script_type = data.script_type
          getScript({ id: data.id }).then(res => {
            this.tempScript.script_data = res.data.script_data
          })
        }

        this.deBugButtonIsLoading = false
        this.scriptDrawerIsShow = true
      }
    })
  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.$busEvents.drawerIsShow)
  },

  methods: {

    findCode() {
      if (this.findStr) {
        const editor = this.$refs.editor.editor
        editor.find(this.findStr)
      }
    },

    selectScriptType() {
      if ([this.addMockScriptMsg, this.addTestScriptMsg].indexOf(this.tempScript.script_data) !== -1) {
        this.tempScript.script_data = this.tempScript.script_type === 'mock' ? this.addMockScriptMsg : this.addTestScriptMsg
      }
    },

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
            // this.tempScript.id = res.data.id
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
        if (this.showMessage(this, res)) {
          this.dialogIsShow = false
          this.debugResultDetail = res.result
          this.debugResultMessage = res.message
          this.activeName = 'debugResult'
          this.debugResultDrawerIsShow = true
        }
      })
    },

    editorInit() {
      require('brace/ext/language_tools')
      require('brace/mode/python')
      require('brace/snippets/python')
      require('brace/theme/monokai')
    }
  }

}
</script>

<style scoped>

</style>
