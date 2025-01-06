import { jsPDF } from "jspdf";
import "jspdf-autotable";

const generatePDF = (tasks, selectionModel) => {
  const doc = new jsPDF();

  // Add a custom header
  doc.setFontSize(18);
  doc.text("Weekly Maintenance Report", 14, 20);

  // Add a sub-header with the current date
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

  // Determine which rows to export
  const rowsToExport =
    selectionModel.length > 0
      ? tasks.filter((task) => selectionModel.includes(task.id))
      : tasks;

  const tableData = rowsToExport.map((task) => [
    task.date,
    task.location,
    task.title,
    task.description,
    task.status,
  ]);

  // Generate the table
  doc.autoTable({
    startY: 40,
    head: [["Date", "Location", "Title", "Description", "Status"]],
    body: tableData,
  });

  doc.save("maintenance_report.pdf");
};

export default generatePDF;
