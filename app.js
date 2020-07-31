// VARIABLES
// Indicate which "slide" or "position" we're on
let slide = 1;

let data_dict = {
    total_spending: {},
    world_gdp_data: {},
    us_gdp_data: {},
};

let gdp_scales = {
    xScale: [],
    yScale: [],
    colScale: [],
};

let gdp_dimensions = {
    height: 500,
    width: 1000,
    margin: { top: 25, bottom: 50, left: 50, right: 50 },
};

let spending_dimensions = {
    height: 500,
    width: 1000,
    margin: { top: 25, bottom: 50, left: 50, right: 50 },
};

async function main() {
    create_pie_chart_svg();
}

async function create_spending_chart() {
    const data = await d3.csv("total_spending_top_12.csv", function (d) {
        if (d.Country != "World") {
            return {
                Country: d.Country,
                Year: parseInt(d.Year),
                TotalSpending: d.TotalSpending / 1000000000,
            };
        }
    });

    data_dict.total_spending = data;

    // Set the dimensions of the SVG
    const width = spending_dimensions.width;
    const height = spending_dimensions.height;
    const margin = spending_dimensions.margin;

    // Find the maximum percGDP and Year for scales
    let maxBudget_NonUS = d3.max(data, function (d) {
        if (d.Country !== "United States") {
            return +d.TotalSpending;
        }
    });

    let maxBudget_Total = d3.max(data, function (d) {
        return +d.TotalSpending;
    });

    let maxYear = d3.max(data, function (d) {
        return +d.Year;
    });

    let years = [];
    for (let index = 1993; index < 2019; index++) {
        years.push(index);
    }

    // Define X scale
    let x = d3
        .scalePoint()
        .domain(years)
        .range([0, width - margin.left - margin.right]);

    // Define Y scale
    let y = d3
        .scaleLinear()
        .domain([0, Math.floor(maxBudget_NonUS + 1)])
        .range([height - margin.top - margin.bottom, 0]);

    // Define initial x scale for transition
    let x2 = d3.scalePoint().domain(years).range([0, 0]);

    // Define initial y scale for transition
    let y2 = d3
        .scaleLinear()
        .domain([0, Math.floor(maxBudget_NonUS + 1)])
        .range([
            height - margin.top - margin.bottom,
            height - margin.top - margin.bottom,
        ]);

    // Add color scale
    let colScale = d3.scaleOrdinal(d3.schemePaired);

    // Add a "g" element to the svg
    let svg = d3
        .select(".main-svg")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "plot-g");

    // Add the X and Y axis
    // The y-axis
    let yAxis = d3
        .select(".main-svg")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "yAxis-g")
        .attr("opacity", 0)
        .transition()
        .delay(1500)
        .attr("opacity", 1)
        .call(d3.axisLeft(y2).ticks(0))
        .transition()
        .duration(500)
        .call(d3.axisLeft(y).ticks(0))
        .transition()
        .call(d3.axisLeft(y));

    let translate = height - margin.bottom;
    let xAxis = d3
        .select(".main-svg")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + translate + ")")
        .attr("class", "xAxis-g")
        .attr("opacity", 0)
        .transition()
        .delay(1500)
        .attr("opacity", 1)
        .call(d3.axisBottom(x2).tickValues(0))
        .transition()
        .duration(500)
        .call(d3.axisBottom(x).tickValues(0))
        .transition()
        .call(d3.axisBottom(x));

    // Add Y-Axis title
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("class", "axis-title")
        .attr(
            "transform",
            "translate(-10" + "," + (height - height / 2) / 2 + ")rotate(-90)"
        )
        .attr("y", -75)
        .attr("x", 0)
        .transition()
        .delay(1500)
        .duration(1000)
        .attr("y", -30)
        .attr("x", 0)
        .text("Total Military Expenditure (Billions USD)");

    // Add X axis title
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("class", "axis-title")
        .attr("x", width / 2 - 25)
        .attr("y", height)
        .transition()
        .delay(1500)
        .duration(1000)
        .attr("x", width / 2 - 25)
        .attr("y", height - margin.bottom + 10)
        .text("Year");

    let nested1 = d3
        .nest()
        .key(function (d) {
            if (
                ![
                    "Italy",
                    "Brazil",
                    "Japan",
                    "France",
                    "Germany",
                    "United Kingdom",
                    "Korea, Rep.",
                ].includes(d.Country)
            ) {
                return d.Country;
            }
        })
        .entries(data);

    let nested = [];
    for (item in nested1) {
        if (nested1[item].key != "undefined") {
            nested.push(nested1[item]);
        }
    }

    // Make everyone except US
    let points = svg
        .selectAll(".point")
        .data(
            data.filter(function (d) {
                if (
                    ![
                        "Italy",
                        "Brazil",
                        "Japan",
                        "France",
                        "Germany",
                        "United Kingdom",
                        "Korea, Rep.",
                        "United States",
                    ].includes(d.Country)
                ) {
                    return d;
                }
            })
        )
        .enter()
        .append("circle")
        .attr("class", "point")
        .attr("fill", function (d) {
            return colScale(d.Country);
        })
        .attr("r", 0)
        .attr("cx", function (d) {
            return x(d.Year);
        })
        .attr("cy", function (d) {
            return y(0);
        })
        .attr("pointer-events", "none");

    points
        .transition()
        .delay(2000)
        .duration(2000)
        .attr("r", 5)
        .attr("cx", function (d) {
            return x(d.Year);
        })
        .attr("cy", function (d) {
            return y(d.TotalSpending);
        })
        .transition()
        .delay(750)
        .attr("pointer-events", "auto");

    // Plot US without transitions
    let us_points = svg
        .selectAll(".point-us")
        .data(
            data.filter(function (d) {
                if (d.Country == "United States") {
                    return d;
                }
            })
        )
        .enter()
        .append("circle")
        .attr("class", "point")
        .attr("fill", function (d) {
            return colScale(d.Country);
        })
        .attr("r", 5)
        .attr("cx", function (d) {
            return x(d.Year);
        })
        .attr("cy", function (d) {
            return y(d.TotalSpending);
        })
        .attr("pointer-events", "auto");

    let path = svg
        .selectAll(".point-line")
        .data(nested)
        .enter()
        .append("path")
        .attr("class", "point-line")
        .attr("fill", "none")
        .attr("stroke", function (d) {
            return colScale(d.key);
        })
        .attr("stroke-width", 1.5)
        .attr("opacity", 0)
        .attr("d", function (d) {
            return d3
                .line()
                .x(function (d) {
                    return x(d.Year);
                })
                .y(function (d) {
                    return y(d.TotalSpending);
                })(d.values);
        })
        .transition()
        .delay(3250)
        .duration(2000)
        .attr("opacity", 1);

    line1 = {
        origin: [550, 550, 320, 320],
        destination: [550, 450, 320, 180],
    };

    line2 = {
        origin: [450, 450, 180, 180],
        destination: [450, 220, 180, 180],
    };

    // Define array of annotation lines
    let text_lines = [
        "These are the top four countries in",
        "military spending since 1993 without",
        "the United States: China, Russia, India,",
        "and Saudi Arabia.",
    ];

    create_annotations_gdp(
        line1,
        line2,
        text_lines,
        500,
        "Top Military Spenders",
        3500,
        false
    );

    // Make tooltip
    let tooltip = d3
        .select(".svg1-container")
        .append("div")
        .attr("class", "tooltip");
    tooltip.append("div").attr("class", "country");
    tooltip.append("div").attr("class", "spending");

    enable_mouse_events();
}

function destroy_svg_spending_chart() {
    d3.selectAll(".point").attr("pointer-events", "none");

    // Destroy previous annotation
    d3.selectAll(".annotations")
        .transition()
        .duration(500)
        .attr("opacity", 0)
        .remove();

    d3.selectAll(".annotation-line2")
        .transition()
        .delay(500)
        .duration(500)
        .attr("x2", 600)
        .remove();

    d3.selectAll(".annotation-line1")
        .transition()
        .delay(1000)
        .duration(500)
        .attr("x2", 560)
        .attr("y2", 125)
        .remove();

    d3.selectAll(".annotation-g").transition().delay(2000).remove();

    const data = data_dict.total_spending;

    // Find the maximum percGDP and Year for scales
    let maxBudget_Total = d3.max(data, function (d) {
        return +d.TotalSpending;
    });

    const height = spending_dimensions.height;
    const margin = spending_dimensions.margin;
    const width = spending_dimensions.width;

    let years = [];
    for (let index = 1993; index < 2019; index++) {
        years.push(index);
    }

    // Define Y scale
    let y = d3
        .scaleLinear()
        .domain([0, Math.floor(maxBudget_Total + 1)])
        .range([height - margin.top - margin.bottom, 0]);

    // Define X scale
    let x = d3
        .scalePoint()
        .domain(years)
        .range([0, width - margin.left - margin.right]);

    // Add the X and Y axis
    // The y-axis
    let svg = d3.select(".main-svg");

    points = svg.select(".plot-g").selectAll(".point");
    points
        .transition()
        .delay(2000)
        .duration(1000)
        .attr("cy", function (d) {
            return y(0);
        })
        .attr("r", 0);

    path = svg
        .selectAll(".point-line")
        .transition()
        .delay(1500)
        .duration(1000)
        .attr("opacity", 0);

    // Define Y scale
    let y2 = d3
        .scaleLinear()
        .domain([0, Math.floor(maxBudget_Total + 1)])
        .range([
            height - margin.top - margin.bottom,
            height - margin.top - margin.bottom,
        ]);

    // Define initial x scale for transition
    let x2 = d3.scalePoint().domain(years).range([0, 0]);

    let axisTitles = svg
        .selectAll(".axis-title")
        .attr("opacity", 1)
        .transition()
        .duration(500)
        .attr("opacity", 0);

    let yAxis = svg
        .select(".yAxis-g")
        .transition()
        .delay(2000)
        .duration(500)
        .call(d3.axisLeft(y).ticks(0));

    let xAxis = svg
        .select(".xAxis-g")
        .transition()
        .delay(2000)
        .duration(500)
        .call(d3.axisBottom(x).tickValues(0));

    //xAxis.transition().delay(3000).remove();
    //yAxis.transition().delay(3000).remove();
    axisTitles.transition().delay(2000).remove();
    svg.transition().delay(3000).select(".plot-g").selectAll("*").remove();
}

function disable_mouse_events() {
    d3.selectAll(".point").attr("pointer-events", "none");
}

function enable_mouse_events() {
    // Make tooltip
    let tooltip = d3.select(".tooltip");

    d3.selectAll(".point")
        .on("mouseover", function (d) {
            d3.select(this).transition().attr("r", 8);

            // Add Country header to Tooltip
            tooltip
                .select(".country")
                .html(
                    "<p class='tooltip-para'><b>" +
                        d.Country +
                        "<br>" +
                        d.Year +
                        "</p><hr>"
                )
                .style("color", "black");

            // Add Spending for that Country to tooltip
            let amount = parseFloat(d.TotalSpending).toFixed(1);
            tooltip
                .select(".spending")
                .html("<b>Total Defense Spending: </b>$" + amount + " B USD");

            // Make tooltip visible when hovering over slice
            tooltip.style("display", "block");
            tooltip.transition().duration(250).style("opacity", 2);
        })
        .on("mouseout", function (d) {
            d3.select(this).transition().attr("r", 5);
            // Hide tooltip on mouse exit from slice
            tooltip.style("display", "none");
            tooltip.style("opacity", 0);
        })
        .on("mousemove", function (d) {
            tooltip
                .style("top", d3.event.layerY + 20 + "px")
                .style("left", d3.event.layerX + "px");
        });
}

function transition_spending_chart_1() {
    d3.selectAll(".point").attr("pointer-events", "none");

    // Destroy previous annotation
    d3.selectAll(".annotations")
        .transition()
        .duration(500)
        .attr("opacity", 0)
        .remove();

    d3.selectAll(".annotation-line2")
        .transition()
        .delay(500)
        .duration(500)
        .attr("x2", 600)
        .remove();

    d3.selectAll(".annotation-line1")
        .transition()
        .delay(1000)
        .duration(500)
        .attr("x2", 560)
        .attr("y2", 125)
        .remove();

    d3.selectAll(".annotation-g").transition().delay(2000).remove();

    const data = data_dict.total_spending;

    // Find the maximum percGDP and Year for scales
    let maxBudget_Total = d3.max(data, function (d) {
        if (d.Country !== "United States") {
            return +d.TotalSpending;
        }
    });

    const height = spending_dimensions.height;
    const margin = spending_dimensions.margin;
    const width = spending_dimensions.width;

    let years = [];
    for (let index = 1993; index < 2019; index++) {
        years.push(index);
    }

    // Define Y scale
    let y = d3
        .scaleLinear()
        .domain([0, Math.floor(maxBudget_Total + 1)])
        .range([height - margin.top - margin.bottom, 0]);
    // Define X scale
    let x = d3
        .scalePoint()
        .domain(years)
        .range([0, width - margin.left - margin.right]);

    let colScale = d3.scaleOrdinal(d3.schemePaired);

    // Add the X and Y axis
    // The y-axis
    let svg = d3.select(".main-svg");

    svg.select(".yAxis-g")
        .transition()
        .delay(1500)
        .duration(1000)
        .call(d3.axisLeft(y));

    let points = d3.selectAll(".point");
    points
        .transition()
        .delay(1500)
        .duration(1000)
        .attr("cy", function (d) {
            return y(d.TotalSpending);
        })
        .transition()
        .delay(750)
        .attr("pointer-events", "auto");

    path = svg
        .selectAll(".point-line")
        .transition()
        .delay(1500)
        .duration(1000)
        .attr("d", function (d) {
            return d3
                .line()
                .x(function (d) {
                    return x(d.Year);
                })
                .y(function (d) {
                    return y(d.TotalSpending);
                })(d.values);
        });

    line1 = {
        origin: [550, 550, 320, 320],
        destination: [550, 450, 320, 180],
    };

    line2 = {
        origin: [450, 450, 180, 180],
        destination: [450, 220, 180, 180],
    };

    // Define array of annotation lines
    let text_lines = [
        "These are the top four countries in",
        "military spending since 1993 without",
        "the United States: China, Russia, India,",
        "and Saudi Arabia.",
    ];

    create_annotations_gdp(
        line1,
        line2,
        text_lines,
        500,
        "Top Military Spenders",
        2500,
        false
    );
}

