const LogoutPage = {
    template: `
    <div class="p-std">
    </div>
    `,
    data() {
        return {
            dbUrl: "",
            email: ""
        };
    },
    created() {
        var app = this;
        DbConfig.logout();
        app.$parent.groupTitle = "";
        router.push({path: "/login"});
    }
}