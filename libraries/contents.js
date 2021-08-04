var colors = [
	{
		name:"Bar Chart",
		id:1,
		src:"bar_chart.js"
	},
	{
		name:"Grouped Bar Chart",
		id:2,
		src:"grouped_bar_chart.js"
	},
	{
		name:"Stacked Bar Chart",
		id:3,
		src:"stacked_bar_chart.js"
	}	
];


var content_options = colors.map(function(d) {
	return {
		value: d.id,
		label: d.name
	}
});
