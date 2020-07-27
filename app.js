// VARIABLES
// Indicate which "slide" or "position" we're on
let slide = 1;

let data1 = {};
let data2 = {};

async function main() {
    //create_pie_chart_svg();
    create_gdp_line_chart();
}

function handleClick(event, id) {
    $(event).addClass("active").siblings().removeClass("active");

    if (id == "1") {
        if (slide != "1") {
            slide = "1";
            let textNode =
                "United States Defence Spending vs. Rest of the World (2018)";
            document.getElementById("vis-title").textContent = textNode;

            create_pie_chart_svg();
        }
    } else if (id == "2") {
        if (slide != "2") {
            slide = "2";
            let textNode =
                "United States Defence Spending as % of GDP (1960 - 2018)";
            document.getElementById("vis-title").textContent = textNode;

            let bodyText =
                "Clearly, the overall defence budget as a percentage of GDP has been decreasing since 1960. However, there are some periods of dramatic increase.\n\nWe are going to analyze <b>four</b> key time periods of particular interest to understand how events unfolding at the time affected the US defence budget.";
            document.getElementById("explanation-text").innerHTML = bodyText;

            destroy_pie_chart();
            create_gdp_line_chart();
        }
    } else if (id == "3") {
        toggleData();
    }
}

async function create_gdp_line_chart() {
    const gdpSpending = await d3.csv("us_world_gdp_spending.csv", function (d) {
        return {
            Country: d["Country.Name"],
            Year: d3.timeParse("%Y")(d.Year),
            PercGDP: d.PercGDP,
        };
    });

    us_data = gdpSpending.filter(function (d) {
        return d.Country == "United States";
    });

    world_data = gdpSpending.filter(function (d) {
        return d.Country == "World";
    });

    const data = us_data;

    data2 = data;
    data1 = data.filter((elem) => {
        return elem.Year.getFullYear() < 2002;
    });

    console.log(data1);
    console.log(data2);

    // Set the dimensions of the SVG
    const width = 1000;
    const height = 500;
    //const margin = 50;

    const margin = { top: 25, bottom: 50, left: 50, right: 50 };

    // Find the maximum percGDP and Year for scales
    let maxGDP = d3.max(data, function (d) {
        return +d.PercGDP;
    });
    let maxYear = d3.max(data, function (d) {
        return +d.Year;
    });

    // Define X scale
    let x = d3
        .scaleTime()
        .domain(
            d3.extent(data, function (d) {
                return d.Year;
            })
        )
        .range([0, width - margin.left - margin.right]);

    // Define Y scale
    let y = d3
        .scaleLinear()
        .domain([0, Math.floor(maxGDP + 1)])
        .range([height - margin.top - margin.bottom, 0]);

    // Define initial x scale for transition
    let x2 = d3
        .scaleTime()
        .domain(
            d3.extent(data, function (d) {
                return d.Year;
            })
        )
        .range([0, 0]);

    // Define initial y scale for transition
    let y2 = d3
        .scaleLinear()
        .domain([0, Math.floor(maxGDP + 1)])
        .range([
            height - margin.top - margin.bottom,
            height - margin.top - margin.bottom,
        ]);

    // Add color scale
    let colScale = d3
        .scaleLinear()
        .domain([0, Math.floor(maxGDP + 1)])
        .range(["white", "#d21f3c"]);

    // Add a "g" element to the svg
    let svg = d3
        .select(".main-svg")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Add the X and Y axis
    // The y-axis
    let yAxis = d3
        .select(".main-svg")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(d3.axisLeft(y2).ticks(0))
        .transition()
        .duration(1000)
        .call(d3.axisLeft(y).ticks(0))
        .transition()
        .call(d3.axisLeft(y));

    let translate = height - margin.bottom;
    let xAxis = d3
        .select(".main-svg")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + translate + ")")
        .call(d3.axisBottom(x2).ticks(0))
        .transition()
        .duration(1000)
        .call(d3.axisBottom(x).ticks(0))
        .transition()
        .call(d3.axisBottom(x).ticks(20));

    // Add Y-Axis title
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("class", "axis-title")
        .attr(
            "transform",
            "translate(0" + "," + (height - height / 2) / 2 + ")rotate(-90)"
        )
        .attr("y", -75)
        .attr("x", 0)
        .transition()
        .duration(1000)
        .attr("y", -30)
        .attr("x", 0)
        .text("% of GDP Spent on Defense");

    // Add X axis title
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("class", "axis-title")
        .attr("x", width / 2 - 25)
        .attr("y", height)
        .transition()
        .duration(1000)
        .attr("x", width / 2 - 25)
        .attr("y", height - margin.bottom + 10)
        .text("Year");

    // Add points for US data
    let points = svg
        .selectAll(".point")
        .data(data2)
        .enter()
        .append("circle")
        .attr("class", "point")
        .attr("fill", (d) => colScale(d.PercGDP));

    points
        .attr("r", 0)
        .attr("cx", (d) => x(d.Year))
        .attr("cy", (d) => y(0))
        .transition()
        .delay(500)
        .duration(1000)
        .attr("r", 4)
        .attr("cx", (d) => x(d.Year))
        .attr("cy", (d) => y(d.PercGDP));

    points
        .on("mouseover", function (d) {
            //console.log(d3.select(this));
            d3.select(this).transition().attr("r", 8);

            let current = this;

            let others = d3.selectAll(".point").filter(function (d) {
                return current != this;
            });
            //others.transition().duration(500).attr("fill", "grey");
            console.log(d);
            // Add Country header to Tooltip
            tooltip
                .select(".country")
                .html("<h6>" + d.Year.getFullYear() + "</h6>")
                .style("color", "black");

            // Add Spending for that Country to tooltip
            let amount = parseFloat(d.PercGDP).toFixed(2);
            tooltip
                .select(".spending")
                .html("<b>% of GDP: </b>" + amount + "%");

            // Make tooltip visible when hovering over slice
            tooltip.style("display", "block");
            tooltip.transition().duration(250).style("opacity", 2);
        })
        .on("mouseout", function (d) {
            d3.select(this).transition().attr("r", 4);
            // Hide tooltip on mouse exit from slice
            tooltip.style("display", "none");
            tooltip.style("opacity", 0);
        })
        .on("mousemove", function (d) {
            tooltip
                .style("top", d3.event.layerY + 20 + "px")
                .style("left", d3.event.layerX + "px");
        });

    let lines = svg
        .selectAll(".line-point")
        .data(data2)
        .enter()
        .append("line")
        .attr("x1", (d) => x(d.Year))
        .attr("x2", (d) => x(d.Year))
        .attr("y1", (d) => y(d.PercGDP))
        .attr("y2", (d) => y(d.PercGDP));

    lines
        .transition()
        .delay(1250)
        .duration(500)
        .attr("y2", (d) => height - margin.bottom - margin.top)
        .style("stroke", (d) => colScale(d.PercGDP))
        .attr("stroke-width", 1.5);

    lines.on("mouseover", (d) => {
        //console.log(d);
    });

    // Make tooltip
    let tooltip = d3
        .select(".svg1-container")
        .append("div")
        .attr("class", "tooltip");
    tooltip.append("div").attr("class", "country");
    tooltip.append("div").attr("class", "spending");
}

