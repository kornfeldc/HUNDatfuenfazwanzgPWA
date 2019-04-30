const SalesPage = {
    template: `
    <div class="p-std">
        <div class="above_actions">
            <sale-line v-for="entry in sales" :sale="entry" v-on:click="open(entry)" :key="entry._id"/>
        </div>
        <div class="actions">
            <div class="field">
                <div class="control">
                    <button class="button is-link" @click="open">Neuer Verkauf</button>
                </div>
            </div>
        </div>
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
            router.push({ path: 'sale/'+ (entry && entry._id ? entry._id : '_') });
        }
    }
}