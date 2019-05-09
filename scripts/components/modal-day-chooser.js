Vue.component('modal-day-chooser', { 
    mixins: [utilMixins],
    template:`
    <div class="modal" ref="modal">
        <div class="modal-background"></div>
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title">Tag auswählen</p>
                <button class="delete" aria-label="close" @click="cancel"></button>
            </header>
            <section class="modal-card-body" v-if="render">
                <template v-for="day in dayList">
                    <div class="columns is-mobile is-vcentered hover" @click="selectDay(day.day);">
                        <div class="column">
                            {{day.dayText}}    
                        </div>
                        <div class="column is-narrow warning-text" style="min-width:100px;text-align:right">
                            {{format(day.topay)}}
                        </div>
                        <div class="column is-narrow has-text-success" style="min-width:100px;text-align:right">
                            {{format(day.payed)}}
                        </div>
                    </div>
                </template>
            </section>
            <footer class="modal-card-foot">
                <button class="button is-link" @click="today">Heute</button>
                <button class="button is-text" @click="cancel">Abbrechen</button>
            </footer>
        </div>
    </div>
    `,
    data() {
        return {
            resolve: null,
            reject: null,
            dayList: [],
            render: true
        };
    },
    methods: {
        open() {
            var app = this;
            app.tab = "favorites";
            
            Sale.getDayList().then(dayList => {
                app.dayList = dayList;
                $(app.$refs.modal).addClass("is-active");
            });   

            app.render=false;
            app.$nextTick(()=>app.render=true);

            return new Promise((resolve, reject) => {
                app.resolve = resolve;
                app.reject = reject;
            });
        },
        selectDay(day) {
            var app = this;
            $(app.$refs.modal).removeClass("is-active");
            app.resolve(day);
        },
        today() {
            this.selectDay(moment().format("DD.MM.YYYY"));
        },
        cancel() {
            var app = this;
            $(app.$refs.modal).removeClass("is-active");
            app.reject();
        }
    }
 });