async function create_gdp_line_chart2() {
    const gdpSpending = await d3.csv("us_world_gdp_spending.csv", function (d) {
        return {
            Country: d["Country.Name"],
            Year: d3.timeParse("%Y")(d.Year),
            PercGDP: d.PercGDP,
        };
    });

    us_data = gdpSpending.filter(function (d) {
        return d.Country == "United States";
    });

    world_data = gdpSpending.filter(function (d) {
        return d.Country == "World";
    });

    const data = us_data;

    data2 = data;
    data1 = data.filter((elem) => {
        return elem.Year.getFullYear() < 2002;
    });

    console.log(data1);
    console.log(data2);

    // Set the dimensions of the SVG
    const width = 1000;
    const height = 500;
    const margin = 50;

    // Find the maximum percGDP and Year for scales
    let maxGDP = d3.max(data, function (d) {
        return +d.PercGDP;
    });
    let maxYear = d3.max(data, function (d) {
        return +d.Year;
    });

    // Define X scale
    let x = d3
        .scaleTime()
        .domain(
            d3.extent(data, function (d) {
                return d.Year;
            })
        )
        .range([0, width - 2 * margin]);

    // Define Y scale
    let y = d3
        .scaleLinear()
        .domain([0, Math.floor(maxGDP + 1)])
        .range([height - 2 * margin, 0]);

    // Define initial x scale for transition
    let x2 = d3
        .scaleTime()
        .domain(
            d3.extent(data, function (d) {
                return d.Year;
            })
        )
        .range([0, 0]);

    // Define initial y scale for transition
    let y2 = d3
        .scaleLinear()
        .domain([0, Math.floor(maxGDP + 1)])
        .range([0, 0]);

    // Add color scale
    let colScale = d3
        .scaleLinear()
        .domain([0, Math.floor(maxGDP + 1)])
        .range(["white", "#d21f3c"]);

    // Add a "g" element to the svg
    let svg = d3
        .select(".main-svg")
        .append("g")
        .attr("transform", "translate(" + margin + "," + margin + ")");

    // Add the X and Y axis
    // The y-axis
    let yAxis = d3
        .select(".main-svg")
        .append("g")
        .attr("transform", "translate(" + margin + "," + margin + ")")
        .call(d3.axisLeft(y2).ticks(0))
        .transition()
        .duration(1000)
        .call(d3.axisLeft(y).ticks(0))
        .transition()
        .call(d3.axisLeft(y));

    let translate = height - margin;
    let xAxis = d3
        .select(".main-svg")
        .append("g")
        .attr("transform", "translate(" + margin + "," + translate + ")")
        .call(d3.axisBottom(x2).ticks(0))
        .transition()
        .duration(1000)
        .call(d3.axisBottom(x).ticks(0))
        .transition()
        .call(d3.axisBottom(x).ticks(20));

    svg.append("text")
        .attr("text-anchor", "end")
        .attr("class", "axis-title")
        .attr(
            "transform",
            "translate(0" + "," + (height - height / 2) / 2 + ")rotate(-90)"
        )
        .attr("y", -75)
        .attr("x", 0)
        .transition()
        .duration(1000)
        .attr("y", -25)
        .attr("x", 0)
        .text("% of GDP Spent on Defense");

    // Add X axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("class", "axis-title")
        .attr("x", width / 2 - 25)
        .attr("y", height)
        .transition()
        .duration(1000)
        .attr("x", width / 2 - 25)
        .attr("y", height - margin - 10)
        .text("Year");

    // Add points for US data
    let points = svg
        .selectAll(".point")
        .data(data1)
        .enter()
        .append("circle")
        .attr("class", "point")
        .attr("fill", (d) => colScale(d.PercGDP));

    points
        .attr("r", 0)
        .attr("cx", (d) => x(d.Year))
        .attr("cy", (d) => y(0))
        .transition()
        .delay(1000)
        .duration(1000)
        .attr("r", 3)
        .attr("cx", (d) => x(d.Year))
        .attr("cy", (d) => y(d.PercGDP));

    points
        .on("mouseover", (a, b, c) => {})
        .on("mouseout", (d) => {})
        .on("mousemove", (d) => {});

    let lines = svg
        .selectAll(".line-point")
        .data(data1)
        .enter()
        .append("line")
        .attr("x1", (d) => x(d.Year))
        .attr("x2", (d) => x(d.Year))
        .attr("y1", (d) => y(d.PercGDP))
        .attr("y2", (d) => y(d.PercGDP));

    lines
        .transition()
        .delay(3000)
        .duration(500)
        .attr("y2", (d) => height - 2 * margin)
        .style("stroke", (d) => colScale(d.PercGDP))
        .attr("stroke-width", 1);
    lines.on("mouseover", (d) => {
        console.log(d);
    });

    /** To Change Dataset!
     *     let u = svg.selectAll(".point").data(data2);
    let points2 = svg
        .selectAll(".point")
        .data(data2)
        .enter()
        .append("circle")
        .attr("class", "point")
        .attr("cx", (d) => x(d.Year))
        .attr("cy", (d) => y(0))
        .transition()
        .duration(1000)
        .attr("cx", (d) => x(d.Year))
        .attr("cy", (d) => y(d.PercGDP))
        .attr("r", 3);
     */

    //data = [];
    // let path = svg
    //     .selectAll("path")
    //     .data([
    //         data.filter((d) => {
    //             return d.Year.getFullYear() < 2002;
    //         }),
    //     ])
    //     .enter()
    //     .append("path")
    //     .attr("class", "year-point")
    //     .attr("fill", "none")
    //     .attr("stroke", "dodgerblue")
    //     .attr("stroke-width", 1.5)
    //     .attr(
    //         "d",
    //         d3
    //             .line()
    //             .x((d) => 0)
    //             .y((d) => 0)
    //     )
    //     .transition()
    //     .duration(2000)
    //     .attr(
    //         "d",
    //         d3
    //             .line()
    //             .x((d) => x(d.Year))
    //             .y((d) => y(d.PercGDP))
    //     );

    // var n = svg
    //     .selectAll(".year-point")
    //     .data(data)
    //     .enter()
    //     .append("path")
    //     .attr("class", "year-point")
    //     .attr("fill", "none")
    //     .attr("stroke", "dodgerblue")
    //     .attr("stroke-width", 1.5)
    //     .attr(
    //         "d",
    //         d3
    //             .line()
    //             .x((d) => x(d.Year))
    //             .y((d) => y(d.PercGDP))
    //     );

    //path.on("mouseover", (d, i) => {
    //console.log(d);
    //console.log(i);
    //});

    // svg.append("text")
    //     .attr("text-anchor", "end")
    //     .attr(
    //         "transform",
    //         "translate(" +
    //             5 / 2 +
    //             "," +
    //             (height - height / 2) / 2 +
    //             ")rotate(-90)"
    //     )
    //     .attr("y", -margin + 10)
    //     .attr("x", -margin + 20)
    //     .text("% of GDP Spent on Defense");

    // // Add X axis label:
    // svg.append("text")
    //     .attr("text-anchor", "end")
    //     .attr("x", width - 500)
    //     .attr("y", height + margin / 2 + 20)
    //     .text("Year");

    // Add the line for World data
    // svg.append("path")
    //     .datum(world_data)
    //     .attr("fill", "none")
    //     .attr("stroke", "steelblue")
    //     .attr("stroke-width", 1.5)
    //     .attr(
    //         "d",
    //         d3
    //             .line()
    //             .x(function (d) {
    //                 return x(d.Year);
    //             })
    //             .y(function (d) {
    //                 return y(d.PercGDP);
    //             })
    //     );

    //handleHover(svg, width, height, x, y, data);
}