function create_spending_chart_2(reverse = false) {
    let points = d3.selectAll(".point").attr("pointer-events", "none");

    // Destroy previous annotation
    d3.selectAll(".annotations")
        .transition()
        .duration(500)
        .attr("opacity", 0)
        .remove();

    d3.selectAll(".annotation-line2")
        .transition()
        .delay(500)
        .duration(500)
        .attr("x2", 450)
        .remove();

    d3.selectAll(".annotation-line1")
        .transition()
        .delay(1000)
        .duration(500)
        .attr("x2", 550)
        .attr("y2", 320)
        .remove();

    d3.selectAll(".annotation-g").transition().delay(2000).remove();

    const data = data_dict.total_spending;

    // Find the maximum percGDP and Year for scales
    let maxBudget_Total = d3.max(data, function (d) {
        return +d.TotalSpending;
    });

    const height = spending_dimensions.height;
    const margin = spending_dimensions.margin;
    const width = spending_dimensions.width;

    let years = [];
    for (let index = 1993; index < 2019; index++) {
        years.push(index);
    }

    // Define Y scale
    let y = d3
        .scaleLinear()
        .domain([0, Math.floor(maxBudget_Total + 1)])
        .range([height - margin.top - margin.bottom, 0]);
    // Define X scale
    let x = d3
        .scalePoint()
        .domain(years)
        .range([0, width - margin.left - margin.right]);

    let colScale = d3.scaleOrdinal(d3.schemePaired);

    if (reverse) {
        // Define initial x scale for transition
        let x2 = d3.scalePoint().domain(years).range([0, 0]);

        // Define initial y scale for transition
        let y2 = d3
            .scaleLinear()
            .domain([0, Math.floor(maxBudget_Total + 1)])
            .range([
                height - margin.top - margin.bottom,
                height - margin.top - margin.bottom,
            ]);

        // Add a "g" element to the svg
        let svg = d3
            .select(".main-svg")
            .append("g")
            .attr(
                "transform",
                "translate(" + margin.left + "," + margin.top + ")"
            )
            .attr("class", "plot-g");

        // Add the X and Y axis
        // The y-axis
        let yAxis = d3
            .select(".main-svg")
            .append("g")
            .attr(
                "transform",
                "translate(" + margin.left + "," + margin.top + ")"
            )
            .attr("class", "yAxis-g")
            .attr("opacity", 0)
            .transition()
            .attr("opacity", 1)
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
            .attr(
                "transform",
                "translate(" + margin.left + "," + translate + ")"
            )
            .attr("class", "xAxis-g")
            .attr("opacity", 0)
            .transition()
            .attr("opacity", 1)
            .call(d3.axisBottom(x2).tickValues(0))
            .transition()
            .duration(1000)
            .call(d3.axisBottom(x).tickValues(0))
            .transition()
            .call(d3.axisBottom(x));

        // Add Y-Axis title
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("class", "axis-title")
            .attr(
                "transform",
                "translate(-10" +
                    "," +
                    (height - height / 2) / 2 +
                    ")rotate(-90)"
            )
            .attr("y", -75)
            .attr("x", 0)
            .transition()
            .duration(1500)
            .attr("y", -30)
            .attr("x", 0)
            .text("Total Military Expenditure (Billions USD)");

        // Add X axis title
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("class", "axis-title")
            .attr("x", width / 2 - 25)
            .attr("y", height)
            .transition()
            .duration(1500)
            .attr("x", width / 2 - 25)
            .attr("y", height - margin.bottom + 10)
            .text("Year");

        let nested1 = d3
            .nest()
            .key(function (d) {
                if (
                    ![
                        "Italy",
                        "Brazil",
                        "Japan",
                        "France",
                        "Germany",
                        "United Kingdom",
                        "Korea, Rep.",
                    ].includes(d.Country)
                ) {
                    return d.Country;
                }
            })
            .entries(data);

        let nested = [];
        for (item in nested1) {
            if (nested1[item].key != "undefined") {
                nested.push(nested1[item]);
            }
        }

        // Make everyone except US
        let points = svg
            .selectAll(".point")
            .data(
                data.filter(function (d) {
                    if (
                        ![
                            "Italy",
                            "Brazil",
                            "Japan",
                            "France",
                            "Germany",
                            "United Kingdom",
                            "Korea, Rep.",
                        ].includes(d.Country)
                    ) {
                        return d;
                    }
                })
            )
            .enter()
            .append("circle")
            .attr("class", "point")
            .attr("fill", function (d) {
                return colScale(d.Country);
            })
            .attr("r", 0)
            .attr("cx", function (d) {
                return x(d.Year);
            })
            .attr("cy", function (d) {
                return y(0);
            })
            .attr("pointer-events", "none");

        points
            .transition()
            .delay(1000)
            .duration(2000)
            .attr("r", 5)
            .attr("cx", function (d) {
                return x(d.Year);
            })
            .attr("cy", function (d) {
                return y(d.TotalSpending);
            })
            .transition()
            .delay(750)
            .attr("pointer-events", "auto");

        let path = svg
            .selectAll(".point-line")
            .data(nested)
            .enter()
            .append("path")
            .attr("class", "point-line")
            .attr("fill", "none")
            .attr("stroke", function (d) {
                return colScale(d.key);
            })
            .attr("stroke-width", 1.5)
            .attr("opacity", 0)
            .attr("d", function (d) {
                return d3
                    .line()
                    .x(function (d) {
                        return x(d.Year);
                    })
                    .y(function (d) {
                        return y(d.TotalSpending);
                    })(d.values);
            })
            .transition()
            .delay(2500)
            .duration(1000)
            .attr("opacity", 1);
        line1 = {
            origin: [560, 560, 125, 125],
            destination: [560, 600, 125, 150],
        };

        line2 = {
            origin: [600, 600, 150, 150],
            destination: [600, 855, 150, 150],
        };

        // Define array of annotation lines
        let text_lines = [
            "This is the United States. Historically, the",
            "US has spent more than three-times as ",
            "much as any other country in the world",
            "at any given point in time in the last 58",
            "years.",
        ];

        create_annotations_gdp(
            line1,
            line2,
            text_lines,
            500,
            "United States",
            3500,
            true
        );
    } else {
        // Add the X and Y axis
        // The y-axis
        let svg = d3.select(".main-svg");

        svg.select(".yAxis-g")
            .transition()
            .delay(1500)
            .duration(1000)
            .call(d3.axisLeft(y));

        points
            .transition()
            .delay(1500)
            .duration(1000)
            .attr("cy", function (d) {
                return y(d.TotalSpending);
            })
            .transition()
            .delay(750)
            .attr("pointer-events", "auto");

        path = svg
            .selectAll(".point-line")
            .transition()
            .delay(1500)
            .duration(1000)
            .attr("d", function (d) {
                return d3
                    .line()
                    .x(function (d) {
                        return x(d.Year);
                    })
                    .y(function (d) {
                        return y(d.TotalSpending);
                    })(d.values);
            });

        line1 = {
            origin: [560, 560, 125, 125],
            destination: [560, 600, 125, 150],
        };

        line2 = {
            origin: [600, 600, 150, 150],
            destination: [600, 855, 150, 150],
        };

        // Define array of annotation lines
        let text_lines = [
            "This is the United States. Historically, the",
            "US has spent more than three-times as ",
            "much as any other country in the world",
            "at any given point in time in the last 58",
            "years.",
        ];

        create_annotations_gdp(
            line1,
            line2,
            text_lines,
            500,
            "United States",
            2500,
            true
        );
    }
    enable_mouse_events();
}

function disable_buttons(time, last = false) {
    d3.selectAll(".point").attr("pointer-events", "none");
    document.getElementById("next").disabled = true;
    document.getElementById("previous").disabled = true;
    document.getElementById("restart").disabled = true;
    setTimeout(function () {
        if (!last) {
            document.getElementById("next").disabled = false;
            document.getElementById("previous").disabled = false;
            document.getElementById("restart").disabled = false;
        } else {
            document.getElementById("previous").disabled = false;
            document.getElementById("restart").disabled = false;
        }
        d3.selectAll(".point").attr("pointer-events", "auto");
    }, time);
}

function handleClick(event, id) {

    if (id == "sources") {
        
    } else if (id == "restart") {
        slide = 1

        d3.select(".main-svg").selectAll("*").attr("opacity", 1).transition().on("end", function(d) {
            d3.select(this).remove()

        }).duration(750).attr("opacity", 0)

        d3.selectAll(".tooltip").remove()
        d3.selectAll(".tooltip-pie")

    } else if (id == "next") {
        slide += 1;
    } else if (id == "previous") {
        slide -= 1;

        if (slide == 1 || slide == 3) {
            d3.select(".main-svg")
                .selectAll("*")
                .attr("opacity", 1)
                .transition()
                .on("end", function (d) {
                    d3.select(this).remove();
                })
                .duration(1000)
                .attr("opacity", 0);
        }
    }

    if (slide == 1) {
        document.getElementById("current-slide").innerHTML = slide;

        document.getElementById("previous").disabled = true;

        document.getElementById("vis-title").textContent =
            "United States Defence Spending vs. Rest of the World (2018)";

             document.getElementById("explanation-title").innerHTML =
            "United States Defense Spending";

        let bodyText =
            "The US has historically allocated a very large proportion of its total GDP towards military expenditure when compared to the rest of the world. For example, in 2018 the United States" +
            " alone accounted for approximately 36.4% of total military expenditures. <br /><br /> In the below pie chart, the total defense spending of the United States is compared to <b>the rest of the world " +
            "combined</b> in 2018.";
        document.getElementById("explanation-text").innerHTML = bodyText;

        if (id == "previous") {
            d3.selectAll(".tooltip").remove();
        }
        create_pie_chart_svg();
    } else if (slide == 2) {
        disable_buttons(4000);
        document.getElementById("current-slide").innerHTML = slide;

        document.getElementById("explanation-title").innerHTML =
            "Top 5 Countries in Military Expenditure";

        document.getElementById("vis-title").textContent =
            "Total Defense Spending in Billions USD vs. Year (1993 - 2018)";

        let bodyText =
            "The other top four military-spending countries as of 2018 were China, Saudi Arabia, Russia and India. Notice that China appears to be spending significantly more than the other three as of the last two decades." +
            " Note that data from only as far back as 1993 was used in this particular plot because total defense spending data for Russia (historically the United States' military rival) only became available from 1993 onwards.";

        // NEXT SLIDE: When comparing total military spending to other countries in the world, the US has historically outspent them all by a significant margin.
        //     "Overall defence budget as a percentage of GDP has been decreasing since 1960. However, notice how there are some periods of dramatic increase/decrease." +
        //     " We are going to analyze key time periods of particular interest to understand how events unfolding at the time affected the US defence budget.";
        document.getElementById("explanation-text").innerHTML = bodyText;

        if (id == "next") {
            destroy_pie_chart();
            create_spending_chart();
        } else {
            transition_spending_chart_1();
        }
    } else if (slide == 3) {
        d3.selectAll(".point").attr("pointer-events", "none");
        disable_buttons(3000);
        document.getElementById("current-slide").innerHTML = slide;

        document.getElementById("explanation-title").innerHTML =
            "Top 5 Countries in Military Expenditure";

        document.getElementById("vis-title").textContent =
            "Total Defense Spending in Billions USD vs. Year (1993 - 2018)";

        let bodyText =
            "Now, adding the United States to the picture shows the sheer magnitude by which the United States out-spends even the most heavily spending other countries. When analyzing overall spending, " +
            "it indeed seems as if most countries have increased military expenditure over the years. However, this does not take into account the overall GDP, which (as it increases over the years) allows countries " +
            "to naturally invest more total money into defense.";

        // NEXT SLIDE: When comparing total military spending to other countries in the world, the US has historically outspent them all by a significant margin.
        //     "Overall defence budget as a percentage of GDP has been decreasing since 1960. However, notice how there are some periods of dramatic increase/decrease." +
        //     " We are going to analyze key time periods of particular interest to understand how events unfolding at the time affected the US defence budget.";
        document.getElementById("explanation-text").innerHTML = bodyText;

        if (id == "previous") {
            create_spending_chart_2(true);
        } else {
            create_spending_chart_2();
        }
    } else if (slide == 4) {
        document.getElementById("current-slide").innerHTML = slide;
        // Title of Plot
        document.getElementById("vis-title").textContent =
            "United States Defence Spending as % of GDP (1960 - 2018)";

        // Paragraph Title
        document.getElementById("explanation-title").innerHTML =
            "Overview of US Military Expenditure as a Percentage of GDP";

        // Paragraph Text
        let bodyText =
            " We are more interested in defence spending as a <b>percentage</b> of GDP over the years. Notice that this chart, when compared to the last, actually shows a drop of defense spending as a percentage of GDP as " +
            "the years go on, yet there are some interesting dips/rises at certain points which we may want to investigate further. Thus, we will be analyzing the United States' defense spending as a percentage of GDP " +
            " from 1960 to 2018. Furthermore, we will be analyzing various international events of import between 1960 and 2018 and how they may have impacted the US defense budget.";
        document.getElementById("explanation-text").innerHTML = bodyText;

        if (id == "next") {
            disable_buttons(4500);
            destroy_svg_spending_chart();
            create_gdp_line_chart_1();
        } else {
            disable_buttons(2500);
            create_gdp_line_chart_1(true);
        }
    } else if (slide == 5) {
        disable_buttons(2500);

        document.getElementById("current-slide").innerHTML = slide;
        // Title of Plot
        document.getElementById("vis-title").textContent =
            "United States Defence Spending as % of GDP (1960 - 1967)";

        // Paragraph Title
        document.getElementById("explanation-title").innerHTML =
            "Entering the Vietnam War";

        // Paragraph Text
        let bodyText =
            "In 1965, the US increased their involvement in the Vietnam War. In 1965, President Johnson ordered a three-year bombing campaign (Operation Rolling Thunder) " +
            "in Northern Vietnam and deployed combat troops to Vietnam. This escalation required higher military spending. As a result, defense spending increases dramatically over " +
            "the next two years until it reaches 9.06% of the GDP in 1967. Note that this is the highest amount of military expenditure as a percentage of GDP during the entire 58-year" +
            " period being analyzed.";
        document.getElementById("explanation-text").innerHTML = bodyText;

        //create_spending_chart_2();

        // Bring up the data points

        if (id == "next") {
            create_gdp_line_chart_2();
        } else {
            create_gdp_line_chart_2(true);
        }

        // Create the annotation
    } else if (slide == 6) {
        disable_buttons(2500);

        document.getElementById("current-slide").innerHTML = slide;
        // Title of Plot
        document.getElementById("vis-title").textContent =
            "United States Defence Spending as % of GDP (1968 - 1980)";

        // Paragraph Title
        document.getElementById("explanation-title").innerHTML =
            "President Nixon Gradually Decreases Involvement in Vietnam";

        // Paragraph Text
        let bodyText =
            "By 1969, the Vietnam War was very unpopular with the general US public. President Nixon sought to reduce US participation, which " +
            "he gradually did until the Paris Peace Accords were signed in 1973 upon which direct US involvement in the Vietnam War ended. During the 1970s, the US defense budget has been argued by some to have been" +
            " perhaps excessively low. This led to concerns at the time about the deteriorating quality of the US military forces, equipment, and competition from the Soviet Union. These reduced defense budgets began" +
            " from approximately 1967 and lasted until 1981 when Ronald Reagan began his presidency.";
        document.getElementById("explanation-text").innerHTML = bodyText;

        if (id == "next") {
            create_gdp_line_chart_3();
        } else {
            create_gdp_line_chart_3(true);
        }
    } else if (slide == 7) {
        disable_buttons(2500);

        document.getElementById("current-slide").innerHTML = slide;
        // Title of Plot
        document.getElementById("vis-title").textContent =
            "United States Defence Spending as % of GDP (1981 - 1989)";

        // Paragraph Title
        document.getElementById("explanation-title").innerHTML =
            "President Reagan's Defense Buildup and the Cold War";

        // Paragraph Text
        let bodyText =
            "When Ronald Reagan won the presidency in 1980, he had a very different approach towards the defense budget than his predecessors. At the time, there were serious concerns about the deteriorating quality of" +
            " the US military. Reagan's policies heavily emphasized the importance of building up US military capabilities to win the Cold War. This included purchasing more military equipment and increasing " +
            "R&D budgets for developing new military technology. As a result of these policies, the defense budget increased drastically under his presidency, particularly during his first term.";

        // Talk in annotations about how he did begin reducing his military spending over his second term
        // Also discuss potentially how the cold war effected this spending
        document.getElementById("explanation-text").innerHTML = bodyText;

        // Now de-construct the previous chart elements

        if (id == "next") {
            create_gdp_line_chart_4();
        } else {
            create_gdp_line_chart_4(true);
        }
    } else if (slide == 8) {
        disable_buttons(2500);

        document.getElementById("current-slide").innerHTML = slide;
        // Title of Plot
        document.getElementById("vis-title").textContent =
            "United States Defence Spending as % of GDP (1990 - 2000)";

        // Paragraph Title
        document.getElementById("explanation-title").innerHTML =
            "Post-Cold War Budget Cuts";

        // Paragraph Text
        let bodyText =
            "After the fall of the Soviet Union in 1991 and subsequent end of the Cold War, there was no longer a need for such heavy investment in defense. Beginning with President George H. W. Bush and continuing" +
            " with President Clinton until 2001, the US saw defense budgets relative to GDP fall dramatically. The era of peace allowed for an increased emphasis on balancing the federal budget. " +
            "Thus, President Clinton's policies during his tenure as president involved reducing overall federal spending over his two terms as president. As a result, defense spending fell dramatically during the 1990s.";

        // defense spending fell almost year-on-year to a 68-year low of 2.91% of the GDP in 1999 - annotate
        document.getElementById("explanation-text").innerHTML = bodyText;

        if (id == "next") {
            create_gdp_line_chart_5();
        } else {
            create_gdp_line_chart_5(true);
        }
    } else if (slide == 9) {
        disable_buttons(2500);

        document.getElementById("current-slide").innerHTML = slide;
        // Title of Plot
        document.getElementById("vis-title").textContent =
            "United States Defence Spending as % of GDP (2001 - 2008)";

        // Paragraph Title
        document.getElementById("explanation-title").innerHTML =
            "9/11: Wars in Iraq and Afghanistan";

        // Paragraph Text
        let bodyText =
            "After the 9/11 attacks, President Bush launched his 'War on Terror' that began the Afghanistan War in 2001 and the Iraq War in 2003. Naturally, this resulted in" +
            " dramatic increases in defense spending over the course of his presidency for modernizing weapons, many of which had grown outdated during the last ten years as a result of" +
            " reduced military spending during the 1990s.";

        // defense spending fell almost year-on-year to a 68-year low of 2.91% of the GDP in 1999 - annotate
        document.getElementById("explanation-text").innerHTML = bodyText;

        if (id == "next") {
            create_gdp_line_chart_6();
        } else {
            create_gdp_line_chart_6(true);
        }
    } else if (slide == 10) {
        disable_buttons(2500);

        document.getElementById("current-slide").innerHTML = slide;
        // Title of Plot
        document.getElementById("vis-title").textContent =
            "United States Defence Spending as % of GDP (2009 - 2018)";

        // Paragraph Title
        document.getElementById("explanation-title").innerHTML =
            "2008 Recession and the End of the Iraq War";

        // Paragraph Text
        let bodyText =
            "Under President Obama's presidency the Iraq war ended in 2011 with the withdrawal of all US combat troops. Furthermore, as a result of the " +
            "2008 recession, defense was one of the many sectors where federal spending was reduced. By the end of President Obama's tenure, defense spending as a percentage" +
            " of GDP had reached Clinton-era levels - significantly reduced from Bush-era defense spending.";

        // defense spending fell almost year-on-year to a 68-year low of 2.91% of the GDP in 1999 - annotate
        document.getElementById("explanation-text").innerHTML = bodyText;

        //create_gdp_line_chart_7();
        if (id == "next") {
            create_gdp_line_chart_7();
        } else {
            create_gdp_line_chart_7(true);
        }
    } else if (slide == 11) {
        disable_buttons(2000, true);
        document.getElementById("next").disabled = true;

        document.getElementById("current-slide").innerHTML = slide;

        // Title of Plot
        document.getElementById("vis-title").textContent =
            "United States Defence Spending as % of GDP (1960 - 2018)";

        // Paragraph Title
        document.getElementById("explanation-title").innerHTML = "The End";

        // Paragraph Text
        let bodyText =
            "Hopefully by this point users have a better understanding of US defense spending over the years, how it compares to other countries, and how it has trended as a function of total GDP over the years." +
            " To start over, please press the 'Restart' button on the top-right of the page. <br><br> The sources for historical information and the data can be accessed by clicking on the 'Sources' button on the" +
            " top-left of the page.";

        // defense spending fell almost year-on-year to a 68-year low of 2.91% of the GDP in 1999 - annotate
        document.getElementById("explanation-text").innerHTML = bodyText;

        create_gdp_line_chart_8();
    }
}
function create_annotations_gdp(
    line1,
    line2,
    text_lines,
    duration = 500,
    change_type,
    delay = 1750,
    left_right = true,
    c1 = "annotation-line1",
    c2 = "annotation-line2"
) {
    let svg = d3.select(".main-svg").append("g").attr("class", "annotation-g");

    svg.append("line")
        .attr("class", c1)
        .style("stroke", "black")
        .attr("stroke-width", 1)
        .attr("x1", line1.origin[0])
        .attr("x2", line1.origin[1])
        .attr("y1", line1.origin[2])
        .attr("y2", line1.origin[3])
        .transition()
        .delay(delay)
        .duration(duration)
        .attr("x1", line1.destination[0])
        .attr("x2", line1.destination[1])
        .attr("y1", line1.destination[2])
        .attr("y2", line1.destination[3]);

    svg.append("line")
        .attr("class", c2)
        .style("stroke", "black")
        .attr("stroke-width", 1)
        .attr("x1", line2.origin[0])
        .attr("x2", line2.origin[1])
        .attr("y1", line2.origin[2])
        .attr("y2", line2.origin[3])
        .transition()
        .delay(delay + duration)
        .duration(duration)
        .attr("x1", line2.destination[0])
        .attr("x2", line2.destination[1])
        .attr("y1", line2.destination[2])
        .attr("y2", line2.destination[3]);

    // First annotation line begins here
    let y_count = line2.destination[2] + 20;

    if (left_right) {
        svg.append("text")
            .attr("class", "annotations")
            .attr("x", line2.origin[0] + 2)
            .attr("y", y_count - 30)
            .attr("opacity", 0)
            .transition()
            .delay(delay + 250)
            .duration(1500)
            .attr("opacity", 1)
            .text(change_type)
            .attr("font-weight", "bold");

        // Add all lines for the annotation
        for (line in text_lines) {
            svg.append("text")
                .attr("class", "annotations")
                .attr("x", line2.origin[0] + 2)
                .attr("y", y_count)
                .attr("opacity", 0)
                .transition()
                .delay(delay + 250)
                .duration(1500)
                .attr("opacity", 1)
                .text(text_lines[line]);
            y_count += 20;
        }
    } else {
        svg.append("text")
            .attr("class", "annotations")
            .attr("x", line2.destination[1])
            .attr("y", y_count - 30)
            .attr("opacity", 0)
            .transition()
            .delay(delay + 250)
            .duration(1500)
            .attr("opacity", 1)
            .text(change_type)
            .attr("font-weight", "bold");

        // Add all lines for the annotation
        for (line in text_lines) {
            svg.append("text")
                .attr("class", "annotations")
                .attr("x", line2.destination[1])
                .attr("y", y_count)
                .attr("opacity", 0)
                .transition()
                .delay(delay + 250)
                .duration(1500)
                .attr("opacity", 1)
                .text(text_lines[line]);
            y_count += 20;
        }
    }
}

