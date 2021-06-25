//Import react dependency
import React from 'react';
import { Line, Pie } from 'react-chartjs-2';

//Creating the modal react component
const Graph = props => {
  //Extracting data from properties of component
  const { labels, data, colours, type, lineLabels } = props;

  const renderGraph = () => {
    //Initialising the variables that will be input as parameters 
    //To the graph components
    let chartData = {};
    let options = {};

    //Selects which type of graph to output based on the type input as a property
    switch (type) {
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
            borderWidth: 1
          }]
        }

        return <Pie className="pie" options={options} width={150} data={chartData} />

      case 'Line':
        //Setting up the axis for the line graph
        options = {
          responsive: true,
          maintainAspectRatio: true,
          tension: 0.5,
          scales: {
            y: {
              ticks: {
                beginAtZero: true,
                suggestedMax: 100,
                suggestedMin: 0,
                allignment: 'end'
              },
              title: {
                text: 'Percentage',
                display: true
              }
            },
            x: {
              title: {
                text: 'Assignment',
                display: true
              }
            }
          }
        }

        //Setting up the labels for the rows on the line graph, making sure they are only
        //10 characters so they aren't too long (will overlap)
        chartData = {
          labels: labels.map(label => label.slice(0, 10) + '...'),
          datasets: []
        }

        //Splitting the data into separate datasets so each student is a line
        for (let i = 0; i < data.length; i++) {
          chartData.datasets.push({
            label: lineLabels[i],
            data: data[i],
            borderColor: colours[i],
            backgroundColor: colours[i]
          })
        }

        return <Line className="line" height={150} data={chartData} options={options} />

      default:
    }
  }

  return (
    <div id="graph">
      {renderGraph()}
    </div>
  )
}

export default Graph;
