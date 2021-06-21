<template>
  <div id="root">
    <button @click="this.getSlides">Get Slides</button>
    <button @click="this.convert">Convert</button>
    <button @click="uploadSlides">Upload</button>
    <h1 class="text-3xl">{{ status }}</h1>
    <table id="logs" class="w-full p-8" v-if="logs.length">
      <thead>
        <tr>
          <th>Slide</th>
          <th>Status</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="log in logs">
          <td>{{ log.key }}</td>
          <td v-if="log.err" class="text-red">Error: {{ log.err }}</td>
          <td class="text-green" v-else>Success: {{ log.data.Location }}</td>
          <td>{{ log.date }}</td>
        </tr>
      </tbody>
    </table>
    <table id="errors" class="w-full p-8">
      <thead>
        <tr>
          <th>Slide</th>
          <th>Upload Error</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="upload in uploads">
          <td>{{ upload }}</td>
          <td>{{ upload }}</td>
        </tr>
      </tbody>
    </table>
    <h2 class="text-xl text-center my-8">{{ date.date }}</h2>
    <table id="slides" class="w-full p-8">
      <thead>
        <tr>
          <th>Slide</th>
          <th>Status</th>
          <th>Uploaded on</th>
          <th>Slide Link</th>
          <th>Product Page</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="check in slides">
          <td>{{ check.slide }}</td>
          <td>{{ check.status }}</td>
          <td>{{ check.date }}</td>
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
import $ from "jquery";
import "datatables";
import { mapActions } from "vuex";
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: "AKIA4EV32R5KQIFS6VRG",
  secretAccessKey: "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",
});

export default {
  methods: {
    callUploads() {
      this.status = "uploading";
    },
    async uploadSlides() {
      let uploadResult = await this.$axios("/server-middleware/upload");
      console.log('result!!');
      console.log(uploadResult);
    },
    ...mapActions(["uploadCheck", "getSlides", "convert", "upload"]),
  },
  mounted() {
    if (process.browser) {
      $("#slides").dataTable({
        paging: false,
      });
      $("#errors").dataTable({
        paging: false,
      });
    }
  },
  data() {
    return {
      json: {},
      status: "Ready to upload slides",
    };
  },
  // async fetch() {},
  computed: {
    slides() {
      return this.$store.state.slides;
    },
    uploads() {
      return this.$store.state.uploads;
    },
    date() {
      return this.$store.state.date;
    },
    logs() {
      return this.$store.state.logs;
    }
  },
};
</script>
<style>
button {
  width: 100px;
  height: 50px;
  background: black;
  color: white;
  @apply rounded;
  cursor: pointer;
}
th,
td {
  @apply w-1/4 p-2 border;
}
#slides_filter {
  @apply text-xl p-4;
}
#errors_filter {
  @apply text-xl p-4;
}
#slides_filter input {
  @apply border;
}
#errors_filter input {
  @apply border;
}
a {
  color: blue;
  text-decoration: underline;
}
</style>