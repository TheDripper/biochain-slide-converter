<template>
  <div id="root" class="p-4">
    <ul id="top" class="flex text-xl w-full justify-between">
      <li><a href="#errors">Errors</a></li>
      <li><a href="#queued">Convert</a></li>
      <li><a href="#converted">Upload</a></li>
    </ul>
    <div id="backtotop" class="sticky top-0 left-0"><a href="#top">Back to top</a></div>
    <table v-if="slides.length" id="slides" class="w-full p-8">
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
          <td v-if="check.error">Error</td>
          <td v-else>Success</td>
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
    <h2 class="text-2xl mt-12">Failed Uploads: {{ errors.length }}</h2>
    <table id="errors" class="w-full p-8" v-if="errors.length">
      <thead>
        <tr>
          <th>Slide</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="error in errors">
          <td>{{ error.slide }}</td>
        </tr>
      </tbody>
    </table>
    <h2 id="queued" class="text-2xl mt-12">
      Uploaded .svs to Convert: {{ queued.length }}
    </h2>
    <button @click="callGetSlides($event)">Convert .svs to .dzi</button>
    <table class="w-full p-8" v-if="queued.length">
      <thead>
        <tr>
          <th>Slide</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="queue in queued">
          <td>{{ queue.Key }}</td>
        </tr>
      </tbody>
    </table>
    <h2 class="text-2xl mt-12" id="converted">Converted Slides: Ready to Upload: {{ converted.length }}</h2>
    <button @click="uploadSlides">Upload .dzi files to Biochain</button>
    <table class="w-full p-8" v-if="converted.length">
      <thead>
        <tr>
          <th>Slide</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="convert in converted">
          <td>{{ convert.filename }}</td>
          <td>{{ convert.updatedAt }}</td>
        </tr>
      </tbody>
    </table>
    <h2 class="text-2xl mt-12">Uploaded Slides</h2>
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
    let converted = await context.$content("converted").fetch();
    if (logs.length) {
      for (let log of logs) {
        log.name = path.basename(log.key);
      }
    }
    return {
      logs,
      converted,
    };
  },
  methods: {
    callUploads() {
      this.status = "uploading";
    },
    callGetSlides(e) {
      e.target.classList.add('disabled');
      e.target.textContent = "Converting...";
      this.getSlides();
      console.log(e.target);
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
    audit() {
      return this.$store.state.audit;
    },
    queued() {
      let slides = [];
      for (let slide of this.$store.state.queued.data.Contents) {
        slide.status = "ready";
        slides.push(slide);
      }
      return slides;
    },
    files() {
      return this.$refs.files.files;
    },
    slides() {
      return this.$store.state.slides;
    },
    errors() {
      return this.$store.state.errors;
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
<style lang="scss">
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
table {
  border: 1px solid black;
}
.disabled {
  pointer-events: none;
  opacity: 0.5;
}
</style>