import live from "~/live.json"
import errors from "~/errors.json"
const csv = require("csvtojson");

export const state = () => ({
  slides: [],
  errors: []
});

export const mutations = {
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
  async nuxtServerInit({commit}) {
      commit('slides',live);
      commit('errors',errors);
  }
};
