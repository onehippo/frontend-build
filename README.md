# hippo-build

## Testing

### Unit tests
Hippo-build supports unit testing using Karma and Jasmine. The test files are located using the following file pattern
`**/*.spec.js`.
#### Loading HTML, CSS and JSON fixtures
The default Karma setup of hippo-build exposes the [jasmine-jquery](https://github.com/velesin/jasmine-jquery) module
for handling HTML, CSS and JSON fixtures, as well as provide a set of custom matchers that simplify validating DOM
conditions, e.g. `expect($('#id-name')[0]).toBeInDOM()`.

Fixture files should be defined adjacent to the spec files that use them, or at least as close as possible. They follow
the same naming convention as the spec files and are named with a `.fixture` suffix, e.g. `cms.login.fixture.html` or
`cms.config.fixture.json`. The Karma configuration provided by hippo-build is setup to serve these files on the path
expected by the jasmine-jquery module. To accomplish this, Karma is instructed to serve fixture files over it's
HTTP-server by adding a file pattern to the `files` option: `{ pattern: '**/*.fixture.*', included: false }`.
Second, Karma is instructed to proxy the path `/spec/javascripts/fixtures/` (which is the default fixtures path of
jasmine-jquery) to `/base/src/angularjs/` (which is a combination of Karma's base path for serving files over HTTP and
the root folder where hippo-build expects your Angular code to live).

This means that if you customise the `files` and/or `proxies` option in your project's Karma configuration, and you need
to work with fixtures in your tests, you have to replicate these two configuration values:
```
proxies: {
  "/spec/javascripts/fixtures/": "/base/src/angularjs/",
  "/spec/javascripts/fixtures/json/": "/base/src/angularjs/",
},
files: [
  { pattern: '**/*.fixture.*', included: false },
]
```
The simplest way is, instead of replacing the `files` and/or `proxies` values, to concatenate your custom values into
the options provided by hippo-build, e.g. `karma.cfg.files = karma.cfg.files.concat([templates, scripts])`

##### Example project setup and code
```
|- src
  |- angularjs
    |- main.js
    |- main.spec.js
    |- main.fixture.html
    |- main.fixture.json
    |- dialogs
      |- dialog.fixture.html
      |- dialog.fixture.css
      ..
```

In `main.spec.js` you can then load your fixtures with:
```
// Load html fixture into the DOM
jasmine.getFixtures().load('main.fixture.html');
// from a subfolder
jasmine.getFixtures().load('dialogs/dialog.fixture.html');

// load css fixture into the DOM
jasmine.getStyleFixtures().load('dialogs/dialog.fixture.css');

// Load JSON fixture object
var jsonObject = jasmine.getJSONFixtures().load('main.fixture.json');
```

For more control over the paths you can use the following snippet in your spec files:
```
beforeEach(function () {
  jasmine.getFixtures().fixturesPath = 'base/spec/js/fixtures';
  jasmine.getStyleFixtures().fixturesPath = 'base/spec/css/fixtures';
  jasmine.getJSONFixtures().fixturesPath = 'base/spec/json/fixtures';
});
```
