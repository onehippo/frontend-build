# hippo-build

## Testing

### Unit tests
Hippo-build supports unit testing using Karma and Jasmine. The test files are located using the following file pattern `**/*.spec.js`.

#### Loading HTML, CSS and JSON fixtures
The default Karma setup of hippo-build exposes the [jasmine-jquery](https://github.com/velesin/jasmine-jquery) module
for handling HTML, CSS and JSON fixtures, as well as provide a set of custom matchers that simplify validating DOM conditions, e.g. `expect($('#id-name')[0]).toBeInDOM()`. 

Fixture files should be defined adjacent to the spec files that use them, or at least as close as possible. They follow the same naming convention as the spec files and are named with a `.fixture` suffix, e.g. `cms.login.fixture.html` or `cms.config.fixture.json`. The default value for the fixtures path is set to `base/src/angularjs`. The 'base' part is needed because Karma serves the fixtures files on this path. This value can be changed by setting the configuration parameter `fixturesPath` in the project's `build.conf.js`. Setting this parameter will also change the fixtures path for CSS and JSON files, but these can also be customised using the `styleFixturesPath` and `jsonFixturesPath` parameters.

For more control over these paths you can use the following snippet in your spec files:
```
beforeEach(function () {
  jasmine.getFixtures().fixturesPath = 'base/spec/js/fixtures';
  jasmine.getStyleFixtures().fixturesPath = 'base/spec/css/fixtures';
  jasmine.getJSONFixtures().fixturesPath = 'base/spec/json/fixtures';
});
```
##### Example project setup and code
```
|- src
  |- angularjs
    |- main.js
    |- main.spec.js
    |- main.fixture.html
    |- dialogs
      |- dialog.fixture.html
      |- dialog.fixture.css
      ..  
```
In `main.spec.js` you should be able to load fixtures into the DOM with:
```
loadFixtures('main.fixture.html');
// from a subfolder
loadFixtures('dialogs/dialog.fixture.html');
// load css
loadStyleFixtures('dialogs/dialog.fixture.css);
```
