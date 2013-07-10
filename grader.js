#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');

var CHECKSFILE_DEFAULT = "checks.json"; // default tests
//var HTMLFILE_DEFAULT = "index.html";  // no default used


var assertFileExists = function(infile) 
{
    var instr = infile.toString();
    if(!fs.existsSync(instr)) 
    {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var loadChecks = function(checksfile) 
{
    return JSON.parse(fs.readFileSync(checksfile));
};

var clone = function(fn) 
{
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var processHtml = function(program) 
{
    var checks = loadChecks(program.checks).sort();
    var out = {};

    if(program.url)
    {
        // debug output
        //console.log(program.url);

        // retrieve the data frm the url
        rest.get(program.url).on('complete', function(result, response) 
        {
            // handle errors
            if (result instanceof Error)
            {
                console.error('Error: ' + util.format(response.message));
                process.exit(1);
            }
            else // on complete
            { 
                // process html when we get all the data
                $ = cheerio.load(result);

                // process the data 
                for(var ii in checks) 
                {
                    var present = $(checks[ii]).length > 0;
                    out[checks[ii]] = present;
                } 

                // format and output results
                var outJson = JSON.stringify(out, null, 4);
                console.log(outJson);     
            }
        });
    }
    else
    { 
        // debug output
        //console.log(program.file);

        // resd in the html file
        $ = cheerio.load(fs.readFileSync(program.file));

        // process the data
        for(var ii in checks) 
        {
            var present = $(checks[ii]).length > 0;
            out[checks[ii]] = present;
        } 

        // format and output results
        var outJson = JSON.stringify(out, null, 4);
        console.log(outJson);
    }
}

if(require.main == module) 
{
    program

    .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
    .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists))
    .option('-u, --url <html_file>', 'URL to index.html')
    .parse(process.argv);

    // process the html file and output the results to console.log
    processHtml(program);    
} 
else 
{
    exports.checkHtml = checkHtml;
}



