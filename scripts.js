document.addEventListener("DOMContentLoaded", function () {
  const req = new XMLHttpRequest();
  req.open(
    "GET",
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json",
    true
  );
  req.send();
  req.onload = function () {
    const json = JSON.parse(req.responseText);
    let dataset = json.monthlyVariance;

    dataset.forEach(function (d) {
      d.date = new Date(d.year, d.month - 1, 1, 0, 0);
    });

    dataset.forEach(function (d) {
      d.monthDate = new Date(1970, d.month - 1, 1, 0, 0);
    });

    dataset.forEach(function (d) {
      let baseTemp = 8.66;
      d.temperature = baseTemp + d.variance;
    });

    function toMonthName(monthNumber) {
      const date = new Date();
      date.setMonth(monthNumber - 1);
    
      return date.toLocaleString('en-US', {
        month: 'long',
      });
    }

    const colorScale = {
      "arctic": "#234ea0",
      "freezing": "#4a74b4",  //  3.25 - 4.74
      "colder": "#76abd0",  //  4.75 - 6.24
      "cold": "#abd6e8",  //  6.25 - 7.74
      "chill": "#dcf1ec", //  7.75 - 8.24
      "normal": "#faf8c0",  // 8.25 - 8.99
      "warm": "#fedc90",  //  9 - 9.49
      "hot": "#fcab64",   //  9.50 - 10.99
      "hotter": "#f16d43",  //  11.00 - 12.25
      "burning": "#a50026"  //  12.26 - 13.75
    }

    const w = 1000;
    const h = 500;
    const margin = { top: 40, right: 40, bottom: 150, left: 70 };
    const innerWidth = w - margin.left - margin.right;
    const innerHeight = h - margin.top - margin.bottom;

    const monthFormat = d3.timeFormat('%B');

    console.log(dataset);
    console.log(dataset[1].date);
    console.log(dataset[1].monthDate);
    console.log(d3.max(dataset, (d) => d.temperature))

    const xScale = d3
      .scaleTime()
      .domain([d3.min(dataset, (d) => new Date(d.year.toString())), d3.max(dataset, (d) => new Date(d.year.toString()))])
      .range([margin.left, w - margin.right]);

    const yScale = d3
      .scaleTime()
      .domain([d3.max(dataset, (d) => new Date(d.monthDate.toString())), d3.min(dataset, (d) => new Date(d.monthDate.toString()))])
      .range([h - margin.bottom, margin.top]);

    const legendScale = d3
      .scaleLinear()
      .domain([2, 14])
      .range([99, 400])

    const svg = d3
      .select("#graph")
      .append("svg")
      .attr("width", w)
      .attr("height", h);

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .attr("id", "tooltip")
      .style("opacity", 0);

    d3.select("svg")
      .selectAll("rect")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(new Date(d.year.toString())))
      .attr("y", (d) => yScale(new Date(d.monthDate.toString())))
      .attr("width", 3)
      .attr("height", (d) => yScale(d.month) - 10)
      .attr("fill", (d) =>
        d.temperature < 3.2 ? colorScale.arctic :
          d.temperature < 4.4 ? colorScale.freezing :
            d.temperature < 5.6 ? colorScale.colder :
              d.temperature < 6.8 ? colorScale.cold :
                d.temperature < 8 ? colorScale.chill :
                  d.temperature < 9.2 ? colorScale.normal :
                    d.temperature < 10.4 ? colorScale.warm :
                      d.temperature < 11.6 ? colorScale.hot :
                        d.temperature < 12.8 ? colorScale.hotter : colorScale.burning)
      .attr("class", "cell")
      .attr("data-month", (d) => d.month - 1)
      .attr("data-year", (d) => d.year)
      .attr("data-temp", (d) => d.temperature)
      .on("mouseover", function (d, i) {
        tooltip
          .html(
            i.year + " - " + toMonthName(i.month) + "<br>" + 
            "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + i.temperature.toFixed(2) + "<br>" + 
            "&nbsp;&nbsp;&nbsp;&nbsp;" + i.variance.toFixed(2)
          )
          .attr("data-year", i.year)
          .style("left", event.pageX + 5 + "px")
          .style("top", event.pageY - 50 + "px");
        tooltip.style("opacity", 0.9);
        tooltip.attr("id", "tooltip");
        var colorChange = d3.select(this);
        colorChange.style("stroke", "grey");
      })
      .on("mouseout", function () {
        var colorChange = d3.select(this);
        colorChange.style("stroke", "none")
        tooltip.style("opacity", 0);
      });

    /*svg.selectAll("text")
       .data(dataset)
       .enter()
       .append("text")
       .text((d) =>  (d[0] + "," + d[1]))
       .attr("x", (d) => xScale(d[0] + 10))
       .attr("y", (d) => yScale(d[1]))*/

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale).tickFormat(monthFormat);
    const legendAxis = d3.axisBottom(legendScale).tickFormat(x => `${x.toFixed(1)}`).tickValues([2, 3.2, 4.4, 5.6, 6.8, 8, 9.2, 10.4, 11.6, 12.8, 14])
      ;

    const yAxisGrid = d3
      .axisLeft(yScale)
      .tickSize(-innerWidth - 3)
      .tickFormat("")
      .ticks(10);

    svg
      .append("g")
      .attr("class", "y-axis-grid")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxisGrid)
      .style("opacity", 0.2);

    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${h - margin.bottom + 30})`)
      .call(xAxis);

    svg
      .append("g")
      .attr("id", "y-axis")
      .attr("transform", `translate(${margin.left}, 15)`)
      .call(yAxis);

    svg
      .append('g')
      .attr('id', 'legend')
      .attr('transform', `translate(100, 430)`);

    svg
      .append('g')
      .attr('id', 'legend-axis')
      .attr('transform', 'translate(0,455)')
      .call(legendAxis);

    svg
      .select('#legend').append('rect').attr('x', 0).attr('y', 0).attr('width', 30)
      .style('height', 20).style('opacity', 1).style('fill', colorScale.arctic).attr("stroke", "black")

    svg
      .select('#legend').append('rect').attr('x', 30).attr('y', 0).attr('width', 30)
      .style('height', 20).style('opacity', 1).style('fill', colorScale.freezing).attr("stroke", "black")

    svg
      .select('#legend').append('rect').attr('x', 60).attr('y', 0).attr('width', 30)
      .style('height', 20).style('opacity', 1).style('fill', colorScale.colder).attr("stroke", "black")

    svg
      .select('#legend').append('rect').attr('x', 90).attr('y', 0).attr('width', 30)
      .style('height', 20).style('opacity', 1).style('fill', colorScale.cold).attr("stroke", "black")

    svg
      .select('#legend').append('rect').attr('x', 120).attr('y', 0).attr('width', 30)
      .style('height', 20).style('opacity', 1).style('fill', colorScale.chill).attr("stroke", "black")

    svg
      .select('#legend').append('rect').attr('x', 150).attr('y', 0).attr('width', 30)
      .style('height', 20).style('opacity', 1).style('fill', colorScale.normal).attr("stroke", "black")

    svg
      .select('#legend').append('rect').attr('x', 180).attr('y', 0).attr('width', 30)
      .style('height', 20).style('opacity', 1).style('fill', colorScale.warm).attr("stroke", "black")

    svg
      .select('#legend').append('rect').attr('x', 210).attr('y', 0).attr('width', 30)
      .style('height', 20).style('opacity', 1).style('fill', colorScale.hot).attr("stroke", "black")

    svg
      .select('#legend').append('rect').attr('x', 240).attr('y', 0).attr('width', 30)
      .style('height', 20).style('opacity', 1).style('fill', colorScale.hotter).attr("stroke", "black")

    svg
      .select('#legend').append('rect').attr('x', 270).attr('y', 0).attr('width', 30)
      .style('height', 20).style('opacity', 1).style('fill', colorScale.burning).attr("stroke", "black")

  };
});