function create_gdp_line_chart_8() {
    // Destroy previous annotation

    d3.selectAll(".annotations").transition().duration(500).attr("opacity", 0);

    d3.select(".annotation-line2")
        .transition()
        .on("end", function (d) {
            d3.select(this).remove();
        })
        .delay(500)
        .duration(500)
        .attr("x2", 780);

    d3.select(".annotation-line1")
        .transition()
        .on("end", function (d) {
            d3.select(this).remove();
        })
        .delay(1000)
        .duration(500)
        .attr("x2", 900)
        .attr("y2", 265);

    d3.selectAll(".annotation-g").transition().delay(2000).remove();

    d3.selectAll(".point").transition().duration(1000).style("opacity", 1);
    d3.selectAll(".line-point").transition().duration(1000).style("opacity", 1);
}

function create_gdp_line_chart_7(reverse = false) {
    if (reverse) {
        //console.log(d3.select(".annotation-line4"));
        //console.log(d3.select(".annotation-line4"));
        // d3.selectAll(".annotations")
        //     .transition()
        //     .duration(500)
        //     .attr("opacity", 0);

        // d3.select(".annotation-line4")
        //     .transition()
        //     .on("end", function (d) {
        //         d3.select(this).remove();
        //     })
        //     .delay(500)
        //     .duration(500)
        //     .attr("x2", 780);

        // d3.select(".annotation-line3")
        //     .transition()
        //     .on("end", function (d) {
        //         d3.select(this).remove();
        //     })
        //     .delay(1000)
        //     .duration(500)
        //     .attr("x2", 900)
        //     .attr("y2", 265);

        // d3.selectAll(".annotation-g").transition().delay(2000).remove();

        // Select the SVG container
        let svg = d3.select(".main-svg").select(".plot-g");

        // Filter data points from 1960 to 1981
        const data = data_dict.us_gdp_data.filter(function (d) {
            return d.Year.getFullYear() < 2019;
        });

        // Extract scales from global dictionary
        const x = gdp_scales.xScale;
        const y = gdp_scales.yScale;
        const colScale = gdp_scales.colScale;

        // Extract svg dimensions from global dictionary
        const height = gdp_dimensions.height;
        const width = gdp_dimensions.width;
        const margin = gdp_dimensions.margin;

        let tooltip = d3.select(".tooltip");

        // Remove unnecessary points
        let points = svg.selectAll(".point");
        points.each(function (d) {
            if (d.Year.getFullYear() > 2018) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("r", 0)
                    .attr("cy", (d) => y(0));
            } else {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .style("opacity", 1)
                    .attr("pointer-events", "none");
            }
        });

        let lines = svg.selectAll(".line-point");
        lines.each(function (d) {
            if (d.Year.getFullYear() > 2018) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("y2", (d) => height - margin.bottom - margin.top);
            } else {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .style("opacity", 1);
            }
        });

        // We want to highlight only key years
        // Fade all previous points
        // We want to highlight only key years
        let years = [];
        for (let index = 2009; index < 2019; index++) {
            years.push(index);
        }
        fade_data(data, years);

        // Define the co-ordinates of the annotation lines
        // Format of line: [x1, x2, y1, y2]
        line1 = {
            origin: [900, 900, 265, 265],
            destination: [900, 780, 265, 45],
        };

        line2 = {
            origin: [780, 780, 45, 45],
            destination: [780, 500, 45, 45],
        };

        // Define array of annotation lines
        let text_lines = [
            "As a result of the 2008 recession and the ",
            "conclusion of the Iraq War in 2011, ",
            "the defense budget was gradually reduced",
            "from the highs of the Bush administration under",
            " President Obama",
        ];

        create_annotations_gdp(
            line1,
            line2,
            text_lines,
            500,
            "Decrease",
            1500,
            false
        );
    } else {
        // Destroy previous annotation
        d3.selectAll(".annotations")
            .transition()
            .duration(500)
            .attr("opacity", 0);

        d3.selectAll(".annotation-line2")
            .transition()
            .on("end", function (d) {
                d3.select(this).remove();
            })
            .delay(500)
            .duration(500)
            .attr("x2", 675)
            .remove();

        d3.selectAll(".annotation-line1")
            .transition()
            .on("end", function (d) {
                d3.select(this).remove();
            })
            .delay(1000)
            .duration(500)
            .attr("x2", 760)
            .attr("y2", 265);

        d3.selectAll(".annotation-g").transition().delay(2000).remove();

        // Select the SVG container
        let svg = d3.select(".main-svg").select("g");

        // Filter data points from 1960 to 1981
        const data = data_dict.us_gdp_data.filter(function (d) {
            return d.Year.getFullYear() < 2019;
        });

        // Extract scales from global dictionary
        const x = gdp_scales.xScale;
        const y = gdp_scales.yScale;
        const colScale = gdp_scales.colScale;

        // Extract svg dimensions from global dictionary
        const height = gdp_dimensions.height;
        const width = gdp_dimensions.width;
        const margin = gdp_dimensions.margin;

        // Fade all previous points
        // We want to highlight only key years
        years = [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018];
        fade_data(data, years);

        let tooltip = d3.select(".tooltip");

        // Remove unnecessary points
        let points = svg.selectAll(".point");
        points.each(function (d) {
            if (years.includes(d.Year.getFullYear())) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("r", 5)
                    .attr("cy", (d) => y(d.PercGDP))
                    .attr("pointer-events", "none");
            }
        });

        let lines = svg.selectAll(".line-point");
        lines.each(function (d) {
            if (years.includes(d.Year.getFullYear())) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("y2", (d) => y(d.PercGDP));
            }
        });

        //Define the co-ordinates of the annotation lines
        //Format of line: [x1, x2, y1, y2]
        //Line 2 = horizontal, line 1 = diagonal
        let line1 = {
            origin: [900, 900, 265, 265],
            destination: [900, 780, 265, 45],
        };

        let line2 = {
            origin: [780, 780, 45, 45],
            destination: [780, 500, 45, 45],
        };

        // Define array of annotation lines
        let text_lines = [
            "As a result of the 2008 recession and the ",
            "conclusion of the Iraq War in 2011, ",
            "the defense budget was gradually reduced",
            "from the highs of the Bush administration under",
            " President Obama",
        ];

        create_annotations_gdp(
            line1,
            line2,
            text_lines,
            500,
            "Decrease",
            2000,
            false,
            "annotation-line1",
            "annotation-line2"
        );
    }
}

function create_gdp_line_chart_6(reverse = false) {
    if (reverse) {
        d3.selectAll(".annotations")
            .transition()
            .duration(500)
            .attr("opacity", 0);

        d3.select(".annotation-line2")
            .transition()
            .on("end", function (d) {
                d3.select(this).remove();
            })
            .delay(500)
            .duration(500)
            .attr("x2", 780);

        d3.select(".annotation-line1")
            .transition()
            .on("end", function (d) {
                d3.select(this).remove();
            })
            .delay(1000)
            .duration(500)
            .attr("x2", 900)
            .attr("y2", 265);

        d3.selectAll(".annotation-g").transition().delay(2000).remove();

        // Select the SVG container
        let svg = d3.select(".main-svg").select(".plot-g");

        // Filter data points from 1960 to 1981
        const data = data_dict.us_gdp_data.filter(function (d) {
            return d.Year.getFullYear() < 2009;
        });

        // Extract scales from global dictionary
        const x = gdp_scales.xScale;
        const y = gdp_scales.yScale;
        const colScale = gdp_scales.colScale;

        // Extract svg dimensions from global dictionary
        const height = gdp_dimensions.height;
        const width = gdp_dimensions.width;
        const margin = gdp_dimensions.margin;

        let tooltip = d3.select(".tooltip");

        // Remove unnecessary points
        let points = svg.selectAll(".point");
        points.each(function (d) {
            if (d.Year.getFullYear() > 2008) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("r", 0)
                    .attr("cy", (d) => y(0));
            } else {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .style("opacity", 1)
                    .attr("pointer-events", "none");
            }
        });

        let lines = svg.selectAll(".line-point");
        lines.each(function (d) {
            if (d.Year.getFullYear() > 2008) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("y2", (d) => height - margin.bottom - margin.top);
            } else {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .style("opacity", 1);
            }
        });

        // We want to highlight only key years
        // Fade all previous points
        // We want to highlight only key years
        let years = [];
        for (let index = 2001; index < 2009; index++) {
            years.push(index);
        }
        fade_data(data, years);

        // Define the co-ordinates of the annotation lines
        // Format of line: [x1, x2, y1, y2]
        line1 = {
            origin: [760, 760, 265, 265],
            destination: [760, 675, 265, 25],
        };

        line2 = {
            origin: [675, 675, 25, 25],
            destination: [675, 380, 25, 25],
        };

        // Define array of annotation lines
        let text_lines = [
            "Due to the ongoing wars, the defense budget",
            "rose during the course of President Bush's",
            " tenure in office from 2.94% to 4.22%",
        ];

        create_annotations_gdp(
            line1,
            line2,
            text_lines,
            500,
            "Increase",
            2250,
            false
        );
    } else {
        // Destroy previous annotation
        d3.selectAll(".annotations")
            .transition()
            .duration(500)
            .attr("opacity", 0)
            .remove();

        d3.selectAll(".annotation-line2")
            .transition()
            .delay(500)
            .duration(500)
            .attr("x2", 675)
            .remove();

        d3.selectAll(".annotation-line1")
            .transition()
            .delay(1000)
            .duration(500)
            .attr("x2", 600)
            .attr("y2", 255)
            .remove();

        d3.selectAll(".annotation-g").transition().delay(2000).remove();

        // Select the SVG container
        let svg = d3.select(".main-svg").select("g");

        // Filter data points from 1960 to 1981
        const data = data_dict.us_gdp_data.filter(function (d) {
            return d.Year.getFullYear() < 2009;
        });

        // Extract scales from global dictionary
        const x = gdp_scales.xScale;
        const y = gdp_scales.yScale;
        const colScale = gdp_scales.colScale;

        // Extract svg dimensions from global dictionary
        const height = gdp_dimensions.height;
        const width = gdp_dimensions.width;
        const margin = gdp_dimensions.margin;

        // Fade all previous points
        // We want to highlight only key years
        let years = [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008];
        fade_data(data, years);

        let tooltip = d3.select(".tooltip");

        // Remove unnecessary points
        let points = svg.selectAll(".point");
        points.each(function (d) {
            if (years.includes(d.Year.getFullYear())) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("r", 5)
                    .attr("cy", (d) => y(d.PercGDP))
                    .attr("pointer-events", "none");
            }
        });

        let lines = svg.selectAll(".line-point");
        lines.each(function (d) {
            if (years.includes(d.Year.getFullYear())) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("y2", (d) => y(d.PercGDP));
            }
        });

        // Define the co-ordinates of the annotation lines
        // Format of line: [x1, x2, y1, y2]
        // Line 2 = horizontal, line 1 = diagonal
        line1 = {
            origin: [760, 760, 265, 265],
            destination: [760, 675, 265, 25],
        };

        line2 = {
            origin: [675, 675, 25, 25],
            destination: [675, 380, 25, 25],
        };

        // Define array of annotation lines
        let text_lines = [
            "Due to the ongoing wars, the defense budget",
            "rose during the course of President Bush's",
            " tenure in office from 2.94% to 4.22%",
        ];

        create_annotations_gdp(
            line1,
            line2,
            text_lines,
            500,
            "Increase",
            2250,
            false
        );
    }
}

function create_gdp_line_chart_5(reverse = false) {
    if (reverse) {
        // Destroy previous annotation
        d3.selectAll(".annotations")
            .transition()
            .duration(500)
            .attr("opacity", 0)
            .remove();

        d3.selectAll(".annotation-line2")
            .transition()
            .delay(500)
            .duration(500)
            .attr("x2", 675)
            .remove();

        d3.selectAll(".annotation-line1")
            .transition()
            .delay(1000)
            .duration(500)
            .attr("x2", 760)
            .attr("y2", 265)
            .remove();

        d3.selectAll(".annotation-g").transition().delay(2000).remove();

        // Select the SVG container
        let svg = d3.select(".main-svg").select(".plot-g");

        // Filter data points from 1960 to 1981
        const data = data_dict.us_gdp_data.filter(function (d) {
            return d.Year.getFullYear() < 2001;
        });

        // Extract scales from global dictionary
        const x = gdp_scales.xScale;
        const y = gdp_scales.yScale;
        const colScale = gdp_scales.colScale;

        // Extract svg dimensions from global dictionary
        const height = gdp_dimensions.height;
        const width = gdp_dimensions.width;
        const margin = gdp_dimensions.margin;

        let tooltip = d3.select(".tooltip");

        // Remove unnecessary points
        let points = svg.selectAll(".point");
        points.each(function (d) {
            if (d.Year.getFullYear() > 2000) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("r", 0)
                    .attr("cy", (d) => y(0));
            } else {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .style("opacity", 1)
                    .attr("pointer-events", "none");
            }
        });

        let lines = svg.selectAll(".line-point");
        lines.each(function (d) {
            if (d.Year.getFullYear() > 2000) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("y2", (d) => height - margin.bottom - margin.top);
            } else {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .style("opacity", 1);
            }
        });

        // We want to highlight only key years
        // Fade all previous points
        // We want to highlight only key years
        let years = [];
        for (let index = 1990; index < 2001; index++) {
            years.push(index);
        }
        fade_data(data, years);

        // Define the co-ordinates of the annotation lines
        // Format of line: [x1, x2, y1, y2]
        line1 = {
            origin: [600, 600, 255, 255],
            destination: [600, 675, 255, 120],
        };

        line2 = {
            origin: [675, 675, 120, 120],
            destination: [675, 960, 120, 120],
        };

        // Define array of annotation lines
        let text_lines = [
            "The 1990s saw defense budgets relative to",
            "GDP fall to record lows. Presidents H. W. Bush",
            " and Clinton focused primarily on balancing",
            "the budget, which required reducing overall",
            "federal spending.",
        ];

        create_annotations_gdp(line1, line2, text_lines, 500, "Decrease", 2250);
    } else {
        // Destroy previous annotation
        d3.selectAll(".annotations")
            .transition()
            .duration(500)
            .attr("opacity", 0)
            .remove();

        d3.selectAll(".annotation-line2")
            .transition()
            .delay(500)
            .duration(500)
            .attr("x2", 550)
            .remove();

        d3.selectAll(".annotation-line1")
            .transition()
            .delay(1000)
            .duration(500)
            .attr("x2", 440)
            .attr("y2", 160)
            .remove();

        d3.selectAll(".annotation-g").transition().delay(2000).remove();

        // Select the SVG container
        let svg = d3.select(".main-svg").select(".plot-g");

        // Filter data points from 1960 to 1981
        const data = data_dict.us_gdp_data.filter(function (d) {
            return d.Year.getFullYear() < 2001;
        });

        // Extract scales from global dictionary
        const x = gdp_scales.xScale;
        const y = gdp_scales.yScale;
        const colScale = gdp_scales.colScale;

        // Extract svg dimensions from global dictionary
        const height = gdp_dimensions.height;
        const width = gdp_dimensions.width;
        const margin = gdp_dimensions.margin;

        // Fade all previous points
        // We want to highlight only key years
        years = [
            1990,
            1991,
            1992,
            1993,
            1994,
            1995,
            1996,
            1997,
            1998,
            1999,
            2000,
        ];
        fade_data(data, years);

        let tooltip = d3.select(".tooltip");

        // Remove unnecessary points
        let points = svg.selectAll(".point");
        points.each(function (d) {
            if (years.includes(d.Year.getFullYear())) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("r", 5)
                    .attr("cy", (d) => y(d.PercGDP))
                    .attr("pointer-events", "none");
            }
        });

        let lines = svg.selectAll(".line-point");
        lines.each(function (d) {
            if (years.includes(d.Year.getFullYear())) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("y2", (d) => y(d.PercGDP));
            }
        });

        // Define the co-ordinates of the annotation lines
        // Format of line: [x1, x2, y1, y2]
        // Line 2 = horizontal, line 1 = diagonal
        line1 = {
            origin: [600, 600, 255, 255],
            destination: [600, 675, 255, 120],
        };

        line2 = {
            origin: [675, 675, 120, 120],
            destination: [675, 960, 120, 120],
        };

        // Define array of annotation lines
        let text_lines = [
            "The 1990s saw defense budgets relative to",
            "GDP fall to record lows. Presidents H. W. Bush",
            " and Clinton focused primarily on balancing",
            "the budget, which required reducing overall",
            "federal spending.",
        ];

        create_annotations_gdp(line1, line2, text_lines, 500, "Decrease", 2250);
    }
}

