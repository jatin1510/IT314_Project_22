google.charts.load('current', { 'packages': ['corechart'] });
google.charts.setOnLoadCallback(drawChart);

async function drawChart()
{
  const placed = await document.getElementById('placed').innerHTML;
  console.log(typeof(placed));
  console.log(100 - placed);
  const data = await google.visualization.arrayToDataTable([
    ['Category', 'average'],
    ['Placed', parseInt(placed)],
    ['Not Placed', 100 - parseInt(placed)],
  ]);
  const options = {
    title: 'Total Students Placed',
    width: 600,
    height: 600,
    colors: ['#1be45d', '#1c45e3']
  };
  const chart = await new google.visualization.PieChart(document.getElementById('myChart'));
  await chart.draw(data, options);

  const male = await document.getElementById('male').innerHTML;
  console.log(male);
  const data1 = await google.visualization.arrayToDataTable([
    ['Category', 'percentage'],
    ['Male', parseInt(male)],
    ['Female', 100 - parseInt(male)],
  ]);
  const options1 = {
    title: 'Total Student Placed Gender Wise',
    width: 600,
    height: 600,
    colors: ['#3f00bb', '#5f8aff']
  };
  const chart1 = await new google.visualization.PieChart(document.getElementById('myChart1'));
  await chart1.draw(data1, options1);
}