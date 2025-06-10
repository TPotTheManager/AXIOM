// Load the Google Charts library
google.charts.load('current', {
  packages: ['table']
});

google.charts.setOnLoadCallback(drawTable);

let dataTable; // Global variable for filtering later

function drawTable() {
  const query = new google.visualization.Query(
    'https://docs.google.com/spreadsheets/d/1nya0mn169Gal2Z2sU729Gr_AOaTLVjqbISTAXf8heRY/gviz/tq?sheet=Current_Week'
  );

  query.send(function(response) {
    if (response.isError()) {
      console.error('Error in query:', response.getMessage(), response.getDetailedMessage());
      return;
    }

    dataTable = response.getDataTable();

    const table = new google.visualization.Table(document.getElementById('table_div'));
    table.draw(dataTable, { showRowNumber: false, width: '100%', height: 'auto' });
  });
}

function filterData() {
  const empName = document.getElementById('empName').value;
  if (!dataTable) return;

  const view = new google.visualization.DataView(dataTable);
  view.setRows(dataTable.getFilteredRows([{ column: 1, value: empName }]));

  const table = new google.visualization.Table(document.getElementById('table_div'));
  table.draw(view, { showRowNumber: false, width: '100%', height: 'auto' });
}
