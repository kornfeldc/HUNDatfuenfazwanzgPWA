Vue.component('article-line', { 
    template:`
    <div class="columns is-mobile is-vcentered hover" @click="$emit('click');">
        <div class="column">
            <i :class="'fa fa-star f200 ' + ( article.isFavorite ? 'additional-text' : 'has-text-grey-lighter' )"/>
        </div>
        <div class="column is-full">
            <h4 class="title is-4">{{article.title}}</h4>
        </div>
    </div>
    `,
    props: {
        article: { type: Object }
    }
 });