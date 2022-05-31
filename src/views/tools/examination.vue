<template>
  <div class="app-container">

    <!-- inline="true"，el-form-item不自动换行 -->
    <el-form label-width="100px" :inline="true">
      <el-form-item :label="'题目名称：'" size="mini">
        <el-input
          v-model="keywords"
          placeholder="输入题目关键字搜索"
          style="width: 300%"
          class="filter-item"
          size="mini"
        />
      </el-form-item>
    </el-form>

    <el-table :data="question_result" stripe>
      <el-table-column prop="question" label="题目" min-width="60"></el-table-column>
      <el-table-column prop="answer" label="选项" min-width="40%"></el-table-column>
    </el-table>

  </div>
</template>

<script>
import {examination} from "@/apis/tools/examination";

export default {
  name: "examination",
  data() {
    return {
      questions: [],
      keywords: ""  // 搜索关键字
    }
  },

  methods: {
    initQuestion() {
      examination().then((response) => {
          if (this.showMessage(this, response)) {
            this.questions = response.data
          }
        }
      )
    }
  },

  //定义计算属性，判断是否为关键字搜索
  computed: {
    question_result() {
      const that = this;

      if (this.keywords) {  // 如果是关键字搜索，返回搜索内容
        return this.questions.filter(function (item) {  // filter 会把所有为true的数据保存到数组里面
          return item.question.indexOf(that.keywords) >= 0;
        })
      } else {  // 否则返回所有数据
        return this.questions
      }
    }
  },

  mounted() {
    this.initQuestion()
  }
}


</script>

<style scoped>

</style>

