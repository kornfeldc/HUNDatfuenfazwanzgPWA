Vue.component('article-line', { 
    mixins: [utilMixins],
    template:`
    <div class="columns is-mobile is-vcentered hover" @click="$emit('click');">
        <div class="column is-narrow">
            <i :class="'fa fa-heart f200 ' + ( article.isFavorite ? 'red-text' : 'has-text-grey-lighter' )"/>
        </div>
        <div class="column">
            <h4 class="title is-4">{{article.title}}</h4>
        </div>
        <div class="column is-narrow">
            <div>{{vutil.format(article.price)}}</div>
        </div>
    </div>
    `,
    props: {
        article: { type: Object }
    }
 });