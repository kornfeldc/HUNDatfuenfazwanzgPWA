Vue.component('search', { 
    mixins: [utilMixins],
    template:`
    <div class="field has-addons pb-std">
        <div class="control has-icons-left" style="width:100%">
            <input class="input" type="text" @keyup="changed" v-model="value" placeholder="Suche"/>
            <span class="icon is-small is-left">
                <i class="fas fa-search"></i>
            </span>
        </div>
        <div class="control" v-if="value && value.length > 0">
            <a class="button is-outlined is-danger" @click="clear">
                <i class="fas fa-times"></i>
            </a>
        </div>
    </div>
    `,
    props: {
        value: { type: String }
    },
    methods: {
        clear() {
            var app = this;
            app.$emit("input", "");
            app.$emit("changed");
        },
        changed() {
            var app = this;
            app.$emit("input", app.value);
            app.$emit("changed");
        }
    }
 });