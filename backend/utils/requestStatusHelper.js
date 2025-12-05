/**
 * Computes the status category for a request based on due date and completion status
 * @param {Object} request - The request document
 * @returns {String} - One of: "Cancelled", "Overdue", "Due Today", "Open"
 */
const getRequestStatusCategory = (request) => {
  // If rejected, it's cancelled
  if (request.status === "rejected") {
    return "Cancelled";
  }

  // If approved, it's completed (not overdue/due today)
  if (request.status === "approved") {
    return "Open"; // or could return "Completed" if you want a separate category
  }

  // Check if all recipients have signed
  const allSigned = request.recipients && request.recipients.every((r) => r.signed === true);
  if (allSigned) {
    return "Open"; // Fully signed, no longer urgent
  }

  // If no due date, it's just open
  if (!request.dueDate) {
    return "Open";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day

  const dueDate = new Date(request.dueDate);
  dueDate.setHours(0, 0, 0, 0); // Set to start of day

  // Check if due date is today
  if (dueDate.getTime() === today.getTime()) {
    return "Due Today";
  }

  // Check if due date is in the past
  if (dueDate.getTime() < today.getTime()) {
    return "Overdue";
  }

  // Due date is in the future
  return "Open";
};

module.exports = { getRequestStatusCategory };
