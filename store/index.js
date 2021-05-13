import live from "~/live.json"
const csv = require("csvtojson");

export const state = () => ({
  slides: []
});

export const mutations = {
  slides(state, slides) {
    state.slides = slides;
  }
};
export const actions = {
  // async getPage(context, id) {
  //   const slides = await this.$axios.$get('/wp-json/wp/v2/product');
  //   commit('slides',slides);
  // },
  async nuxtServerInit({commit}) {
      commit('slides',live);
  }
};
