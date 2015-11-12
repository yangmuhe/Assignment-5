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

//TODO: create a projection, and a d3.geo.path() generator
//Center the projection at the center of Boston
var bostonLatLng = [42.315520,-71.088066]; //from http://itouchmap.com/latlong.html

//TODO: create a color scale

//TODO: create a d3.map() to store the value of median HH income per block group

//TODO: import data, parse, and draw