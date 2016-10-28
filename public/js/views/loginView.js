'use strict';
window.LoginView = Backbone.View.extend({

    initialize:function () {
        console.log('Initializing Login View');
        //Backbone.pubSub.on('login', this.render, this); 
        Backbone.pubSub.on('logout', this.render, this); 
    },

    events:{
        "click .btn-login": "login"
    },

    render:function () {
        console.log('Rendering View');
        var authToken = Lockr.get('authToken');
        //console.log(authToken);
        if(authToken === undefined || authToken === null) {
            $(this.el).html(this.template());
            return this;
        };
    },
    login: function(e) {
        //===========================================================================================
        // This function wants the following credentials which are hardwired into route: /login in the
        // API file: 
        //    email: admin@associatevets.com
        //    password: pets4life
        //===========================================================================================
        
        e.preventDefault();
        var self = this;
        $.ajax({
            type: "POST",
            url: "api/login",
            data: {
                email: $("form").find('#email').val(),
                password: $("form").find('#password').val()
            },
            success: function(response) {
                if(response.success === true || response.error === false){
                    Lockr.set('authToken', response.authToken);
                    Backbone.pubSub.trigger('login');
                    location = "#home";
                }else{
                    alert('There was an error logging you in. Please check your credentials and try again.')
                }
            },
            error: function(response){
                console.log(response)
                 $('.messages').empty();
                _.each(response.responseJSON.message, function(message){
                    $('.messages').append('<div class="alert alert-danger text-center">' + message + '</div>');
                })
            },
            dataType: 'json'
        });
    }
});