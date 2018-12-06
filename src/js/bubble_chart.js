'use strict';

(function () {

    function focusCounrty(country) {
        var countryName;
        if (country.country) {
            countryName = country.country;
        } else {
            countryName = country;
        }
        $("#country-name").empty()
        $("#country-name").html(countryName + "<br> Avg expenditure change: " + country.y.toFixed(2) + "%<br>Avg tourist change: " + country.x.toFixed(2) + "%" + "<br>Ending year expenditure: " + country.s.toFixed(2) + " $Mil");
        countryName = countryName.toLowerCase();
        countryName = countryName.replace(/\s+/g, '%20')
        var triplink = 'https://www.tripadvisor.com/Search?q=' + countryName;
        var bookinglink = 'https://www.booking.com/searchresults.html?ss=' + countryName;
        var gnewslink = 'https://news.google.com/search?q=' + countryName + "%20" + $("#slider-range").slider("values", 0).toString() + '&hl=en-US';
        var wikilink = 'https://en.wikipedia.org/wiki/' + countryName;

        $("#country-name").append("<br><hr><a href=" + triplink + " target='_blank'><label>Trip Advisor</label></a>");
        $("#country-name").append("<br><a href=" + bookinglink + " target='_blank'><label>Booking.com</label></a>");
        $("#country-name").append("<br><a href=" + gnewslink + " target='_blank'><label>Google News</label></a>");
        $("#country-name").append("<br><a href=" + wikilink + " target='_blank'><label>Wiki</label></a>");
        $("#country-name").show();
    }

    $('.country-select').select2({
        placeholder: "Search for country"
    });

    $('.country-select').on('select2:select', function (e) {
        var result = generateData().filter(obj => {
            return obj.country === e.params.data.text
        })
        focusCounrty(result[0]);
    });

    $(function () {
        $("#slider-range").slider({
            range: true,
            min: 1995,
            max: 2014,
            values: [2008, 2014],
            slide: function (event, ui) {
                if (ui.values[0] == ui.values[1])
                    return false;
                $("#amount").val(ui.values[0] + " - " + ui.values[1]);
            },
            change: function (event, ui) {
                filterData();
                render(generateData());
            }
        });
        $("#amount").val($("#slider-range").slider("values", 0) +
            " - " + $("#slider-range").slider("values", 1));

        $("#bubble-slider").slider({
            range: true,
            min: 2,
            max: 80,
            values: [5, 50],
            slide: function (event, ui) {
                if (ui.values[0] == ui.values[1])
                    return false;
                $("#bubble-size").val(ui.values[0] + " - " + ui.values[1]);
            },
            change: function (event, ui) {
                filterData();
                render(generateData());
            }
        });
        $("#bubble-size").val($("#bubble-slider").slider("values", 0) +
            " - " + $("#bubble-slider").slider("values", 1));
    });

    $("#arrive_depart").change(function () {
        filterData();
        render(generateData());
    })

    var XDATA = "arrivals"
    // Y axis for expenditure
    var YDATA = "in_expenditure"
    // bubble size for total expenditure
    var BSIZE = "in_expenditure"
    // ending year
    var EYEAR = "2008"
    // starting year
    var SYEAR = "2014"

    function filterData() {
        if ($("#arrive_depart").val() === "arrivals") {
            // X axis for tourist visit
            XDATA = "arrivals"
            // Y axis for expenditure
            YDATA = "in_expenditure"
            // bubble size for total expenditure
            BSIZE = "in_expenditure"
        } else {
            // X axis for tourist visit
            XDATA = "departures"
            // Y axis for expenditure
            YDATA = "out_expenditure"
            // bubble size for total expenditure
            BSIZE = "out_expenditure"
        }
        // starting year
        SYEAR = $("#slider-range").slider("values", 0).toString()
        // ending year
        EYEAR = $("#slider-range").slider("values", 1).toString()
        // bubble size min
        bSizeMin = $("#bubble-slider").slider("values", 0)
        // bubble size max
        bSizeMax = $("#bubble-slider").slider("values", 1)
    }


    function generateData() {
        var _data = [];
        stats.forEach(country => {
            var datapoint = {};
            // percentage of growth/decline between two years (average growth rate) on tourst visit
            if (country[XDATA][EYEAR] != "" && country[XDATA][SYEAR] != "")
                datapoint.x = 100 * (Math.pow((country[XDATA][EYEAR] / country[XDATA][SYEAR]), 1 / (parseInt(EYEAR) - parseInt(SYEAR))) - 1);
            else datapoint.x = 0;
            // percentage of growth/decline between two years (average growth rate) on expenditure
            if (country[YDATA][EYEAR] != "" && country[YDATA][SYEAR] != "")
                datapoint.y = 100 * (Math.pow((country[YDATA][EYEAR] / country[YDATA][SYEAR]), 1 / (parseInt(EYEAR) - parseInt(SYEAR))) - 1);
            else datapoint.y = 0;
            // size of bubble
            if (country[BSIZE][EYEAR] != "")
                datapoint.s = country[BSIZE][EYEAR];
            else datapoint.s = 0;
            datapoint.country = country.country
            datapoint.id = country + datapoint.x + datapoint.y + XDATA + Math.random();
            if (datapoint.s != 0 && datapoint.x != 0 && datapoint.y != 0)
                _data.push(datapoint)
        });
        _data.sort(function (a, b) {
            if (a.s < b.s) return 1;
            if (a.s > b.s) return -1;
            return 0;
        })

        $('.country-select').empty();
        $('.country-select').append('<option value=""></option>');
        for (var i = 0; i < _data.length; i++) {
            $('.country-select').append('<option value="' + _data[i].country + '">' + _data[i].country + '</option>');
        }
        return _data;
    }

    var data = generateData();

    var height = window.innerHeight * 0.9;
    var width = window.innerWidth * 0.60;
    var margin = 70;

    var svg = d3.select("#vis")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    // append text for x
    svg.append("text")
        .attr("class", "axis-label")
        .attr("y", (height - 40))
        .attr("x", width - margin)
        .style("text-anchor", "middle")
        .text("Tourist Change(%)");
    // append text for y
    svg.append("text")
        .attr("class", "axis-label")
        .attr("y", margin - 10)
        .attr("x", margin + 25)
        .style("text-anchor", "middle")
        .text("Expenditure Change(%)");

    // zoom feature
    var zoom = d3.zoom()
        .scaleExtent([.5, 20])
        .extent([
            [0, 0],
            [width, height]
        ])
        .on("zoom", zoomed);
    // add a covering rect for zoom control
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .call(zoom);

    // initiaite variables
    var x;
    var y;
    var s;
    var gX;
    var gY;
    var xAxis
    var yAxis
    var points;
    var gridX;
    var gridY;
    var bSizeMin = 5;
    var bSizeMax = 50;

    function render(_data) {

        // find max value for x
        var max_x = Math.max.apply(Math, _data.map(function (o) {
            return o.x;
        }))
        // find max value for y
        var max_y = Math.max.apply(Math, _data.map(function (o) {
            return o.y;
        }))

        // find min value for x
        var min_x = Math.min.apply(Math, _data.map(function (o) {
            return o.x;
        }))
        // find min value for y
        var min_y = Math.min.apply(Math, _data.map(function (o) {
            return o.y;
        }))

        // define x 
        x = d3.scaleLinear()
            .domain([min_x, max_x])
            .range([margin, width - margin]);
        // define y
        y = d3.scaleLinear()
            .domain([max_y, min_y])
            .range([margin, height - margin]);
        // define circle size scale
        s = d3.scaleLinear()
            .domain([0, Math.max.apply(Math, data.map(function (o) {
                return o.s;
            }))])
            .range([bSizeMin, bSizeMax]);
        // remove old axis
        svg.selectAll("g").remove();

        xAxis = d3.axisBottom(x)

        yAxis = d3.axisLeft(y)

        // Add axes.  First the X axis.
        gX = svg.append("g")
            .attr("id", "x-axis")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (height - margin) + ")")
            .call(xAxis);

        // gridX = svg.append("g")
        //     .attr("class", "grid")
        //     .attr("transform", "translate(0," + height + ")")
        //     .call(xAxis.ticks(5)
        //         .tickSize(-height)
        //         .tickFormat("")
        //     );

        // Now the Y axis.
        gY = svg.append("g")
            .attr("id", "y-axis")
            .attr("class", "axis")
            .attr("transform", "translate(" + margin + ",0)")
            .call(yAxis);

        // gridY = svg.append("g")
        //     .attr("class", "grid")
        //     .call(yAxis.ticks(5)
        //         .tickSize(-width)
        //         .tickFormat("")
        //     );

        // Render the scatterplot.
        var circles = svg.selectAll("circle").data(_data, function (d) {
            return d.id;
        });

        circles.exit()
            .transition()
            .duration(250)
            .attr("r", 0)
            .remove();

        points = circles.enter().append("circle")
            .attr("r", 0)
            .attr("cx", function (d) {
                return x(d.x);
            })
            .attr("cy", function (d) {
                return y(d.y);
            })
            .attr("r", function (d) {
                return s(d.s)
            })
            .each(function (d) {
                if (d.x >= 0 && d.y >= 0) {
                    d3.select(this)
                        .style('fill', 'green')
                        .style('fill-opacity', 0.6)
                        .style('stroke', 'green');
                } else if (d.x <= 0 && d.y >= 0) {
                    d3.select(this)
                        .style('fill', 'red')
                        .style('fill-opacity', 0.6)
                        .style('stroke', 'red');
                } else if (d.x < 0 && d.y < 0) {
                    d3.select(this).style('fill', 'orange')
                        .style('fill-opacity', 0.6)
                        .style('stroke', 'orange');
                } else if (d.x > 0 && d.y < 0) {
                    d3.select(this).style('fill', 'blue')
                        .style('fill-opacity', 0.6)
                        .style('stroke', 'blue');
                }
            })
            .on("mouseover", function (d) {
                $("#country-name").hide();
                $("#hover-country").html(d.country + "<br> Avg expenditure change: " + d.y.toFixed(2) + "%<br>Avg tourist change: " + d.x.toFixed(2) + "%"+ "<br>Ending year expenditure: " + d.s.toFixed(2) + " $Mil").css({
                    opacity: 0.5
                });
            })
            .on("mouseout", function (d) {
                $("#country-name").show();
                $("#hover-country").empty();
            })
            .on("click", function (d) {
                focusCounrty(d);
                $("#hover-country").empty();
            })
    }

    function zoomed() {
        // create new scale ojects based on event
        var new_xScale = d3.event.transform.rescaleX(x);
        var new_yScale = d3.event.transform.rescaleY(y);
        // update axes
        gX.call(xAxis.scale(new_xScale));
        gY.call(yAxis.scale(new_yScale));
        // gridX.call(xAxis.ticks(5)
        //     .tickSize(-height)
        //     .tickFormat("").scale(new_xScale));
        // gridY.call(yAxis.ticks(5)
        //     .tickSize(-width)
        //     .tickFormat("").scale(new_yScale));
        points.data(generateData())
            .attr('cx', function (d) {
                return new_xScale(d.x)
            })
            .attr('cy', function (d) {
                return new_yScale(d.y)
            });
    }
    render(generateData());

})();