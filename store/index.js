import live from "~/live.json";
import errors from "~/errors.json";


export const state = () => ({
  slides: [],
  errors: [],
  date: ''
});

export const mutations = {
  date(state, date) {
    state.date = date;
  },
  slides(state, slides) {
    state.slides = slides;
  },
  errors(state, errors) {
    state.errors = errors;
  }
};
export const actions = {
  // async getPage(context, id) {
  //   const slides = await this.$axios.$get('/wp-json/wp/v2/product');
  //   commit('slides',slides);
  // },
  async fileCheck({ commit }) {},
  async nuxtServerInit({ commit }) {
    let date = live.pop();
    commit("date", date);
    commit("slides", live);
    commit("errors", errors);
  }
};
