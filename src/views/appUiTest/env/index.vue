<template>
  <div class="app-container">
    <el-tabs v-model="activeName">

      <el-tab-pane name="appServer">
        <template slot="label">
          <span> appium执行服务器 </span>
          <el-popover class="el_popover_class" placement="top-start" trigger="hover">
            <div>添加appium执行服务器</div>
            <el-button
              slot="reference"
              type="text"
              style="margin-left: 10px"
              icon="el-icon-plus"
              @click="showAddDrawer(activeName)"
            ></el-button>
          </el-popover>
        </template>
        <serverView></serverView>
      </el-tab-pane>

      <el-tab-pane label="手机设备管理" name="appPhone">
        <template slot="label">
          <span> 手机设备管理 </span>
          <el-popover class="el_popover_class" placement="top-start" trigger="hover">
            <div>添加手机设备</div>
            <el-button
              slot="reference"
              type="text"
              style="margin-left: 10px"
              icon="el-icon-plus"
              @click="showAddDrawer(activeName)"
            ></el-button>
          </el-popover>
        </template>
        <phoneView></phoneView>
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
      activeName: "appServer"
    }
  },

  methods: {
    // 打开新增抽屉
    showAddDrawer(drawerType){
      this.$bus.$emit(this.$busEvents.drawerIsShow, drawerType)
    }
  },

}
</script>

<style scoped>

</style>
