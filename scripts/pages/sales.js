const SalesPage = {
    mixins: [sessionMixin,utilMixins],
    template: `
    <page-container :syncing="syncing">
        <div class="above_actions">
            <div class="px-std columns is-mobile is-vcentered">
                <div class="column is-full is-centered" style="text-align:center">
                    <button class="button is-link is-rounded is-outlined" @click="chooseDay">{{dayText}}</button>
                </div>
            </div>
            <template v-for="entry in sales">
                <div class="px-std columns is-mobile is-vcentered" v-if="entry.isFirstUnpayed">
                    <div class="column">
                        <p class="title is-5 warning-text">Offen</p>
                    </div>
                    <div class="column is-narrow title">
                        <p class="title is-5 warning-text">{{format(sumUnpayed)}}</p>
                    </div>
                </div>
                <div class="px-std columns is-mobile is-vcentered" v-if="entry.isFirstPayed">
                    <div class="column">
                        <p class="title is-5 has-text-success">Bezahlt</p>
                    </div>
                    <div class="column is-narrow title">
                        <p class="title is-5 has-text-success">{{format(sumPayed)}}</p>
                    </div>
                </div>
                <sale-line  :sale="entry" v-on:click="open(entry)" :key="entry._id"/>
            </template>

            <div v-if="sales.length === 0" class="px-std columns is-mobile is-vcentered">
                <div class="column is-full is-centered" style="text-align:center">
                    <div class="title is-4">&nbsp;</div>
                    <div class="title is-4">&nbsp;</div>
                    <div class="title is-4">
                        Es gibt noch keine Verkäufe
                    </div>
                    <div>
                        <button class="button is-link is-large" @click="open">Jetzt neuen Verkauf anlegen</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="actions" v-show="isToday && sales.length > 0">
            <div class="field is-grouped">
                <div class="control">
                    <button-primary @click="open">Neuer Verkauf</button-primary>
                </div>
            </div>
        </div>
        <modal-day-chooser ref="dayChooser" @syncStart="syncing=true" @syncStop="syncing=false" />
    </page-container>
    `,
    data() {
        return {
            day: moment().format("DD.MM.YYYY"),
            sales: [],
            isMainPage: true
        };
    },
    computed: {
        isToday() {
            return this.day === moment().format("DD.MM.YYYY");
        },
        dayText() {
            return moment(this.day,"DD.MM.YYYY").format("dddd, DD.MM.YYYY");
        },
        sumUnpayed() {
            var app = this;
            var sum = 0;
            app.sales.filter(s => !s.isPayed).forEach(s => sum += s.articleSum);
            return sum;
        },
        sumPayed() {
            var app = this;
            var sum = 0;
            app.sales.filter(s => s.isPayed).forEach(s => sum += s.articleSum);
            return sum;
        }
    },
    methods: {
        initDone() {
            var app = this;
            app.load();
        },
        load() {
            var app = this;
            app.syncing=true;            
            Sale.getListFiltered({ day: app.day }).then(sales => {
                app.sales = sales;      
                app.syncing=false;
            });
        },
        open(entry) {
            router.push({ path: 'sale/'+ (entry && entry._id ? entry._id : '_') });
        },
        chooseDay() {
            var app = this;
            app.$refs.dayChooser.open().then(day => {
                app.day = day;
                app.load();
            }); 
        }
    }
}