function create_gdp_line_chart_4(reverse = false) {
    if (reverse) {
        // Destroy previous annotation
        d3.selectAll(".annotations")
            .transition()
            .duration(500)
            .attr("opacity", 0)
            .remove();

        d3.selectAll(".annotation-line2")
            .transition()
            .delay(500)
            .duration(500)
            .attr("x2", 675)
            .remove();

        d3.selectAll(".annotation-line1")
            .transition()
            .delay(1000)
            .duration(500)
            .attr("x2", 600)
            .attr("y2", 255)
            .remove();

        d3.selectAll(".annotation-g").transition().delay(2000).remove();

        // Select the SVG container
        let svg = d3.select(".main-svg").select(".plot-g");

        // Filter data points from 1960 to 1981
        const data = data_dict.us_gdp_data.filter(function (d) {
            return d.Year.getFullYear() < 1989;
        });

        // Extract scales from global dictionary
        const x = gdp_scales.xScale;
        const y = gdp_scales.yScale;
        const colScale = gdp_scales.colScale;

        // Extract svg dimensions from global dictionary
        const height = gdp_dimensions.height;
        const width = gdp_dimensions.width;
        const margin = gdp_dimensions.margin;

        let tooltip = d3.select(".tooltip");

        // Remove unnecessary points
        let points = svg.selectAll(".point");
        points.each(function (d) {
            if (d.Year.getFullYear() > 1989) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("r", 0)
                    .attr("cy", (d) => y(0));
            } else {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .style("opacity", 1)
                    .attr("pointer-events", "none");
            }
        });

        let lines = svg.selectAll(".line-point");
        lines.each(function (d) {
            if (d.Year.getFullYear() > 1989) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("y2", (d) => height - margin.bottom - margin.top);
            } else {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .style("opacity", 1);
            }
        });

        // We want to highlight only key years
        // Fade all previous points
        // We want to highlight only key years
        let years = [];
        for (let index = 1981; index < 1989; index++) {
            years.push(index);
        }
        fade_data(data, years);

        // Define the co-ordinates of the annotation lines
        // Format of line: [x1, x2, y1, y2]
        line1 = {
            origin: [440, 440, 160, 160],
            destination: [440, 550, 160, 60],
        };

        line2 = {
            origin: [550, 550, 60, 60],
            destination: [550, 808, 60, 60],
        };

        // Define array of annotation lines
        let text_lines = [
            "On average, defense spending during the",
            "Reagan administration reached levels not",
            "seen since the height of the Vietnam",
            "War",
        ];

        create_annotations_gdp(line1, line2, text_lines, 500, "Increase", 2250);
    } else {
        // Destroy previous annotation
        d3.selectAll(".annotations")
            .transition()
            .duration(500)
            .attr("opacity", 0)
            .remove();

        d3.selectAll(".annotation-line2")
            .transition()
            .delay(500)
            .duration(500)
            .attr("x2", 400)
            .remove();

        d3.selectAll(".annotation-line1")
            .transition()
            .delay(1000)
            .duration(500)
            .attr("x2", 265)
            .attr("y2", 160)
            .remove();

        d3.selectAll(".annotation-g").transition().delay(2000).remove();

        // Select the SVG container
        let svg = d3.select(".main-svg").select(".plot-g");

        // Filter data points from 1960 to 1981
        const data = data_dict.us_gdp_data.filter(function (d) {
            return d.Year.getFullYear() < 1990;
        });

        // Extract scales from global dictionary
        const x = gdp_scales.xScale;
        const y = gdp_scales.yScale;
        const colScale = gdp_scales.colScale;

        // Extract svg dimensions from global dictionary
        const height = gdp_dimensions.height;
        const width = gdp_dimensions.width;
        const margin = gdp_dimensions.margin;

        // Fade all previous points
        // We want to highlight only key years
        let years = [1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989];
        fade_data(data, [1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989]);

        let tooltip = d3.select(".tooltip");

        // Remove unnecessary points
        let points = svg.selectAll(".point");
        points.each(function (d) {
            if (years.includes(d.Year.getFullYear())) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("r", 5)
                    .attr("cy", (d) => y(d.PercGDP))
                    .attr("pointer-events", "none");
            }
        });

        let lines = svg.selectAll(".line-point");
        lines.each(function (d) {
            if (years.includes(d.Year.getFullYear())) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("y2", (d) => y(d.PercGDP));
            }
        });

        // Define the co-ordinates of the annotation lines
        // Format of line: [x1, x2, y1, y2]
        // Line 2 = horizontal, line 1 = diagonal
        line1 = {
            origin: [440, 440, 160, 160],
            destination: [440, 550, 160, 60],
        };

        line2 = {
            origin: [550, 550, 60, 60],
            destination: [550, 808, 60, 60],
        };

        // Define array of annotation lines
        let text_lines = [
            "On average, defense spending during the",
            "Reagan administration reached levels not",
            "seen since the height of the Vietnam",
            "War",
        ];

        create_annotations_gdp(line1, line2, text_lines, 500, "Increase", 2250);
    }
}

function create_gdp_line_chart_3(reverse = false) {
    if (reverse) {
        // Destroy previous annotation
        d3.selectAll(".annotations")
            .transition()
            .duration(500)
            .attr("opacity", 0)
            .remove();

        d3.selectAll(".annotation-line2")
            .transition()
            .delay(500)
            .duration(500)
            .attr("x2", 550)
            .remove();

        d3.selectAll(".annotation-line1")
            .transition()
            .delay(1000)
            .duration(500)
            .attr("x2", 440)
            .attr("y2", 160)
            .remove();

        d3.selectAll(".annotation-g").transition().delay(2000).remove();

        // Select the SVG container
        let svg = d3.select(".main-svg").select(".plot-g");

        // Filter data points from 1960 to 1981
        const data = data_dict.us_gdp_data.filter(function (d) {
            return d.Year.getFullYear() < 1981;
        });

        // Extract scales from global dictionary
        const x = gdp_scales.xScale;
        const y = gdp_scales.yScale;
        const colScale = gdp_scales.colScale;

        // Extract svg dimensions from global dictionary
        const height = gdp_dimensions.height;
        const width = gdp_dimensions.width;
        const margin = gdp_dimensions.margin;

        let tooltip = d3.select(".tooltip");

        // Remove unnecessary points
        let points = svg.selectAll(".point");
        points.each(function (d) {
            if (d.Year.getFullYear() > 1980) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("r", 0)
                    .attr("cy", (d) => y(0));
            } else {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .style("opacity", 1)
                    .attr("pointer-events", "none");
            }
        });

        let lines = svg.selectAll(".line-point");
        lines.each(function (d) {
            if (d.Year.getFullYear() > 1980) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("y2", (d) => height - margin.bottom - margin.top);
            } else {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .style("opacity", 1);
            }
        });

        // We want to highlight only key years
        // Fade all previous points
        // We want to highlight only key years
        let years = [];
        for (let index = 1968; index < 1981; index++) {
            years.push(index);
        }
        fade_data(data, years);

        // Define the co-ordinates of the annotation lines
        // Format of line: [x1, x2, y1, y2]
        line1 = {
            origin: [265, 265, 160, 160],
            destination: [265, 400, 160, 60],
        };

        line2 = {
            origin: [400, 400, 60, 60],
            destination: [400, 683, 60, 60],
        };

        // Define array of annotation lines
        let text_lines = [
            "Defense spending drops almost year-on-year",
            "from the heights of the late 1960s under ",
            "Presidents Nixon and Ford",
        ];

        create_annotations_gdp(line1, line2, text_lines, 500, "Decrease", 2250);
    } else {
        // Destroy previous annotation

        d3.selectAll(".annotations")
            .transition()
            .duration(500)
            .attr("opacity", 0);

        d3.selectAll(".annotation-line2")
            .transition()
            .delay(500)
            .duration(500)
            .attr("x2", 240)
            .remove();

        d3.selectAll(".annotation-line1")
            .transition()
            .delay(1000)
            .duration(500)
            .attr("x2", 175)
            .attr("y2", 110)
            .remove();

        d3.selectAll(".annotation-g").transition().delay(2000).remove();

        // Select the SVG container
        let svg = d3.select(".main-svg").select(".plot-g");

        // Filter data points from 1960 to 1981
        const data = data_dict.us_gdp_data.filter(function (d) {
            return d.Year.getFullYear() < 1981;
        });

        // Extract scales from global dictionary
        const x = gdp_scales.xScale;
        const y = gdp_scales.yScale;
        const colScale = gdp_scales.colScale;

        // Extract svg dimensions from global dictionary
        const height = gdp_dimensions.height;
        const width = gdp_dimensions.width;
        const margin = gdp_dimensions.margin;

        // Fade all previous points
        // We want to highlight only key years
        let years = [];
        for (let index = 1968; index < 1981; index++) {
            years.push(index);
        }
        fade_data(data, years);

        let tooltip = d3.select(".tooltip");

        // Remove unnecessary points
        let points = svg.selectAll(".point");
        points.each(function (d) {
            if (years.includes(d.Year.getFullYear())) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("r", 5)
                    .attr("cy", (d) => y(d.PercGDP))
                    .attr("pointer-events", "none");
            }
        });

        let lines = svg.selectAll(".line-point");
        lines.each(function (d) {
            if (years.includes(d.Year.getFullYear())) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("y2", (d) => y(d.PercGDP));
            }
        });

        // Define the co-ordinates of the annotation lines
        // Format of line: [x1, x2, y1, y2]
        // Line 1 = horizontal, line 2 = vertical
        line1 = {
            origin: [265, 265, 160, 160],
            destination: [265, 400, 160, 60],
        };

        line2 = {
            origin: [400, 400, 60, 60],
            destination: [400, 683, 60, 60],
        };

        // Define array of annotation lines
        let text_lines = [
            "Defense spending drops almost year-on-year",
            "from the heights of the late 1960s under ",
            "Presidents Nixon and Ford",
        ];

        create_annotations_gdp(line1, line2, text_lines, 500, "Decrease", 2000);
    }
}

function create_gdp_line_chart_2(reverse = false) {
    if (reverse) {
        // Destroy previous annotation
        d3.selectAll(".annotations")
            .transition()
            .duration(500)
            .attr("opacity", 0)
            .remove();

        d3.selectAll(".annotation-line2")
            .transition()
            .delay(500)
            .duration(500)
            .attr("x2", 400)
            .remove();

        d3.selectAll(".annotation-line1")
            .transition()
            .delay(1000)
            .duration(500)
            .attr("x2", 265)
            .attr("y2", 160)
            .remove();

        d3.selectAll(".annotation-g").transition().delay(2000).remove();

        // Filter data points from 1960 to 1969
        const data = data_dict.us_gdp_data.filter(function (d) {
            return d.Year.getFullYear() < 1968;
        });

        // Extract scales from global dictionary
        const x = gdp_scales.xScale;
        const y = gdp_scales.yScale;
        const colScale = gdp_scales.colScale;

        // Extract svg dimensions from global dictionary
        const height = gdp_dimensions.height;
        const width = gdp_dimensions.width;
        const margin = gdp_dimensions.margin;

        let tooltip = d3.select(".tooltip");

        // Select the SVG container
        let svg = d3.select(".main-svg").select(".plot-g");

        // Fade all previous points
        // We want to highlight only key years
        let years = [];
        for (let index = 1968; index < 2019; index++) {
            years.push(index);
        }

        //fade_data(data.concat, years);

        // Remove unnecessary points
        let points = svg.selectAll(".point");
        points.each(function (d) {
            if (d.Year.getFullYear() > 1967) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("r", 0)
                    .attr("cy", (d) => y(0));
            } else {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .style("opacity", 1)
                    .attr("pointer-events", "none");
            }
        });

        let lines = svg.selectAll(".line-point");
        lines.each(function (d) {
            if (d.Year.getFullYear() > 1967) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("y2", (d) => height - margin.bottom - margin.top);
            } else {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .style("opacity", 1);
            }
        });

        // We want to highlight only key years
        fade_data(data, [1965, 1966, 1967]);

        // Define the co-ordinates of the annotation lines
        // Format of line: [x1, x2, y1, y2]
        line1 = {
            origin: [175, 175, 110, 110],
            destination: [175, 240, 110, 75],
        };

        line2 = {
            origin: [240, 240, 75, 75],
            destination: [240, 490, 75, 75],
        };

        // Define array of annotation lines
        let text_lines = [
            "Military spending drastically increases",
            "from 7.21% of the GDP in 1965 to 9.06% ",
            "in 1967. These years are when the US",
            "increased its direct involvement in the",
            "Vietnam War.",
        ];

        create_annotations_gdp(line1, line2, text_lines, 500, "Increase", 2500);
    } else {
        // Select the SVG container
        let svg = d3.select(".main-svg").select(".plot-g");

        // Filter data points from 1960 to 1969
        const data = data_dict.us_gdp_data.filter(function (d) {
            return d.Year.getFullYear() < 1968;
        });

        // Extract scales from global dictionary
        const x = gdp_scales.xScale;
        const y = gdp_scales.yScale;
        const colScale = gdp_scales.colScale;

        // Extract svg dimensions from global dictionary
        const height = gdp_dimensions.height;
        const width = gdp_dimensions.width;
        const margin = gdp_dimensions.margin;

        let tooltip = d3.select(".tooltip");

        // Remove unnecessary points
        let points = svg.selectAll(".point");
        points.each(function (d) {
            if (d.Year.getFullYear() > 1967) {
                d3.select(this)
                    .attr("opacity", 1)
                    .transition()
                    .duration(1000)
                    .attr("r", 0)
                    .attr("cy", (d) => y(0));
            } else {
                d3.select(this)
                    .transition()
                    .delay(500)
                    .attr("pointer-events", "none");
            }
        });

        let lines = svg.selectAll(".line-point");
        lines.each(function (d) {
            if (d.Year.getFullYear() > 1967) {
                d3.select(this)
                    .transition()
                    //.delay(500)
                    .duration(1000)
                    .attr("y1", (d) => height - margin.bottom - margin.top);
            }
        });

        points
            .on("mouseover", function (d) {
                d3.select(this).transition().attr("r", 8);

                let current = this;

                let others = d3.selectAll(".point").filter(function (d) {
                    return current != this;
                });
                //others.transition().duration(500).attr("fill", "grey");
                // Add Country header to Tooltip
                tooltip
                    .select(".country")
                    .html(
                        "<p class='tooltip-para'><b>" +
                            d.Country +
                            "<br>" +
                            d.Year.getFullYear() +
                            "</p><hr>"
                    )
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
                d3.select(this).transition().attr("r", 5);
                // Hide tooltip on mouse exit from slice
                tooltip.style("display", "none");
                tooltip.style("opacity", 0);
            })
            .on("mousemove", function (d) {
                tooltip
                    .style("top", d3.event.layerY + 20 + "px")
                    .style("left", d3.event.layerX + "px");
            });

        // We want to highlight only key years
        fade_data(data, [1965, 1966, 1967]);

        // Define the co-ordinates of the annotation lines
        // Format of line: [x1, x2, y1, y2]
        line1 = {
            origin: [175, 175, 110, 110],
            destination: [175, 240, 110, 75],
        };

        line2 = {
            origin: [240, 240, 75, 75],
            destination: [240, 490, 75, 75],
        };

        // Define array of annotation lines
        let text_lines = [
            "Military spending drastically increases",
            "from 7.21% of the GDP in 1965 to 9.06% ",
            "in 1967. These years are when the US",
            "increased its direct involvement in the",
            "Vietnam War.",
        ];

        create_annotations_gdp(line1, line2, text_lines, 500, "Increase", 1000);
    }
}

