<template>
  <div class="container">
    <div>
      <div style="margin: 20px">
        共{{ iconList.length }}个图标
      </div>

      <div v-for="(iconItemList, index) in showIconGroupList" :key="iconItemList">
        第 {{ index + 1 }} 行
        <i
            :class="`iconfont icon-test${iconItemName}`"
            v-for="iconItemName in iconItemList"
            :key="iconItemName"
            style="margin-right: 20px;font-size: 90px;"
            @click="clickIcon(iconItemName)"
        ></i>
      </div>

    </div>
  </div>
</template>

<script lang="ts" setup>
import {glyphs as iconList} from "@/assets/icons/iconfont.json"
import {ElMessage} from 'element-plus'
import toClipboard from "@/utils/copy-to-memory";

let showIconGroupList = []
let tempIconList: string[] = []
iconList.forEach((item, index) => {
  let elementIndex = index + 1
  if (elementIndex >= 10 && elementIndex % 10 === 0) {  // 10个一组
    showIconGroupList.push(JSON.parse(JSON.stringify(tempIconList)))
    tempIconList = []
  }
  tempIconList.push(item.font_class)
})

const clickIcon = async (iconName: string) => {
  try {
    console.log(`当前点击的图标： iconfont icon-test${iconName}`)
    await toClipboard(`iconfont icon-test${iconName}`);  //实现复制
    ElMessage.success("已复制到粘贴板")
  } catch (e) {
    console.error(e);
  }
}
</script>

<style lang="scss" scoped>

</style>
