/** 
    bar chart
**/
window.D3Sample = window.D3Sample || {};

D3Sample.Chart = (function(){

    /** passed a date string, convert it into a d3 formatted date string
    */
    var getDateFormatted = function(dateString ) {
        var splitDate = dateString.split("-");
        var format = d3.time.format("%A, %B %e");    
        return format(getDate(dateString)); // returns a string
    };

    /** given some number
    */
    var formatNumber = function(d) {
        var formatLargeNumber = d3.format("s");
        var result; 
        result = parseFloat(d); // convert from string to float
        if (isInt(d)){ result = parseInt(d, 10); } // if its an int remove .00

        function isFloat(n) {
            return n === +n && n !== (n|0);
        }

        if (result > 1000){
            result = parseInt(result, 10); // truncate any decimals
            result = formatLargeNumber(result);
        } else {
            // don't display percent tick marks
            if (isFloat(result)) {
                result = "";
            }
        }
        return result;
    }

    // test if something is integer
    var isInt = function(n){
        return typeof n== "number" && isFinite(n) && n%1===0;
    }

    var getDate = function(dateString){
        var splitDate = dateString.split("-");
        return new Date(splitDate[0], parseInt(splitDate[1])-1, parseInt(splitDate[2]));
    };

    /** format money such that
        large numbers over 1k use magnitude
        don't show in between numbers such as 1.5
    */ 
    var formatMoney = function(d){
        var formatCurrency = d3.format("$.0f"); // remove decimals
        var formatLargeCurrency = d3.format("$s.0f"); // remove decimal use scale
        var result;

        if (isInt(d)){
            result = formatCurrency(d);
            if (d >= 1000) {
                result = formatLargeCurrency(d);
            }
        } else {
            d = "";
        }  
         return result;
    };

    var makeChart = function(){
        var dataSubs = D3Sample.DATA1 || [];
        var dataRenew = D3Sample.DATA2 || [];

        var allData = [];
        if (dataSubs) { allData = allData.concat(dataSubs); }
        if (dataRenew) { allData = allData.concat(dataRenew); }


        var trueWidth = 310;
        var trueHeight = 160;
        var margin = {top: 10, right: 0, bottom: 20, left: 30};
        var width = trueWidth - margin.left - margin.right,
            height = trueHeight - margin.top - margin.bottom;

        var minDate = getDate(allData[0][0]);
        var maxDate = getDate(allData[allData.length-1][0]);
        var maxY = d3.max(allData, function(d) { return parseFloat(d[1], 10); });
        if (maxY == 0) { maxY = 1; } // data is all 0 for y

        // set up axis range domain and other properties
        var y = d3.scale.linear()
            .range([height, 0])
            .domain([0, maxY]);

        var x = d3.time.scale()
            .domain([minDate, maxDate])
            .range([0, width]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .ticks(0)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .ticks(5)
            .tickFormat(formatNumber)
            .tickSubdivide(0)
            .orient("left");

        // create the chart 
        var svg = d3.select("#area-chart")
            .attr("width", trueWidth)
            .attr("height", trueHeight)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var drawCapline = d3.svg.line()
            .interpolate("monotone")
            .x(function(d) { return x(getDate(d[0])); })
            .y(function(d) { return y(d[1]); });

        var drawArea = d3.svg.area()
            .interpolate("monotone")
            .x(function(d) { return x(getDate(d[0])); })
            .y0(height)
            .y1(function(d) { return y(d[1]); });

        // tool tip for the date and info
        var formatDate = function(d){
            var nameItem = "subscriber";
            if (d[1] > 1) {
                nameItem += "s";
            } 
            return "<strong>" + d[1] + "</strong> " + nameItem + "<br /> on "+ getDateFormatted(d[0]);
        }
        var tip = d3.tip()
            .attr('class', 'd3-tip subscriber-tip')
            .offset([-10, 0])
            .html(function(d) { return formatDate(d); });

        var formatDateRenew = function(d){
            var nameItem = "renewal";
            if (d[1] > 1) {
                nameItem += "s";
            } 
            return "<strong>" + d[1] + "</strong> " + nameItem + "<br /> on "+ getDateFormatted(d[0]);
        }

        var renewTip = d3.tip()
            .attr('class', 'd3-tip renew-tip')
            .offset([-10, 0])
            .html(function(d) { return formatDateRenew(d); });

        // remove data that has the value 0
        var zeroOut = function(dataSet){
            var noZeroData = [];
            for (var g=0; g<dataSet.length; g++) {
                var pair = dataSet[g];
                if (pair[1] !== "0") {
                    noZeroData.push(dataSet[g]);
                }
            }
            return noZeroData;
        }

        // draw y-axis grid lines
        svg.selectAll("line.y")
          .data(y.ticks(5))
          .enter().append("line")
          .attr("class", "gridline")
          .attr("x1", 0)
          .attr("x2", width)
          .attr("y1", y)
          .attr("y2", y);
 
        if (dataSubs.length > 0) {
            // draw this weeks area
            svg.append("path")
                .datum(dataSubs)
                .attr("class", "areaCurrent")
                .attr("d", drawArea);

            // draw this weeks top line
            svg.append("path")
              .datum(dataSubs)
              .attr("class", "caplineCurrent")
              .attr("d", drawCapline);
        }

        if (dataRenew.length > 0) {
            // draw this weeks renew area
            svg.append("path")
                .datum(dataRenew)
                .attr("class", "areaRenew")
                .attr("d", drawArea);

            // draw this weeks renew top line
            svg.append("path")
              .datum(dataRenew)
              .attr("class", "caplineRenew")
              .attr("d", drawCapline);
        }
        
        // draw axis 
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)");

        var drawDotX = function(d){
            if (d[2]){
                return x(getDate(d[0])); 
            } else {
                return -10000; // draw it off screen
            }
        };

        var drawDotY = function(d) {
            if (d[2]){
                return y(d[1]);
            } 
        };

        // this weeks points
        if (dataSubs.length > 0) {
            var noZeroData = zeroOut(dataSubs);

            svg.selectAll('.point')
                .data(noZeroData)
                .enter().append("svg:circle")
                .attr("class", "pointCurrent")
                .attr("r", 3)
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide)
                .attr("cx", drawDotX)
                .attr("cy", drawDotY);

            svg.call(tip);
        }

        if (dataRenew.length > 0) {
            var noZeroData = zeroOut(dataRenew);

            svg.selectAll('.point')
                .data(noZeroData)
                .enter().append("svg:circle")
                .attr("class", "pointRenew")
                .attr("r", 3)
                .on('mouseover', renewTip.show)
                .on('mouseout', renewTip.hide)
                .attr("cx", drawDotX)
                .attr("cy", drawDotY);

            svg.call(renewTip);
        }
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