async function create_gdp_line_chart_1(reverse = false) {
    d3.selectAll(".point").attr("pointer-events", "none");

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

    data_dict.world_gdp_data = world_data;
    data_dict.us_gdp_data = us_data;

    // Set the dimensions of the SVG
    const width = gdp_dimensions.width;
    const height = gdp_dimensions.height;
    const margin = gdp_dimensions.margin;

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

    // Save globally
    gdp_scales.xScale = x;
    gdp_scales.yScale = y;
    gdp_scales.colScale = colScale;

    if (reverse) {
        d3.selectAll(".annotations")
            .transition()
            .duration(500)
            .attr("opacity", 0);

        d3.selectAll(".annotation-line2")
            .transition()
            .delay(500)
            .duration(500)
            .attr("x2", 240)
            .remove();

        d3.selectAll(".annotation-line1")
            .transition()
            .delay(1000)
            .duration(500)
            .attr("x2", 175)
            .attr("y2", 110)
            .remove();

        d3.selectAll(".annotation-g").transition().delay(2000).remove();

        // Select the SVG container
        let svg = d3.select(".main-svg").select(".plot-g");

        // Fade all previous points
        // We want to highlight only key years
        let years = [];
        for (let index = 1968; index < 2019; index++) {
            years.push(index);
        }

        //fade_data(data.concat, years);

        let tooltip = d3.select(".tooltip");

        // Remove unnecessary points
        let points = svg.selectAll(".point");
        points.each(function (d) {
            if (years.includes(d.Year.getFullYear())) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("r", 5)
                    .attr("cy", (d) => y(d.PercGDP))
                    .attr("pointer-events", "none");
            } else {
                d3.select(this)
                    .attr("pointer-events", "none")
                    .transition()
                    .duration(500)
                    .style("opacity", 1);
            }
        });
}

function transition_spending_chart_1() {
    d3.selectAll(".point").attr("pointer-events", "none");

    // Destroy previous annotation
    d3.selectAll(".annotations")
        .transition()
        .duration(500)
        .attr("opacity", 0)
        .remove();

    d3.selectAll(".annotation-line2")
        .transition()
        .delay(500)
        .duration(500)
        .attr("x2", 600)
        .remove();

    d3.selectAll(".annotation-line1")
        .transition()
        .delay(1000)
        .duration(500)
        .attr("x2", 560)
        .attr("y2", 125)
        .remove();

    d3.selectAll(".annotation-g").transition().delay(2000).remove();

    const data = data_dict.total_spending;

    // Find the maximum percGDP and Year for scales
    let maxBudget_Total = d3.max(data, function (d) {
        if (d.Country !== "United States") {
            return +d.TotalSpending;
        }
    });

    const height = spending_dimensions.height;
    const margin = spending_dimensions.margin;
    const width = spending_dimensions.width;

    let years = [];
    for (let index = 1993; index < 2019; index++) {
        years.push(index);
    }

    // Define Y scale
    let y = d3
        .scaleLinear()
        .domain([0, Math.floor(maxBudget_Total + 1)])
        .range([height - margin.top - margin.bottom, 0]);
    // Define X scale
    let x = d3
        .scalePoint()
        .domain(years)
        .range([0, width - margin.left - margin.right]);

    let colScale = d3.scaleOrdinal(d3.schemePaired);

    // Add the X and Y axis
    // The y-axis
    let svg = d3.select(".main-svg");

    svg.select(".yAxis-g")
        .transition()
        .delay(1500)
        .duration(1000)
        .call(d3.axisLeft(y));

    let points = d3.selectAll(".point");
    points
        .transition()
        .delay(1500)
        .duration(1000)
        .attr("cy", function (d) {
            return y(d.TotalSpending);
        })
        .transition()
        .delay(500)
        .attr("pointer-events", "auto");

    path = svg
        .selectAll(".point-line")
        .transition()
        .delay(1500)
        .duration(1000)
        .attr("d", function (d) {
            return d3
                .line()
                .x(function (d) {
                    return x(d.Year);
                })
                .y(function (d) {
                    return y(d.TotalSpending);
                })(d.values);
        });

    line1 = {
        origin: [550, 550, 320, 320],
        destination: [550, 450, 320, 180],
    };

    line2 = {
        origin: [450, 450, 180, 180],
        destination: [450, 220, 180, 180],
    };

    // Define array of annotation lines
    let text_lines = [
        "These are the top four countries in",
        "military spending since 1993 without",
        "the United States: China, Russia, India,",
        "and Saudi Arabia.",
    ];

    create_annotations_gdp(
        line1,
        line2,
        text_lines,
        500,
        "Top Military Spenders",
        2500,
        false
    );
}

function create_spending_chart_2(reverse = false) {
    let points = d3.selectAll(".point").attr("pointer-events", "none");

    // Destroy previous annotation
    d3.selectAll(".annotations")
        .transition()
        .duration(500)
        .attr("opacity", 0)
        .remove();

    d3.selectAll(".annotation-line2")
        .transition()
        .delay(500)
        .duration(500)
        .attr("x2", 450)
        .remove();

    d3.selectAll(".annotation-line1")
        .transition()
        .delay(1000)
        .duration(500)
        .attr("x2", 550)
        .attr("y2", 320)
        .remove();

    d3.selectAll(".annotation-g").transition().delay(2000).remove();

    const data = data_dict.total_spending;

    // Find the maximum percGDP and Year for scales
    let maxBudget_Total = d3.max(data, function (d) {
        return +d.TotalSpending;
    });

    const height = spending_dimensions.height;
    const margin = spending_dimensions.margin;
    const width = spending_dimensions.width;

    let years = [];
    for (let index = 1993; index < 2019; index++) {
        years.push(index);
    }

    // Define Y scale
    let y = d3
        .scaleLinear()
        .domain([0, Math.floor(maxBudget_Total + 1)])
        .range([height - margin.top - margin.bottom, 0]);
    // Define X scale
    let x = d3
        .scalePoint()
        .domain(years)
        .range([0, width - margin.left - margin.right]);

    let colScale = d3.scaleOrdinal(d3.schemePaired);

    if (reverse) {
        // Define initial x scale for transition
        let x2 = d3.scalePoint().domain(years).range([0, 0]);

        // Define initial y scale for transition
        let y2 = d3
            .scaleLinear()
            .domain([0, Math.floor(maxBudget_Total + 1)])
            .range([
                height - margin.top - margin.bottom,
                height - margin.top - margin.bottom,
            ]);

        // Add a "g" element to the svg
        let svg = d3
            .select(".main-svg")
            .append("g")
            .attr(
                "transform",
                "translate(" + margin.left + "," + margin.top + ")"
            )
            .attr("class", "plot-g");

        // Add the X and Y axis
        // The y-axis
        let yAxis = d3
            .select(".main-svg")
            .append("g")
            .attr(
                "transform",
                "translate(" + margin.left + "," + margin.top + ")"
            )
            .attr("class", "yAxis-g")
            .attr("opacity", 0)
            .transition()
            .attr("opacity", 1)
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
            .attr(
                "transform",
                "translate(" + margin.left + "," + translate + ")"
            )
            .attr("class", "xAxis-g")
            .attr("opacity", 0)
            .transition()
            .attr("opacity", 1)
            .call(d3.axisBottom(x2).tickValues(0))
            .transition()
            .duration(1000)
            .call(d3.axisBottom(x).tickValues(0))
            .transition()
            .call(d3.axisBottom(x));

        // Add Y-Axis title
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("class", "axis-title")
            .attr(
                "transform",
                "translate(-10" +
                    "," +
                    (height - height / 2) / 2 +
                    ")rotate(-90)"
            )
            .attr("y", -75)
            .attr("x", 0)
            .transition()
            .duration(1500)
            .attr("y", -30)
            .attr("x", 0)
            .text("Total Military Expenditure (Billions USD)");

        // Add X axis title
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("class", "axis-title")
            .attr("x", width / 2 - 25)
            .attr("y", height)
            .transition()
            .duration(1500)
            .attr("x", width / 2 - 25)
            .attr("y", height - margin.bottom + 10)
            .text("Year");

        let nested1 = d3
            .nest()
            .key(function (d) {
                if (
                    ![
                        "Italy",
                        "Brazil",
                        "Japan",
                        "France",
                        "Germany",
                        "United Kingdom",
                        "Korea, Rep.",
                    ].includes(d.Country)
                ) {
                    return d.Country;
                }
            })
            .entries(data);

        let nested = [];
        for (item in nested1) {
            if (nested1[item].key != "undefined") {
                nested.push(nested1[item]);
            }
        }

        // Make everyone except US
        let points = svg
            .selectAll(".point")
            .data(
                data.filter(function (d) {
                    if (
                        ![
                            "Italy",
                            "Brazil",
                            "Japan",
                            "France",
                            "Germany",
                            "United Kingdom",
                            "Korea, Rep.",
                        ].includes(d.Country)
                    ) {
                        return d;
                    }
                })
            )
            .enter()
            .append("circle")
            .attr("class", "point")
            .attr("fill", function (d) {
                return colScale(d.Country);
            })
            .attr("r", 0)
            .attr("cx", function (d) {
                return x(d.Year);
            })
            .attr("cy", function (d) {
                return y(0);
            })
            .attr("pointer-events", "none");

        points
            .transition()
            .delay(1000)
            .duration(2000)
            .attr("r", 5)
            .attr("cx", function (d) {
                return x(d.Year);
            })
            .attr("cy", function (d) {
                return y(d.TotalSpending);
            })
            .transition()
            .delay(500)
            .attr("pointer-events", "auto");

        let path = svg
            .selectAll(".point-line")
            .data(nested)
            .enter()
            .append("path")
            .attr("class", "point-line")
            .attr("fill", "none")
            .attr("stroke", function (d) {
                return colScale(d.key);
            })
            .attr("stroke-width", 1.5)
            .attr("opacity", 0)
            .attr("d", function (d) {
                return d3
                    .line()
                    .x(function (d) {
                        return x(d.Year);
                    })
                    .y(function (d) {
                        return y(d.TotalSpending);
                    })(d.values);
            })
            .transition()
            .delay(2500)
            .duration(1000)
            .attr("opacity", 1);
        line1 = {
            origin: [560, 560, 125, 125],
            destination: [560, 600, 125, 150],
        };

        line2 = {
            origin: [600, 600, 150, 150],
            destination: [600, 855, 150, 150],
        };

        // Define array of annotation lines
        let text_lines = [
            "This is the United States. Historically, the",
            "US has spent more than three-times as ",
            "much as any other country in the world",
            "at any given point in time in the last 58",
            "years.",
        ];

        create_annotations_gdp(
            line1,
            line2,
            text_lines,
            500,
            "United States",
            3500,
            true
        );
    } else {
        // Add the X and Y axis
        // The y-axis
        let svg = d3.select(".main-svg");

        svg.select(".yAxis-g")
            .transition()
            .delay(1500)
            .duration(1000)
            .call(d3.axisLeft(y));

        points
            .transition()
            .delay(1500)
            .duration(1000)
            .attr("cy", function (d) {
                return y(d.TotalSpending);
            })
            .transition()
            .delay(500)
            .attr("pointer-events", "auto");

        path = svg
            .selectAll(".point-line")
            .transition()
            .delay(1500)
            .duration(1000)
            .attr("d", function (d) {
                return d3
                    .line()
                    .x(function (d) {
                        return x(d.Year);
                    })
                    .y(function (d) {
                        return y(d.TotalSpending);
                    })(d.values);
            });

        line1 = {
            origin: [560, 560, 125, 125],
            destination: [560, 600, 125, 150],
        };

        line2 = {
            origin: [600, 600, 150, 150],
            destination: [600, 855, 150, 150],
        };

        // Define array of annotation lines
        let text_lines = [
            "This is the United States. Historically, the",
            "US has spent more than three-times as ",
            "much as any other country in the world",
            "at any given point in time in the last 58",
            "years.",
        ];

        create_annotations_gdp(
            line1,
            line2,
            text_lines,
            500,
            "United States",
            2500,
            true
        );
    }
    enable_mouse_events();
}

function disable_buttons(time, last = false) {
    d3.selectAll(".point").attr("pointer-events", "none");
    document.getElementById("next").disabled = true;
    document.getElementById("previous").disabled = true;
    document.getElementById("restart").disabled = true;
    setTimeout(function () {
        if (!last) {
            document.getElementById("next").disabled = false;
            document.getElementById("previous").disabled = false;
            document.getElementById("restart").disabled = false;
        } else {
            document.getElementById("previous").disabled = false;
            document.getElementById("restart").disabled = false;
        }
        d3.selectAll(".point").attr("pointer-events", "auto");
    }, time);
}

