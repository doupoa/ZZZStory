import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "ZZZStory",
  description: "绝区零故事汇",
  lang: "zh-Hans",
  cleanUrls: true,
  srcExclude: ["**/README.md", "**/TODO.md"],
  metaChunk: true,
  appearance: "dark",

  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/logo.svg" }],
    // ['link', { rel: 'icon', type: 'image/png', href: '/vitepress-logo-mini.png' }],
    ["meta", { name: "theme-color", content: "#5f67ee" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:locale", content: "zh-Hans" }],
    [
      "meta",
      {
        property: "og:title",
        content: "ZZZStory | 绝区零故事汇",
      },
    ],
    ["meta", { property: "og:site_name", content: "ZZZStory" }],
    // [
    //   "meta",
    //   {
    //     property: "og:image",
    //     content: "https://vitepress.dev/vitepress-og.jpg",
    //   },
    // ],
    // ["meta", { property: "og:url", content: "https://vitepress.dev/" }],
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "/logo.png",
    nav: [
      { text: "主页", link: "/" },
      { text: "关于", link: "/markdown-examples" },
    ],
    footer: {
      message:
        "本站所有内容（除 <a href='https://www.mihoyo.com/'>miHoYo</a> 拥有的及另外声明的）均以遵循<a href='https://creativecommons.org/licenses/by-nc-sa/4.0/'> CC BY-NC-SA 4.0 </a>协议授权",
      copyright: "Copyright © 2024 CP77 Text Database",
    },
    docFooter: {
      prev: "上一页",
      next: "下一页",
    },
    outline: {
      label: "页面导航",
    },
    editLink: {
      pattern:
        "https://github.com/doupoa/ZZZStory/edit/main/docs/:path",
      text: "在 GitHub 上编辑此页",
    },
    lastUpdated: {
      text: "最后更新于",
      formatOptions: {
        dateStyle: "short",
        timeStyle: "medium",
      },
    },

    search: {
      provider: "local",
      placeholder: "搜索文档",
      translations: {
        button: {
          buttonText: "搜索文档",
          buttonAriaLabel: "搜索文档",
        },
        modal: {
          searchBox: {
            resetButtonTitle: "清除查询条件",
            resetButtonAriaLabel: "清除查询条件",
            cancelButtonText: "取消",
            cancelButtonAriaLabel: "取消",
          },
          startScreen: {
            recentSearchesTitle: "搜索历史",
            noRecentSearchesText: "没有搜索历史",
            saveRecentSearchButtonTitle: "保存至搜索历史",
            removeRecentSearchButtonTitle: "从搜索历史中移除",
            favoriteSearchesTitle: "收藏",
            removeFavoriteSearchButtonTitle: "从收藏中移除",
          },
          errorScreen: {
            titleText: "无法获取结果",
            helpText: "你可能需要检查你的网络连接",
          },
          footer: {
            selectText: "选择",
            navigateText: "切换",
            closeText: "关闭",
            searchByText: "搜索提供者",
          },
          noResultsScreen: {
            noResultsText: "无法找到相关结果",
            suggestedQueryText: "你可以尝试查询",
            reportMissingResultsText: "你认为该查询应该有结果？",
            reportMissingResultsLinkText: "点击反馈",
          },
        },
      },
    },
    returnToTopLabel: "回到顶部",
    sidebarMenuLabel: "菜单",
    darkModeSwitchLabel: "主题",
    lightModeSwitchTitle: "切换到浅色模式",
    darkModeSwitchTitle: "切换到深色模式",

    sidebar: [
      {
        text: "Examples",
        items: [
          { text: "Markdown Examples", link: "/markdown-examples" },
          { text: "Runtime API Examples", link: "/api-examples" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/doupoa/ZZZStory" },
    ],
  },
});
