<template>
  <!-- 选择环境和运行模式 -->
  <el-dialog title="选择运行环境" append-to-body :visible.sync="dialogIsShow" :close-on-click-modal="false" width="50%">

    <!-- 选择运行环境 -->
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
      <el-radio v-model="runEnv" :label="key" v-for="(value, key) in runEnvData " :key="key">{{ value }}</el-radio>
    </div>

    <!-- 选择运行浏览器 -->
    <div v-if="triggerRunType === 'webUi'">
      <div style="margin-top: 20px">
        <label>选择浏览器：</label>
      </div>
      <div style="margin-top: 10px">
        <label>
        <span style="color: red">
          注： <br>
          1、请确保服务器已安装此浏览器 <br>
          2、请确webdriver版本与浏览器版本匹配
        </span>
        </label>
      </div>
      <div style="margin-top: 10px">
        <el-radio
          v-model="runBrowser"
          :label="key" v-for="(value, key) in runBrowserNameData " :key="key">{{ value }}
        </el-radio>
      </div>
    </div>

    <!-- 业务线，接口自动化，且运行的是用例集，才显示此选项 -->
    <div v-if="showSelectBusiness">
      <div style="margin-top: 40px">
        <label>业务线： </label>
      </div>
      <div style="margin-top: 10px">
        <label>
          <span style="color: red">
            仅运行当前用例集下，业务线为当前选中的业务线的测试用例
          </span>
        </label>
      </div>
      <div style="margin-top: 10px">
        <businessView
          ref="businessView"
          :isMultiple="false"
          :selectType="'radio'"
        ></businessView>
      </div>
    </div>

    <!-- 执行模式 -->
    <div v-if="showSelectRunModel">
      <div style="margin-top: 40px">
        <label>执行模式： </label>
      </div>

      <div style="margin-top: 10px">
        <label>
          <span style="color: red">
            串行执行: 用例一条一条顺序串行执行 <br>
            并行执行: 每条用例一个线程并行执行 <br>
            注：并行执行仅仅是为了提升执行效率，请勿用于压力测试<br>
          </span>
        </label>
      </div>

      <div style="margin-top: 10px">
        <el-radio v-model="runType" :label="key" v-for="(value, key) in runModeData" :key="key">{{ value }}</el-radio>
      </div>

    </div>

    <!-- 运行app的配置 -->
    <div v-if="triggerRunType === 'appUi'">
      <div style="margin-top: 40px">
        <label>运行终端： </label>
      </div>

      <div style="margin-top: 10px">
        <label>
          <span style="color: red">
            运行服务器: 要连接哪个终端的appium服务器进行app自动化测试 <br>
            运行手机: 该设备运行自动化测试的手机型号 <br>
            注：请确保测试平台与选中的appium服务器网络通畅、appium服务器已启动、手机已连接到该服务器<br>
          </span>
        </label>
      </div>
      <el-row>
        <el-col :span="12">
          <div style="margin-top: 10px">
            <label>运行服务器：</label>
            <el-select
              v-model="runServer"
              filterable
              default-first-option
              placeholder="请选择运行服务器"
              style="width: 70%"
              size="mini"
            >
              <el-option
                v-for="server in runServerList"
                :key="server.id"
                :label="`${server.name}   (最近一次访问：${statusContentMapping[server.status]})`"
                :value="server.id"
              >
              </el-option>
            </el-select>
          </div>
        </el-col>

        <el-col :span="12">
          <div style="margin-top: 10px">
            <label>运行手机：</label>
            <el-select
              v-model="runPhone"
              filterable
              default-first-option
              placeholder="请选择运行手机"
              style="width: 70%"
              size="mini"
            >
              <el-option
                v-for="phone in runPhoneList"
                :key="phone.id"
                :label="phone.name"
                :value="phone.id"
              >
              </el-option>
            </el-select>
          </div>
        </el-col>
      </el-row>

    </div>

    <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogIsShow = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="runData()">确 定</el-button>
    </span>

  </el-dialog>
</template>

<script>
import businessView from '@/components/Selector/business'

import {appiumServerRequestStatusMappingContent, appiumServerRequestStatusMappingTagType} from "@/utils/mapping";

import {getConfigByName, getRunModel} from "@/apis/config/config";
import {phoneList, serverList} from "@/apis/appUiTest/env";  // 初始化超时时间
import {getRunTimeout} from "@/utils/getConfig";

export default {
  name: "selectRunEnv",
  props: ['event', 'callBackEvent'],
  components: {
    businessView
  },
  data() {
    return {
      dialogIsShow: false,
      runEnvData: {},
      runModeData: {},
      runBrowserNameData: {},
      runEnv: '',
      runBrowser: '',
      runServer: '',
      runPhone: '',
      triggerRunType: 'api',
      runType: '0',
      runServerList: [],
      runPhoneList: [],
      showSelectRunModel: false,
      showSelectBusiness: false,

      statusContentMapping: appiumServerRequestStatusMappingContent,
      statusTagTypeMapping: appiumServerRequestStatusMappingTagType
    }
  },
  methods: {

    // 点确定
    runData() {
      this.$bus.$emit(this.callBackEvent, {
        runEnv: this.runEnv,
        browser: this.runBrowser,
        businessId: this.showSelectBusiness ? this.$refs.businessView.business : '',
        runServer: this.runServer,
        runPhone: this.runPhone,
        runType: parseInt(this.runType)
      })
      this.dialogIsShow = false
    },

    // 获取环境配置
    initEnv() {
      getConfigByName({'name': 'run_test_env'}).then(response => {
        this.runEnvData = JSON.parse(response.data.value)
      })
    },

    // 获取浏览器配置
    initBrowserName() {
      getConfigByName({'name': 'browser_name'}).then(response => {
        this.runBrowserNameData = JSON.parse(response.data.value)
        let keys = Object.keys(this.runBrowserNameData)
        if (keys.length > 0) {
          this.runBrowser = keys[0]
        }
      })
    },

    // 获取执行模式配置
    initRunMode() {
      getRunModel().then(response => {
        this.runModeData = response.data
      })
    },

    // 获取app测试的运行环境
    getRunAppEnv() {
      serverList().then(response => {
        this.runServerList = response.data.data
        if (this.runServerList.length > 0) {
          this.runServer = this.runServerList[0].id
        }
      })

      phoneList().then(response => {
        this.runPhoneList = response.data.data
        if (this.runPhoneList.length > 0) {
          this.runPhone = this.runPhoneList[0].id
        }
      })
    }
  },

  mounted() {

    // 获取默认环境
    getConfigByName({'name': 'default_env'}).then(response => {
      this.runEnv = response.data.value
    })

    getRunTimeout(this)  // 初始化等待用例运行超时时间

    this.$bus.$on(this.event, (triggerRunType, showSelectRunModel, runType) => {
      this.triggerRunType = triggerRunType
      this.showSelectRunModel = showSelectRunModel
      if (triggerRunType === 'api') {
        this.initRunMode()
        if (runType === 'set'){
          this.showSelectBusiness=true
        }
      } else if (triggerRunType === 'appUi') {
        this.getRunAppEnv()
      } else {
        this.initRunMode()
        this.initBrowserName()
      }
      this.dialogIsShow = true
    })

    this.initEnv()

  },

  // 组件销毁前，关闭bus监听事件
  beforeDestroy() {
    this.$bus.$off(this.event)
  },
}
</script>

<style scoped>

</style>
