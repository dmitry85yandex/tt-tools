/** 
 * pr-updater test enviroment
 * @description Test coverage of the main functions of the api module
 * @example  How to use this script
 * RUN: 
 * In command line in the directory with project type next command:
 * $ mocha
 * @version 0.01
 * @autor Surzhikov Dmitry
 */
var should = require('should'),
    intercept = require("intercept-stdout"),
        api = require("../api");

//SetUp test credentails
api.implementation.owner = 'dmitry85yandex';
api.implementation.repo = 'tt-tools';
api.implementation.pass = 'dsurzhikov85';
// SetUp Pull Request number
api.implementation.pr = 1;

describe('Api module', function() {
    describe('Check GITHUB hostname', function() {
        it('should equal https://api.github.com', function () {
            var host = api.implementation.host; 
            host.should.equal('https://api.github.com');
        })
    });  
    
    describe('Testing initialization (init() method of api module)', function() {
        it('init() without stdin arguments should output in stdout "Wrong parameters!" message', function () {
            var credentials = {
                owner: api.implementation.owner,
                repo: api.implementation.repo,
                pass: api.implementation.pass,
            }, 
                arguments = []; 
            // start intercept stdout    
            var intercept = require("intercept-stdout"),
                capturedRes = "";

            var unhook_intercept = intercept(function(stdout) {
                capturedRes += stdout;
            });
            api.implementation.init(credentials, arguments); 
            // end intercept stdout
            unhook_intercept();
                
            capturedRes.should.equal('Wrong parameters!\n');
        })
    });     

    describe('Testing getPRBody method', function() {
        it('return value should be a string type', function () {
            var result = api.implementation.getPRBody();
            result.should.be.type('string');
        })
        
        it('should throw an error if invalid credentials', function () {
            //SetUp wrong credentails 
            api.implementation.owner = 'owner';
            api.implementation.pass = 'pass';

            api.implementation.getPRBody.bind(null).should.throw();
            
            //TearDown back right credentails 
            api.implementation.owner = 'dmitry85yandex';
            api.implementation.repo = 'tt-tools';
        })        
    }); 
    
    describe('Testing upPRBody method', function() {
        it('The return value should have a JSON type', function () {
            //SetUp passed data 
            var data = 'Rest of comment\nCoverage:100%\nReview:All files good! :smile:\nCodestyle: :ok_hand:\n';
            var result = api.implementation.upPRBody(data);
            result.should.be.json;
        });       
    });    

})