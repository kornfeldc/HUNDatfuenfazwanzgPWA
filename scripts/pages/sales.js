const SalesPage = {
    template: `
    <div class="p-std">
        <sale-line v-for="entry in sales" :sale="entry" v-on:click="open(entry)" :key="entry._id"/>
    </div>
    `,
    data() {
        return {
            sales: []
        };
    },
    mounted() {
        var app = this;
        this.load();
    },
    methods: {
        load() {
            var app = this;
            db.getSales().then(sales => {
                app.sales = sales;      
            });
        },
        open(entry) {
            router.push({ path: 'article/'+entry._id });
        }
    }
}