<template>
  <div>
    <el-tree
      :data="data"
      node-key="id"
      default-expand-all
      @node-drag-start="handleDragStart"
      @node-drag-enter="handleDragEnter"
      @node-drag-leave="handleDragLeave"
      @node-drag-over="handleDragOver"
      @node-drag-end="handleDragEnd"
      @node-drop="handleDrop"
      draggable
      :allow-drop="allowDrop"
      :allow-drag="allowDrag">
    </el-tree>

    <el-popover
      placement="top"
      width="160"
      v-model="visible">
      <p>这是一段内容这是一段内容确定删除吗？</p>
      <div style="text-align: right; margin: 0">
        <el-button size="mini" type="text" @click="visible = false">取消</el-button>
        <el-button type="primary" size="mini" @click="visible = false">确定</el-button>
      </div>
      <el-button slot="reference">删除</el-button>
    </el-popover>
  </div>

</template>
<script>
export default {
  data() {
    return {
      visible: false,

      data: [{
        id: 1,
        label: '一级 1',
        children: [{
          id: 4,
          label: '二级 1-1',
          children: [{
            id: 9,
            label: '三级 1-1-1'
          }, {
            id: 10,
            label: '三级 1-1-2'
          }]
        }]
      }, {
        id: 2,
        label: '一级 2',
        children: [{
          id: 5,
          label: '二级 2-1'
        }, {
          id: 6,
          label: '二级 2-2'
        }]
      }, {
        id: 3,
        label: '一级 3',
        children: [{
          id: 7,
          label: '二级 3-1'
        }, {
          id: 8,
          label: '二级 3-2',
          children: [{
            id: 11,
            label: '三级 3-2-1'
          }, {
            id: 12,
            label: '三级 3-2-2'
          }, {
            id: 13,
            label: '三级 3-2-3'
          }]
        }]
      }],
      defaultProps: {
        children: 'children',
        label: 'label'
      }
    };
  },
  methods: {
    // 节点开始拖拽时触发的事件
    handleDragStart(node, ev) {
      console.log('drag start', node);
    },
    // 拖拽进入其他节点时触发的事件
    handleDragEnter(draggingNode, dropNode, ev) {
      console.log('tree drag enter: ', dropNode.label);
    },
    // 拖拽离开某个节点时触发的事件
    handleDragLeave(draggingNode, dropNode, ev) {
      console.log('tree drag leave: ', dropNode.label);
    },
    // 在拖拽节点时触发的事件（类似浏览器的 mouseover 事件）
    handleDragOver(draggingNode, dropNode, ev) {
      console.log('tree drag over: ', dropNode.label);
    },
    // 拖拽结束时（可能未成功）触发的事件
    handleDragEnd(draggingNode, dropNode, dropType, ev) {
      console.log('tree drag end: ', dropNode && dropNode.label, dropType);
    },
    // 拖拽成功完成时触发的事件
    handleDrop(draggingNode, dropNode, dropType, ev) {
      console.log('拖拽成功完成.dropType: ', dropType);

      console.log('拖拽成功完成.draggingNode: ', draggingNode);

      console.log('拖拽成功完成.ev: ', ev);
    },
    // 判断节点能否被拖拽
    allowDrop(draggingNode, dropNode, type) {
      return true
      // if (dropNode.data.label === '二级 3-1') {
      //   return type !== 'inner';
      // } else {
      //   return true;
      // }
    },
    // 拖拽时判定目标节点能否被放置。type 参数有三种情况：'prev'、'inner' 和 'next'，分别表示放置在目标节点前、插入至目标节点和放置在目标节点后
    allowDrag(draggingNode) {
      return draggingNode.data.label.indexOf('三级 3-2-2') === -1;
    }
  }
};
</script>
