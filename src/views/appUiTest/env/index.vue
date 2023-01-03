<template>
  <div class="app-container">
    <el-tabs v-model="activeName">

      <el-tab-pane label="appium执行服务器" name="server">
        <serverView></serverView>
        <span slot="label"> appium执行服务器 </span>
        <span slot="label">
          <el-popover class="el_popover_class" placement="top-start" trigger="hover">
            <div>添加appium执行服务器</div>
            <el-button
              slot="reference"
              type="text"
              style="margin-left: 10px"
              icon="el-icon-plus"
              @click="showAddDrawer('server')"
            ></el-button>
          </el-popover>
         </span>
      </el-tab-pane>

      <el-tab-pane label="手机设备管理" name="phone">
        <phoneView></phoneView>
        <span slot="label"> 手机设备管理 </span>
        <span slot="label">
          <el-popover class="el_popover_class" placement="top-start" trigger="hover">
            <div>添加手机设备</div>
            <el-button
              slot="reference"
              type="text"
              style="margin-left: 10px"
              icon="el-icon-plus"
              @click="showAddDrawer('phone')"
            ></el-button>
          </el-popover>
         </span>
      </el-tab-pane>

    </el-tabs>
  </div>
</template>

<script>
import serverView from "@/views/appUiTest/env/server";
import phoneView from "@/views/appUiTest/env/phone";

export default {
  name: "index",
  components: {serverView, phoneView},
  data() {
    return {
      activeName: "server"
    }
  },

  methods: {
    // 打开新增抽屉
    showAddDrawer(drawerType){
      if (drawerType === 'server'){
        this.$bus.$emit(this.$busEvents.app.showEditeServerDrawer)
      }else {
        this.$bus.$emit(this.$busEvents.app.showEditePhoneDrawer)
      }
    }
  },

}
</script>

<style scoped>

</style>
