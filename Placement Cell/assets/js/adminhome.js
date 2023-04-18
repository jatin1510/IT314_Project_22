google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {

const data = google.visualization.arrayToDataTable([
  ['Category', 'average'],
  ['Placed',51.4],
  ['Not - Placed',48.6],
]);
const options = {
  title:'Total Students Placed',
  width:600,
  height:600,
  colors:['#1be45d','#1c45e3']
};
const chart = new google.visualization.PieChart(document.getElementById('myChart'));
  chart.draw(data, options);




const data1 = google.visualization.arrayToDataTable([
  ['Category', 'percentage'],
  ['A',60],
  ['A1',40],
]);
const options1 = {
  title:'Students Placed and Company Categories',
  width:600,
  height:600,
  colors:['#3f00bb','#5f8aff']
};
const chart1 = new google.visualization.PieChart(document.getElementById('myChart1'));
  chart1.draw(data1, options1);
}