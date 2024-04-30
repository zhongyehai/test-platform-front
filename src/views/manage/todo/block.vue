<template>
  <div class="block">
    <div class="header">
      <span class="num">{{ data.children.length }}</span>
      <div :class="data.status">{{ data.title }}</div>
      <div>
        <el-popover class="el_popover_class" placement="top-start" trigger="hover" content="添加任务">
          <template #reference>
            <el-button
                v-if="data.status === 'todo'"
                type="text"
                style="margin-left: 10px"
                @click="addTodo"
            ><Plus></Plus>
            </el-button>
          </template>
        </el-popover>
      </div>
    </div>
    <div class="dataList" ref="dom">
      <Item v-for="item in data.children" :key="item.id" :data="item" :status="data.status" :userDict="userDict"/>
    </div>
  </div>

</template>

<script lang="ts" setup>
import type {Ref} from 'vue'
import {ref, onMounted} from 'vue'
import Item from './item.vue'
import Sortable, {CustomEvent} from 'sortablejs'

import {ChangeTodoSort, ChangeTodoStatus} from "@/api/manage/todo";
import {Plus} from "@icon-park/vue-next";
import {bus, busEvent} from "@/utils/bus-events";

const props = defineProps({
  data: {
    type: Object,
    default: () => {
      return {
        name: '',
        status: '',
        children: []
      }
    }
  },
  userDict: {
    type: Object,
    default: {}
  }
})

const dom: Ref<HTMLDivElement> = ref(null) as any

onMounted(() => {
  dom.value.dataList = props.data
  new Sortable(dom.value, {
    group: 'shared',
    animation: 150,
    ghostClass: 'blue-background-class',
    onEnd: function (evt: CustomEvent) {
      const pullMode = evt.pullMode
      const oldIndex = evt.oldIndex
      const newIndex = evt.newIndex

      let oldList = evt.target.dataList.children
      let newList = evt.to.dataList.children

      if (pullMode) { // 移动至toList并去除旧数据
        const item = oldList[oldIndex]
        const status = evt.to.dataList.status
        ChangeTodoStatus({id: item.id, status: status}).then(response => {
          if (response) {
            newList.splice(newIndex, 0, item)
            oldList.splice(oldIndex, 1)
            bus.emit(busEvent.drawerIsCommit, {eventType: 'get-todo-list'});
          }
        })
      } else { // 同List位置修改

        // 前端移动
        const tem = oldList[oldIndex]
        oldList[oldIndex] = oldList[newIndex]
        oldList[newIndex] = tem

        // 后端重新排序
        let idList = []
        oldList.forEach(item => {
          idList.push(item.id)
        })
        ChangeTodoSort({id_list: idList}).then(response => {})
      }
    }
  })
})

const addTodo = () => {
  bus.emit(busEvent.drawerIsShow, {eventType: 'add-todo'});
}

</script>

<style lang="scss" scoped>
.block {
  width: calc(100% / 4.3);
  height: calc(100% - 10px);
  background: #efefef;
  border: 1px solid #e3e3e3;
  border-radius: 4px;
  display: inline-flex;
  flex-direction: column;

  .header {
    display: flex;
    align-items: center;
    height: 50px;
    padding-left: 15px;

    .num {
      display: inline-block;
      margin-right: 4px;
      // padding: 2px 0px;
      color: #fff;
      font-size: 12px;
      min-width: 20px;
      line-height: 20px;
      font-weight: 400;
      text-align: center;
      background-color: #999;
      border-radius: 50%;
    }

    div {
      color: #000;
      margin-left: 5px;
    }
    .todo {
      color: #FF9900;
    }

    .doing {
      color: #409eff;
    }

    .testing {
      color: #58D68D;
    }

    .done {
      color: #000;
    }
  }

  .dataList {
    // width: 100%;
    padding: 0 0 0 10px;
    overflow-y: auto;
    flex: 1;
    height: auto;
    width: calc(100% - 10px);
  }
}
</style>