function handleClick(event, id) {
    if (id == "next") {
        slide += 1;
    } else if (id == "previous") {
        slide -= 1;

        if (slide == 1 || slide == 3) {
            d3.select(".main-svg")
                .selectAll("*")
                .attr("opacity", 1)
                .transition()
                .on("end", function (d) {
                    d3.select(this).remove();
                })
                .duration(1000)
                .attr("opacity", 0);
        }
    }
    console.log(slide);

    if (slide == 1) {
        document.getElementById("current-slide").innerHTML = slide;

        document.getElementById("previous").disabled = true;

        document.getElementById("vis-title").textContent =
            "United States Defence Spending vs. Rest of the World (2018)";

        let bodyText =
            "The US has historically allocated a very large proportion of its total GDP towards military expenditure when compared to the rest of the world. For example, in 2018 the United States" +
            " alone accounted for approximately 36.4% of total military expenditures. <br /><br /> In the below pie chart, the total defense spending of the United States is compared to <b>the rest of the world " +
            "combined</b> in 2018.";
        document.getElementById("explanation-text").innerHTML = bodyText;

        if (id == "previous") {
            d3.selectAll(".tooltip").remove();
        }
        create_pie_chart_svg();
    } else if (slide == 2) {
        disable_buttons(4000);
        document.getElementById("current-slide").innerHTML = slide;

        document.getElementById("explanation-title").innerHTML =
            "Top 5 Countries in Military Expenditure";

        document.getElementById("vis-title").textContent =
            "Total Defense Spending in Billions USD vs. Year (1993 - 2018)";

        let bodyText =
            "The other top four military-spending countries as of 2018 were China, Saudi Arabia, Russia and India. Notice that China appears to be spending significantly more than the other three as of the last two decades." +
            " Note that data from only as far back as 1993 was used in this particular plot because total defense spending data for Russia (historically the United States' military rival) only became available from 1993 onwards.";

        // NEXT SLIDE: When comparing total military spending to other countries in the world, the US has historically outspent them all by a significant margin.
        //     "Overall defence budget as a percentage of GDP has been decreasing since 1960. However, notice how there are some periods of dramatic increase/decrease." +
        //     " We are going to analyze key time periods of particular interest to understand how events unfolding at the time affected the US defence budget.";
        document.getElementById("explanation-text").innerHTML = bodyText;

        if (id == "next") {
            destroy_pie_chart();
            create_spending_chart();
        } else {
            transition_spending_chart_1();
        }
    } else if (slide == 3) {
        d3.selectAll(".point").attr("pointer-events", "none");
        disable_buttons(3000);
        document.getElementById("current-slide").innerHTML = slide;

        document.getElementById("explanation-title").innerHTML =
            "Top 5 Countries in Military Expenditure";

        document.getElementById("vis-title").textContent =
            "Total Defense Spending in Billions USD vs. Year (1993 - 2018)";

        let bodyText =
            "Now, adding the United States to the picture shows the sheer magnitude by which the United States out-spends even the most heavily spending other countries. When analyzing overall spending, " +
            "it indeed seems as if most countries have increased military expenditure over the years. However, this does not take into account the overall GDP, which (as it increases over the years) allows countries " +
            "to naturally invest more total money into defense.";

        // NEXT SLIDE: When comparing total military spending to other countries in the world, the US has historically outspent them all by a significant margin.
        //     "Overall defence budget as a percentage of GDP has been decreasing since 1960. However, notice how there are some periods of dramatic increase/decrease." +
        //     " We are going to analyze key time periods of particular interest to understand how events unfolding at the time affected the US defence budget.";
        document.getElementById("explanation-text").innerHTML = bodyText;

        if (id == "previous") {
            create_spending_chart_2(true);
        } else {
            create_spending_chart_2();
        }
    } else if (slide == 4) {
        document.getElementById("current-slide").innerHTML = slide;
        // Title of Plot
        document.getElementById("vis-title").textContent =
            "United States Defence Spending as % of GDP (1960 - 2018)";

        // Paragraph Title
        document.getElementById("explanation-title").innerHTML =
            "Overview of US Military Expenditure as a Percentage of GDP";

        // Paragraph Text
        let bodyText =
            " We are more interested in defence spending as a <b>percentage</b> of GDP over the years. Notice that this chart, when compared to the last, actually shows a drop of defense spending as a percentage of GDP as " +
            "the years go on, yet there are some interesting dips/rises at certain points which we may want to investigate further. Thus, we will be analyzing the United States' defense spending as a percentage of GDP " +
            " from 1960 to 2018. Furthermore, we will be analyzing various international events of import between 1960 and 2018 and how they may have impacted the US defense budget.";
        document.getElementById("explanation-text").innerHTML = bodyText;

        if (id == "next") {
            disable_buttons(4500);
            destroy_svg_spending_chart();
            create_gdp_line_chart_1();
        } else {
            disable_buttons(2500);
            create_gdp_line_chart_1(true);
        }
    } else if (slide == 5) {
        disable_buttons(2500);

        document.getElementById("current-slide").innerHTML = slide;
        // Title of Plot
        document.getElementById("vis-title").textContent =
            "United States Defence Spending as % of GDP (1960 - 1967)";

        // Paragraph Title
        document.getElementById("explanation-title").innerHTML =
            "Entering the Vietnam War";

        // Paragraph Text
        let bodyText =
            "In 1965, the US increased their involvement in the Vietnam War. In 1965, President Johnson ordered a three-year bombing campaign (Operation Rolling Thunder) " +
            "in Northern Vietnam and deployed combat troops to Vietnam. This escalation required higher military spending. As a result, defense spending increases dramatically over " +
            "the next two years until it reaches 9.06% of the GDP in 1967. Note that this is the highest amount of military expenditure as a percentage of GDP during the entire 58-year" +
            " period being analyzed.";
        document.getElementById("explanation-text").innerHTML = bodyText;

        //create_spending_chart_2();

        // Bring up the data points

        if (id == "next") {
            create_gdp_line_chart_2();
        } else {
            create_gdp_line_chart_2(true);
        }

        // Create the annotation
    } else if (slide == 6) {
        disable_buttons(2500);

        document.getElementById("current-slide").innerHTML = slide;
        // Title of Plot
        document.getElementById("vis-title").textContent =
            "United States Defence Spending as % of GDP (1968 - 2018)";

        // Paragraph Title
        document.getElementById("explanation-title").innerHTML =
            "President Nixon Gradually Decreases Involvement in Vietnam";

        // Paragraph Text
        let bodyText =
            "By 1969, the Vietnam War was very unpopular with the general US public. President Nixon sought to reduce US participation, which " +
            "he gradually did until the Paris Peace Accords were signed in 1973 upon which direct US involvement in the Vietnam War ended. During the 1970s, the US defense budget has been argued by some to have been" +
            " perhaps excessively low. This led to concerns at the time about the deteriorating quality of the US military forces, equipment, and competition from the Soviet Union. These reduced defense budgets began" +
            " from approximately 1967 and lasted until 1981 when Ronald Reagan began his presidency.";
        document.getElementById("explanation-text").innerHTML = bodyText;

        if (id == "next") {
            create_gdp_line_chart_3();
        } else {
            create_gdp_line_chart_3(true);
        }
    } else if (slide == 7) {
        disable_buttons(2500);

        document.getElementById("current-slide").innerHTML = slide;
        // Title of Plot
        document.getElementById("vis-title").textContent =
            "United States Defence Spending as % of GDP (1981 - 1989)";

        // Paragraph Title
        document.getElementById("explanation-title").innerHTML =
            "President Reagan's Defense Buildup and the Cold War";

        // Paragraph Text
        let bodyText =
            "When Ronald Reagan won the presidency in 1980, he had a very different approach towards the defense budget than his predecessors. At the time, there were serious concerns about the deteriorating quality of" +
            " the US military. Reagan's policies heavily emphasized the importance of building up US military capabilities to win the Cold War. This included purchasing more military equipment and increasing " +
            "R&D budgets for developing new military technology. As a result of these policies, the defense budget increased drastically under his presidency, particularly during his first term.";

        // Talk in annotations about how he did begin reducing his military spending over his second term
        // Also discuss potentially how the cold war effected this spending
        document.getElementById("explanation-text").innerHTML = bodyText;

        // Now de-construct the previous chart elements

        if (id == "next") {
            create_gdp_line_chart_4();
        } else {
            create_gdp_line_chart_4(true);
        }
    } else if (slide == 8) {
        disable_buttons(2500);

        document.getElementById("current-slide").innerHTML = slide;
        // Title of Plot
        document.getElementById("vis-title").textContent =
            "United States Defence Spending as % of GDP (1990 - 2000)";

        // Paragraph Title
        document.getElementById("explanation-title").innerHTML =
            "Post-Cold War Budget Cuts";

        // Paragraph Text
        let bodyText =
            "After the fall of the Soviet Union in 1991 and subsequent end of the Cold War, there was no longer a need for such heavy investment in defense. Beginning with President George H. W. Bush and continuing" +
            " with President Clinton until 2001, the US saw defense budgets relative to GDP fall dramatically. The era of peace allowed for an increased emphasis on balancing the federal budget. " +
            "Thus, President Clinton's policies during his tenure as president involved reducing overall federal spending over his two terms as president. As a result, defense spending fell dramatically during the 1990s.";

        // defense spending fell almost year-on-year to a 68-year low of 2.91% of the GDP in 1999 - annotate
        document.getElementById("explanation-text").innerHTML = bodyText;

        if (id == "next") {
            create_gdp_line_chart_5();
        } else {
            create_gdp_line_chart_5(true);
        }
    } else if (slide == 9) {
        disable_buttons(2500);

        document.getElementById("current-slide").innerHTML = slide;
        // Title of Plot
        document.getElementById("vis-title").textContent =
            "United States Defence Spending as % of GDP (2001 - 2008)";

        // Paragraph Title
        document.getElementById("explanation-title").innerHTML =
            "9/11: Wars in Iraq and Afghanistan";

        // Paragraph Text
        let bodyText =
            "After the 9/11 attacks, President Bush launched his 'War on Terror' that began the Afghanistan War in 2001 and the Iraq War in 2003. Naturally, this resulted in" +
            " dramatic increases in defense spending over the course of his presidency for modernizing weapons, many of which had grown outdated during the last ten years as a result of" +
            " reduced military spending during the 1990s.";

        // defense spending fell almost year-on-year to a 68-year low of 2.91% of the GDP in 1999 - annotate
        document.getElementById("explanation-text").innerHTML = bodyText;

        if (id == "next") {
            create_gdp_line_chart_6();
        } else {
            create_gdp_line_chart_6(true);
        }
    } else if (slide == 10) {
        disable_buttons(2500);

        document.getElementById("current-slide").innerHTML = slide;
        // Title of Plot
        document.getElementById("vis-title").textContent =
            "United States Defence Spending as % of GDP (2009 - 2018)";

        // Paragraph Title
        document.getElementById("explanation-title").innerHTML =
            "2008 Recession and the End of the Iraq War";

        // Paragraph Text
        let bodyText =
            "Under President Obama's presidency the Iraq war ended in 2011 with the withdrawal of all US combat troops. Furthermore, as a result of the " +
            "2008 recession, defense was one of the many sectors where federal spending was reduced. By the end of President Obama's tenure, defense spending as a percentage" +
            " of GDP had reached Clinton-era levels - significantly reduced from Bush-era defense spending.";

        // defense spending fell almost year-on-year to a 68-year low of 2.91% of the GDP in 1999 - annotate
        document.getElementById("explanation-text").innerHTML = bodyText;

        //create_gdp_line_chart_7();
        if (id == "next") {
            create_gdp_line_chart_7();
        } else {
            create_gdp_line_chart_7(true);
        }
    } else if (slide == 11) {
        disable_buttons(2000, true);
        document.getElementById("next").disabled = true;

        document.getElementById("current-slide").innerHTML = slide;

        // Title of Plot
        document.getElementById("vis-title").textContent =
            "United States Defence Spending as % of GDP (1960 - 2018)";

        // Paragraph Title
        document.getElementById("explanation-title").innerHTML = "The End";

        // Paragraph Text
        let bodyText =
            "Hopefully by this point users have a better understanding of US defense spending over the years, how it compares to other countries, and how it has trended as a function of total GDP over the years." +
            " To start over, please press the 'Restart' button on the top-right of the page. <br><br> The sources for historical information and the data can be accessed by clicking on the 'Sources' button on the" +
            " top-left of the page.";

        // defense spending fell almost year-on-year to a 68-year low of 2.91% of the GDP in 1999 - annotate
        document.getElementById("explanation-text").innerHTML = bodyText;

        create_gdp_line_chart_8();
    }
}
function create_annotations_gdp(
    line1,
    line2,
    text_lines,
    duration = 500,
    change_type,
    delay = 1750,
    left_right = true,
    c1 = "annotation-line1",
    c2 = "annotation-line2"
) {
    let svg = d3.select(".main-svg").append("g").attr("class", "annotation-g");

    svg.append("line")
        .attr("class", c1)
        .style("stroke", "black")
        .attr("stroke-width", 1)
        .attr("x1", line1.origin[0])
        .attr("x2", line1.origin[1])
        .attr("y1", line1.origin[2])
        .attr("y2", line1.origin[3])
        .transition()
        .delay(delay)
        .duration(duration)
        .attr("x1", line1.destination[0])
        .attr("x2", line1.destination[1])
        .attr("y1", line1.destination[2])
        .attr("y2", line1.destination[3]);

    svg.append("line")
        .attr("class", c2)
        .style("stroke", "black")
        .attr("stroke-width", 1)
        .attr("x1", line2.origin[0])
        .attr("x2", line2.origin[1])
        .attr("y1", line2.origin[2])
        .attr("y2", line2.origin[3])
        .transition()
        .delay(delay + duration)
        .duration(duration)
        .attr("x1", line2.destination[0])
        .attr("x2", line2.destination[1])
        .attr("y1", line2.destination[2])
        .attr("y2", line2.destination[3]);

    // First annotation line begins here
    let y_count = line2.destination[2] + 20;

    if (left_right) {
        svg.append("text")
            .attr("class", "annotations")
            .attr("x", line2.origin[0] + 2)
            .attr("y", y_count - 30)
            .attr("opacity", 0)
            .transition()
            .delay(delay + 250)
            .duration(1500)
            .attr("opacity", 1)
            .text(change_type)
            .attr("font-weight", "bold");

        // Add all lines for the annotation
        for (line in text_lines) {
            svg.append("text")
                .attr("class", "annotations")
                .attr("x", line2.origin[0] + 2)
                .attr("y", y_count)
                .attr("opacity", 0)
                .transition()
                .delay(delay + 250)
                .duration(1500)
                .attr("opacity", 1)
                .text(text_lines[line]);
            y_count += 20;
        }
    } else {
        svg.append("text")
            .attr("class", "annotations")
            .attr("x", line2.destination[1])
            .attr("y", y_count - 30)
            .attr("opacity", 0)
            .transition()
            .delay(delay + 250)
            .duration(1500)
            .attr("opacity", 1)
            .text(change_type)
            .attr("font-weight", "bold");

        // Add all lines for the annotation
        for (line in text_lines) {
            svg.append("text")
                .attr("class", "annotations")
                .attr("x", line2.destination[1])
                .attr("y", y_count)
                .attr("opacity", 0)
                .transition()
                .delay(delay + 250)
                .duration(1500)
                .attr("opacity", 1)
                .text(text_lines[line]);
            y_count += 20;
        }
    }
}

function create_gdp_line_chart_8() {
    // Destroy previous annotation

    d3.selectAll(".annotations").transition().duration(500).attr("opacity", 0);

    d3.select(".annotation-line2")
        .transition()
        .on("end", function (d) {
            d3.select(this).remove();
        })
        .delay(500)
        .duration(500)
        .attr("x2", 780);

    d3.select(".annotation-line1")
        .transition()
        .on("end", function (d) {
            d3.select(this).remove();
        })
        .delay(1000)
        .duration(500)
        .attr("x2", 900)
        .attr("y2", 265);

    d3.selectAll(".annotation-g").transition().delay(2000).remove();

    d3.selectAll(".point").transition().duration(1000).style("opacity", 1);
    d3.selectAll(".line-point").transition().duration(1000).style("opacity", 1);
}

function create_gdp_line_chart_7(reverse = false) {
    if (reverse) {
        //console.log(d3.select(".annotation-line4"));
        //console.log(d3.select(".annotation-line4"));
        // d3.selectAll(".annotations")
        //     .transition()
        //     .duration(500)
        //     .attr("opacity", 0);

        // d3.select(".annotation-line4")
        //     .transition()
        //     .on("end", function (d) {
        //         d3.select(this).remove();
        //     })
        //     .delay(500)
        //     .duration(500)
        //     .attr("x2", 780);

        // d3.select(".annotation-line3")
        //     .transition()
        //     .on("end", function (d) {
        //         d3.select(this).remove();
        //     })
        //     .delay(1000)
        //     .duration(500)
        //     .attr("x2", 900)
        //     .attr("y2", 265);

        // d3.selectAll(".annotation-g").transition().delay(2000).remove();

        // Select the SVG container
        let svg = d3.select(".main-svg").select(".plot-g");

        // Filter data points from 1960 to 1981
        const data = data_dict.us_gdp_data.filter(function (d) {
            return d.Year.getFullYear() < 2019;
        });

        // Extract scales from global dictionary
        const x = gdp_scales.xScale;
        const y = gdp_scales.yScale;
        const colScale = gdp_scales.colScale;

        // Extract svg dimensions from global dictionary
        const height = gdp_dimensions.height;
        const width = gdp_dimensions.width;
        const margin = gdp_dimensions.margin;

        let tooltip = d3.select(".tooltip");

        // Remove unnecessary points
        let points = svg.selectAll(".point");
        points.each(function (d) {
            if (d.Year.getFullYear() > 2018) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("r", 0)
                    .attr("cy", (d) => y(0));
            } else {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .style("opacity", 1)
                    .attr("pointer-events", "auto");
            }
        });

        let lines = svg.selectAll(".line-point");
        lines.each(function (d) {
            if (d.Year.getFullYear() > 2018) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("y2", (d) => height - margin.bottom - margin.top);
            } else {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .style("opacity", 1);
            }
        });

        // We want to highlight only key years
        // Fade all previous points
        // We want to highlight only key years
        let years = [];
        for (let index = 2009; index < 2019; index++) {
            years.push(index);
        }
        fade_data(data, years);

        // Define the co-ordinates of the annotation lines
        // Format of line: [x1, x2, y1, y2]
        line1 = {
            origin: [900, 900, 265, 265],
            destination: [900, 780, 265, 45],
        };

        line2 = {
            origin: [780, 780, 45, 45],
            destination: [780, 500, 45, 45],
        };

        // Define array of annotation lines
        let text_lines = [
            "As a result of the 2008 recession and the ",
            "conclusion of the Iraq War in 2011, ",
            "the defense budget was gradually reduced",
            "from the highs of the Bush administration under",
            " President Obama",
        ];

        create_annotations_gdp(
            line1,
            line2,
            text_lines,
            500,
            "Decrease",
            1500,
            false
        );
    } else {
        // Destroy previous annotation
        d3.selectAll(".annotations")
            .transition()
            .duration(500)
            .attr("opacity", 0);

        d3.selectAll(".annotation-line2")
            .transition()
            .on("end", function (d) {
                d3.select(this).remove();
            })
            .delay(500)
            .duration(500)
            .attr("x2", 675)
            .remove();

        d3.selectAll(".annotation-line1")
            .transition()
            .on("end", function (d) {
                d3.select(this).remove();
            })
            .delay(1000)
            .duration(500)
            .attr("x2", 760)
            .attr("y2", 265);

        d3.selectAll(".annotation-g").transition().delay(2000).remove();

        // Select the SVG container
        let svg = d3.select(".main-svg").select("g");

        // Filter data points from 1960 to 1981
        const data = data_dict.us_gdp_data.filter(function (d) {
            return d.Year.getFullYear() < 2019;
        });

        // Extract scales from global dictionary
        const x = gdp_scales.xScale;
        const y = gdp_scales.yScale;
        const colScale = gdp_scales.colScale;

        // Extract svg dimensions from global dictionary
        const height = gdp_dimensions.height;
        const width = gdp_dimensions.width;
        const margin = gdp_dimensions.margin;

        // Fade all previous points
        // We want to highlight only key years
        years = [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018];
        fade_data(data, years);

        let tooltip = d3.select(".tooltip");

        // Remove unnecessary points
        let points = svg.selectAll(".point");
        points.each(function (d) {
            if (years.includes(d.Year.getFullYear())) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("r", 5)
                    .attr("cy", (d) => y(d.PercGDP))
                    .attr("pointer-events", "auto");
            }
        });

        let lines = svg.selectAll(".line-point");
        lines.each(function (d) {
            if (years.includes(d.Year.getFullYear())) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("y2", (d) => y(d.PercGDP));
            }
        });

        //Define the co-ordinates of the annotation lines
        //Format of line: [x1, x2, y1, y2]
        //Line 2 = horizontal, line 1 = diagonal
        let line1 = {
            origin: [900, 900, 265, 265],
            destination: [900, 780, 265, 45],
        };

        let line2 = {
            origin: [780, 780, 45, 45],
            destination: [780, 500, 45, 45],
        };

        // Define array of annotation lines
        let text_lines = [
            "As a result of the 2008 recession and the ",
            "conclusion of the Iraq War in 2011, ",
            "the defense budget was gradually reduced",
            "from the highs of the Bush administration under",
            " President Obama",
        ];

        create_annotations_gdp(
            line1,
            line2,
            text_lines,
            500,
            "Decrease",
            2000,
            false,
            "annotation-line1",
            "annotation-line2"
        );
    }
}

