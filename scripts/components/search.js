Vue.component('search', { 
    mixins: [utilMixins],
    template:`
    <div class="columns is-mobile is-vcentered hover">
        <input type="text" @changed="changed" v-model="value"/>
    </div>
    `,
    props: {
        value: { type:String }
    },
    methods: {
        changed() {
            var app = this;
            alert("test:"+app.value);
            app.$emit("input", app.value);
        }
    }
 });