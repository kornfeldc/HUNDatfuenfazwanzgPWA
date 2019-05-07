Vue.component('sale-person', { 
    mixins: [utilMixins],
    template:`
    <div class="box">
        <div class="media">
            <div class="media-content">
                <p class="title is-5">{{person.nameWithGroup}}</p>
            </div>
            <div class="media-right">
                {{sale.saleDayShort}}
            </div>
        </div>
        <div class="media">
            <div class="media-content">
                Guthaben <button class="ml-std button is-small is-outlined is-link" @click="addCredit">Aufladen</button>
            </div>
            <div class="media-right">
                {{format(person.credit || 0)}}
            </div>
        </div>
    </div>
    `,
    props: {
        sale: { type: Object },
        person: { type: Object }
    },
    methods:{
        addCredit() {}
    }
 });