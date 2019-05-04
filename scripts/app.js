//start service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('../service-worker.js')
        .then(function() { console.log('Service Worker Registered'); });
}

//define routes
const router = new VueRouter({
    routes:  [
        { path: '/articles', component: ArticlesPage, meta: { title:"Artikel" } },
        { path: '/persons', component: PersonsPage, meta: { title: "Personen" } },
        { path: '/sales', component: SalesPage, meta: { title: "Verkauf" } },
        { path: '/logout', component: LogoutPage, meta: { title: "Logout" } },
        { path: '/login', component: LoginPage, meta: { title: "Login" } },
        { path: '/', component: LoginPage, meta: { title: "Login" } },

        { path: '/sale/:id', component: SalePage, meta: { title: "Verkauf" } },
        { path: '/person/:id', component: PersonPage, meta: { title: "Person" } },
        { path: '/article/:id', component: ArticlePage, meta: { title:"Artikel" } },
        { path: '/pay/:id', component: PayPage, meta: { title:"Bezahlen" } }
    ]
});

const COLOR_PRIMARY = "#1976d2";

//initialize vue app
new Vue({
    el: "#app",
    router: router,
    data() {
        return {
            groupTitle: ""
        };
    },
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