function create_gdp_line_chart_6(reverse = false) {
    if (reverse) {
        d3.selectAll(".annotations")
            .transition()
            .duration(500)
            .attr("opacity", 0);

        d3.select(".annotation-line2")
            .transition()
            .on("end", function (d) {
                d3.select(this).remove();
            })
            .delay(500)
            .duration(500)
            .attr("x2", 780);

        d3.select(".annotation-line1")
            .transition()
            .on("end", function (d) {
                d3.select(this).remove();
            })
            .delay(1000)
            .duration(500)
            .attr("x2", 900)
            .attr("y2", 265);

        d3.selectAll(".annotation-g").transition().delay(2000).remove();

        // Select the SVG container
        let svg = d3.select(".main-svg").select(".plot-g");

        // Filter data points from 1960 to 1981
        const data = data_dict.us_gdp_data.filter(function (d) {
            return d.Year.getFullYear() < 2009;
        });

        // Extract scales from global dictionary
        const x = gdp_scales.xScale;
        const y = gdp_scales.yScale;
        const colScale = gdp_scales.colScale;

        // Extract svg dimensions from global dictionary
        const height = gdp_dimensions.height;
        const width = gdp_dimensions.width;
        const margin = gdp_dimensions.margin;

        let tooltip = d3.select(".tooltip");

        // Remove unnecessary points
        let points = svg.selectAll(".point");
        points.each(function (d) {
            if (d.Year.getFullYear() > 2008) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("r", 0)
                    .attr("cy", (d) => y(0));
            } else {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .style("opacity", 1)
                    .attr("pointer-events", "auto");
            }
        });

        let lines = svg.selectAll(".line-point");
        lines.each(function (d) {
            if (d.Year.getFullYear() > 2008) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("y2", (d) => height - margin.bottom - margin.top);
            } else {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .style("opacity", 1);
            }
        });

        // We want to highlight only key years
        // Fade all previous points
        // We want to highlight only key years
        let years = [];
        for (let index = 2001; index < 2009; index++) {
            years.push(index);
        }
        fade_data(data, years);

        // Define the co-ordinates of the annotation lines
        // Format of line: [x1, x2, y1, y2]
        line1 = {
            origin: [760, 760, 265, 265],
            destination: [760, 675, 265, 25],
        };

        line2 = {
            origin: [675, 675, 25, 25],
            destination: [675, 380, 25, 25],
        };

        // Define array of annotation lines
        let text_lines = [
            "Due to the ongoing wars, the defense budget",
            "rose during the course of President Bush's",
            " tenure in office from 2.94% to 4.22%",
        ];

        create_annotations_gdp(
            line1,
            line2,
            text_lines,
            500,
            "Increase",
            2250,
            false
        );
    } else {
        // Destroy previous annotation
        d3.selectAll(".annotations")
            .transition()
            .duration(500)
            .attr("opacity", 0)
            .remove();

        d3.selectAll(".annotation-line2")
            .transition()
            .delay(500)
            .duration(500)
            .attr("x2", 675)
            .remove();

        d3.selectAll(".annotation-line1")
            .transition()
            .delay(1000)
            .duration(500)
            .attr("x2", 600)
            .attr("y2", 255)
            .remove();

        d3.selectAll(".annotation-g").transition().delay(2000).remove();

        // Select the SVG container
        let svg = d3.select(".main-svg").select("g");

        // Filter data points from 1960 to 1981
        const data = data_dict.us_gdp_data.filter(function (d) {
            return d.Year.getFullYear() < 2009;
        });

        // Extract scales from global dictionary
        const x = gdp_scales.xScale;
        const y = gdp_scales.yScale;
        const colScale = gdp_scales.colScale;

        // Extract svg dimensions from global dictionary
        const height = gdp_dimensions.height;
        const width = gdp_dimensions.width;
        const margin = gdp_dimensions.margin;

        // Fade all previous points
        // We want to highlight only key years
        let years = [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008];
        fade_data(data, years);

        let tooltip = d3.select(".tooltip");

        // Remove unnecessary points
        let points = svg.selectAll(".point");
        points.each(function (d) {
            if (years.includes(d.Year.getFullYear())) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("r", 5)
                    .attr("cy", (d) => y(d.PercGDP))
                    .attr("pointer-events", "auto");
            }
        });

        let lines = svg.selectAll(".line-point");
        lines.each(function (d) {
            if (years.includes(d.Year.getFullYear())) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("y2", (d) => y(d.PercGDP));
            }
        });

        // Define the co-ordinates of the annotation lines
        // Format of line: [x1, x2, y1, y2]
        // Line 2 = horizontal, line 1 = diagonal
        line1 = {
            origin: [760, 760, 265, 265],
            destination: [760, 675, 265, 25],
        };

        line2 = {
            origin: [675, 675, 25, 25],
            destination: [675, 380, 25, 25],
        };

        // Define array of annotation lines
        let text_lines = [
            "Due to the ongoing wars, the defense budget",
            "rose during the course of President Bush's",
            " tenure in office from 2.94% to 4.22%",
        ];

        create_annotations_gdp(
            line1,
            line2,
            text_lines,
            500,
            "Increase",
            2250,
            false
        );
    }
}

function create_gdp_line_chart_5(reverse = false) {
    if (reverse) {
        // Destroy previous annotation
        d3.selectAll(".annotations")
            .transition()
            .duration(500)
            .attr("opacity", 0)
            .remove();

        d3.selectAll(".annotation-line2")
            .transition()
            .delay(500)
            .duration(500)
            .attr("x2", 675)
            .remove();

        d3.selectAll(".annotation-line1")
            .transition()
            .delay(1000)
            .duration(500)
            .attr("x2", 760)
            .attr("y2", 265)
            .remove();

        d3.selectAll(".annotation-g").transition().delay(2000).remove();

        // Select the SVG container
        let svg = d3.select(".main-svg").select(".plot-g");

        // Filter data points from 1960 to 1981
        const data = data_dict.us_gdp_data.filter(function (d) {
            return d.Year.getFullYear() < 2001;
        });

        // Extract scales from global dictionary
        const x = gdp_scales.xScale;
        const y = gdp_scales.yScale;
        const colScale = gdp_scales.colScale;

        // Extract svg dimensions from global dictionary
        const height = gdp_dimensions.height;
        const width = gdp_dimensions.width;
        const margin = gdp_dimensions.margin;

        let tooltip = d3.select(".tooltip");

        // Remove unnecessary points
        let points = svg.selectAll(".point");
        points.each(function (d) {
            if (d.Year.getFullYear() > 2000) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("r", 0)
                    .attr("cy", (d) => y(0));
            } else {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .style("opacity", 1)
                    .attr("pointer-events", "auto");
            }
        });

        let lines = svg.selectAll(".line-point");
        lines.each(function (d) {
            if (d.Year.getFullYear() > 2000) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("y2", (d) => height - margin.bottom - margin.top);
            } else {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .style("opacity", 1);
            }
        });

        // We want to highlight only key years
        // Fade all previous points
        // We want to highlight only key years
        let years = [];
        for (let index = 1990; index < 2001; index++) {
            years.push(index);
        }
        fade_data(data, years);

        // Define the co-ordinates of the annotation lines
        // Format of line: [x1, x2, y1, y2]
        line1 = {
            origin: [600, 600, 255, 255],
            destination: [600, 675, 255, 120],
        };

        line2 = {
            origin: [675, 675, 120, 120],
            destination: [675, 960, 120, 120],
        };

        // Define array of annotation lines
        let text_lines = [
            "The 1990s saw defense budgets relative to",
            "GDP fall to record lows. Presidents H. W. Bush",
            " and Clinton focused primarily on balancing",
            "the budget, which required reducing overall",
            "federal spending.",
        ];

        create_annotations_gdp(line1, line2, text_lines, 500, "Decrease", 2250);
    } else {
        // Destroy previous annotation
        d3.selectAll(".annotations")
            .transition()
            .duration(500)
            .attr("opacity", 0)
            .remove();

        d3.selectAll(".annotation-line2")
            .transition()
            .delay(500)
            .duration(500)
            .attr("x2", 550)
            .remove();

        d3.selectAll(".annotation-line1")
            .transition()
            .delay(1000)
            .duration(500)
            .attr("x2", 440)
            .attr("y2", 160)
            .remove();

        d3.selectAll(".annotation-g").transition().delay(2000).remove();

        // Select the SVG container
        let svg = d3.select(".main-svg").select(".plot-g");

        // Filter data points from 1960 to 1981
        const data = data_dict.us_gdp_data.filter(function (d) {
            return d.Year.getFullYear() < 2001;
        });

        // Extract scales from global dictionary
        const x = gdp_scales.xScale;
        const y = gdp_scales.yScale;
        const colScale = gdp_scales.colScale;

        // Extract svg dimensions from global dictionary
        const height = gdp_dimensions.height;
        const width = gdp_dimensions.width;
        const margin = gdp_dimensions.margin;

        // Fade all previous points
        // We want to highlight only key years
        years = [
            1990,
            1991,
            1992,
            1993,
            1994,
            1995,
            1996,
            1997,
            1998,
            1999,
            2000,
        ];
        fade_data(data, years);

        let tooltip = d3.select(".tooltip");

        // Remove unnecessary points
        let points = svg.selectAll(".point");
        points.each(function (d) {
            if (years.includes(d.Year.getFullYear())) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("r", 5)
                    .attr("cy", (d) => y(d.PercGDP))
                    .attr("pointer-events", "auto");
            }
        });

        let lines = svg.selectAll(".line-point");
        lines.each(function (d) {
            if (years.includes(d.Year.getFullYear())) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("y2", (d) => y(d.PercGDP));
            }
        });

        // Define the co-ordinates of the annotation lines
        // Format of line: [x1, x2, y1, y2]
        // Line 2 = horizontal, line 1 = diagonal
        line1 = {
            origin: [600, 600, 255, 255],
            destination: [600, 675, 255, 120],
        };

        line2 = {
            origin: [675, 675, 120, 120],
            destination: [675, 960, 120, 120],
        };

        // Define array of annotation lines
        let text_lines = [
            "The 1990s saw defense budgets relative to",
            "GDP fall to record lows. Presidents H. W. Bush",
            " and Clinton focused primarily on balancing",
            "the budget, which required reducing overall",
            "federal spending.",
        ];

        create_annotations_gdp(line1, line2, text_lines, 500, "Decrease", 2250);
    }
}

function create_gdp_line_chart_4(reverse = false) {
    if (reverse) {
        // Destroy previous annotation
        d3.selectAll(".annotations")
            .transition()
            .duration(500)
            .attr("opacity", 0)
            .remove();

        d3.selectAll(".annotation-line2")
            .transition()
            .delay(500)
            .duration(500)
            .attr("x2", 675)
            .remove();

        d3.selectAll(".annotation-line1")
            .transition()
            .delay(1000)
            .duration(500)
            .attr("x2", 600)
            .attr("y2", 255)
            .remove();

        d3.selectAll(".annotation-g").transition().delay(2000).remove();

        // Select the SVG container
        let svg = d3.select(".main-svg").select(".plot-g");

        // Filter data points from 1960 to 1981
        const data = data_dict.us_gdp_data.filter(function (d) {
            return d.Year.getFullYear() < 1989;
        });

        // Extract scales from global dictionary
        const x = gdp_scales.xScale;
        const y = gdp_scales.yScale;
        const colScale = gdp_scales.colScale;

        // Extract svg dimensions from global dictionary
        const height = gdp_dimensions.height;
        const width = gdp_dimensions.width;
        const margin = gdp_dimensions.margin;

        let tooltip = d3.select(".tooltip");

        // Remove unnecessary points
        let points = svg.selectAll(".point");
        points.each(function (d) {
            if (d.Year.getFullYear() > 1989) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("r", 0)
                    .attr("cy", (d) => y(0));
            } else {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .style("opacity", 1)
                    .attr("pointer-events", "auto");
            }
        });

        let lines = svg.selectAll(".line-point");
        lines.each(function (d) {
            if (d.Year.getFullYear() > 1989) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("y2", (d) => height - margin.bottom - margin.top);
            } else {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .style("opacity", 1);
            }
        });

        // We want to highlight only key years
        // Fade all previous points
        // We want to highlight only key years
        let years = [];
        for (let index = 1981; index < 1989; index++) {
            years.push(index);
        }
        fade_data(data, years);

        // Define the co-ordinates of the annotation lines
        // Format of line: [x1, x2, y1, y2]
        line1 = {
            origin: [440, 440, 160, 160],
            destination: [440, 550, 160, 60],
        };

        line2 = {
            origin: [550, 550, 60, 60],
            destination: [550, 808, 60, 60],
        };

        // Define array of annotation lines
        let text_lines = [
            "On average, defense spending during the",
            "Reagan administration reached levels not",
            "seen since the height of the Vietnam",
            "War",
        ];

        create_annotations_gdp(line1, line2, text_lines, 500, "Increase", 2250);
    } else {
        // Destroy previous annotation
        d3.selectAll(".annotations")
            .transition()
            .duration(500)
            .attr("opacity", 0)
            .remove();

        d3.selectAll(".annotation-line2")
            .transition()
            .delay(500)
            .duration(500)
            .attr("x2", 400)
            .remove();

        d3.selectAll(".annotation-line1")
            .transition()
            .delay(1000)
            .duration(500)
            .attr("x2", 265)
            .attr("y2", 160)
            .remove();

        d3.selectAll(".annotation-g").transition().delay(2000).remove();

        // Select the SVG container
        let svg = d3.select(".main-svg").select(".plot-g");

        // Filter data points from 1960 to 1981
        const data = data_dict.us_gdp_data.filter(function (d) {
            return d.Year.getFullYear() < 1990;
        });

        // Extract scales from global dictionary
        const x = gdp_scales.xScale;
        const y = gdp_scales.yScale;
        const colScale = gdp_scales.colScale;

        // Extract svg dimensions from global dictionary
        const height = gdp_dimensions.height;
        const width = gdp_dimensions.width;
        const margin = gdp_dimensions.margin;

        // Fade all previous points
        // We want to highlight only key years
        let years = [1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989];
        fade_data(data, [1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989]);

        let tooltip = d3.select(".tooltip");

        // Remove unnecessary points
        let points = svg.selectAll(".point");
        console.log(points);
        points.each(function (d) {
            if (years.includes(d.Year.getFullYear())) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("r", 5)
                    .attr("cy", (d) => y(d.PercGDP))
                    .attr("pointer-events", "auto");
            }
        });

        let lines = svg.selectAll(".line-point");
        lines.each(function (d) {
            if (years.includes(d.Year.getFullYear())) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("y2", (d) => y(d.PercGDP));
            }
        });

        // Define the co-ordinates of the annotation lines
        // Format of line: [x1, x2, y1, y2]
        // Line 2 = horizontal, line 1 = diagonal
        line1 = {
            origin: [440, 440, 160, 160],
            destination: [440, 550, 160, 60],
        };

        line2 = {
            origin: [550, 550, 60, 60],
            destination: [550, 808, 60, 60],
        };

        // Define array of annotation lines
        let text_lines = [
            "On average, defense spending during the",
            "Reagan administration reached levels not",
            "seen since the height of the Vietnam",
            "War",
        ];

        create_annotations_gdp(line1, line2, text_lines, 500, "Increase", 2250);
    }
}

