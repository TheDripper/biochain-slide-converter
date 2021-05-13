<template>
  <div id="root">
    <table id="slides" class="w-full p-8">
      <thead>
        <tr>
          <th>Slide</th>
          <th>Status</th>
          <th>Slide Link</th>
          <th>Product Page</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="check in fileCheck">
          <td>{{ check.filename }}</td>
          <td>{{ check.status }}</td>
          <td>
            <a target="_blank" :href="check.url">View Slide on biochain.com</a>
          </td>
          <td>
            <a target="_blank" :href="check.product">{{ check.name }}</a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
var AWS = require("aws-sdk");
const s3 = new AWS.S3({
  accessKeyId: "AKIA4EV32R5KYPYOXCXF",
  secretAccessKey: "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",
});
import $ from "jquery";
import "datatables";
export default {
  mounted() {
    if (process.browser) {
      $("#slides").dataTable({
        paging: false,
      });
    }
  },
  async asyncData({ store }) {
    let slides = store.state.slides;
    let fileCheck = [];
    for (const slide of slides) {
      let key = "converted/" + slide.slide + ".dzi";
      let url = "http://biochain.com/slides/?id=" + slide.slide;
      let s3uri = "https://biochain.s3-us-west-1.amazonaws.com/converted/"+slide.slide+".dzi";
      let product = slide.product
      let name = slide.name
      const params = {
        Bucket: "biochain",
        Key: key,
      };
      try {
        const fileTest = await s3.getObject(params).promise();
        let testObj = {
          "aws-key": key,
          test: fileTest,
          status: "success",
          filename: slide.slide,
          url,
          s3uri,
          product,
          name
        };
        fileCheck.push(testObj);
      } catch (err) {
        const fileTest = err.toString();
        let testObj = {
          "aws-key": key,
          test: fileTest,
          status: "error",
          filename: slide.slide,
          url,
          s3uri,
          product,
          name
        };
        fileCheck.push(testObj);
      }
    }
    return {
      fileCheck,
      slides,
    };
  },
  computed: {},
};
</script>
<style>
th,
td {
  @apply w-1/4 p-2 border;
}
#slides_filter {
  @apply text-xl p-4;
}
#slides_filter input {
  @apply border;
}
a {
  color: blue;
  text-decoration: underline;
}
</style>