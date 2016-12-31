# Logchief

A javascript library for logging.

```javascript
var mylogger = window.logger.get("com.example.afunctionality");
mylogger.info("a super log message") 
if(mylogger.isInfo) {
  mylogger.info("a complex message : " + JSON.stringify(somedata)) 
}
```

## Why using Logchief

* For large javascript application
* For switching log level in the console in production or in dev
* It is easy to use and easy to learn
* The usage is similar to *slf4j* and *java logging*.
* Tested with karma (95.36% Statements 144/151)
* It is very fast

## Compatible browsers

* Google Chrome
* Firefox
* Edge
* Internet Explorer 7, 8, 9, 10, 11

Other browsers may be compatible but there are not tested with *Karma*.

## What is Logchief

* Allow to create hierarchical log (myapp.data, myapp.service, myapp.service.hello)
* Easy to use
* Small size
* Use *console* behind but can be something else
* Extensible (formatter and console overridable)

## What is not Logchief

* Output manager (the output is delegating to the *console*)

## The project files

| Nom | Description  |
|-----|--------------|
| logchief.js  | The main javascript file |
| logchief-angular.js  | Replace the angular js with a logchief logger named *angular* |
| logchief-test.js  | The tests (must not be included in a web page, for testing only) |
| dist/logchief.min.js  | The minification of logchief.js |
| dist/logchief.full.min.js  | The minification of logchief.js and logchief-angular.js |

## How to build

Install npm (tested with nodejs 4+).

In the cloned repository, download the dependencies

```bash
npm install
```

### Build the documentation and the minified files

```bash
grunt
```

The minified files are in the *dist* folder.

The documentation is available in the *jsdoc* folder (*logger.html*). There are many examples.

### Run jshint

```bash
grunt jshint
```

## How to test with Karma

Open *karma.conf.js*, at line 65-68, comment or uncomment this lines for selecting the browsers. If you want to debug, comment lines 89-93 and the dot of the line 85.

```bash
grunt test
```

The test coverage are in *coverage* folder. If you want to disable test coverage, comment line 32.


