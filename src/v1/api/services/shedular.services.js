const schedule = require('node-schedule');
const {sendNoPunchInEmail, sendNoPunchOutEmail, getUserToMail, getUserToMailPunchOut} = require('../controller/adminMaster/attendance.controller');

/**
 * Converts time in 12-hour Indian format to UTC Date object
 * @param {string} timeString - Time in format "HH:MM AM/PM"
 * @returns {Date} - UTC Date object
 */
function convertIndianTimeToUTC(timeString) {
  const [timePart, amPmPart] = timeString.split(' ');
  const [hoursStr, minutesStr] = timePart.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  
  // Convert 12-hour format to 24-hour format
  if (amPmPart.toUpperCase() === 'PM' && hours !== 12) {
    hours += 12;
  } else if (amPmPart.toUpperCase() === 'AM' && hours === 12) {
    hours = 0;
  }
  
  // Create a date object with the current date in UTC
  const today = new Date();
  
  // Set the time to the Indian time (IST is UTC+5:30)
  // First convert to UTC by subtracting the offset
  const utcHours = (hours - 5 + 24) % 24; // Add 24 and take modulo to handle negative hours
  const utcMinutes = (minutes - 30 + 60) % 60; // Add 60 and take modulo to handle negative minutes
  const adjustHoursForMinutes = (minutes - 30) < 0 ? 1 : 0; // Adjust hour if minutes go negative
  
  const finalUtcHours = (utcHours - adjustHoursForMinutes + 24) % 24;
  
  // Create the UTC date
  return new Date(Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
    finalUtcHours,
    utcMinutes,
    0,
    0
  ));
}

/**
 * Schedules email sending for a specific time
 * @param {string} timeString - Time in format "HH:MM AM/PM"
 * @param {Array} ids - Branch IDs
 * @param {number} type - 1 for punch-in, 2 for punch-out
 */
async function scheduleForTime(timeString, ids, type) {
  try {
    const utcTime = convertIndianTimeToUTC(timeString);

    // Add 30 minutes to the scheduled time
    const delayedTime = new Date(utcTime.getTime() + 15 * 60 * 1000);

    if (delayedTime < new Date()) {
      console.log(
        `Time ${timeString} (IST) with 30-minute delay converted to ${delayedTime.toISOString()} (UTC) has already passed today. Not scheduling.`
      );
      return;
    }

    console.log(
      `Setting up scheduler for ${timeString} (IST) with 30-minute delay → ${delayedTime.toISOString()} (UTC) with ${
        ids.length
      } IDs`
    );

    // Schedule the job at the specified time with 30-minute delay
    schedule.scheduleJob(delayedTime, async function () {
      try {
        if (type === 1) {
          await getUserToMail(ids);
        } else {
          await getUserToMailPunchOut(ids);
        }
        console.log(
          `Successfully executed mail sending for type ${type} at ${new Date().toISOString()} (30 minutes after scheduled time)`
        );
      } catch (error) {
        console.error(`Error executing mail sending for type ${type}:`, error);
      }
    });
  } catch (error) {
    console.error(`Error scheduling for time ${timeString}:`, error);
  }
}

/**
 * Sets up the daily scheduler to run at 4 AM IST
 */
function setupDailyScheduler() {
  // For 4:00 AM IST, convert to UTC:
  // 4:00 AM IST = 04:00 IST = 22:30 previous day UTC (IST is UTC+5:30)
  
  // Schedule to run at 10:30 PM UTC (4:00 AM IST next day) every day except Sunday
  // Cron format: second minute hour day-of-month month day-of-week
  const dailySchedule = '0 30 0 * * 0-5'; // 10:30 PM UTC (4:00 AM IST next day), Sunday-Friday
  // const dailySchedule = '0 30 22 * * 1-6';

  
  schedule.scheduleJob(dailySchedule, async function() {
    try {
      console.log('Running daily scheduler at 4:00 AM IST (10:30 PM UTC previous day)...');
      
      // Call the functions to get the array of time objects
      const timeObjectsOne = await sendNoPunchInEmail();
      const timeObjectsTwo = await sendNoPunchOutEmail();
      
      // For each time object, set up one-time schedulers
      for (const obj of timeObjectsOne) {
        await scheduleForTime(obj.punchin_time, obj.branches, 1);
      }
      
      for (const obj of timeObjectsTwo) {
        await scheduleForTime(obj.punchout_time, obj.branches, 2);
      }
    } catch (error) {
      console.error('Error in daily scheduler:', error);
    }
  });
  
  console.log('Daily scheduler set up successfully to run at 4:00 AM IST (10:30 PM UTC previous day) Sunday-Friday!');
}

/**
 * Initial setup: run the daily function immediately if it's not Sunday
 */
async function initialSetup() {
  try {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    if (dayOfWeek !== 6) { // If not Saturday (next day would be Sunday)
      console.log('Initial setup: Running functions now...');
      
      // Call the functions to get the array of time objects
      const timeObjectsOne = await sendNoPunchInEmail();
      const timeObjectsTwo = await sendNoPunchOutEmail();

      
      // For each time object, set up one-time schedulers
      for (const obj of timeObjectsOne) {
        await scheduleForTime(obj.punchin_time, obj.branches, 1);
      }
      
      for (const obj of timeObjectsTwo) {
        await scheduleForTime(obj.punchout_time, obj.branches, 2);
      }
    }
  } catch (error) {
    console.error('Error in initial setup:', error);
  }
}

/**
 * Start the scheduler
 */
async function start() {
  try {
    console.log('Starting scheduler system...');
    console.log(`Current UTC time: ${new Date().toISOString()}`);
    const istTime = new Date(Date.now() + (5 * 60 + 30) * 60 * 1000);
    console.log(`Current IST time: ${istTime.toISOString()} (${istTime.toLocaleTimeString('en-IN')})`);
    
    setupDailyScheduler();
    await initialSetup();
    
    console.log('Scheduler started successfully!');
  } catch (error) {
    console.error('Error starting scheduler:', error);
  }
}

// Run the start function to begin

if(process.env.PLATFORM == "prod"){
  start().catch(error => {
    console.error('Fatal error starting scheduler:', error);
  });
}

module.exports = { start };