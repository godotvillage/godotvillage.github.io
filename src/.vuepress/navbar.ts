import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/",
  {
    text: "教程",
    prefix: "/tutorial/",
    icon: "book",
    children: [
      {
        text: "教程列表",
        icon: "list",
        link: "index",
      },
      {
        text: "落叶轻羽B站教程",
        icon: "video",
        link: "luoye",
      },
      {
        text: "其他B站UP主视频列表",
        icon: "video",
        link: "otherbilibili",
      },
      {
        text: "收集的资源网站",
        icon: "compass",
        link: "assetweb",
      }
    ]
  },
  {
    text: "论坛",
    icon: "comment",
    link: "/discussion/list",
  },
  // {
  //   text: "游戏",
  //   icon: "gamepad",
  //   prefix: "/game/",
  //   children: [
  //     {
  //       text: "在线游戏说明",
  //       icon: "pen-to-square",
  //       link: "index",
  //     },
  //     {
  //       text: "游戏列表",
  //       icon: "list",
  //       link: "list",
  //     },
  //     {
  //       text: "游戏上传",
  //       icon: "upload",
  //       link: "upload",
  //     }
  //   ]
  // },
  "/farm/",
  {
    text: "项目跟踪",
    icon: "list",
    link: "/projects/",
  },
  {
    text: "GameJam",
    icon: "gamepad",
    link: "/gamejam/",
  },
  "/tools/index",
  {
    text: "Alpha Agent",
    icon: "robot",
    link: "/alpha/",
  }
  // {
  //   text: "博文",
  //   icon: "pen-to-square",
  //   prefix: "/posts/",
  //   children: [
  //     {
  //       text: "苹果",
  //       icon: "pen-to-square",
  //       prefix: "apple/",
  //       children: [
  //         { text: "苹果1", icon: "pen-to-square", link: "1" },
  //         { text: "苹果2", icon: "pen-to-square", link: "2" },
  //         "3",
  //         "4",
  //       ],
  //     },
  //     {
  //       text: "香蕉",
  //       icon: "pen-to-square",
  //       prefix: "banana/",
  //       children: [
  //         {
  //           text: "香蕉 1",
  //           icon: "pen-to-square",
  //           link: "1",
  //         },
  //         {
  //           text: "香蕉 2",
  //           icon: "pen-to-square",
  //           link: "2",
  //         },
  //         "3",
  //         "4",
  //       ],
  //     },
  //     { text: "樱桃", icon: "pen-to-square", link: "cherry" },
  //     { text: "火龙果", icon: "pen-to-square", link: "dragonfruit" },
  //     "tomato",
  //     "strawberry",
  //   ],
  // },
  // {
  //   text: "V2 文档",
  //   icon: "book",
  //   link: "https://theme-hope.vuejs.press/zh/",
  // },
]);
