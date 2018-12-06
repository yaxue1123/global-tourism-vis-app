$(document).ready(function(){
	// ######################### Graph 2: Tourists among Time ##############################
	// Display summary of all countries arrival tourists data at default.
	year_tourists(null, "arrivals");

	// Change as the user chooses in or out expenditure.
	// Change as the user select countries.
	$("#arrive-depart-1, #country").change(function () {
		$("#vis_canvas1").empty();

		// Selection: country.
		// An array to store all selected countries.
		let country_arr = new Array();
		let country_obj = $("#country").select2("data");
		for (let i = 0; i < country_obj.length; i++) {
			country_arr.push(country_obj[i].id);
		}

		if ($("#arrive-depart-1").val() === "arrivals") {
			if (country_arr.length > 0) {
				$("#graph2-title").text("Selected In-bound Tourists");
				year_tourists(country_arr, "arrivals");
			} else {
				$("#graph2-title").text("Global In-bound Tourists");
				year_tourists(null, "arrivals");
			}
		} else if ($("#arrive-depart-1").val() === "departures") {
			if (country_arr.length > 0) {
				$("#graph2-title").text("Selected Out-bound Tourists");
				year_tourists(country_arr, "departures");
			} else {
				$("#graph2-title").text("Global Out-bound Tourists");
				year_tourists(null, "departures");
			}
		}

		// update tooltip.
		$('[data-toggle="tooltip"]').tooltip();
	});

	// Process tourism data.
	// Return year and total in/ out travel data. 
	function year_tourists(_country, _subset) {
		// The tourism dataset is a list of tourism data objects of different countries.  
		// Pull in_travel or out_travel data.
		let travel = stats.map(function (d) {
			return d[_subset];
		});

		let year_travel = [];
		// If no selected country, display the global total tourists among all countries.
		if (_country === null) {
			// Get an array of dic of 217 countries in/ out travel data from 1995 to 2014.
			// Calculate each year's travel summary.
			// Store in a dic.
			for (let i = 1995; i < 2015; i++) {
				let total_travel = 0;
				total_travel = travel.reduce((acc, t) => acc + ((t[i] === "" || isNaN(t[i])) ? 0 : t[i]), 0);
				year_travel[i] = total_travel;
			}


			// Transformed to key-value pair.
			year_travel = Object.keys(year_travel).map(function (key) {
				return {
					id: key,
					value: this[key],
					country: "ALL"
				};
			}, year_travel);
		} else {
			// Draw multiple line charts for countries.
			// Get country id from courtry name array.
			let country_name = stats.map(function (d) {
				return d["country"];
			});
			// Store each country's tourist data based on year with key-value-country pairs.
			for (let j = 0; j < _country.length; j++) {
				let country_id = country_name.indexOf(_country[j]);
				for (let i = 1995; i < 2015; i++) {
					year_travel.push({
						id: i,
						value: travel[country_id][i] === "" ? 0 : travel[country_id][i],
						country: _country[j]
					});
				}
			}
		}

		// Pass a list of objects including id, value and country for each item.
		time_vis = new TimeVis(year_travel);
		time_vis.render();
	}

	// ######################### Graph 3: Expenditure Rank by Country ##############################
	// Show in expenditure and all time by default.
	show_expenditure(null, "in_expenditure", "All time");

	// Change as user chooses in or out expenditure and different time range.
	// Store selected country names in an array.
	// Calling select2('data') will return a JavaScript array of objects 
	// representing the current selection.
	$("#arrive-depart-1, #year, #country").change(function () {
		$(".bar").remove();

		let country_arr = new Array();
		let country_obj = $("#country").select2("data");
		for (let i = 0; i < country_obj.length; i++) {
			country_arr.push(country_obj[i].id);
		}

		if ($("select").val() === "arrivals") {
			if (country_arr.length > 0) {
				$("#graph3-title").text("Selected In-expenditure - " + $("#year").val());
				show_expenditure(country_arr, "in_expenditure", $("#year").val());
			} else {
				$("#graph3-title").text("Global In-expenditure Top 5 - " + $("#year").val());
				show_expenditure(null, "in_expenditure", $("#year").val());
			}
		} else if ($("select").val() === "departures") {
			if (country_arr.length > 0) {
				$("#graph3-title").text("Selected Out-expenditure - " + $("#year").val());
				show_expenditure(country_arr, "out_expenditure", $("#year").val());
			} else {
				$("#graph3-title").text("Global Out-expenditure Top 5 - " + $("#year").val());
				show_expenditure(null, "out_expenditure", $("#year").val());
			}
		}
	});

	/* 
		Input: user selected country name array, arrival/ departure, year.
		Output: Key-value pair of country id and average expenditure. 
	*/
	function show_expenditure(_country, _subset, _year) {
		// The tourism dataset is a list of tourism data objects of different countries.  
		// Step1: choose arrivals or departures.
		let expenditure = stats.map(function (d) {
			return d[_subset];
		});

		// Then get array of numbers. 
		// Step2: Decide year scope and calculate average expenditure.
		let sub_expenditure;
		if (_year === "All time") {
			sub_expenditure = expenditure.map(function (d) {
				let sum = 0;
				let count = 0;
				for (let i = 1995; i < 2015; i++)
					if (d[i] != "") {
						count++;
						sum += parseInt(d[i]);
					}
				return count != 0 ? Math.round(sum / count) : 0;
			});
		} else {
			sub_expenditure = expenditure.map(function (d) {
				return d[_year] !== '..' ? d[_year] : 0;
			});
		}

		// Step3: Decide top 5 or user selected n.
		let id_avg = Object.keys(sub_expenditure).map(function (key) {
			return {
				key: key,
				value: this[key]
			};
		}, sub_expenditure);

		let expenditure_vis;
		if (_country === null) {
			// Get top n (based on user input, 10 at default) countries. Store index.
			// Sort.
			id_avg.sort(function (p1, p2) {
				return p2.value - p1.value;
			})
			// Get key-value pair (key: country id, value: average expenditure).
			let top_expenditure = id_avg.slice(0, 5);
			expenditure_vis = new ExpenditureVis(top_expenditure);
		} else {
			// Get country id from courtry name array.
			let country_name = stats.map(function (d) {
				return d["country"];
			});
			let select_expenditure = [];
			_country.map(function (d) {
				select_expenditure.push(id_avg[country_name.indexOf(d)]);
			});
			expenditure_vis = new ExpenditureVis(select_expenditure);
		}

		expenditure_vis.render();
	};

	// Initialize tooltip after d3 rendering.	
	$('[data-toggle="tooltip"]').tooltip();
})

