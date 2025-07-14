module.exports = function (config) {
  config.set({
    failOnFailingTestSuite: true,
    frameworks: ['jasmine', 'chai', 'sinon'],
    client: {
      jasmine: {
        timeoutInterval: 60000,
        random: false
      },
      clearContext: false,
    },
    reporters: ["spec"],
    specReporter: {
      maxLogLines: 5,             // limit number of lines logged per test
      suppressErrorSummary: true, // do not print error summary
      suppressFailed: false,      // do not print information about failed tests
      suppressPassed: false,      // do not print information about passed tests
      suppressSkipped: false,     // do not print information about skipped tests
      showSpecTiming: true,       // print the time elapsed for each spec
      failFast: false,            // test would finish with error when a first fail occurs
      prefixes: {
        success: '     [OK] ',      // override prefix for passed tests, default is '✓ '
        failure: ' [FAILED] ',      // override prefix for failed tests, default is '✗ '
        skipped: '[SKIPPED] '      // override prefix for skipped tests, default is '- '
      }
    },
    files: [
      { pattern: '../dist/interaction-manager.js', served: true },
      { pattern: 'actions.js', served: true },
      { pattern: 'define-engine.js', served: true },
      'interaction-manager/**/*.js',
    ],
    singleRun: true,
    retryLimit: 0,
    webpack: {
      module: {
        rules: [
          {
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: [/node_modules/, /helpers/],
          }
        ]
      },
      watch: true
    },
    webpackServer: {
      noInfo: true
    },
    browsers: [],
    exclude: [
      'node_modules/',
    ],
    customDebugFile: 'specRunner.html',
    logLevel: config.LOG_INFO,
    processKillTimeout: 20000,
    browserSocketTimeout: 20000,
  });
};
