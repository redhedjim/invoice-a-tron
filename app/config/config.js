module.exports = {
    'port': 3000,
    'database_URL': '127.0.0.1',
    'database_user': 'root',
    'database_password': '1q2w3e4r',
    'database': 'tbtrak',
    'database_charset': 'utf8',
    'env' : 'dev', //valid values are dev or prod
	"harvest": {
        'subdomain' : 'associatevets',  
        "email": "crawforda@associatevets.com",
        "password": "Tweety123",
        "identifier": "123",
        "secret": "12345",
        "user_agent": "node-harvest test runner",
        "authorization": "Basic bGVvdHVja2VyQG91dGxvb2suY29tOjFxMnczZTRy"
    }
};