const COUNTRYLIMIT = 5;

$(document).ready(function () {
	// ############## Original ######################
	$('.js-example-basic-multiple-limit').select2({
		maximumSelectionLength: COUNTRYLIMIT,
		placeholder: "Search up to "+COUNTRYLIMIT+" countries"
	  });
	var c_sel = $("#country")
	var y_sel = $("#year")
	c_sel.empty()
	y_sel.empty()
	for (var i = 0; i < stats.length; i++) {
		c_sel.append('<option value="' + stats[i].country + '">' + stats[i].country + '</option>');
	}
	y_sel.append('<option value="All time">All time</option>')
	for (var i = 2014; i >= 1995; i--) {
		y_sel.append('<option value="' + i + '">' + i + '</option>');
	}

	
})

var old_selected_countries = [];

$(function(){
	$('#arrive-depart-1').change(function() {
		map.setAD($(this).val());
		map.selectCountries(old_selected_countries);
	})
})

$(function(){
	$('#year').change(function() {
		map.setYear($(this).val(), old_selected_countries);
	})
})

$(function(){
	$('.js-example-basic-multiple-limit').change(function() {
		map.selectCountries(old_selected_countries, $(this).val());
		old_selected_countries = $(this).val(); 
	})
})

class mapVis {
	
	constructor(stats, polys, main_map) {
		this.arrive_depart = "arrivals";
		this.year = "All time";
		this.stats = stats;
		this.polys = polys;
		this.main_map = main_map;

	}

	setAD(new_ad) {
		this.arrive_depart = new_ad;
		
		if(arguments[1]){
			this.render(arguments[1]);
		} else{
			this.render();	
		}	
	}

	setYear(new_year) {
		this.year = new_year;
		if(arguments[1]){
			this.render(arguments[1]);
		} else{
			this.render();	
		}
	}
	
	calculate(arrive_depart, year){
		var thisvis = this;
		var arrive_depart = thisvis.arrive_depart;
		var year = thisvis.year;
		var main_map = thisvis.main_map;
		var stats = this.stats;

		var holder = [];
		var averages = {};
		
		stats.forEach(function(a){				
		    if(year === "All time"){
				var all = [];
				
				var years= [1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003,2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014];
				
				for(var i = 0; i<years.length; i++){
					var value = a[arrive_depart][years[i]];
					
					if (value !== ""){
						all.push(a[arrive_depart][years[i]]);
					}
				}
				
				var sum = 0;
				
				for(i=0; i<all.length; i++){
					sum += all[i];
				}
				
				var average = sum/all.length;
				
				if(Number.isNaN(average) == false){
					averages[a.country] = average;
					holder.push(average);
				}
				
			} else{
				if((a !== undefined) && (a[arrive_depart] !== undefined) && (a[arrive_depart][year] !== "") && (Number.isNaN(a[arrive_depart][year]) == false)){
					holder.push(a[arrive_depart][year]);
				}
			}	
		});
		
		var max = 0;
		var min = 0;
		
		if(year==="All time"){
			max = Math.max.apply(Math, Object.values(averages));
			min = Math.min.apply(Math, Object.values(averages));
		} else {
			max =  Math.max.apply(Math, holder);
			min = Math.min.apply(Math, holder);
		}
		
		return [holder, averages, min, max];
			
	}
	
	setColorScale(min, max){
		return d3.scaleLog().domain([min, max]).range(['#D6EAF8', '#21618C']);
	}

	render() {

		var thisvis = this;
		var arrive_depart = thisvis.arrive_depart;
		var year = thisvis.year;
		var main_map = thisvis.main_map;
		var stats = this.stats;
		var polys = this.polys;

		var [holder, averages, min, max] = this.calculate(arrive_depart, year);
		var color_scale = this.setColorScale(min, max);
				
		polys.eachLayer(function(layer){
			
			var data = stats.find(function (b) {
				return b.country.toLowerCase() == layer.feature.properties.name.toLowerCase();
			});
			
			var fill = "white";
			var opacity = 0;
				
			if(data !== undefined){
				
				if((year==="All time") && (averages[data.country] !== undefined)){					
					if(Number.isNaN(averages[data.country]) || averages[data.country]==0){
						fill="white";
						opacity = 0;
					} else {
						fill = color_scale(averages[data.country]);
						opacity = 0.8;
					}
					
				} else if ((data[arrive_depart] !== undefined) && (data[arrive_depart][year] !== undefined) && (data[arrive_depart][year] !== "")) {
					if(Number.isNaN(data[arrive_depart][year]) || data[arrive_depart][year]==0){
						fill="white";
						opacity = 0;
					} else{
						fill = color_scale(data[arrive_depart][year])
						opacity = 0.8;
					}
				}
			}
			
			layer.setStyle({color: "grey", weight: .1, fillColor:fill, fillOpacity: opacity});
			
		});
		
		var old_countries=arguments[0] || 0;
		
		if(old_countries!==0){
			this.selectCountries(old_countries);
		}
	}
	
	selectCountries(){
		var old_countries = arguments[0];
		var new_countries = arguments[1] || 0;
		
		if(new_countries !== 0){
			for(var i=0; i<new_countries.length; i++){
				if(old_countries.indexOf(new_countries[i]) > -1){
					continue;
			} else {				
				polys.eachLayer(function(layer){
					if(new_countries[i].toLowerCase()==layer.feature.properties.name.toLowerCase()){
						layer.setStyle({color: "orange", weight: 4});
					}
				});
			}
		}
		
		for(var b=0; b<old_countries.length; b++){
			if(new_countries.indexOf(old_countries[b]) < 0){				
				polys.eachLayer(function(layer){
					if(old_countries[i].toLowerCase()==layer.feature.properties.name.toLowerCase()){
							layer.setStyle({color: "grey", weight: .1});
						}
					});
				}
			}
		} else{
			for(var c= 0; c<old_countries.length; c++){
				polys.eachLayer(function(layer){
					if(old_countries[c].toLowerCase()==layer.feature.properties.name.toLowerCase()){
							layer.setStyle({color: "orange", weight: 4});
						}
					});
			}
		}
	}

}