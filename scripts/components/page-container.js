Vue.component('page-container', { 
    mixins: [sessionMixin],
    template:`
    <div class="p-std">
        <template v-if="!syncing">
            <slot></slot>
        </template>
        <a v-if="syncing" class="button is-loading is-large is-fullwidth is-link is-outlined" style="border:0">Loading</a>
    </div>
    `
 });