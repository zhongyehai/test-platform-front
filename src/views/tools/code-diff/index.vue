<template>

  <div class="code-diff">
    <div style="text-align: center;">
      <el-button type="primary" size="small" @click="diffString">字符串对比</el-button>
      <el-button type="primary" size="small" @click="diffJson">json对比</el-button>
    </div>
    <el-row>
      <el-col :span="12">
        <div class="code-section">
          <h3>旧数据 <span v-show="oldStringError" style="color: red">{{ oldStringError }}</span> </h3>
          <textarea v-model="oldString" placeholder="输入对比项1" :style="{height: inputHeight}"></textarea>
        </div>
      </el-col>

      <el-col :span="12">
        <div class="code-section">
          <h3>新数据<span v-show="newStringError" style="color: red">{{ newStringError }}</span> </h3>
          <textarea v-model="newString" placeholder="输入对比项2" :style="{height: inputHeight}"></textarea>
        </div>
      </el-col>
    </el-row>

  </div>

  <el-drawer v-model="showDiffRes" title="对比结果" size="80%">
    <div >
      <code-diff
          :old-string="oldStringDiff"
          :new-string="newStringDiff"
          :style="{height: inputHeight}"
          output-format="side-by-side"
          language="json"
      />
    </div>
  </el-drawer>

</template>
<script lang="ts" setup>
import {onBeforeUnmount, onMounted, ref} from "vue";

const oldString = ref<string>('');
const oldStringDiff = ref<string>('');
const oldStringError = ref<string>('');

const newString = ref<string>('');
const newStringDiff = ref<string>('');
const newStringError = ref<string>('');

const showDiffRes = ref(false);


const inputHeight = ref(`${window.innerHeight * 0.67}px`)

const setInputHeight = () => {
  if (window.innerHeight < 800) {  // 小屏
    inputHeight.value = `${window.innerHeight * 0.67}px`
  } else {  // 大屏
    inputHeight.value = `${window.innerHeight * 0.74}px`
  }
}

// 将通讯录按照 ABCD字母的顺序排序
const sortObjByKey = (obj) => {
  const keys = Object.keys(obj).sort();
  const newObj = {};
  for (let i = 0; i < keys.length; i++) {
    const index = keys[i];
    newObj[index] = obj[index];
  }
  return newObj;
}

const diffString = () => {
  oldStringDiff.value = oldString.value
  newStringDiff.value = newString.value
  showDiffRes.value = true
}

const diffJson = () => {
  try {
    oldStringDiff.value = JSON.stringify(sortObjByKey(JSON.parse(oldString.value)), null, 2)
    oldStringError.value = ""
  }catch(err) {
    oldStringError.value = "不可序列化json，请检查"
    return
  }

  try {
    newStringDiff.value = JSON.stringify(sortObjByKey(JSON.parse(newString.value)), null, 2)
    newStringError.value = ""
  }catch(err) {
    newStringError.value = "不可序列化json，请检查"
    return
  }
  showDiffRes.value = true
}

onMounted(() => {
  setInputHeight()
  window.addEventListener('resize', setInputHeight);
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', setInputHeight);
})

</script>
<style>

.code-diff {
  display: flex;
  flex-direction: column;
  margin: 10px;
}

.code-section {
  border: 1px solid #ccc;
  margin: 10px 0;
  padding: 10px;
  border-radius: 4px;
  background-color: #f9f9f9;
}

textarea {
  width: 95%;
  //height: 500px;
  height: 900%;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px;
  font-family: monospace;
  resize: none; /* 禁止调整大小 */
}

</style>
