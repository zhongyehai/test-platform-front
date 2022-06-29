<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',

  // 解决因页面刷新，vuex中状态丢失的问题，刷新时将vuex的值保存在 localStorage , 刷新完成读取出来，

  // 方案一：配合store.index.state的赋值
  mounted() {
    // 页面加载完毕时添加刷新页面的监听事件
    // window.addEventListener('unload', this.saveState)
    window.addEventListener('beforeunload', this.saveState)

  },
  methods: {
    saveState() {
      // 把this.$store.state保存到localStorage.state
      localStorage.setItem('state', JSON.stringify(this.$store.state))
    }
  }



  // 方案二：从监听事件解决，参考：https://www.cnblogs.com/attacking-cabbage/p/10846211.html
  // created() {
  //   // 刷新时将vuex的值保存在 localStorage ,刷新完成读取出来
  //   let storeKey = 'state'
  //   // 保存 vuex中的状态到 localStorage.state
  //   window.addEventListener("beforeunload",()=>{
  //     window.localStorage.setItem(storeKey, JSON.stringify(this.$store.state))
  //   })
  //    // 如果 localStorage.state 有值，则取出来赋给vuex.state
  //   if (window.localStorage.getItem(storeKey) ) {
  //     this.$store.replaceState(Object.assign({}, this.$store.state,JSON.parse(window.localStorage.getItem(storeKey))))
  //   }
  // }
}
</script>

<style>

/*抽屉body*/
.el-drawer__body {
  overflow-y: scroll;
  margin-bottom: 50px;
}

/*抽屉footer固定到底部*/
.demo-drawer__footer {
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  border-top: 1px solid #e8e8e8;
  padding: 10px 16px;
  text-align: right;
  background-color: white;
}

/* el-popconfirm - title 换行*/
.el-popconfirm__main {
  white-space: pre-line;
  margin: -14px 0 4px;
}

.el-popconfirm__main > i {
  margin-top: 22px;
  margin-bottom: auto;
}
</style>
