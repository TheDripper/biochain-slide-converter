<template>
  <div id="root">
    <p v-for="slide in slides">{{ slide.Name }}</p>
  </div>
</template>
<script>
var AWS = require("aws-sdk");
const s3 = new AWS.S3({
  accessKeyId: "AKIA4EV32R5KYPYOXCXF",
  secretAccessKey: "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",
});
export default {
  async asyncData() {
    const params = {
      Bucket: "biochain",
      Key: "converted/ASDF-1234.dzi",
    };
    const fileCheck = await s3.getObject(params).promise();
    console.log(fileCheck);
    return {
        fileCheck
    }
  },
  computed: {
    slides() {
      return this.$store.state.slides;
    },
  },
};
</script>
