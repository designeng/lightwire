const PATH_WIDTH = 1;
const HEAP_RSS_COLOR ='orange';
const HEAP_TOTAL_COLOR ='#69b3a2';
const HEAP_USED_COLOR ='red';

const toMb = (n) => Number((n / 1024 / 1024).toFixed(2));

var memoryValues = samples.map(item => {
    var { rss, heapTotal, heapUsed, external } = item.memory;
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

var xRangeStartEnd = [start, end];

memoryData = samples.map((item) => {
    return {
        time: item.time,
        rss: toMb(item.memory.rss),
        heapTotal: toMb(item.memory.heapTotal),
        heapUsed: toMb(item.memory.heapUsed),
    }
});

var svg = d3.select('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform',
        'translate(' + margin.left + ',' + margin.top + ')');

/* Init X axis */
var x = d3.scaleTime()
    .domain(xRangeStartEnd)
    .range([ 0, width ]);

svg.append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(x)
);

/* Init Y axis */
var y = d3.scaleLinear()
    .domain(yRange)
    .range([ height, 0 ]);

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
