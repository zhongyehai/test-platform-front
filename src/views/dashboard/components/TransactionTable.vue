<template>
  <el-table :data="list" style="width: 100%;padding-top: 15px;">
    <el-table-column label="Order_No" min-width="200">
      <template slot-scope="scope">
        {{ scope.row.order_no | orderNoFilter }}
      </template>
    </el-table-column>
    <el-table-column label="Price" width="195" align="center">
      <template slot-scope="scope">
        ¥{{ scope.row.price }}
      </template>
    </el-table-column>
    <el-table-column label="Status" width="100" align="center">
      <template slot-scope="{row}">
        <el-tag :type="row.status | statusFilter">
          {{ row.status }}
        </el-tag>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        success: 'success',
        pending: 'danger'
      }
      return statusMap[status]
    },
    orderNoFilter(str) {
      return str.substring(0, 30)
    }
  },
  data() {
    return {
      list: null
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.list = [
        {
          "order_no": "62EE57c2-3faF-d2C3-C9Df-Adc1De4DF4bF",
          "timestamp": 1107783863806,
          "username": "Paul Jackson",
          "price": 5242,
          "status": "success"
        },
        {
          "order_no": "c7816fA9-a3D4-b8ed-7404-f56Bd8Dce154",
          "timestamp": 1107783863806,
          "username": "George Robinson",
          "price": 2855.5,
          "status": "pending"
        },
        {
          "order_no": "Be3dA3bd-D901-ed94-bdeC-84FbEDFb8B83",
          "timestamp": 1107783863806,
          "username": "Patricia Thomas",
          "price": 14078,
          "status": "pending"
        },
        {
          "order_no": "8d34e0f6-53ef-9aC3-975e-6cDbA418D388",
          "timestamp": 1107783863806,
          "username": "Frank Garcia",
          "price": 6618.3,
          "status": "pending"
        },
        {
          "order_no": "bBEF8e82-2Ec3-c7B5-85D1-1F5aff7f17aF",
          "timestamp": 1107783863806,
          "username": "Melissa Wilson",
          "price": 8469.7,
          "status": "pending"
        },
        {
          "order_no": "9cAA50fB-Bd7e-fef6-D777-515CefD9bfB6",
          "timestamp": 1107783863806,
          "username": "Jessica Harris",
          "price": 14185.4,
          "status": "pending"
        },
        {
          "order_no": "c9fa0917-F9F6-b4DA-EDE2-a29ACbcAC7bE",
          "timestamp": 1107783863806,
          "username": "Jeffrey Rodriguez",
          "price": 6487.21,
          "status": "success"
        },
        {
          "order_no": "CD4CDEA7-Db9f-22cA-6cb7-ecd667779A5d",
          "timestamp": 1107783863806,
          "username": "Richard Harris",
          "price": 8346.7,
          "status": "pending"
        }
      ]
    }
  }
}
</script>
