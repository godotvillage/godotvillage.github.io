import{_ as l}from"./plugin-vue_export-helper-DlAUqK2U.js";import{c as n,o as a,a as s,f as u,F as h,h as _,t as r}from"./app-DQop-ceN.js";const m={data(){return{discussions:[],loading:!0}},async mounted(){await this.fetchDiscussions()},methods:{async fetchDiscussions(){const o=`
        query {
          repository(owner: "godotvillage", name: "godotvillage.github.io") {
            discussions(first: 20, categoryId: "DIC_kwDOP-_yic4CwbD6", orderBy: {field: CREATED_AT, direction: DESC}) {
              nodes {
                id
                number
                title
                body
                createdAt
                author {
                  login
                  avatarUrl
                }
                comments(first: 1) {
                  totalCount
                }
                category {
                  name
                }
              }
            }
          }
        }
      `;try{const c=await(await fetch("https://api.github.com/graphql",{method:"POST",headers:{Authorization:"Bearer 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","Content-Type":"application/json"},body:JSON.stringify({query:o})})).json();this.discussions=c.data.repository.discussions.nodes}catch(e){console.error("获取讨论列表失败:",e)}finally{this.loading=!1}},navigateToDiscussion(o){this.$router.push(`/discussion/index.html?number=${o}`)},createNewDiscussion(){window.open("https://github.com/godotvillage/godotvillage.github.io/discussions/new?category=general","_blank")},formatDate(o){return new Date(o).toLocaleDateString("zh-CN")}}},g={class:"discussions-list"},p={class:"forum-header"},f={class:"discussions-container"},y={key:0,class:"loading"},D=["onClick"],v={class:"discussion-title"},b={class:"discussion-meta"},w={class:"author"},C={class:"date"},k={class:"comments"};function N(o,e,c,T,d,i){return a(),n("div",g,[s("div",p,[e[1]||(e[1]=s("h2",null,"列表",-1)),s("button",{onClick:e[0]||(e[0]=(...t)=>i.createNewDiscussion&&i.createNewDiscussion(...t)),class:"new-post-btn"},"新建帖子")]),s("div",f,[d.loading?(a(),n("div",y,"加载中...")):u("v-if",!0),(a(!0),n(h,null,_(d.discussions,t=>(a(),n("div",{key:t.id,class:"discussion-item",onClick:A=>i.navigateToDiscussion(t.number)},[s("div",v,r(t.title),1),s("div",b,[s("span",w,"作者: "+r(t.author.login),1),s("span",C,r(i.formatDate(t.createdAt)),1),s("span",k,"评论: "+r(t.comments.totalCount),1)])],8,D))),128))])])}const j=l(m,[["render",N],["__scopeId","data-v-fb8637a0"]]);export{j as default};
