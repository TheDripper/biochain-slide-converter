import live from "~/live.json";
import logs from "~/imports.json";
// import errors from "~/errors.json";
// import audit from "~/audit.json";

export const state = () => ({
  slides: [],
  uploads: [],
  converted: [],
  date: ""
});

export const mutations = {
  date(state, date) {
    state.date = date;
  },
  slides(state, slides) {
    state.slides = slides;
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
  logs(state, audit) {
    state.logs = logs;
  }
};
export const actions = {
  async getSlides({ commit, store }) {
    let { data } = await this.$axios("/server-middleware/slides");
    let uploads = data.data.Contents;
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
    commit("date", date);
    commit("slides", live);
    commit("logs",logs);
  }
};
