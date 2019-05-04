Vue.component('sale-line', { 
    mixins: [utilMixins],
    template:`
    <div class="columns is-mobile is-vcentered hover" @click="$emit('click');">
        {{sale.person.nameWithGroup}}
    </div>
    `,
    props: {
        sale: { type: Object }
    }
 });