import React from "react";

function formatGeneratedResponse(response) {
  // Split the response into lines
  const lines = response.split("\n");

  // Initialize an empty array to store table rows
  const rows = [];

  // Loop through each line of the response
  lines.forEach((line, index) => {
    // Trim the line and remove any leading or trailing whitespace
    const trimmedLine = line.trim();

    // Ignore empty lines and lines containing '---'
    if (trimmedLine !== "" && !trimmedLine.includes("---")) {
      // Split the line into cells using the pipe character (|)
      const cells = trimmedLine.split("|").map((cell) => cell.trim());

      // If it's the first line, treat it as a table header
      if (index === 0) {
        // Create table header cells (<th>) for each cell
        const headerCells = cells.map((cell, idx) => <th key={idx}>{cell}</th>);

        // Create a table row (<tr>) for the header row
        const headerRow = <tr key={index}>{headerCells}</tr>;

        // Add the header row to the rows array
        rows.push(headerRow);
      } else {
        // Create table data cells (<td>) for each cell
        const dataCells = cells.map((cell, idx) => {
          // Check if the cell content is bolded
          if (cell.match(/\*\*(.*?)\*\*/)) {
            // Render the bolded text
            return (
              <td key={idx}>
                <strong>{cell.replace(/\*\*(.*?)\*\*/g, "$1")}</strong>
              </td>
            );
          } else {
            // Render the cell content as is
            return <td key={idx}>{cell}</td>;
          }
        });

        // Create a table row (<tr>) for the data row
        const dataRow = <tr key={index}>{dataCells}</tr>;

        // Add the data row to the rows array
        rows.push(dataRow);
      }
    }
  });

  // Return the formatted table rows
  return rows;
}

function GeneratedResponseTable({ response }) {
  // Call the formatGeneratedResponse function to format the response into table rows
  const tableRows = formatGeneratedResponse(response);

  // Render the table with the formatted rows
  return (
    <table>
      <tbody>{tableRows}</tbody>
    </table>
  );
}

export default GeneratedResponseTable;
