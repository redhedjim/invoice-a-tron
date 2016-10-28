'use strict';

module.exports = function(app, express, jwt, bodyParser, Bookshelf, _) {

//get an instance of the express router
var apiRouter = express.Router();
var requireAuth = function(req, res, next) {
	if (!req.user) {
		res.end('Not authorized', 401)
	} else {
		console.log("hit")
		next()
	}
}

//test route to make sure everything is working
//accessed at GET http://localhost:3000/api
// apiRouter.get('/', function(req, res){
//    res.redirect('/#harvest');

// });

//==============================
// AuthToken generator
//==============================
apiRouter.post('/login', function(req, res, bodyParser) {
	//Hard coded email and password values
	var sysEmail = 'admin@associatevets.com';
	var sysPassword = 'pets4life';
	var user = sysEmail;
	//Credentials supplied by user
	var userEmail = req.body.email;
	var userPassword = req.body.password;
	var messageArray = [];
	//Make sure the username nad password match
	if (userEmail === sysEmail && userPassword === sysPassword){
				
		// if user is found and password is right
		// create a token
		var authToken = jwt.sign(user, app.get('superSecret'), {
			expiresIn: '7d' // expires in 24 hours
		});
		
		var verifiedJWT = jwt.verify(authToken, app.get('superSecret'));
		// res.send({message: verifiedJWT.attributes.admin})
		// return the information including token as JSON
		messageArray.push("Welcome to Inpoice-a-tron!");
		res.json({
			success: true,
			message: messageArray,
			authToken: authToken			
		});
	
	}else{
		messageArray.push('The email and/or password entered are not valid.')
		res.status(401).send({
			success: false, 
			message: messageArray
		})
	}
	
})
// 	var User = require('../models/user.js');
// 	var crypto = require('crypto');

//   User.forge({email: req.body.email}).fetch().then(function(user, err) {

// 		//Takes the users password entry, encrypts it and checks against database
// 		var userPassword = req.body.password;
// 		if(userPassword !== undefined && userPassword !== null && userPassword !== ""){

// 			//encrypts password and compares to DB entry
// 			// var hashPassword = crypto
// 			// 	.createHash("md5")
// 			// 	.update(userPassword)
// 			// 	.digest('hex');
// 			var hashPassword = userPassword
// 			/** Enable this version of hashPassword instead of above until signup feature is made.
			  	
// 			    var hashPassword = userPassword;
				
// 			**/
// 			if (!user) {
// 				//Condition check to see if user exists
// 				res.json({ success: false, message: 'Authentication failed. User not found.' });
// 			} else if (user) {
// 				// check if password matches
// 				if (user.get('password') != hashPassword) {
// 					res.json({ success: false, message: 'Authentication failed. Wrong password.' });
// 				} else {
// 					// if user is found and password is right
// 					// create a token
// 					var authToken = jwt.sign(user, app.get('superSecret'), {
// 						expiresIn: '7d' // expires in 24 hours
// 					});
					
// 					var verifiedJWT = jwt.verify(authToken, app.get('superSecret'));
// 					// res.send({message: verifiedJWT.attributes.admin})
// 					// return the information including token as JSON
// 					res.json({
// 						success: true,
// 						message: 'Enjoy your token!',
// 						authToken: authToken,
// 						admin: verifiedJWT.attributes.admin,
// 						user: verifiedJWT.attributes.id
// 					});
// 				}
// 		    }

// 		}else{
// 			res.json({message: "Password required."})
// 		}


// 	}).catch(function(err) {
// 		    if (err) throw err;

// 	})
// });

// // ====================================
// // Middleware to verify token
// // ====================================
// apiRouter.use(function(req, res, next){
// 	console.log("this was hit");
// 	//console.log(req.headers);
// 	//Checks the header, url params, or POST params for token
// 	//var authToken = Lockr.get('authtoken');

// 	//decode token if found
// 	if (authToken) {
// 		//verifies secret and checks token expirary
// 		jwt.verify(authToken, app.get('superSecret'), function(err, decoded) {			
// 			if(err) {
// 				return res.json({
// 					error: true,
// 					message: "Failed to authenticate token."
					
// 				});
// 			} else {
// 				req.decoded = decoded; //If token checks out, save to request for use in other routes
// 				next();
// 			}				
			
// 		});
// 	} else {

// 		//if no token exists, return an error
// 		return res.status(403).send({
// 			success: false,
// 			message: 'No token provided.'
// 		});
// 	}
// });

//====================================================================================
//Routes for TbTrak
//====================================================================================

//===============================
//  HARVEST TIME & INVOICE
//===============================

apiRouter.route('/harvest')
	//Get list of projects and their time entries in a given date range
	.get(function (req, res) {
		
		var config = require('../config/config.js');

		var Harvest = require('../../lib/harvest');
		var harvest = new Harvest({
			subdomain: config.harvest.subdomain,
			email: config.harvest.email,
			password: config.harvest.password
		});

		var Projects = harvest.Projects;
		var Reports = harvest.Reports;
		var period_start = req.query.period_start;
		var period_end = req.query.period_end;
	
		//Get's list of projects and their details.  Projects are clinic names
		var getProjects = new Promise(function(resolve, reject){
			Projects.list({}, function(err, projects) {
				if (err){
					resolve(err);
				}else{
					resolve(projects);
				}
			});
		});
		
		//Puts the projects as keys in an array with their name and code
		function makeProjectList(projects){
			var project_details = {}; //array to store list of projects & info
			_.each(projects, function(project){
				//Set project id/name/code to vars
				var project_id = project.project.id; 
				var project_name = project.project.name;
				var project_code = project.project.code;
				var client_id = project.project.client_id;
				
				//Push entries to array
				if(!project_details[project_id]){
					project_details[project_id] = { project_id, project_name, project_code, client_id };
				}						
			});
			return project_details; // {id: 1 { name: name, code: code}, id:2 {...} }
		};

		//Takes an object of projects and details from previous function
		function getTimeEntries(project_details){

			var timePromiseArray = []; // array to hold the promises below

			//Start looping thorough the project_aray 
			//and create a promise for each timeEntry fetch
			_.each(project_details, function(project, i){

				var projectID = project.project_id;// store current project id

				//Create a new promise and add it to the array
				i = new Promise(function(resolve, reject){
					Reports.timeEntriesByProject({
						"only_unbilled": true, //Show only unbilled time entries
						"project_id": project.project_id,
						"from": period_start,
						"to": period_end
						
					}, function(err, times) {
						if (err){
							console.log("Error: ", err);
							resolve();
						}else{
							//If a project has timne entries, add the to the project_details object	
							if(times.length > 0){
								project.timeEntries = times; 
								resolve(project_details);
							//If a project has no time entries, remove the project from the promise_details object
							}else{
								delete project_details[projectID];
								resolve(project_details);
							}
						}
					});
				});
				timePromiseArray.push(i); //Push the above promise to the promise array				
			});
			return Promise.all(timePromiseArray).then(function(results){ 
				res.status(200).send(results);
			}).catch(function(err){
				res.status(400).send(err);
			})
		}

		//String functions together in a big promise chain
		getProjects
		.then(makeProjectList)
		.then(getTimeEntries)
		
    })

	//Create new organization
	.post(function(req, res) {
        var self = this;
		var config = require('../config/config.js');

		var Harvest = require('../../lib/harvest');
		var harvest = new Harvest({
			subdomain: config.harvest.subdomain,
			email: config.harvest.email,
			password: config.harvest.password
		});

		var Invoices = harvest.Invoices;
		var invoiceDetails = req.body.invoice;
		var period_start = req.body.invoice.period_start;
		var period_end = req.body.invoice.period_end;
		var client_id = req.body.invoice.client_id;
		var project_list = req.body.invoice.projects_to_invoice;
		var dateToday = new Date();

		function createInvoices(){
			var invoicePromiseArray = [];
			_.each(project_list, function(project, i){
				i = new Promise(function(resolve, reject){
					Invoices.create({            
						"invoice": {
							"due_at_human_format": "NET 10",
							"client_id": project.client_id,
							"currency" : "Canadian Dollar - CAD",
							"issued_at": dateToday,
							"subject": "Invoice",
							"notes": "",
							"kind": "task",
							"projects_to_invoice": project.project_id,
							"import_hours": "yes",
							"import_expense": "no",
							"period_start": period_start,
							"period_end": period_end
						}      
					}, function(err, tasks) {
						if (err){				
							resolve();
						}else{
							resolve();
						}
					});
				});
				invoicePromiseArray.push(i);
			});
			return Promise.all(invoicePromiseArray).then(function(results){ 
				res.status(200).send({
					success: true,
					message: "Project invoices created successfully!",
					data: results
				});
			}).catch(function(err){
				res.status(400).send({
					error: true,
					message: "Your invoices could not be created. '" + err + "'Please try again.",
					data: null
				});
			})
		};

		createInvoices();
	})

	return apiRouter;
};


