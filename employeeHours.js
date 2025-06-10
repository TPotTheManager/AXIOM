google.charts.load("current", { packages: ["table"] });

google.charts.setOnLoadCallback(drawTable);

let fullData;

function drawTable() {
  const query = new google.visualization.Query(
    "https://docs.google.com/spreadsheets/d/1nya0mn169Gal2Z2sU729Gr_AOaTLVjqbISTAXf8heRY/gviz/tq?sheet=Current_Week"
  );
  query.send(handleQueryResponse);
}

function handleQueryResponse(response) {
  if (response.isError()) {
    console.error("Error in query:", response.getMessage(), response.getDetailedMessage());
    return;
  }

  fullData = response.getDataTable();
  const table = new google.visualization.Table(document.getElementById("table-container"));
  table.draw(fullData, { showRowNumber: false, width: "100%", height: "100%" });
}

function filterData() {
  const empName = document.getElementById("empName").value.trim().toLowerCase();

  if (!fullData) return;

  const filtered = new google.visualization.DataTable();
  const cols = fullData.getNumberOfColumns();

  for (let i = 0; i < cols; i++) {
    filtered.addColumn(fullData.getColumnType(i), fullData.getColumnLabel(i));
  }

  for (let i = 0; i < fullData.getNumberOfRows(); i++) {
    const name = fullData.getValue(i, 1); // Assuming column 1 is employee name
    if (name.toLowerCase().includes(empName)) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        row.push(fullData.getValue(i, j));
      }
      filtered.addRow(row);
    }
  }

  const table = new google.visualization.Table(document.getElementById("table-container"));
  table.draw(filtered, { showRowNumber: false, width: "100%", height: "100%" });
}
