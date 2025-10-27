const ActivityLog = require("../models/ActivityLog");

async function logActivity(action, collectionName, fullName, email) {
  try {
    await ActivityLog.create({ action, collectionName, userFullName: fullName, email });
    console.log(`✅ Activity logged: ${action} for ${collectionName}`);
  } catch (err) {
    console.error("❌ Failed to log activity:", err.message);
  }
}

function formatTimeForDisplay(timeString) {
  if (!timeString) return '';
  try {
    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${period}`;
    }
    return timeString;
  } catch (e) {
    return timeString;
  }
}

function generateRequestNumber(prefix) {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 10);
  return `${prefix}-${timestamp}-${randomString}`;
}

module.exports = {
  logActivity,
  formatTimeForDisplay,
  generateRequestNumber
};