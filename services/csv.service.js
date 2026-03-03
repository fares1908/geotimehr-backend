const { Parser } = require('json2csv');

/**
 * Helper function to format raw minutes into hours and minutes text.
 * @param {number} mins - Total minutes
 * @returns {string} e.g. "8h 30m"
 */
const formatMinsStr = (mins) => {
  if (!mins || isNaN(mins)) return '0h 0m';
  const hours = Math.floor(mins / 60);
  const m = mins % 60;
  return `${hours}h ${m}m`;
};

/**
 * Generates a normalized CSV string for a monthly timesheet report.
 * 
 * @param {Array<Object>} employees - Array of aggregated user statistics for the month
 * @param {string} month - "YYYY-MM"
 * @returns {string} Complete CSV text
 * @throws {Error} When CSV generation fails
 */
const generateTimesheetCSV = (employees, month) => {
  try {
    // Standardize metrics
    const data = employees.map(emp => ({
      'Employee ID': emp.employeeId || 'N/A',
      'Name': emp.name,
      'Department': emp.department || 'N/A',
      'Job Title': emp.jobTitle || 'N/A',
      'Days Present': emp.daysPresent || 0,
      'Total Hours': formatMinsStr(emp.totalMins),
      'Late Days': emp.lateDays || 0,
      'Total Late Mins': emp.totalLateMins || 0,
      'Missing Checkouts': emp.missingOutDays || 0,
      'Month': month
    }));

    const fields = [
      'Employee ID',
      'Name',
      'Department',
      'Job Title',
      'Days Present',
      'Total Hours',
      'Late Days',
      'Total Late Mins',
      'Missing Checkouts',
      'Month'
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(data);
    
    return csv;
  } catch (err) {
    const error = new Error('CSV generation failed: ' + err.message);
    error.statusCode = 500;
    throw error;
  }
};

module.exports = {
  generateTimesheetCSV
};
