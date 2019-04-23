Vue.component('article-line', { 
    template:`
    <div class="columns is-mobile is-vcentered hover" @click="$emit('click');">
        {{article}}
    </div>
    `,
    props: {
        article: { type: Object }
    }
 });