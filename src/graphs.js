import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3'; // Import D3.js library

const Graphs = ({ activities }) => {
  const graphRef = useRef(null);
  const width = 1200; // Define width of the SVG
  const height = 300; // Define height of the SVG

  useEffect(() => {
    if (activities.length) {
      drawGraphs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activities]);

  const drawGraphs = () => {
    const svg = d3.select(graphRef.current);

    // Clear previous graph content
    svg.selectAll("*").remove();

    // Adjust margin and inner width/height to leave space for axis labels
    const margin = { top: 30, right: 40, bottom: 60, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Get the date 10 days ago and today's date
    const today = new Date();
    const tenDaysAgo = new Date(today);
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 9); // Get the date 10 days ago

    // Generate an array of the last 10 days
    const lastTenDays = Array.from({ length: 10 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      return date; // Return Date object
    }).reverse(); // Reverse the order of the array

    // Filter activities for the last 10 days
    const barData = lastTenDays.flatMap((date) => {
      const activitiesForDate = activities.filter(a => {
        const activityDate = new Date(a.date);
        return activityDate.getDate() === date.getDate();
      });
      return activitiesForDate.map((activity, index) => ({
        date: date.getDate(),
        type: activity ? activity.type : null,
        distance: activity ? activity.distance : 0,
        index // Index within the group of activities for this date
      }));
    });

    // Create scales
    const xScale = d3.scaleBand()
      .domain(lastTenDays.map(date => date.getDate())) // Use last 10 days as domain
      .range([0, innerWidth])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(barData, d => d.distance)])
      .nice()
      .range([innerHeight, 0]);

    // Append group element and translate to leave space for margin
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Append horizontal gridlines with animation
    g.selectAll(".gridline")
      .data(yScale.ticks(10)) // Adjust ticks to show increments of 1
      .enter().append("line")
      .attr("class", "gridline")
      .attr("x1", 0)
      .attr("y1", 0) // Start from the top initially
      .attr("x2", innerWidth)
      .attr("y2", 0) // Initially invisible
      .attr("stroke", "#000000")
      .attr("stroke-width", "0.5px")
      .transition() // Add transition
      .duration(1000) // Duration of animation in milliseconds
      .delay((d, i) => i * 100 + 2000) // Delay each line after the bars
      .attr("y1", d => yScale(d)) // Animate from top to bottom
      .attr("y2", d => yScale(d));



    // Append bars
    const bars = g.selectAll(".bar")
      .data(barData)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => {
        const numActivities = activities.filter(a => new Date(a.date).getDate() === d.date).length;
        if (numActivities === 1) {
          return xScale(d.date) + (xScale.bandwidth() - xScale.bandwidth() / 2) / 2; // Center the pillar when there's only one activity
        } else {
          return xScale(d.date) + xScale.bandwidth() / (numActivities + 1) * (d.index + 1); // Spread the pillars when multiple activities
        }
      })
      .attr("width", d => {
        const numActivities = activities.filter(a => new Date(a.date).getDate() === d.date).length;
        if (numActivities === 1) {
          return xScale.bandwidth() / 2; // Set width to half of bandwidth when there's only one activity
        } else {
          return xScale.bandwidth() / (numActivities + 1); // Adjust width when multiple activities
        }
      })
      .attr("y", innerHeight) // Start from bottom
      .attr("height", 0) // Initial height is 0
      .attr("fill", d => getColor(d.type)) // Set color
      .transition() // Add transition
      .duration(1000) // Duration of animation in milliseconds
      .delay((d, i) => i * 100) // Delay each bar
      .attr("y", d => yScale(d.distance))
      .attr("height", d => innerHeight - yScale(d.distance));

    // Append x-axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d => d)); // Format ticks to show only day number

    // Append y-axis
    g.append("g").call(d3.axisLeft(yScale).ticks(10));

    // Append bar labels with animation
    g.selectAll(".bar-label")
      .data(barData)
      .enter().append("text")
      .attr("class", "bar-label")
      .attr("x", d => {
        const numActivities = activities.filter(a => new Date(a.date).getDate() === d.date).length;
        if (numActivities === 1) {
          return xScale(d.date) + (xScale.bandwidth() - xScale.bandwidth() / 2); // Center the label when there's only one activity
        } else {
          return xScale(d.date) + xScale.bandwidth() / (numActivities + 1) * (d.index + 1) + xScale.bandwidth() / (numActivities + 1) / 2;
        }
      })
      .attr("y", innerHeight) // Set initial position at the bottom
      .attr("text-anchor", "middle")
      .attr("fill-opacity", 0) // Initially invisible
      .text(d => d.distance)
      .transition() // Add transition
      .duration(1000) // Duration of animation in milliseconds
      .delay((d, i) => i * 100 + 500) // Delay each label to appear after bars
      .attr("y", d => yScale(d.distance) - 5) // Move label to appropriate position
      .attr("fill-opacity", 1); // Make label visible

    // Style axis labels
    svg.selectAll("text")
      .attr("font-family", 'Bebas Neue', "sans-serif")
      .attr("font-size", "20px")
      .attr("fill", "#000000");

    // Style axis lines
    svg.selectAll("path")
      .attr("stroke", "#000000")
      .attr("stroke-width", "1");

    // Style bars
    svg.selectAll(".bar")
      .attr("stroke", "#000000")
      .attr("stroke-width", "1");

    // Append color legends
    const legendGroup = svg.append("g")
      .attr("transform", `translate(${innerWidth / 2 - 100}, ${height - margin.bottom / 2})`); // Adjust position

    const legendData = ["Swimming", "Running", "Cycling"];
    const legendSpacing = 120;

    legendGroup.selectAll(".legend")
      .data(legendData)
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(${i * legendSpacing}, 0)`);

    legendGroup.selectAll(".legend")
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", d => getColor(d));

    legendGroup.selectAll(".legend")
      .append("text")
      .attr("x", 15)
      .attr("y", 10)
      .attr("dy", ".35em")
      .text(d => d)
      .attr("font-family", 'Bebas Neue', "sans-serif")
      .attr("font-size", "20px")
      .attr("fill", "#000000");
  };

  const getColor = (type) => {
    switch (type) {
      case "Swimming":
        return "#70c7f8";
      case "Running":
        return "#4caf50";
      case "Cycling":
        return "#ff9800";
      default:
        return "steelblue"; // Default color
    }
  };

  return (
    <div className="graphs-container">
      <svg ref={graphRef} width={width} height={height}></svg>
    </div>
  );
};

export default Graphs;
