window.HomeView = Backbone.View.extend({

    initialize:function (response) {
        console.log('Initializing Home View');
        this.client_id = 4663884;

       
    },

    events:{
        "click .get-entries": "fetchTimeEntries",
        "click .create-invoices": "createInvoices"
    },

    render:function () {
        console.log('Rendering Home View');
        if(this.projects){
            $(this.el).html(this.template({projects: this.projects}));
        }else{
            $(this.el).html(this.template({projects: null}));
        }
        
        return this;
    },

    fetchTimeEntries: function(){
        var self = this;
        $('.messages').addClass('hidden'); // remove any messages previosuly rendered
        var getTimeEntries = new Promise(function(resolve, reject){

            //Variables for date range
            self.period_start = moment($('#time-start-date').val()).format('YYYYMMDD');
            self.period_end = moment($('#time-end-date').val()).format('YYYYMMDD');
            
            //manual http request
            $.ajax({
                method: "GET",
                url: "api/harvest",
                dataType:"json",
                data: {

                    "client_id": self.client_id,
                    "period_start": self.period_start,
                    "period_end": self.period_end
                },
                
                success: function(response){
                    resolve(response);
                },
                error: function(err){
                    console.log("Error: ", err);
                    resolve(err);
                }
            })
        }).then(function(response){          
            self.projects = response[response.length-1];
            self.render();
        });
    },

    
    createInvoices: function() {
        var self = this;
        var project_list = [];
        //Loop to create array of unique project numbers
        _.each(this.projects, function(project){
            if(project.project_id){
                if(!project_list.includes(project.project_id) ){
                project_list.push({project_id: project.project_id, client_id: project.client_id });
                }
             }

        });

            //manual http request
            $.ajax({
                method: "POST",
                url: "api/harvest",
                dataType:"json",
            
                data: {
                    "invoice": {
                        "due_at_human_format": "NET 30",
                        "client_id": self.client_id,
                        "currency" : "Canadian Dollar - CAD",
                        "issued_at": "2015-04-22",
                        "subject": "Beta test",
                        "notes": "Some notes go here",
                        "kind": "project",
                        "projects_to_invoice": project_list,
                        "import_hours": "yes",
                        "import_expense": "yes",
                        "period_start": self.period_start,
                        "period_end": self.period_end,
                        "expense_period_start": "2015-01-01",
                        "expense_period_end": "2015-03-31"
                    }
                },
                
                success: function(response){
                    $('.alert-success').removeClass('hidden');
                    console.log(response);
                },
                error: function(err){
                    console.log(err.responseText);
                }
            });
            //End of AJAX calls
        
    }
    

});