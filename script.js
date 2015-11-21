console.log("Assignment 5");

var margin = {t:50,r:100,b:50,l:50};
var width = document.getElementById('map').clientWidth - margin.r - margin.l,
    height = document.getElementById('map').clientHeight - margin.t - margin.b;

var canvas = d3.select('.canvas');
var map = canvas
    .append('svg')
    .attr('width',width+margin.r+margin.l)
    .attr('height',height + margin.t + margin.b)
    .append('g')
    .attr('class','canvas')
    .attr('transform','translate('+margin.l+','+margin.t+')');


//TODO: set up a mercator projection, and a d3.geo.path() generator
//Center the projection at the center of Boston
var bostonLngLat = [-71.088066,42.315520]; //from http://itouchmap.com/latlong.html
var projection = d3.geo.mercator()
    .center(bostonLngLat)
    .translate([0,0])
    .scale(1);

var pathGeneraor = d3.geo.path()
    .projection(projection);


//TODO: create a color scale
var colorScale = d3.scale.linear()
    .domain([100,200000])
    .range(['white','green']);


//TODO: create a d3.map() to store the value of median HH income per block group
var incomeByBlockGroup = d3.map();


//TODO: import data, parse, and draw
//import data
queue()
    .defer(d3.json, "data/bos_census_blk_group.geojson")
    .defer(d3.json, "data/bos_neighborhoods.geojson")
    .defer(d3.csv, "data/acs2013_median_hh_income.csv", parseData)
    .await(function(err, blkGroup, nbh){
        console.log(incomeByBlockGroup);
        console.log(blkGroup);
        console.log(nbh);

        draw(blkGroup, nbh);
    })

//d3.csv("data/acs2013_median_hh_income.csv", parseData, dataLoaded);

//parse
function parseData(d){
    /*
    incomeByBlockGroup.set(d.geoid, {
        income: +d.B19013001
    }) */ //works the same
    incomeByBlockGroup.set(d.geoid, +d.B19013001)
}

/*
//find the min and max of income
function dataLoaded(err, rows){
    var incomeMin = d3.min(rows, function(d){
            return (incomeByBlockGroup.get(income))
        }),
        incomeMax = d3.max(rows, function(d){
            return (incomeByBlockGroup.get(d.properties.geoid)).income
        });
    colorScale.domain([incomeMin,incomeMax])
        .range(['white','blue']);

    console.log(incomeMin);
    console.log(incomeMax);
}
*/

//draw
function draw(blkGroup, nbh){
    //!reset scale!
    //http://stackoverflow.com/questions/14492284/center-a-map-in-d3-given-a-geojson-object
    //Compute the bounds of a feature of interest, then derive scale & translate.
    var b = pathGeneraor.bounds(blkGroup),
        s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
        t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

    //Update the projection to use computed scale & translate.
    projection
        .scale(s)
        .translate(t);

    //draw choropleth
    map.selectAll('.block-groups')
        .data(blkGroup.features)
        .enter()
        .append('path')
        .attr('class','block-groups')
        .attr('d',pathGeneraor)
        .style('stroke', 'white')
        .style('stroke-width', '1px')
        .style('fill', function(d){
            //console.log(d);
            //var medianIncome = (incomeByBlockGroup.get(d.properties.geoid)).income;
            var medianIncome = incomeByBlockGroup.get(d.properties.geoid);
            //console.log(medianIncome);
            if(medianIncome==0){return 'rgb(220,220,220)';}

            return colorScale(medianIncome);
        })
        .call(tooltip);

    //add boundaries of neighborhoods
    map.selectAll('.boundary')
        .data(nbh.features)
        .enter()
        .append('path')
        .attr('class','boundary')
        .attr('d', pathGeneraor)
        .style('stroke','red')
        .style('stroke-width','1px')
        .style('opacity',.5)
        .style('fill','none')

    //add names of neighborhoods
    map.selectAll('.lable')
        .data(nbh.features)
        .enter()
        .append('text')
        .attr('class','lable')
        .text(function(d){
            //console.log(d);
            return d.properties.Name;
        })
        .style('fill','rgb(50,50,50)')
        .style('stroke-width','1px')
        .style('font-size','10px')
        /* //this way doesn't work
        .attr('x', function(d){
            return pathGeneraor.cenroid(d)[0];
        })
        .attr('y', function(d){
            return pathGeneraor.centroid(d)[1];
        })*/
        .attr('transform',function (d){
            var xLable = pathGeneraor.centroid(d)[0],
                yLable = pathGeneraor.centroid(d)[1];
            return 'translate('+xLable+','+yLable+')';
        })
}

//Tooltip (Week 8)
function tooltip(selection){
    selection
        .on('mouseenter',function(d){
            var tooltip = d3.select('.custom-tooltip');
            tooltip.transition()
                .style('opacity',1);

            var medianIncome = incomeByBlockGroup.get(d.properties.geoid);
            //console.log(medianIncome);
            tooltip.select('#medianIncome').html(medianIncome);
        })

        .on('mouseleave',function(){
            d3.select('.custom-tooltip')
                .transition()
                .style('opacity',0)
        })

        .on('mousemove', function(){
            var xy = d3.mouse(document.getElementById('map'));
            var left = xy[0], top = xy[1];

            d3.select('.custom-tooltip')
                .style('left', left + 50 + 'px')
                .style('top',top + 50 + 'px')
        })
}



