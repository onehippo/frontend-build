# frontend-build

## Testing

### Unit tests
Frontend-build supports unit testing using Karma and Jasmine. The test files are located using the following file pattern `**/*.spec.js`.

#### Loading HTML, CSS and JSON fixtures
The default Karma setup of frontend-build exposes the [jasmine-jquery](https://github.com/velesin/jasmine-jquery) module
for handling HTML, CSS and JSON fixtures, as well as provide a set of custom matchers that simplify validating DOM conditions, e.g. `expect($('#id-name')[0]).toBeInDOM()`.

Fixture files should be defined adjacent to the spec files that use them, or at least as close as possible. They follow the same naming convention as the spec files and are named with a `.fixture` suffix, e.g. `cms.login.fixture.html` or `cms.config.fixture.json`. Karma can be instructed to serve fixture files over it's HTTP-server by adding a file pattern  to the `files` array in the project's `karma.conf.js`. The default pattern is saved in `cfg.src.fixtures` and matches `{ pattern: cfg.srcDir + '**/*.fixture.+(js|html|css|json)', included: false}`.

Frontend-build instructs Karma by default to proxy the path `/spec/javascripts/fixtures/` (which is the default fixtures path of jasmine-jquery) to `/base/src/angularjs/`. This is a combination of Karma's base path for serving files over HTTP and the root folder where frontend-build expects your Angular code to live.

When changing the karma options you can customize the proxy path with the following options:
* override `cfg.srcDir` in your build.conf.js which changes the default proxy path from `/base/src/angularjs` to `/base/[your src dir]/angularjs`
* override `cfg.karmaFixtureProxyPath` in your build.conf.js directly
* override `options.proxies` in your karma.conf.js, then you will have to replicate these two configuration values:
```
proxies: {
  '/spec/javascripts/fixtures/': '[your proxy path]',
  '/spec/javascripts/fixtures/json/': '[your proxy path]',
},
```

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

## Releasing frontend-build

To create patch release, run:
```
npm version patch
git push
```

To create a minor release, run:
```
npm version minor
git push
```

Last, create a description for the released version at https://github.com/onehippo/frontend-build/releases/new.
