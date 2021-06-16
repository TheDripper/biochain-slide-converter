import live from "~/live.json";
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
  }
};
export const actions = {
  async getSlides({ commit, store }) {
    let { data } = await this.$axios("/server-middleware/slides");
    let uploads = data.data.Contents;
    commit("uploads", uploads);
    let written = await this.$axios.post("/server-middleware/download", {
      uploads
    });
    console.log("axios post");
    console.log(written);
    return;
  },
  async uploadCheck({ commit }) {
    let { data } = await this.$axios("/server-middleware/getJSON");
    console.log("uploads done! store");
  },
  async convert({ commit, store }) {
    let slides = this.state.uploads;
    let { data } = await this.$axios.post("/server-middleware/convert", {
      slides
    });
    commit("converted", data);
  },
  async fileCheck({ commit }) {},
  async nuxtServerInit({ commit }) {
    //this.converter();
    let date = live.pop();
    commit("date", date);
    commit("slides", live);
  }
};
