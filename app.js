function svg1() {
    const DUMMY_DATA = [
        { id: "d1", value: 10, region: "USA" },
        { id: "d2", value: 11, region: "India" },
        { id: "d3", value: 12, region: "China" },
        { id: "d4", value: 6, region: "Germany" },
    ];

    let width = 250;
    let height = 200;
    const margin = 50;

    // We want to display the above data in a bar chart
    // prettier-ignore
    const container = d3.select(".svg-container").append("svg").classed("svg1", true)

    // These give us functions that give us information about the x and y axis where elements are to be positioned
    // prettier-ignore
    const xScale = d3
        .scaleBand()
        .domain(DUMMY_DATA.map((dataPoint) => dataPoint.region))
        .rangeRound([0, 250])
        .padding(0.1) //.padding(0.1) // scaleBand = Ordinal scale (non-continuous)
    const yScale = d3.scaleLinear().domain([0, 15]).range([200, 0]);

    // To avoid selecting the container as well, use a class to filter
    // prettier-ignore
    const bars = container
            .attr("width", width + 2 * margin)
            .attr("height", height + 2 * margin)
            .append("g")
            .attr("transform", "translate(" + margin + "," + margin + ")")
          .selectAll(".bar") // Select all .bar classed elements
          .data(DUMMY_DATA)   // Bind with data
          .enter()    // Get all elements not present already
          .append("rect")  // Add a div for each datum
          .classed('bar', true) // Add a .bar class to that new div
          .attr("fill", (data, i) => d3.schemeCategory10[i])
          .attr("width", xScale.bandwidth())
          .attr("height", (data) => height - yScale(data.value))
          .attr("x", data => xScale(data.region))
          .attr("y", data => yScale(data.value))

    // The y-axis
    container
        .append("g")
        .attr("transform", "translate(" + margin + "," + margin + ")")
        .call(d3.axisLeft(yScale));

    // The x-axis
    container
        .append("g")
        .attr(
            "transform",
            "translate(" + margin + "," + (height + margin) + ")"
        )
        .call(d3.axisBottom(xScale));
}

async function svg2() {
    let width = 250;
    let height = 200;
    let margin = 50;

    const xScale = d3.scaleLog().domain([10, 150]).range([0, width]);

    const yScale = d3.scaleLog().domain([10, 150]).range([height, 0]);

    const data = await d3.csv("https://flunky.github.io/cars2017.csv");
    //console.log(data);

    container = d3.select(".svg-container").append("svg").classed("sv2", true);

    const scatterplot = container
        .attr("width", width + 2 * margin)
        .attr("height", height + 2 * margin)
        .append("g")
        .attr("transform", "translate(" + margin + "," + margin + ")")
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (data) => xScale(parseInt(data.AverageCityMPG)))
        .attr("cy", (data) => yScale(parseInt(data.AverageHighwayMPG)))
        .attr("r", (data) => 2 + parseInt(data.EngineCylinders))
        .attr("fill", "lightblue")
        .attr("stroke", "black");

    // The y-axis
    container
        .append("g")
        .attr("transform", "translate(" + margin + "," + margin + ")")
        .call(
            d3
                .axisLeft(yScale)
                .tickValues([10, 20, 50, 100])
                .tickFormat(d3.format("~s"))
        );

    // The x-axis
    container
        .append("g")
        .attr(
            "transform",
            "translate(" + margin + "," + (height + margin) + ")"
        )
        .call(
            d3
                .axisBottom(xScale)
                .tickValues([10, 20, 50, 100])
                .tickFormat(d3.format("~s"))
        );
}

async function svg3() {
    // Read in data
    const data = await d3.csv("us_world_gdp_spending.csv", function (d) {
        return {
            Country: d["Country.Name"],
            Year: d3.timeParse("%Y")(d.Year),
            PercGDP: d.PercGDP,
        };
    });

    us_data = data.filter(function (d) {
        return d.Country == "United States";
    });

    world_data = data.filter(function (d) {
        return d.Country == "World";
    });

    console.log(data);

    // Set the dimensions of the SVG
    const width = 800;
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
        .range([0, width]);

    const y = d3
        .scaleLinear()
        .domain([0, maxGDP + 1])
        .range([height, 0]);

    // Specify the div to fill with the chart
    let container = d3
        .select(".svg-container")
        .append("svg")
        .classed("sv3", true);

    // Add the width and height to the svg and add a g
    let svg = container
        .attr("width", width + 2 * margin)
        .attr("height", height + 2 * margin)
        .append("g")
        .attr("transform", "translate(" + margin + "," + margin + ")");

    // Add the X and Y axis
    // The y-axis
    svg.append("g").call(d3.axisLeft(y));

    // The x-axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    console.log();

    // Add the line for US data
    svg.append("path")
        .datum(us_data)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1.5)
        .attr(
            "d",
            d3
                .line()
                .x(function (d) {
                    return x(d.Year);
                })
                .y(function (d) {
                    return y(d.PercGDP);
                })
        );

    // Add the line for World data
    svg.append("path")
        .datum(world_data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr(
            "d",
            d3
                .line()
                .x(function (d) {
                    return x(d.Year);
                })
                .y(function (d) {
                    return y(d.PercGDP);
                })
        );
}

async function main() {
    //svg1();
    //svg2();
    svg3();
}