function toggleData() {
    let u = d3.selectAll(".point").data(data2);
    u.enter()
        .append("circle")
        .merge(u)
        .transition()
        .duration(1000)
        .attr("cx", (d) => x(d.Year))
        .attr("cy", (d) => y(d.PercGDP))
        .attr("r", 5);
}

async function create_pie_chart_svg() {
    const data = await d3.csv("total_spending.csv", function (d) {
        return {
            Country: d["Country"],
            Year: parseInt(d.Year),
            TotalSpending: parseInt(d.TotalSpending),
        };
    });

    // Set the dimensions of the SVG
    const width = 1000;
    const height = 500;
    const margin = 25;
    let radius = Math.min(width, height) / 2 - margin;

    // Define an ordinal scale for colors
    let colScale = d3.scaleOrdinal().domain(data).range(["#457b9d", "#d62828"]);

    data_2018 = data.filter((data) => {
        return data.Year == 2018;
    });

    // Specify the div to fill with the chart
    let svg = d3
        .select(".main-svg")
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // Get slice size for each country's slice based on spending
    let pieChart = d3
        .pie()
        .value((d) => d.TotalSpending)
        .sort(null);

    // Create arc variables for expansion, decrease and enlarge
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);
    let arcClose = d3.arc().innerRadius(0).outerRadius(1);
    let arcLarge = d3
        .arc()
        .innerRadius(0)
        .outerRadius(radius + 25);

    // Path = the pie-chart with data associated with slices
    let path = svg
        .selectAll(".arc")
        .data(pieChart(data_2018))
        .enter()
        .append("g")

        .append("path")
        .attr("class", "arc")
        .attr("d", arcClose)
        .attr("fill", (d) => colScale(d.data.TotalSpending))
        .attr("stroke", "white")
        .style("stroke-width", "2px");

    // Add "Mouse Over" Handler
    path.on("mouseover", function (d) {
        let spending = (d.data.TotalSpending / 1000000000).toFixed(1);

        // Add Country header to Tooltip
        tooltip
            .select(".country")
            .html("<h6>" + d.data.Country + "</h6>")
            .style("color", "black");

        // Add Spending for that Country to tooltip
        tooltip
            .select(".spending")
            .html("<b>Total Spending: $</b>" + spending + "B USD");

        // Make tooltip visible when hovering over slice
        tooltip.style("display", "block");
        tooltip.style("opacity", 2);

        // Make slice slightly larger for emphasis on hover
        d3.select(this).transition().attr("d", arcLarge);

        let current = this;
        let others = d3.selectAll(".arc").filter(function (d) {
            return current != self;
        });
        //others.transition().attr("opacity", 0.3);
    });

    // "Mouse Move" Handler
    path.on("mousemove", function (d) {
        // Move tooltip near new mouse location
        tooltip
            .style("top", d3.event.layerY + 20 + "px")
            .style("left", d3.event.layerX + "px");
    });

    // "Mouse Exit" Handler
    path.on("mouseout", function () {
        // Hide tooltip on mouse exit from slice
        tooltip.style("display", "none");
        tooltip.style("opacity", 0);

        // Reduce slice back to original size
        d3.select(this).transition().attr("d", arcGenerator);
    });

    // Transition the pie-chart in
    path.transition().duration(1500).attr("d", arcGenerator);

    // Add country label to each slice
    svg.selectAll("text")
        .data(pieChart(data_2018))
        .enter()
        .append("text")
        .classed("pieText", true)
        .each(function (d) {
            let xVal = 0;
            let yVal = 0;
            center = arcGenerator.centroid(d);

            if (d.data.Country == "World") {
                xVal = center[0];
                yVal = center[1] + 20;
            } else {
                xVal = center[0] - 25;
                yVal = center[1] + 20;
            }

            d3.select(this)
                .attr("x", xVal)
                .attr("y", yVal)
                .text(d.data.Country);
        });

    // Make tooltip
    let tooltip = d3
        .select(".svg1-container")
        .append("div")
        .attr("class", "tooltip");
    tooltip.append("div").attr("class", "country");
    tooltip.append("div").attr("class", "spending");

    // Create annotation and transition in
    svg.append("line")
        .attr("class", "annotation-line2")
        .attr("x1", 490)
        .attr("x2", 490)
        .attr("y1", 65)
        .attr("y2", 65)
        .transition()
        .delay(1000)
        .duration(500)
        .attr("x1", 240)
        .attr("x2", 490)
        .attr("y1", 65)
        .attr("y2", 65)
        .style("stroke", "black")
        .attr("stroke-width", 1);

    svg.append("line")
        .transition()
        .delay(600)
        .attr("class", "annotation-line1")
        .attr("x1", 240)
        .attr("x2", 240)
        .attr("y1", 65)
        .attr("y2", 65)
        .transition()
        .delay(500)
        .duration(500)
        .attr("x1", 125)
        .attr("x2", 240)
        .attr("y1", -10)
        .attr("y2", 65)
        .style("stroke", "black")
        .attr("stroke-width", 1);

    svg.append("text")
        .attr("class", "annotations")
        .attr("x", 242)
        .attr("y", 500)
        .transition()
        .delay(1000)
        .duration(2000)
        .attr("x", 242)
        .attr("y", 85)
        .text("In 2018, the United States accounted for");
    svg.append("text")
        .attr("class", "annotations")
        .attr("x", 242)
        .attr("y", 500)
        .transition()
        .delay(1000)
        .duration(2000)
        .attr("x", 242)
        .attr("y", 105)
        .text("approximately 36.4% of total worldwide");
    svg.append("text")
        .attr("class", "annotations")
        .attr("x", 242)
        .attr("y", 500)
        .transition()
        .delay(1000)
        .duration(2000)
        .attr("x", 242)
        .attr("y", 125)
        .text("military spending.");

    // let count = 1;
    // svg.selectAll(".annotations")
    //     .each((d) => {
    //         console.log(d);
    //     })
    //     .transition()
    //     .duration(1500)
    //     .attr("y", 1000)
    //     .remove();
}

