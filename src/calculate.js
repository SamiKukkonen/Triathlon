export function calculateWeeklyTotal(items, index) {
    const currentDate = new Date();
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start of the current week
    startDate.setHours(0, 0, 0, 0);
  
    const weeklyActivities = items.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate >= startDate && activityDate <= currentDate && activity.type === getActivityType(items, index);
    });
  
    return weeklyActivities.reduce((total, activity) => total + activity.distance, 0);
  }
  
  export function calculateMonthlyTotal(items, index) {
    const currentDate = new Date();
    const startDate = new Date(currentDate);
    startDate.setDate(1); // Start of the current month
    startDate.setHours(0, 0, 0, 0);
  
    const monthlyActivities = items.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate >= startDate && activityDate <= currentDate && activity.type === getActivityType(items, index);
    });
  
    return monthlyActivities.reduce((total, activity) => total + activity.distance, 0);
  }
  
  function getActivityType(items, index) {
    switch (index) {
      case 0:
        return "Swimming";
      case 1:
        return "Running";
      case 2:
        return "Cycling";
      default:
        return "";
    }
  }
  