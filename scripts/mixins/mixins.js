var mandatoryMixin = {
    methods: {
        hasValue(obj,property) {
            var app = this;
            return (obj && obj[property] && obj[property].length > 0);
        },
        getInputClass(obj,property) {
            return {
                "input": true,
                "is-danger": !this.hasValue(obj,property)
            };
        },
    }
}

var sessionMixin = {
    data() {
        return {
            syncing: false
        }
    },
    created() {
        var app = this;
        
        if(!DbConfig.isLoggedIn()) {
            app.$parent.isLoggedIn = false;
            try { app.$parent.$parent.isLoggedIn = false; } catch(e) {}
            router.push({path: "/login"});
        }
        else {
            app.$parent.isLoggedIn = true;
            app.$parent.groupTitle = DbConfig.getGroupInfo().title;

            try {
                app.$parent.$parent.isLoggedIn = true;
                app.$parent.$parent.groupTitle = DbConfig.getGroupInfo().title;
            }
            catch(e) {}

            //init db
            app.syncing = true;
            DbConfig.initDb().then(()=> {
                app.syncing = false;

            });
        }
    }
}

var utilMixins = {
    methods: {
        format(n, c = 2, d = ",", t = ".") { 
            var c = isNaN(c = Math.abs(c)) ? 2 : c,
            d = d == undefined ? "." : d,
            t = t == undefined ? "," : t,
            s = n < 0 ? "-" : "",
            i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
            j = (j = i.length) > 3 ? j % 3 : 0;

            return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
        }
    }
}