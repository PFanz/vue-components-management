import Vue from "vue";
import Router from "vue-router";
import Navigation from "./Navigation";
import components from "./components";

Vue.use(Router);

let routes = components.map(component => ({
  path: `/${component.name}`,
  component: () => import(`../examples/${component.name}`)
}));

routes.unshift(
  {
    path: "/index.html",
    redirect: "/"
  },
  {
    path: "/",
    component: Navigation
  },
  {
    // 会匹配所有路径
    path: "*",
    redirect: "/"
  }
);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});
