<template>
  <div id="root">
    <table id="errors" class="w-full p-8">
      <thead>
        <tr>
          <th>Slide</th>
          <th>Upload Error</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="error in errors">
          <td>{{ error.slide }}</td>
          <td>{{ error.result }}</td>
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

export default {
  methods: {
    ...mapActions(["fileCheck"]),
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
  computed: {
    slides() {
      return this.$store.state.slides
    },
    errors() {
      return this.$store.state.errors
    },
    date() {
      return this.$store.state.date
    }
  },
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