import { Action, Dialogue, Scene } from "@/components/style/index.ts";
import { useData, useRoute } from "vitepress";
import giscusTalk from "vitepress-plugin-comment-with-giscus";
import DefaultTheme from "vitepress/theme-without-fonts";
import { ViewsIcon, AuthorIcon, LikesIcon } from "../../components/icons";
import Layout from "./Layout.vue";
import "./custom.css";

export default {
  extends: DefaultTheme,
  Layout: Layout,
  setup() {
    // Get frontmatter and route
    const { frontmatter } = useData();
    const route = useRoute();

    // giscus配置
    giscusTalk(
      {
        repo: "doupoa/ZZZStory", //仓库
        repoId: "R_kgDOMViHtg", //仓库ID
        category: "General", // 讨论分类
        categoryId: "DIC_kwDOMViHts4CzmiW", //讨论分类ID
        mapping: "pathname",
        inputPosition: "bottom",
        lang: "zh-CN",
      },
      {
        frontmatter,
        route,
      },
      true
    );
  },

  enhanceApp({ app }) {
    app.component("Dialogue", Dialogue);
    app.component("Action", Action);
    app.component("Scene", Scene);

    app.component("AuthorIcon", AuthorIcon);
    app.component("LikesIcon", LikesIcon);
    app.component("ViewsIcon", ViewsIcon);
  },
};
