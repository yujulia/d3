/** 
    rainbow chart
**/
window.D3Sample = window.D3Sample || {};

D3Sample.Chart = (function(){


    var makeChart = function(){
        var dataset = [D3Sample.DATA, 100-D3Sample.DATA];
        var colorset = ["#ff3300", "#fff"];

        var width = 150,
            height = 145,
            radius = Math.min(width, height) / 2;

        var pie = d3.layout.pie()
            .startAngle(-90 * (Math.PI/180))
            .endAngle(90 * (Math.PI/180))
            .sort(null);

        var arc = d3.svg.arc()
            .innerRadius(radius - 35)
            .outerRadius(radius);

        var svg = d3.select("#rainbow-chart").append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        var path = svg.selectAll("path")
            .data(pie(dataset))
            .enter().append("path")
            .attr("fill", function(d, i) { return colorset[i]; })
            .attr("class", function(d, i){ 
                var classString = "rainbowMain";
                if (i == 1) { 
                    classString = "rainbowDefault";
                }
                return classString;
            })
            .attr("d", arc);
    };

    // ----------------- public

    PublicMethods = {
        init : function(){
            makeChart();
        }
    };

    return PublicMethods;

}());

// on doc ready
$(function () {
    D3Sample.Chart.init();
});
