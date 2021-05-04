// import slides from "~/static/slide-list.csv"
const csv = require("csvtojson");

export const state = () => ({
  slides: {}
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
    const slides = await csv().fromFile('./static/slides.csv');
    console.log(process.env.NODE_ENV);
      commit('slides',slides);
  }
};
