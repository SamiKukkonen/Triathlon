import React, { useEffect, useState } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import './ActivityCalendar.css'; // Import CSS file for styling

const ActivityCalendar = ({ activities }) => {
  const [calendarData, setCalendarData] = useState([]);

  useEffect(() => {
    if (activities.length > 0) {
      const data = generateCalendarData(activities);
      setCalendarData(data);
    }
  }, [activities]);

  const generateCalendarData = (activities) => {
    const dateCounts = {};

    activities.forEach(activity => {
      const dateKey = new Date(activity.date).toISOString().slice(0, 10);
      if (!dateCounts[dateKey]) {
        dateCounts[dateKey] = { counts: {}, types: [] };
      }
      if (!dateCounts[dateKey].counts[activity.type]) {
        dateCounts[dateKey].counts[activity.type] = 0;
        dateCounts[dateKey].types.push(activity.type);
      }
      dateCounts[dateKey].counts[activity.type]++;
    });

    const calendarData = Object.keys(dateCounts).map(dateKey => ({
      date: new Date(dateKey),
      count: dateCounts[dateKey].types.length,
      types: dateCounts[dateKey].types,
    }));

    return calendarData;
  };

  const getClassForValue = (value) => {
    if (!value || !value.types || value.types.length === 0) {
      return 'color-empty';
    } else if (value.types.length === 1) {
      return `color-${value.types[0].toLowerCase()}`;
    } else {
      return 'color-multiple';
    }
  };

  return (
    <div className="activity-calendar">
      <h2>Yearly Activity</h2>
      <CalendarHeatmap
        startDate={new Date().setFullYear(new Date().getFullYear() - 1)}
        endDate={new Date()}
        values={calendarData}
        classForValue={getClassForValue}
        showWeekdayLabels={true}
        transformDayElement={(element, value) => {
          if (element && value && value.date) {
            const date = new Date(value.date);
            if (element.style) {
              element.style.animationDelay = `${date.getDate() * 0.03}s`;
            }
          }
          return element;
        }}
        tooltipDataAttrs={value => {
          if (value && value.date) {
            const date = new Date(value.date);
            return {
              'data-tip': `${date.getDate()}.${date.getMonth() + 1}`,
            };
          }
          return {};
        }}
      />
    </div>
  );
};

export default ActivityCalendar;
