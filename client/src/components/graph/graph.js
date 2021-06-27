//Import react dependency
import React from 'react';
import { Pie, Bar } from 'react-chartjs-2';

//Creating the modal react component
const Graph = props => {
  //Extracting data from properties of component
  const { labels, data, colours, type, xtitle, ytitle, secondaryLabels, yaxis } = props;

  const renderGraph = () => {
    //Initialising the variables that will be input as parameters 
    //To the graph components
    let chartData = {};
    let options = {};

    //Selects which type of graph to output based on the type input as a property
    switch (type) {
      case 'GroupedBar':
        options = {
          scales: {
            y: {
              ticks: {
                stepSize: 1,
                min: 0,
                beginAtZero: true
              },
              title: {
                text: ytitle,
                display: true
              }
            },
            x: {
              title: {
                text: xtitle,
                display: true
              }
            }
          }
        }

        if (yaxis) {
          options = {
            ...options,
            indexAxis: 'y',
          }
        }

        //Setting up the labels for the rows on the line graph, making sure they are only
        //10 characters so they aren't too long (will overlap)
        chartData = {
          labels,
          datasets: []
        }

        //Splitting the data into separate datasets so each student is a line
        for (let i = 0; i < data.length; i++) {
          chartData.datasets.push({
            label: secondaryLabels[i],
            data: data[i],
            backgroundColor: colours[i].slice(0, 7)
          })
        }

        return <Bar className="bar" options={options} height={200} data={chartData} />

      case 'Pie':
        options = {
          radius: 100,
          responsive: true,
          maintainAspectRatio: true
        }

        //Formatting the data correctly for a pie chart
        chartData = {
          labels,
          datasets: [{
            data,
            backgroundColor: colours,
            borderColor: colours.map(colour => colour.slice(0, 7)),
            borderWidth: 3
          }]
        }

        return <Pie className="pie" options={options} width={150} data={chartData} />

      case 'Bar':
        options = {
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              ticks: {
                stepSize: 1,
                min: 0,
                beginAtZero: true
              }
            }
          }
        }

        if (yaxis) {
          options = {
            ...options,
            indexAxis: 'y',
          }
        }

        //Setting up the labels for the rows on the line graph, making sure they are only
        //10 characters so they aren't too long (will overlap)
        chartData = {
          labels,
          datasets: [{
            data,
            backgroundColor: colours,
            borderColor: colours.map(colour => colour.slice(0, 7)),
            borderWidth: 3
          }]
        }

        return <Bar className="bar" options={options} height={200} data={chartData} />

      default:
        break;
    }
  }

  return (
    <div id="graph">
      {renderGraph()}
    </div>
  )
}

export default Graph;
