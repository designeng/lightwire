require('@babel/polyfill'); /* for async/await support */

require('./starter');
// require('./perf/lightwireBenchmark').default();
require('./perf/wireBenchmark').default();