function top_countries_bar_chart(data) {
    x = d3.scaleOrdinal().domain(["World", "United States"]).range([0, width]);

    y = d3.scaleLinear().domain([0, 12000000000]).range([height, 0]);
}

function handleHover(svg, width, height, x, y, data) {
    //const tooltip = svg.append("g");

    var focus = svg
        .append("g")
        .append("circle")
        .style("fill", "none")
        .attr("stroke", "black")
        .attr("r", 8.5)
        .style("opacity", 0);

    // Create the text that travels along the curve of chart
    var focusText = svg
        .append("g")
        .append("text")
        .style("opacity", 0)
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle");

    svg.append("rect")
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout);

    function mouseover() {
        focus.style("opacity", 1);
        focusText.style("opacity", 1);
    }

    function mousemove() {
        let bisect = d3.bisector(function (d) {
            return x(d.Year);
        }).left;

        var x0 = x(x.invert(d3.mouse(this)[0]));
        //console.log(x0);

        let i = bisect(data, x0, 1);
        //console.log(i);

        selectedData = data[i - 1];
        //console.log(selectedData);

        focus
            .attr("cx", x(selectedData.Year))
            .attr("cy", y(selectedData.PercGDP));
        focusText
            .html(
                "Year: " +
                    selectedData.Year.getFullYear() +
                    "  -  " +
                    "% GDP: " +
                    parseFloat(selectedData.PercGDP).toFixed(2)
            )
            .attr("x", x(selectedData.Year) + 15)
            .attr("y", y(selectedData.PercGDP));

        // const { year, pct_gdp } = d3.bisector(d3.mouse(this)[0]);
        // console.log(pct_gdp);

        // tooltip
        //     .attr("transform", `translate(${x(year)},${y(pct_gdp)})`)
        //     .call(callout, `${pct_gdp}${year}`);
    }

    function mouseout() {
        focus.style("opacity", 0);
        focusText.style("opacity", 0);
    }
}

