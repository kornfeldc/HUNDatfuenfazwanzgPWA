Vue.component('sale-article-line', { 
    mixins: [utilMixins],
    template:`
    <div class="columns is-mobile is-vcentered hover" @click="click">
        <div class="column is-narrow" v-if="article.isFavorite !== undefined">
            <i :class="'fa fa-heart f200 ' + ( article.isFavorite ? 'red-text' : 'has-text-grey-lighter' )"/>
        </div>
        <div class="column">
            <h4 class="title is-4">{{article.title}}</h4>
        </div>
        <div class="column is-narrow">
            <button class="button is-rounded is-success" @click="modify(1)">+</button>
        </div>
        <div class="column is-narrow" style="width:50px;text-align:center">
            {{amount}}
        </div>
        <div class="column is-narrow">
            <button class="button is-rounded is-danger" @click="modify(-1)">-</button>
        </div>
        <div class="column is-narrow" style="width:80px;text-align:right">
            <template v-if="mode!=='sale'">
                {{format(article.price)}}
            </template>
            <template v-if="mode==='sale'">
                {{format(article.price * amount)}}
            </template>
        </div>
    </div>
    `,
    props: {
        mode: { type: String, default: "sale" },
        article: { type: Object },
        sale: { type: Object }
    },
    data() {
        return {
            saleArticles: JSON.parse(JSON.stringify(this.sale.articles || []))
        }
    },
    computed: {
        amount() {
            var app = this;
            var amount = 0;
            if(app.article && app.sale) {
                var saleArticle = app.saleArticles.find(sa => sa.article._id == app.article._id);
                if(saleArticle)
                    amount = saleArticle.amount;
            }

            return amount;
        }
    },
    methods:{
        click() {},
        modify(nr) {
            var app = this;
            if(nr > 0 || app.amount > 0) {

                var saleArticle = app.saleArticles.find(sa => sa.article._id == app.article._id);
                if(!saleArticle) {
                    saleArticle = {
                        article: {
                            _id: app.article._id,
                            title: app.article.title,
                            price: app.article.price
                        },
                        amount: 0
                    };
                    app.saleArticles.push(saleArticle);
                    saleArticle = app.saleArticles.find(sa => sa.article._id == app.article._id);
                }
                    
                saleArticle.amount += nr;
                app.$emit("modify", saleArticle.article, saleArticle.amount);
            }
        }
    }
 });