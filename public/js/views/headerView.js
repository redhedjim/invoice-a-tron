window.HeaderView = Backbone.View.extend({
    initialize: function() {
        Backbone.pubSub.on('login', this.render, this); 
        Backbone.pubSub.on('logout', this.render, this); 
    },
    events: {
        "click #btn-login": "login",
        "click #btn-logout": "logout"
    },
    
    render: function(){
        console.log('Rendering View');
        var authToken = Lockr.get('authToken');
        if(!authToken)
        {
             $(this.el).html("");
        }
        else
        {
            $(this.el).html(this.template);
        }
        return this;
    } 
});