const PATH_WIDTH = 1;
const HEAP_RSS_COLOR ='orange';
const HEAP_TOTAL_COLOR ='#69b3a2';
const HEAP_USED_COLOR ='red';

const WIDTH = 960;
const HEIGHT = 500;
const MARGIN = {top: 10, right: 30, bottom: 30, left: 60};

// const toMb = (n) => Number((n / 1024 / 1024).toFixed(2));
const toMb = (n) => Number((n / 1024 / 1024));

var memoryValues = memory.map(item => {
    var { rss, heapTotal, heapUsed, external } = item;
    return [rss, heapTotal, heapUsed, external];
});

var yRange = memoryValues.reduce((res, arr) => {
    var max = Math.max.apply(null, arr);
    var min = Math.min.apply(null, arr);
    if(max > res[1]) res[1] = max;
    if(min < res[0]) res[0] = min;
    return res;
}, [Number.POSITIVE_INFINITY, 0]);

yRange = yRange.map(item => toMb(item))
    var xRange = [start, end];
    var xRangeHumanReadable = [
    moment.unix(start).format('YYYY/MM/DD HH:mm:ss'),
    moment.unix(end).format('YYYY/MM/DD HH:mm:ss')
];

var xRange = [start, end];

let memoryData = memory.map(({ time, rss, heapTotal, heapUsed, external }) => {
    return {
        time,
        rss: toMb(rss),
        heapTotal: toMb(heapTotal),
        heapUsed: toMb(heapUsed),
        external: toMb(external)
    }
});

console.log('memoryData', memoryData);

var svg = d3.select('svg')
    .attr('width', WIDTH + MARGIN.left + MARGIN.right)
    .attr('height', HEIGHT + MARGIN.top + MARGIN.bottom)
    .append('g')
    .attr('transform',
        'translate(' + MARGIN.left + ',' + MARGIN.top + ')');

/* Init X axis */
var x = d3.scaleTime()
    .domain(xRange)
    .range([ 0, WIDTH ]);

svg.append('g')
    .attr('transform', 'translate(0,' + HEIGHT + ')')
    .call(d3.axisBottom(x));

/* Init Y axis */
var y = d3.scaleLinear()
    .domain(yRange)
    .range([ HEIGHT, 0 ]);

svg.append('g')
    .call(d3.axisLeft(y));

svg.append('path')
    .datum(memoryData)
    .attr('fill', 'none')
    .attr('stroke', HEAP_TOTAL_COLOR)
    .attr('stroke-width', PATH_WIDTH)
    .attr('d', d3.line()
        .x((d) => x(d.time))
        .y((d) => y(d.heapTotal)))

svg.append('path')
    .datum(memoryData)
    .attr('fill', 'none')
    .attr('stroke', HEAP_USED_COLOR)
    .attr('stroke-width', PATH_WIDTH)
    .attr('d', d3.line()
        .x((d) => x(d.time))
        .y((d) => y(d.heapUsed)))

svg.append('path')
    .datum(memoryData)
    .attr('fill', 'none')
    .attr('stroke', HEAP_RSS_COLOR)
    .attr('stroke-width', PATH_WIDTH)
    .attr('d', d3.line()
        .x((d) => x(d.time))
        .y((d) => y(d.rss)))
