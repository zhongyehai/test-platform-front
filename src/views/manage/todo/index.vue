<template>
  <div class="layout-container">
    <div class="layout-container-table">
      <div class="list">
        <Block v-for="(block, key) in dataList" :key="key" :data="block" :userDict="userDict"/>
      </div>
    </div>
  </div>
  <addTodoDrawer></addTodoDrawer>
  <editTodoDrawer></editTodoDrawer>
</template>

<script lang="ts" setup>
import {ref, onMounted, onBeforeUnmount} from 'vue'
import Block from './block.vue'
import addTodoDrawer from './add-drawer.vue'
import editTodoDrawer from './edit-drawer.vue'
import {GetTodoList} from "@/api/manage/todo";
import {GetUserList} from "@/api/system/user";
import {bus, busEvent} from "@/utils/bus-events";

const dataList = ref({
  "todo": {
    "title": "待处理",
    "status": "todo",
    "children": [
      {
        "id": 103,
        "tags": [
          "优化"
        ],
        "name": "系统全局国际化",
        "options": [
          "类型：系统优化"
        ]
      }
    ]
  },
  "doing": {
    "title": "处理中",
    "status": "doing",
    "children": [
      {
        "id": 13,
        "tags": [
          "新增"
        ],
        "name": "系统管理-角色管理",
        "options": [
          "类型：页面"
        ]
      }
    ]
  },
  "testing": {
    "title": "测试中",
    "status": "testing",
    "children": [
      {
        "id": 5,
        "tags": [
          "新增"
        ],
        "name": "下拉加载",
        "options": [
          "类型：页面"
        ]
      }
    ]
  },
  "done": {
    "title": "已完成",
    "status": "done",
    "children": [
      {
        "id": 39,
        "tags": [
          "新增"
        ],
        "name": "页面-百度一下",
        "options": [
          "类型：页面"
        ]
      }
    ]
  }
})

const getTodoList = () => {
  GetTodoList({}).then(res => {
    var todoList = []
    var doingList = []
    var testingList = []
    var doneList = []

    res.data.forEach(item => {
      switch (item.status) {
        case "todo":
          todoList.push(item)
          break
        case "doing":
          doingList.push(item)
          break
        case "testing":
          testingList.push(item)
          break
        case "done":
          doneList.push(item)
      }
    })
    dataList.value.todo.children = todoList
    dataList.value.doing.children = doingList
    dataList.value.testing.children = testingList
    dataList.value.done.children = doneList
  })
}
const userDict = ref({})
const getUserList = () => {
  GetUserList({page_num:1, page_size: 99999}).then((response: object) => {
    response.data.data.forEach((item: any) => {
      userDict.value[item.id] = item.name
    })
  })
}

const drawerIsCommit = (message: any) => {
  if (message.eventType === 'get-todo-list') {
    getTodoList()
  }}

onMounted(() => {
  getUserList()
  getTodoList()
  bus.on(busEvent.drawerIsCommit, drawerIsCommit);
})

onBeforeUnmount(() => {
  bus.off(busEvent.drawerIsCommit, drawerIsCommit);
})
</script>

<style lang="scss" scoped>
.layout-container-table {
  white-space: nowrap;
  padding: 15px 0 0 0;
  position: relative;

  :deep(.el-scrollbar__view) {
    height: 100%;
  }

  &::before, &::after {
    content: '';
    width: 15px;
    height: calc(100% - 20px);
    position: absolute;
    background: #fff;
    top: 0;
  }

  &::before {
    left: 0;
  }

  &::after {
    right: 0;
  }

  .list {
    box-sizing: border-box;
    overflow-y: hidden;
    overflow-x: auto;
    text-align: left;
    height: 100%;
    padding: 0 15px;
    background: #fff;

    .block {
      margin-right: 20px;
    }

    .block:last-child {
      margin-right: 0;
    }
  }
}
</style>
