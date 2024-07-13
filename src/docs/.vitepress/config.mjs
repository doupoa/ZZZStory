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
    ["link", { rel: "icon", type: "image/png", href: "/logo.png" }],
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
    logo: "/logo.png",
    nav: [
      { text: "索引", link: "/started" },
      { text: "关于", link: "/about" },
    ],
    sidebar: {
      "/started": [
        {
          text: "主线剧情",
          items: [{ text: "开始", link: "/main-line" }],
        },
        {
          text: "绳网",
          items: [{ text: "开始", link: "/inter-knot" }],
        },
        {
          text: "资料库",
          items: [{ text: "开始", link: "/information" }],
        },
      ],
      "/main-line/": [
        {
          text: "开始",
          link: "/main-line",
        },
      ],

      "/inter-knot/": [
        {
          text: "开始",
          link: "/inter-knot",
        },
      ],
      "/information/": [
        {
          text: "开始",
          link: "/information",
        },
        {
          text: "新艾利都入住指南",
          link: "/information/New-Ailidu-Accommodation-Guide",
        },
      ],
    },
    footer: {
      message:
        "本站所有内容（除 <a href='https://www.mihoyo.com/'>miHoYo</a> 拥有的及另外声明的）均以遵循<a href='https://creativecommons.org/licenses/by-nc-sa/4.0/'> CC BY-NC-SA 4.0 </a>协议授权",
      copyright: "Copyright © 2024 ZZZStory",
    },
    docFooter: {
      prev: "上一页",
      next: "下一页",
    },
    outline: {
      label: "页面导航",
    },
    editLink: {
      pattern: "https://github.com/doupoa/ZZZStory/edit/main/docs/:path",
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
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: "搜索文档",
                buttonAriaLabel: "搜索文档",
              },
              modal: {
                noResultsText: "无法找到相关结果",
                resetButtonTitle: "清除查询条件",
                footer: {
                  selectText: "选择",
                  navigateText: "切换",
                },
              },
            },
          },
        },
      },
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/doupoa/ZZZStory" },
    ],
    returnToTopLabel: "回到顶部",
    sidebarMenuLabel: "菜单",
    darkModeSwitchLabel: "主题",
    lightModeSwitchTitle: "切换到浅色模式",
    darkModeSwitchTitle: "切换到深色模式",
  },
});
