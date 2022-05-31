// 截取字符串指定的长度
export function ellipsis(data, len) {
  if (!data) return ''
  if (data.length > len) {
    return data.slice(0, len) + '...'
  }
  return data
}

// 根据id从list中获取数据
export function getDataDictById(dataDict, dataId) {
  return dataDict[dataId]
}

// 根据id从list中获取数据
export function getDataFormListById(data, data_id) {
  for (let index in data) {
    if (data[index].id === data_id) {
      return data[index]
    }
  }
}

// 根据name从list中获取数据
export function getDataFormListByName(data, data_name) {
  for (let index in data) {
    if (data[index].name === data_name) {
      return data[index]
    }
  }
}

// 递归把列表转为树行结构
export function arrayToTree(arr, parentId) {
  //  arr 是返回的数据  parendId 父id
  let temp = [];
  let treeArr = arr;
  treeArr.forEach((item, index) => {
    if (item.parent === parentId) {
      if (arrayToTree(treeArr, treeArr[index].id).length > 0) {
        // 递归调用此函数
        treeArr[index].children = arrayToTree(treeArr, treeArr[index].id);
      }
      temp.push(treeArr[index]);
    }
  });
  return temp;
}
