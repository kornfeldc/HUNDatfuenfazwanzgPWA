//start service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('../service-worker.js')
        .then(function() { console.log('Service Worker Registered'); });
}

//define routes
const router = new VueRouter({
    routes:  [
        { path: '/articles', component: ArticlesPage },
        { path: '/persons', component: PersonsPage },
        { path: '/sales', component: SalesPage },
        { path: '/', component: SalesPage },

        { path: '/sale/:id', component: SalePage },
        { path: '/person/:id', component: PersonPage },
        { path: '/article/:id', component: ArticlePage }
    ]
});

const COLOR_PRIMARY = "#1976d2";

//initialize vue app
new Vue({
    el: "#app",
    router: router,
    mounted() {
        var app = this;
        app.setThemeColor();
        app.initializeNavigation();
    },
    methods: {
        initializeNavigation() {
            $(".navbar-burger, .navbar-item").click(function() {
                $(".navbar-burger").toggleClass("is-active");
                $(".navbar-menu").toggleClass("is-active");
            });
        },
        setThemeColor() {
            
        }
    }
});
