/** 
 * GITHUB node.js api module
 * @description "Update a pull request"
 * curl -H "Content-Type: application/json"
 * https://api.github.com/repos/:owner/:repo/pulls/:pr
 * @version 0.01
 * @autor Surzhikov Dmitry
 */

var request = require('request'), 
        gsync = true;

function implementation () {
    
    // GITHUB api hostname
    this.host = 'https://api.github.com';
    
    // User GITHUB credentails
    this.owner = false;
    this.repo = false;
    this.pass = false;
   
    // Pull Request ID 
    this.pr = false;
    // Pull Request update data
    this.data = false;
    // Delete section 
    this.del = false;
    
    this.init = function(credentials, arguments) 
    {    
        // set credetails 
        this.owner = credentials.owner;
        this.repo = credentials.repo;
        this.pass = credentials.pass;
        
        // passed text 
        var section = false;
        
        for(i=0; i<arguments.length; i++) {
            if(arguments[i] == '--pr') {
                var n = i + 1; 
                if(typeof arguments[n] != 'undefined'
                    && (parseInt(arguments[n], 10) > 0)) {
                    this.pr = arguments[n];
                }
            }
            
            if(arguments[i] == '--section') {
                var n = i + 1, 
                        d = n + 1;
                if(typeof arguments[n] != 'undefined') {
                    this.data = (typeof arguments[d] != 'undefined') ? arguments[d] : false;
                    section = arguments[n];
                }
            }
            
            if(arguments[i] == '--delete') {
                    this.del = true;
            }
            
            if(arguments[i] == '--clear') {
                    section = 'clear';
            }
        }
        
        if(this.pr) {
            switch (section) {
                case 'codestyle':
                        this.processor('Codestyle:');
                    break; 
                case 'coverage':
                        this.processor('Coverage:');
                    break;                             
                case 'review':
                        this.processor('Review:');
                    break;
                case 'clear': 
                        this.prClear();
                    break;                
                default:
                    console.log('Wrong parameters!');
            }
        } else console.log('Wrong parameters!');
    };
    
    /**
     * prClear
     * @desc - Clear all sections in the Pull Request commment body
     */
    this.prClear = function () 
    {
        var keys = ['Codestyle:', 'Coverage:', 'Review:'],
            cContent = this.getPRBody(), upData = false;
        
        for (var item in keys) {
            var section = keys[item],
                sPos = cContent.indexOf(section);
                if(sPos && sPos!=-1) {
                    var upperBlock = cContent.substring(0, (sPos+section.length)),
                            rest = cContent.substring((sPos+section.length), cContent.length),
                                ePos = rest.indexOf('\n'),
                                    lowerBlock = rest.substring(ePos, rest.length),
                                        fullUpBlock = upperBlock.substring(0, (upperBlock.length-section.length));
                    cContent = fullUpBlock + lowerBlock;
                }        
        }
        
        upData = cContent.trim() + '\n';
        this.upPRBody(upData);
        console.log('All sections has been successfully removed.');
    }
    
    /**
     * processor
     * @desc The main process that serves all sections
     * @param string section - Section keyword
     */
    this.processor = function (section) {
        
        var cContent = this.getPRBody(), 
                upData = false, 
                    sPos = cContent.indexOf(section);
        
        if(this.data) {
            //clear this.data 
            var cData = this.data.replace(section, '');
            this.data = cData;
            // update section
            if(sPos && sPos!=-1) {
                var upperBlock = cContent.substring(0, (sPos+section.length)),
                    rest = cContent.substring((sPos+section.length), cContent.length), 
                        ePos = rest.indexOf('\n'), 
                            lowerBlock = rest.substring(ePos, rest.length);
                upData = upperBlock + this.data + lowerBlock;
            } else {
                upData = cContent + '\n' + section + this.data + '\n';
            }
        } else {
            // view section
            var sectionData = '';
            if(sPos && sPos!=-1) {
                var rest = cContent.substring(sPos, cContent.length),
                    ePos = rest.indexOf('\n'),
                        sectionData = rest.substring(0, ePos);
            }
            console.log('>' + sectionData);
        }
        // delete section
        if(this.del) {
            if(sPos && sPos!=-1) {
                var upperBlock = cContent.substring(0, (sPos+section.length)),
                    rest = cContent.substring((sPos+section.length), cContent.length),
                        ePos = rest.indexOf('\n'),
                            lowerBlock = rest.substring(ePos, rest.length),
                                fullUpBlock = upperBlock.substring(0, (upperBlock.length-section.length));
                upData = fullUpBlock + lowerBlock;
            }
        }
        //update request
        if(upData) {
            this.upPRBody(upData);
            console.log('Pull Request description has been successfully updated.');
        }
    }
    
    /**
     * getPRBody
     * @desc get Pull Request Body content
     * @returns string - PR Body
     */
    this.getPRBody = function() 
    {
        var prBody = false,
            path = '/repos/' + this.owner + '/' + this.repo + '/pulls/' + this.pr,
                uri = this.host + path;
        
        var query = request.get(
            uri,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (X11; Linux i586; rv:31.0) Gecko/20100101 Firefox/31.0',
                    'Content-Type': 'application/json',
                },
                auth: {
                    'user': this.owner,
                    'pass': this.pass,
                },
            },
            function(err, response, body) {
                 var result = JSON.parse(body);
                 prBody = result.body;
                 gsync = false;
                 if(prBody == undefined) {
                    var fs = require('fs');
                        fs.unlink('credentials');
                    process.stdout.clearLine();
                    throw new Error(result.message);
                 }
            }
        );
        query.end();
        
        this.wait();
        
        return prBody; 
    }
    
    /**
     * upPRBody
     * @desc update Pull Request body
     * @param string data - new Pull Request comment body
     * @returns json - full result of PR query
     */
    this.upPRBody = function(data)
    {
        var prData = false,
            content = JSON.stringify({body:data}),
                path = '/repos/' + this.owner + '/' + this.repo + '/pulls/' + this.pr,
                    uri = this.host + path;
        
        var query = request.post(
            uri,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (X11; Linux i586; rv:31.0) Gecko/20100101 Firefox/31.0',
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(content)
                },
                auth: {
                    'user': this.owner,
                    'pass': this.pass,
                },
                body: content
            },
            function(err, response, body) {
                 prData = JSON.parse(body);
                 gsync = false; 
            }
        );
            
        query.end();
         
        this.wait();

        return prData;
    }  
    
    /**
     * wait
     * @desc - Waits for query completion
     */
    this.wait = function() 
    {
        process.stdout.write('Wait...');
        var chars = ['\\','|','/','-'], cnt = 0, line = 8;
        while(gsync) {
            require('deasync').sleep(40);
            if(cnt>3)cnt=0;
            process.stdout.write("."+chars[cnt]);
            process.stdout.cursorTo(line);
            cnt++; line++;
        }
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        gsync = true;
    }    
}

exports.implementation = new implementation();