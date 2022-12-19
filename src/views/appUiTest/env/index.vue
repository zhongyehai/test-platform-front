<template>
  <div class="app-container">
    <el-tabs v-model="activeName">

      <el-tab-pane label="appium执行服务器" name="server">
        <serverView></serverView>
      </el-tab-pane>

      <el-tab-pane label="手机设备管理" name="phone">
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
      activeName: "server"
    }
  },

  methods: {},

}
</script>

<style scoped>

</style>
