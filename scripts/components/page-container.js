Vue.component('page-container', { 
    template:`
    <div class="p-std">
        <div v-show="!syncing">
            <slot></slot>
        </div>
        <a v-if="syncing" class="button is-loading is-large is-fullwidth is-link is-outlined" style="border:0">Loading</a>
    </div>
    `,
    props: {
        syncing: { type: Boolean, default: false }
    }
 });