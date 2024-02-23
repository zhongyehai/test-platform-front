<template>
  <VAceEditor
      style="height: 500px; width: 100%;"
      lang="javascript"
      theme="monokai"
      @init="initEditor"
  />
  <!-- 你可以添加一个按钮来触发查找功能 -->
  <button @click="findAndSelectText('要查找的文本')">查找文本</button>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import {VAceEditor} from "vue3-ace-editor";

const editorRef = ref(null);

// 初始化编辑器设置
const initEditor = (editor) => {
  // 保存编辑器引用
  editorRef.value = editor;

  // 设置编辑器的一些初始选项，例如语言、主题等
  editor.session.setMode('ace/mode/javascript');
  editor.setTheme('ace/theme/monokai');

  // 可选：在这里添加编辑器的其他配置
};

// 查找并选中内容的函数
const findAndSelectText = (text) => {
  const editor = editorRef.value;
  if (editor) {
    editor.find(text, {
      // 查找选项
      backwards: false,
      wrap: true,
      caseSensitive: false,
      wholeWord: false,
      regExp: false,
    });
  }
};

onMounted(() => {
  // 如果需要在组件加载时执行查找，可以在这里调用 findAndSelectText
  // findAndSelectText('要查找的文本');
});
</script>