function create_gdp_line_chart_3(reverse = false) {
    if (reverse) {
        // Destroy previous annotation
        d3.selectAll(".annotations")
            .transition()
            .duration(500)
            .attr("opacity", 0)
            .remove();

        d3.selectAll(".annotation-line2")
            .transition()
            .delay(500)
            .duration(500)
            .attr("x2", 550)
            .remove();

        d3.selectAll(".annotation-line1")
            .transition()
            .delay(1000)
            .duration(500)
            .attr("x2", 440)
            .attr("y2", 160)
            .remove();

        d3.selectAll(".annotation-g").transition().delay(2000).remove();

        // Select the SVG container
        let svg = d3.select(".main-svg").select(".plot-g");

        // Filter data points from 1960 to 1981
        const data = data_dict.us_gdp_data.filter(function (d) {
            return d.Year.getFullYear() < 1981;
        });

        // Extract scales from global dictionary
        const x = gdp_scales.xScale;
        const y = gdp_scales.yScale;
        const colScale = gdp_scales.colScale;

        // Extract svg dimensions from global dictionary
        const height = gdp_dimensions.height;
        const width = gdp_dimensions.width;
        const margin = gdp_dimensions.margin;

        let tooltip = d3.select(".tooltip");

        // Remove unnecessary points
        let points = svg.selectAll(".point");
        points.each(function (d) {
            if (d.Year.getFullYear() > 1980) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("r", 0)
                    .attr("cy", (d) => y(0));
            } else {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .style("opacity", 1)
                    .attr("pointer-events", "auto");
            }
        });

        let lines = svg.selectAll(".line-point");
        lines.each(function (d) {
            if (d.Year.getFullYear() > 1980) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("y2", (d) => height - margin.bottom - margin.top);
            } else {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .style("opacity", 1);
            }
        });

        // We want to highlight only key years
        // Fade all previous points
        // We want to highlight only key years
        let years = [];
        for (let index = 1968; index < 1981; index++) {
            years.push(index);
        }
        fade_data(data, years);

        // Define the co-ordinates of the annotation lines
        // Format of line: [x1, x2, y1, y2]
        line1 = {
            origin: [265, 265, 160, 160],
            destination: [265, 400, 160, 60],
        };

        line2 = {
            origin: [400, 400, 60, 60],
            destination: [400, 683, 60, 60],
        };

        // Define array of annotation lines
        let text_lines = [
            "Defense spending drops almost year-on-year",
            "from the heights of the late 1960s under ",
            "Presidents Nixon and Ford",
        ];

        create_annotations_gdp(line1, line2, text_lines, 500, "Decrease", 2250);
    } else {
        // Destroy previous annotation

        d3.selectAll(".annotations")
            .transition()
            .duration(500)
            .attr("opacity", 0);

        d3.selectAll(".annotation-line2")
            .transition()
            .delay(500)
            .duration(500)
            .attr("x2", 240)
            .remove();

        d3.selectAll(".annotation-line1")
            .transition()
            .delay(1000)
            .duration(500)
            .attr("x2", 175)
            .attr("y2", 110)
            .remove();

        d3.selectAll(".annotation-g").transition().delay(2000).remove();

        // Select the SVG container
        let svg = d3.select(".main-svg").select(".plot-g");

        // Filter data points from 1960 to 1981
        const data = data_dict.us_gdp_data.filter(function (d) {
            return d.Year.getFullYear() < 1981;
        });

        // Extract scales from global dictionary
        const x = gdp_scales.xScale;
        const y = gdp_scales.yScale;
        const colScale = gdp_scales.colScale;

        // Extract svg dimensions from global dictionary
        const height = gdp_dimensions.height;
        const width = gdp_dimensions.width;
        const margin = gdp_dimensions.margin;

        // Fade all previous points
        // We want to highlight only key years
        let years = [];
        for (let index = 1968; index < 1981; index++) {
            years.push(index);
        }
        fade_data(data, years);

        let tooltip = d3.select(".tooltip");

        // Remove unnecessary points
        let points = svg.selectAll(".point");
        points.each(function (d) {
            if (years.includes(d.Year.getFullYear())) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("r", 5)
                    .attr("cy", (d) => y(d.PercGDP))
                    .attr("pointer-events", "auto");
            }
        });

        let lines = svg.selectAll(".line-point");
        lines.each(function (d) {
            if (years.includes(d.Year.getFullYear())) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("y2", (d) => y(d.PercGDP));
            }
        });

        // Define the co-ordinates of the annotation lines
        // Format of line: [x1, x2, y1, y2]
        // Line 1 = horizontal, line 2 = vertical
        line1 = {
            origin: [265, 265, 160, 160],
            destination: [265, 400, 160, 60],
        };

        line2 = {
            origin: [400, 400, 60, 60],
            destination: [400, 683, 60, 60],
        };

        // Define array of annotation lines
        let text_lines = [
            "Defense spending drops almost year-on-year",
            "from the heights of the late 1960s under ",
            "Presidents Nixon and Ford",
        ];

        create_annotations_gdp(line1, line2, text_lines, 500, "Decrease", 2000);
    }
}

function create_gdp_line_chart_2(reverse = false) {
    if (reverse) {
        // Destroy previous annotation
        d3.selectAll(".annotations")
            .transition()
            .duration(500)
            .attr("opacity", 0)
            .remove();

        d3.selectAll(".annotation-line2")
            .transition()
            .delay(500)
            .duration(500)
            .attr("x2", 400)
            .remove();

        d3.selectAll(".annotation-line1")
            .transition()
            .delay(1000)
            .duration(500)
            .attr("x2", 265)
            .attr("y2", 160)
            .remove();

        d3.selectAll(".annotation-g").transition().delay(2000).remove();

        // Filter data points from 1960 to 1969
        const data = data_dict.us_gdp_data.filter(function (d) {
            return d.Year.getFullYear() < 1968;
        });

        // Extract scales from global dictionary
        const x = gdp_scales.xScale;
        const y = gdp_scales.yScale;
        const colScale = gdp_scales.colScale;

        // Extract svg dimensions from global dictionary
        const height = gdp_dimensions.height;
        const width = gdp_dimensions.width;
        const margin = gdp_dimensions.margin;

        let tooltip = d3.select(".tooltip");

        // Select the SVG container
        let svg = d3.select(".main-svg").select(".plot-g");

        // Fade all previous points
        // We want to highlight only key years
        let years = [];
        for (let index = 1968; index < 2019; index++) {
            years.push(index);
        }

        //fade_data(data.concat, years);

        // Remove unnecessary points
        let points = svg.selectAll(".point");
        points.each(function (d) {
            if (d.Year.getFullYear() > 1967) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("r", 0)
                    .attr("cy", (d) => y(0));
            } else {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .style("opacity", 1)
                    .attr("pointer-events", "auto");
            }
        });

        let lines = svg.selectAll(".line-point");
        lines.each(function (d) {
            if (d.Year.getFullYear() > 1967) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("y2", (d) => height - margin.bottom - margin.top);
            } else {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .style("opacity", 1);
            }
        });

        // We want to highlight only key years
        fade_data(data, [1965, 1966, 1967]);

        // Define the co-ordinates of the annotation lines
        // Format of line: [x1, x2, y1, y2]
        line1 = {
            origin: [175, 175, 110, 110],
            destination: [175, 240, 110, 75],
        };

        line2 = {
            origin: [240, 240, 75, 75],
            destination: [240, 490, 75, 75],
        };

        // Define array of annotation lines
        let text_lines = [
            "Military spending drastically increases",
            "from 7.21% of the GDP in 1965 to 9.06% ",
            "in 1967. These years are when the US",
            "increased its direct involvement in the",
            "Vietnam War.",
        ];

        create_annotations_gdp(line1, line2, text_lines, 500, "Increase", 2500);
    } else {
        // Select the SVG container
        let svg = d3.select(".main-svg").select(".plot-g");

        // Filter data points from 1960 to 1969
        const data = data_dict.us_gdp_data.filter(function (d) {
            return d.Year.getFullYear() < 1968;
        });

        // Extract scales from global dictionary
        const x = gdp_scales.xScale;
        const y = gdp_scales.yScale;
        const colScale = gdp_scales.colScale;

        // Extract svg dimensions from global dictionary
        const height = gdp_dimensions.height;
        const width = gdp_dimensions.width;
        const margin = gdp_dimensions.margin;

        let tooltip = d3.select(".tooltip");

        // Remove unnecessary points
        let points = svg.selectAll(".point");
        points.each(function (d) {
            if (d.Year.getFullYear() > 1967) {
                d3.select(this)
                    .attr("opacity", 1)
                    .transition()
                    .duration(1000)
                    .attr("r", 0)
                    .attr("cy", (d) => y(0));
            } else {
                d3.select(this)
                    .transition()
                    .delay(500)
                    .attr("pointer-events", "auto");
            }
        });

        let lines = svg.selectAll(".line-point");
        lines.each(function (d) {
            if (d.Year.getFullYear() > 1967) {
                d3.select(this)
                    .transition()
                    //.delay(500)
                    .duration(1000)
                    .attr("y1", (d) => height - margin.bottom - margin.top);
            }
        });

        points
            .on("mouseover", function (d) {
                d3.select(this).transition().attr("r", 8);

                let current = this;

                let others = d3.selectAll(".point").filter(function (d) {
                    return current != this;
                });
                //others.transition().duration(500).attr("fill", "grey");
                // Add Country header to Tooltip
                tooltip
                    .select(".country")
                    .html(
                        "<p class='tooltip-para'><b>" +
                            d.Country +
                            "<br>" +
                            d.Year.getFullYear() +
                            "</p><hr>"
                    )
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
                d3.select(this).transition().attr("r", 5);
                // Hide tooltip on mouse exit from slice
                tooltip.style("display", "none");
                tooltip.style("opacity", 0);
            })
            .on("mousemove", function (d) {
                tooltip
                    .style("top", d3.event.layerY + 20 + "px")
                    .style("left", d3.event.layerX + "px");
            });

        // We want to highlight only key years
        fade_data(data, [1965, 1966, 1967]);

        // Define the co-ordinates of the annotation lines
        // Format of line: [x1, x2, y1, y2]
        line1 = {
            origin: [175, 175, 110, 110],
            destination: [175, 240, 110, 75],
        };

        line2 = {
            origin: [240, 240, 75, 75],
            destination: [240, 490, 75, 75],
        };

        // Define array of annotation lines
        let text_lines = [
            "Military spending drastically increases",
            "from 7.21% of the GDP in 1965 to 9.06% ",
            "in 1967. These years are when the US",
            "increased its direct involvement in the",
            "Vietnam War.",
        ];

        create_annotations_gdp(line1, line2, text_lines, 500, "Increase", 1000);
    }
}

async function create_gdp_line_chart_1(reverse = false) {
    d3.selectAll(".point").attr("pointer-events", "none");

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

    data_dict.world_gdp_data = world_data;
    data_dict.us_gdp_data = us_data;

    // Set the dimensions of the SVG
    const width = gdp_dimensions.width;
    const height = gdp_dimensions.height;
    const margin = gdp_dimensions.margin;

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

        let lines = svg.selectAll(".line-point");
        lines.each(function (d) {
            if (years.includes(d.Year.getFullYear())) {
                d3.select(this)
                    .transition()
                    .delay(1250)
                    .duration(1000)
                    .attr("y1", (d) => y(d.PercGDP));
            } else {
                d3.select(this).transition().duration(500).style("opacity", 1);
            }
        });
    } else {
        // Add a "g" element to the svg
        d3.select(".main-svg")
            .select(".plot-g")
            .transition()
            .delay(3000)
            .selectAll("*")
            .remove();
        //.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        let svg = d3.select(".main-svg").select(".plot-g");
        // Add the X and Y axis
        // The y-axis
        let yAxis = d3.select(".main-svg").select(".yAxis-g");

        yAxis
            //.append("g")
            //.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            //.call(d3.axisLeft(y2).ticks(0))
            .transition()
            .delay(2500)
            .duration(500)
            .call(d3.axisLeft(y).ticks(0))
            .transition()
            .call(d3.axisLeft(y));

        let translate = height - margin.bottom;
        let xAxis = d3
            .select(".main-svg")
            .select(".xAxis-g")
            //.append("g")
            //.attr("transform", "translate(" + margin.left + "," + translate + ")")
            //.call(d3.axisBottom(x2).ticks(0))
            .transition()
            .delay(2500)
            .duration(500)
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
            .delay(2500)
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
            .delay(2500)
            .duration(1000)
            .attr("x", width / 2 - 25)
            .attr("y", height - margin.bottom + 10)
            .text("Year");

        let points = svg
            .append("g")
            .selectAll(".point")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "point")
            .attr("r", 0)
            .attr("opacity", 1)
            .attr("cx", (d) => x(d.Year))
            .attr("cy", (d) => y(0))
            .attr("fill", (d) => colScale(d.PercGDP))
            .attr("pointer-events", "none");

        points
            .on("mouseover", function (d) {
                d3.select(this).transition().attr("r", 8);

                let current = this;

                let others = d3.selectAll(".point").filter(function (d) {
                    return current != this;
                });
                //others.transition().duration(500).attr("fill", "grey");
                // Add Country header to Tooltip
                tooltip
                    .select(".country")
                    .html(
                        "<p class='tooltip-para'><b>" +
                            d.Country +
                            "<br>" +
                            d.Year.getFullYear() +
                            "</p><hr>"
                    )
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
                d3.select(this).transition().attr("r", 5);
                // Hide tooltip on mouse exit from slice
                tooltip.style("display", "none");
                tooltip.style("opacity", 0);
            })
            .on("mousemove", function (d) {
                tooltip
                    .style("top", d3.event.layerY + 20 + "px")
                    .style("left", d3.event.layerX + "px");
            });

        points
            .transition()
            .delay(3000)
            .duration(1000)
            .attr("r", 5)
            .attr("cx", (d) => x(d.Year))
            .attr("cy", (d) => y(d.PercGDP))
            .transition()
            .attr("pointer-events", "none");

        let lines = svg
            .selectAll(".line-point")
            .data(data)
            .enter()
            .append("line")
            .attr("class", "line-point")
            .style("opacity", 1)
            .attr("x1", (d) => x(d.Year))
            .attr("x2", (d) => x(d.Year))
            .attr("y1", (d) => y(d.PercGDP))
            .attr("y2", (d) => y(d.PercGDP));

        lines
            .transition()
            .delay(3750)
            .duration(500)
            .attr("y2", (d) => height - margin.bottom - margin.top)
            .style("stroke", (d) => colScale(d.PercGDP))
            .attr("stroke-width", 1.5);

        // Make tooltip
        let tooltip = d3.select(".tooltip");
    }
    //enable_mouse_events();
}

function fade_data(data, years_kept) {
    // First, highlight the vietnam war years
    let hide_years = [];
    data.forEach(function (d) {
        if (!years_kept.includes(d.Year.getFullYear())) {
            hide_years.push(d.Year.getFullYear());
        }
    });

    let others = d3.selectAll(".point").filter(function (d) {
        //console.log(d.Year.getFullYear());
        if (hide_years.includes(d.Year.getFullYear())) {
            return this;
        }
    });

    let others2 = d3.selectAll(".line-point").filter(function (d) {
        if (hide_years.includes(d.Year.getFullYear())) {
            return this;
        }
    });
    others.transition().delay(1000).duration(500).style("opacity", 0.3);
    others2.transition().delay(1000).duration(500).style("opacity", 0.3);
}

async function create_pie_chart_svg() {
    // do this in main
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
    const margin = 60;
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
        .attr(
            "transform",
            "translate(" + width / 2 + "," + (height - 60) / 2 + ")"
        );

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
        .outerRadius(radius + 15);

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
            .html(
                "<p class='tooltip-para'><b>" +
                    d.data.Country +
                    "<br>" +
                    d.data.Year +
                    "</p><hr>"
            )
            .style("color", "black");

        // Add Spending for that Country to tooltip
        tooltip
            .select(".spending")
            .html("<b>Total Spending: </b>$" + spending + "B USD");

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
        .attr("opacity", 0)
        .each(function (d) {
            let xVal = 0;
            let yVal = 0;
            center = arcGenerator.centroid(d);

            if (d.data.Country == "World") {
                xVal = center[0];
                yVal = center[1] + 20;
            } else {
                xVal = center[0] - 30;
                yVal = center[1] + 20;
            }

            d3.select(this)
                .attr("x", xVal)
                .attr("y", yVal)
                .text(d.data.Country);
        })
        .transition()
        .delay(1000)
        .duration(500)
        .attr("opacity", "1");

    // Make tooltip
    let tooltip = d3
        .select(".svg1-container")
        .append("div")
        .attr("class", "tooltip-pie");
    tooltip.append("div").attr("class", "country");
    tooltip.append("div").attr("class", "spending");

    // Create annotation and transition in
    svg.append("line")
        .attr("class", "annotation-line1")
        .attr("x1", 105)
        .attr("x2", 105)
        .attr("y1", -5)
        .attr("y2", -5)
        .transition()
        .delay(1200)
        .duration(750)
        .attr("x2", 210)
        .attr("y2", 55)
        .style("stroke", "black")
        .attr("stroke-width", 1);

    svg.append("line")
        .attr("class", "annotation-line2")
        .attr("x1", 210)
        .attr("x2", 210)
        .attr("y1", 55)
        .attr("y2", 55)
        .transition()
        .delay(1600)
        .duration(750)
        .attr("x2", 460)
        .style("stroke", "black")
        .attr("stroke-width", 1);

    svg.append("text")
        .attr("class", "annotations")
        .attr("x", 212)
        .attr("y", 45)
        .attr("opacity", 0)
        .text("Large Proportion")
        .attr("font-weight", "bold")
        .transition()
        .delay(2000)
        .duration(500)
        .attr("opacity", 1);

    svg.append("text")
        .attr("class", "annotations")
        .attr("x", 212)
        .attr("y", 75)
        .attr("opacity", 0)
        .text("In 2018, the United States accounted for")
        .transition()
        .delay(2000)
        .duration(500)
        .attr("opacity", 1);

    svg.append("text")
        .attr("class", "annotations")
        .attr("x", 212)
        .attr("y", 95)
        .attr("opacity", 0)
        .text("approximately 36.4% of total worldwide")
        .transition()
        .delay(2000)
        .duration(500)
        .attr("opacity", 1);

    svg.append("text")
        .attr("class", "annotations")
        .attr("x", 212)
        .attr("y", 115)
        .attr("opacity", 0)
        .transition()
        .delay(2000)
        .duration(500)
        .text("military spending.")
        .attr("opacity", 1);
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

    d3.select(".main-svg")
        .selectAll(".arc")
        .on("mouseover", function () {})
        .on("mousemove", function () {})
        .on("mouseout", function () {});

    d3.select(".main-svg")
        .select("g")
        .selectAll(".pieText")
        .transition()
        .duration(500)
        .attr("opacity", 0)
        .remove();

    d3.selectAll(".annotation-line1")
        .transition()
        .duration(500)
        .delay(500)
        .attr("x2", 105)
        .attr("y2", -5)
        .remove();

    d3.selectAll(".annotation-line2")
        .transition()
        .duration(500)
        .attr("x2", 210)
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
    d3.selectAll(".tooltip-pie").remove();
    d3.transition().delay(2000).selectAll(".pieText").remove();
}
