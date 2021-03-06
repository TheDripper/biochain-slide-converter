// import live from "~/live.json";
import live from "~/imports.json";
// import errors from "~/errors.json";
import audit from "~/full-audit.json";

export const state = () => ({
  slides: [],
  queued: [],
  uploads: [],
  converted: [],
  errors: [],
  date: "",
  audit: null
});

export const mutations = {
  date(state, date) {
    state.date = date;
  },
  slides(state, slides) {
    state.slides = slides;
  },
  queued(state, queued) {
    state.queued = queued;
  },
  uploads(state, uploads) {
    state.uploads = uploads;
  },
  converted(state, converted) {
    state.converted = converted;
  },
  audit(state, audit) {
    state.audit = audit;
  },
  errors(state, errors) {
    state.errors = errors;
  }
};
export const actions = {
  async getSlides({ commit, store }) {
    let { data } = await this.$axios("/server-middleware/slides");
    let uploads = data.data.Contents;
    console.log('uploads',uploads);
    let written = await this.$axios.post("/server-middleware/download", {
      uploads
    });
    commit("uploads", uploads);
    this.$axios.post("/server-middleware/convert", {
      slides: uploads
    });
    // this.$axios("/server-middleware/upload");
  },
  async uploadCheck({ commit }) {
    let { data } = await this.$axios("/server-middleware/getJSON");
    commit("audit", data);
  },
  async convert({ commit, store }) {
    let slides = this.state.uploads;
    this.$axios.post("/server-middleware/convert", {
      slides
    });
    commit("converted", slides);
  },
  async fileCheck({ commit }) {},
  async nuxtServerInit({ commit }) {
    //this.converter();
    let date = live.pop();
    let { data } = await this.$axios("/server-middleware/slides");
    let errors = [];
    for (let slide of live) {
      if(audit.includes(slide.slide)) {
        slide.error = false;
      } else {
        slide.error = true;
        errors.push(slide);
      }
    }
    commit("errors",errors);
    commit("queued",data);
    // let audit = await this.$axios("/server-middleware/audit");
    commit("audit",audit);
    // let converted = await $content("converted").fetch();
    // let uploads = await $content("imports").fetch();
    // commit("converted",converted);
    // commit("uploads",uploads);
    commit("date", date);
    commit("slides", live);
  }
};