class TimeVis{
    constructor(data){
        this.data = data;
    }

    render(){
        // Define scales.
        let x = d3.scaleLinear()
            .domain([1994,2014])
            .range([50,450]);
        
        // Calculate the minimum and maximum value of the tourist data.
        let min_tourists = d3.min(this.data, function(d) { return d.value; });
        let max_tourists = d3.max(this.data, function(d) { return d.value; });
        let y = d3.scaleLinear()
            .domain([max_tourists,min_tourists])
            .range([5,330]);

        // There are at most 5 categories of colors representing differnt countries.
        let country_color = d3.scaleOrdinal(d3.schemeCategory10);

        // Get a reference to the SVG element.
        let svg = d3.select("#vis_canvas1");

        // Define x-axis, y-axis and add axes.
        // First append x-axis and label.
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0,"+(330)+")")
            .call(d3.axisBottom(x).ticks(10, ""));
        
        svg.append("text")
            .attr("class", "axis-label")
            .attr("y", 375)
            .attr("x", 220)
            .style("text-anchor", "middle")
            .text("Year");
        
        // Then append y-axis and label.
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate("+ 50 +",0)")
            .call(d3.axisLeft(y).ticks(10, "~s"));
            
        svg.append("text")
            .attr("transform", "rotate(90)")
            .attr("class", "axis-label")
            .attr("y", 0)
            .attr("x", 180)
            .style("text-anchor", "middle")
            .text("Total tourists");

		// Divide the data into groups of size 20 and then append path.
		// Each piece stands for a country.
        for (let i = 0; i < this.data.length / 20; i ++) {
			// slice: end not included.
            let slice_data_path = this.data.slice(i * 20, (i + 1) * 20);
			let filtered_slice_path = slice_data_path.filter((d) => d.value > 0);  
			let slice_data_circle = this.data.slice(i * 20, (i + 1) * 20 + 1);
            let filtered_slice_circle = slice_data_circle.filter((d) => d.value > 0);            

            // Filter not zero values and draw circle and line.
            // Special case: If all missing values, display as all as zero!
            // data: filter 0s out. If all 0, keep them all.
            if (filtered_slice_path.length === 0) {
                filtered_slice_path = slice_data_path;
			} 

			if (filtered_slice_circle.length === 0) {
                filtered_slice_circle = slice_data_circle;
			} 
			
            svg.append("path")
            .datum(filtered_slice_path)
            .attr("data-legend", function(d) { return d[0].country;})
            .attr("fill", "none")
            .attr("stroke", "grey")
            .attr("stroke-width", 0)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", d3.line()
                .x(d => x(d.id))
                .y(d => y(d.value)))
            .transition()
                .duration(750)
				.attr("stroke-width", 1.5);
				
			// Draw circles.
			let circles = svg.selectAll("circle").data(filtered_slice_circle, function(d) { return d.key;});
	
			circles.enter().append("circle")
				.attr("r", 0)
				.attr("cx", d => x(d.id))
				.attr("cy", d => y(d.value))
				.attr("data-toggle", "tooltip")
				.attr("data-original-title", function(d){
					return "Year: " + this.__data__.id + " Total: " + (this.__data__.value/1000).toFixed(2) + 
					"k Country:  " + this.__data__.country;
				})
				.style("fill", d => country_color(d.country))
				.transition()
					.duration(750)
					.attr("r", 4);
        }
    }
}

class ExpenditureVis {

    constructor(display_country_expenditure) {
        this.data = display_country_expenditure;
    }
    
    render() {
        // Calculate the maximum value of the expenditure data.
        let max_expenditure = d3.max(this.data, function(d) { return d.value; });
        // Define the scales.
        let x = d3.scaleLinear()
            .domain([0, max_expenditure])
            .range([0, 500]);
    
        let y = d3.scaleLinear()
            .domain([0, this.data.length])
            .range([0, 400]);
        
        let rank_color = d3.scaleOrdinal(d3.schemeCategory10);

        // Get a reference to the SVG element.
        let svg = d3.select("#vis_canvas2");

        // Data binding.
        let bar = svg.selectAll(".bar")
            .data(this.data)
            .enter().append("g")
            .attr("class", "bar");
        
        bar.append("rect")
            .attr("x", 0)
            .attr("y", function(d,i) {return y(i);})
            .attr("height", y(1)-y(0))
            .attr("width", function(d) {return x(d.value)})
            .style("fill", function(d, i) {return rank_color(i);})
            .style('fill-opacity', 0)
            .transition().duration(500)
                .style('fill-opacity', .6);

        bar.append("text")
            .attr("class", "bar-text")
            .attr("x", 5)
            .attr("y", function(d,i) {return y(i+0.5);})
            .text(function(d) { 
                return stats[d.key]["country"] + "  $" + (d.value > 0 ? (d.value + "M") : "NO DATA");
            })

    //    svg.append("g");
    }
        
}
