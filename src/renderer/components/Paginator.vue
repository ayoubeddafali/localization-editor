<template>
  <div class="card text-center m-3">
    <h3 class="card-header">Vue.js Pagination Tutorial & Example</h3>
    <div class="card-body">
      <el-table :data="pageOfItems" style="width: 100%">
        <el-table-column label="property" min-width="180">
          <editable-cell slot-scope="{row}" v-model="row.property">
            <span slot="content">{{row.property}}</span>
          </editable-cell>
        </el-table-column>
        <el-table-column label="base_fr" min-width="180">
          <editable-cell slot-scope="{row}" v-model="row.base_fr">
            <span slot="content">{{row.base_fr}}</span>
          </editable-cell>
        </el-table-column>
      </el-table>
    </div>
    <div class="card-footer pb-0 pt-3">
      <jw-pagination :items="exampleItems" @changePage="onChangePage"></jw-pagination>
    </div>
  </div>
</template>

<script>
// an example array of items to be paged
import EditableCell from "./EditableCell.vue";

export default {
  components: {
    EditableCell
  },
  data() {
    return {
      exampleItems: [
        {
          property: "key",
          base_fr: "value"
        },
        {
          property: "key1",
          base_fr: "value1"
        },
        {
          property: "key2",
          base_fr: "value2"
        },
        {
          property: "key2",
          base_fr: "value2"
        },
        {
          property: "key2",
          base_fr: "value2"
        },
        {
          property: "key2",
          base_fr: "value2"
        },
        {
          property: "key2",
          base_fr: "value2"
        },
        {
          property: "key2",
          base_fr: "value2"
        },
        {
          property: "key2",
          base_fr: "value2"
        },
        {
          property: "key2",
          base_fr: "value2"
        },
        {
          property: "key2",
          base_fr: "value2"
        },
        {
          property: "key2",
          base_fr: "value2"
        },
        {
          property: "key2",
          base_fr: "value2"
        },
        {
          property: "key2",
          base_fr: "value2"
        },
        {
          property: "key2",
          base_fr: "value0"
        }
      ],
      pageOfItems: []
    };
  },
  methods: {
    onChangePage(pageOfItems) {
      // update page of items
      this.pageOfItems = pageOfItems;
    }
  }
};
</script>

<style >
a {
  cursor: pointer;
}

.pagination {
  justify-content: center;
  flex-wrap: wrap;
}
</style>