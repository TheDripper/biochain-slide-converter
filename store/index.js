import live from "~/live.json";
// import errors from "~/errors.json";
// import audit from "~/audit.json";


export const state = () => ({
  slides: [],
  uploads: [],
  date: ''
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
  }
};
export const actions = {
  async uploadCheck({ commit }){
      let { data } = await this.$axios("/server-middleware/getJSON");
      commit("uploads",data)
  },
  async fileCheck({ commit }) {},
  async nuxtServerInit({ commit }) {
    //this.converter();
    let date = live.pop();
    commit("date", date);
    commit("slides", live);
  }
};
