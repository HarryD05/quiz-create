//Import react dependency
import React from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';

//Importing styling
import './graph.scss';

//Creating the modal react component
const Graph = props => {
  //Extracting data from properties of component
  const { labels, data, colours, type, lineLabels } = props;

  const renderGraph = () => {
    let chartData = {};
    let options = {};

    switch (type) {
      case 'Bar':
        chartData = {
          labels,
          datasets: [{
            data,
            backgroundColor: colours
          }]
        }

        return <Bar
          data={chartData}
        />

      case 'Pie':
        options = {
          radius: 100,
          responsive: true,
          maintainAspectRatio: true
        }

        chartData = {
          labels,
          datasets: [{
            data,
            backgroundColor: colours
          }]
        }

        return <Pie options={options} width={150} data={chartData} />

      case 'Line':
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

        chartData = {
          labels: labels.map(label => label.slice(0, 10) + '...'),
          datasets: []
        }

        for (let i = 0; i < data.length; i++) {
          chartData.datasets.push({
            label: lineLabels[i],
            data: data[i],
            borderColor: colours[i],
            backgroundColor: colours[i]
          })
        }

        return <Line height={150} data={chartData} options={options} />

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
