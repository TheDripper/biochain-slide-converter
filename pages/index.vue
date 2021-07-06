<template>
  <div id="root" class="p-4">
    <h2 class="text-2xl mt-12">Convert</h2>
    <button @click="this.getSlides">Convert .svs to .dzi</button>
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
          <td>{{ log.name }}</td>
          <td v-if="log.data.err" class="text-red">
            Error: {{ log.data.err }}
          </td>
          <td class="text-green" v-else>Success: {{ log.data.Location }}</td>
          <td>{{ log.date }}</td>
        </tr>
      </tbody>
    </table>
    <h2 class="text-2xl mt-24">Upload to Biochain</h2>
    <button @click="uploadSlides">Upload .dzi files to Biochain</button>
    <table id="uploads" class="w-full p-8">
      <thead>
        <tr>
          <th>Slide</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="upload in uploads">
          <td>{{ upload }}</td>
        </tr>
      </tbody>
    </table>
    <h2 class="text-2xl my-8">Slide Audit</h2>
    <h2 class="text-2xl my-8">{{ date.date }}</h2>
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
const path = require("path");

const s3 = new AWS.S3({
  accessKeyId: "AKIA4EV32R5KQIFS6VRG",
  secretAccessKey: "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",
});

export default {
  async asyncData(context) {
    let logs = await context.$content("imports").fetch();
    if (logs.length) {
      for (let log of logs) {
        log.name = path.basename(log.key);
      }
    }
    return {
      logs,
    };
  },
  methods: {
    callUploads() {
      this.status = "uploading";
    },
    async uploadSlides() {
      let uploadResult = await this.$axios("/server-middleware/upload");
      console.log("result!!");
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
      // files:  []
    };
  },
  // async fetch() {},
  computed: {
    files() {
      return this.$refs.files.files;
    },
    slides() {
      return this.$store.state.slides;
    },
    uploads() {
      return this.$store.state.uploads;
    },
    date() {
      return this.$store.state.date;
    },
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
button {
  font-size: 12px;
}
</style>