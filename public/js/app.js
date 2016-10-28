//event management
Backbone.pubSub = _.extend({}, Backbone.Events);

//recurrsive function on .toJSON()
Backbone.Model.prototype.toJSON = function() {
    return JSON.parse(JSON.stringify(this.attributes));
}



//Overwrite Backbone.sync() to force token to be passed in each request
var _sync = Backbone.sync;
Backbone.sync = function(method, model, options) {

    if( model && (method === 'create' || method === 'update' || method === 'patch') ) {
        options.contentType = 'application/json';
        options.data = JSON.stringify(options.attrs || model.toJSON());
    }

    var authToken = Lockr.get('authToken');
    
    if(authToken !== undefined && authToken !== null)
    {
        options.headers = {
            "x-auth-token" : authToken
        };
    }
    
    return _sync.call( this, method, model, options );
}

window.Router = Backbone.Router.extend({
	routes: {
		"": "login",
        "home": "home",
		"login": "login",
        "logout": "logout"
	},

    //This function checks the authToken and renders our nav and search views if logged in
	initialize: function () {

        this.headerView = new HeaderView()
        this.headerView.render();

        $('#header').html(this.headerView.el); 
        
        // //this is triggered everytime we nagivate somewhere
        // this.on('route', function(routeEvent) {
        //     var authToken = Lockr.get('authToken');
            
        //     if(authToken === undefined || authToken === null)
        //     {
        //         Backbone.pubSub.trigger('logout');
        //         this.navigate('login', {trigger: true});
        //     }
            
        // });
        
	},
        
    login: function() {
        
        this.loginView = new LoginView();
        
        this.loginView.render();
        
        $("#content").html(this.loginView.el);
        
    },

	home: function () {
        
        // Since the home view never changes, we instantiate it and render it only once
        if (!this.homeView) {
            this.homeView = new HomeView();
            this.homeView.render();
        } else {
            this.homeView.delegateEvents(); // delegate events when the view is recycled
        }
        $("#content").html(this.homeView.el);
	}
});

templateLoader.load([
    "HomeView", 
    "LoginView",
    "HeaderView"],

	function () {
		app = new Router();
		Backbone.history.start();

	});