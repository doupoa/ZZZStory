import DefaultTheme from "vitepress/theme";
import Layout from "./Layout.vue";
import "./custom.css";
import Dialogue from "../../components/Dialogue.vue";
import Action from "../../components/Action.vue";
import Scene from "../../components/Scene.vue";

export default {
  extends: DefaultTheme,
  Layout: Layout,
  enhanceApp({ app }) {
    app.component("Dialogue", Dialogue);
    app.component("Action", Action);
    app.component("Scene", Scene);
  },
};