function destroy_pie_chart() {
    let arcClose = d3.arc().innerRadius(0).outerRadius(1);

    d3.selectAll(".annotation-line1")
        .transition()
        .duration(500)
        .attr("x1", 240)
        .attr("y1", 65)
        .remove();

    d3.selectAll(".annotation-line2")
        .transition()
        .delay(500)
        .duration(500)
        .attr("x1", 490)
        .remove();

    d3.selectAll(".annotations")
        .transition()
        .duration(1500)
        .attr("y", 500)
        .remove();

    //d3.selectAll("path").transition().attr("fill", "white");
    d3.selectAll("path")
        .transition()
        .duration(1500)
        .attr("d", arcClose)
        .remove();

    d3.transition().delay(2000).selectAll("g").remove();
    d3.select(".tooltip").remove();
    d3.transition().delay(2000).selectAll(".pieText").remove();
}

function destroy_line_chart() {
    let arcClose = d3.arc().innerRadius(0).outerRadius(1);

    d3.selectAll(".annotation-line1")
        .transition()
        .duration(500)
        .attr("x1", 240)
        .attr("y1", 65)
        .remove();

    d3.selectAll(".annotation-line2")
        .transition()
        .delay(500)
        .duration(500)
        .attr("x1", 490)
        .remove();

    d3.selectAll(".annotations")
        .transition()
        .duration(1500)
        .attr("y", 500)
        .remove();

    //d3.selectAll("path").transition().attr("fill", "white");
    d3.selectAll("path")
        .transition()
        .duration(1500)
        .attr("d", arcClose)
        .remove();

    d3.transition().delay(2000).selectAll("g").remove();
    d3.select(".tooltip").remove();
    d3.transition().delay(2000).selectAll(".pieText").remove();
}
