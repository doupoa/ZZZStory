import { defineConfig } from "vitepress";
import Tailwind from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

// https://vitepress.dev/reference/site-config

export default defineConfig({
  vite: {
    plugins: [Tailwind()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("../", import.meta.url)),
      },
    },
  },
  transformHead({ assets }) {
    const fontFile = assets.find((file) =>
      /font-name\.[\w-]+\.woff/.test(file),
    );
    if (fontFile) {
      return [
        [
          "link",
          {
            rel: "preload",
            as: "font",
            type: "font/woff",
            href: fontFile,
            crossorigin: "anonymous",
          },
        ],
      ];
    }
  },

  title: "ZZZStory",
  description:
    "绝区零故事汇 | Zenless Zone Zero Story | ZZZStory旨在为剧情爱好者及资深游戏玩家提供完整的故事剧情，为非盈利公共项目。很高兴你能对该项目感兴趣，当然也非常希望您能参与项目共同补充完整的《绝区零》剧情故事。",
  lang: "zh-Hans",
  cleanUrls: true,
  srcExclude: ["**/README.md", "**/TODO.md"],
  metaChunk: true,
  appearance: "dark",
  sitemap: {
    hostname: "https://zzzstory.doupoa.site",
  },

  markdown: {
    image: {
      lazyLoading: true,
    },
    container: {
      tipLabel: "提示",
      warningLabel: "警告",
      dangerLabel: "危险",
      infoLabel: "信息",
      detailsLabel: "详细信息",
    },
  },

  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/logo.svg" }],
    ["link", { rel: "icon", type: "image/png", href: "/logo.png" }],
    ["meta", { name: "theme-color", content: "#5f67ee" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:locale", content: "zh-Hans" }],
    ["meta", { property: "og:title", content: "ZZZStory | 绝区零故事汇" }],
    ["meta", { property: "og:site_name", content: "ZZZStory" }],
    [
      "meta",
      {
        property: "og:image",
        content: "https://zzzstory.doupoa.site/zzzstory-og.jpg",
      },
    ],
    ["meta", { property: "og:url", content: "https://zzzstory.doupoa.site" }],

    [
      "script",
      {},
      `(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "n6sgjs4k0v");`,
    ], // Microsoft Clarity 自行部署时请移除
  ],

  themeConfig: {
    logo: "/logo.png",
    nav: [
      { text: "开始", link: "/started" },
      { text: "剧情", link: "/main-line/index" },
      { text: "绳网", link: "/inter-knot/index" },
      { text: "敲敲", link: "/knock-knock/index" },
      { text: "资料库", link: "/information/index" },
      { text: "[ɑ] 驱动盘评级", link: "/tools/drive-disk-rating/index" },
      {
        text: "工具", // 热门工具放外边，不常用的就收起来
        items: [
          {
            text: "剧情编辑器",
            link: "/tools/story-editor/index",
          },
          {
            text: "🚧 驱动盘评级",
            link: "/tools/drive-disk-rating/index",
          },
        ],
      },
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
          items: [
            {
              text: "公告",
              link: "/inter-knot/notice",
            },
            {
              text: "闲聊灌水",
              link: "/inter-knot/chat",
            },
            {
              text: "委托",
              link: "/inter-knot/entrust",
            },
            {
              text: "情报",
              link: "/inter-knot/intelligence",
            },
            {
              text: "求助",
              link: "/inter-knot/seek-help",
            },
            {
              text: "避雷",
              link: "/inter-knot/steering-clear-of",
            },
          ],
        },
        {
          text: "Knock Knock",
          items: [
            {
              text: "私聊",
              link: "/knock-knock/private-message",
            },
            {
              text: "群聊",
              link: "/knock-knock/group-message",
            },
          ],
        },
        {
          text: "资料库",
          items: [
            {
              text: "新艾利都入住指南",
              link: "/information/new-eridu-accommodation-guide",
            },
            {
              text: "都市快报",
              link: "/information/urban-express",
            },
            {
              text: "世界观",
              link: "/information/worldview",
            },
            {
              text: "丽都事典",
              link: "/information/new-eridu-encyclopedia",
            },
            {
              text: "工作台",
              items: [
                {
                  text: "合作者档案",
                  link: "/information/workbench/archive",
                },
                {
                  text: "法厄同图鉴",
                  link: "/information/workbench/database",
                },
                {
                  text: "空洞见闻",
                  link: "/information/workbench/hollow-codex",
                },
              ],
            },
          ],
        },
      ],
      "/main-line/": [
        {
          text: "第0章",
          items: [
            {
              text: "生意 X 诡异 X 道义",
              link: "/main-line/chapter0/Business_x_Strangeness_x_Justness",
            },
            {
              text: "委托:兔与绳",
              link: "/main-line/chapter0/Assignment_The_Rabbit_and_the_Rope",
            },
            {
              text: "委托:绳与兔",
              link: "/main-line/chapter0/Assignment_The_Rope_and_the_rabbit",
            },
          ],
        },
        {
          text: "返回索引",
          link: "/started",
        },
      ],

      "/inter-knot/": [
        {
          text: "绳网",
          items: [
            {
              text: "公告",
              link: "/inter-knot/notice",
            },
            {
              text: "闲聊灌水",
              link: "/inter-knot/chat",
            },
            {
              text: "委托",
              link: "/inter-knot/entrust",
            },
            {
              text: "情报",
              link: "/inter-knot/intelligence",
            },
            {
              text: "求助",
              link: "/inter-knot/seek-help",
            },
            {
              text: "避雷",
              link: "/inter-knot/steering-clear-of",
            },
          ],
        },
        {
          text: "返回索引",
          link: "/started",
        },
      ],
      "/information/": [
        {
          text: "新艾利都入住指南",
          link: "/information/new-eridu-accommodation-guide",
        },
        {
          text: "都市快报",
          link: "/information/urban-express",
        },
        {
          text: "世界观",
          link: "/information/worldview",
        },
        {
          text: "丽都事典",
          link: "/information/new-eridu-encyclopedia",
        },
        {
          text: "工作台",
          items: [
            {
              text: "合作者档案",
              link: "/information/workbench/archive",
            },
            {
              text: "法厄同图鉴",
              link: "/information/workbench/database",
            },
            {
              text: "空洞见闻",
              link: "/information/workbench/hollow-codex",
            },
          ],
        },
        {
          text: "返回索引",
          link: "/started",
        },
      ],
      "/knock-knock": [
        {
          text: "私聊",
          link: "/knock-knock/private-message",
        },
        {
          text: "群聊",
          link: "/knock-knock/group-message",
        },
        {
          text: "返回索引",
          link: "/started",
        },
      ],
    },
    footer: {
      message:
        "本站所有内容（除 <a href='https://www.mihoyo.com/'>miHoYo</a> 拥有的及另外声明的）均以遵循<a href='https://creativecommons.org/licenses/by-nc-sa/4.0/'> CC BY-NC-SA 4.0 </a>协议授权",
      copyright: `Copyright © ${new Date().getFullYear()} ZZZStory`,
    },
    docFooter: {
      prev: "上一页",
      next: "下一页",
    },
    outline: {
      label: "页面导航",
      level: [2, 3],
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
