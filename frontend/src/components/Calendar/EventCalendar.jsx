import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import './EventCalendar.css';

const EventCalendar = ({ events, onSelectEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of the month (0 = Sunday, 1 = Monday, ...)
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Get total days in the current month
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Get total days in the previous month (for filling initial cells)
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // Generate calendar day cells
  const renderDays = () => {
    const dayCells = [];

    // Prev month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthTotalDays - i;
      dayCells.push(
        <div key={`prev-${dayNum}`} className="calendar-day day-padding">
          <span className="day-number">{dayNum}</span>
        </div>
      );
    }

    // Current month days
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // Filter events on this specific day
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        const eventDateStr = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
        return eventDateStr === dateStr;
      });

      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

      dayCells.push(
        <div key={`curr-${day}`} className={`calendar-day ${isToday ? 'today' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}>
          <span className="day-number">{day}</span>
          <div className="day-events-container">
            {dayEvents.map(event => (
              <div 
                key={event.id} 
                className="calendar-event-pill"
                onClick={() => onSelectEvent(event)}
                title={event.title}
              >
                <span className="event-pill-dot" />
                <span className="event-pill-title">{event.title}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Next month padding days to complete a grid (standard 6 rows * 7 columns = 42 cells)
    const totalCells = dayCells.length;
    const remainingCells = 42 - totalCells;
    for (let day = 1; day <= remainingCells; day++) {
      dayCells.push(
        <div key={`next-${day}`} className="calendar-day day-padding">
          <span className="day-number">{day}</span>
        </div>
      );
    }

    return dayCells;
  };

  return (
    <div className="custom-calendar-container glass-panel">
      {/* Calendar Header */}
      <div className="calendar-header">
        <div className="calendar-title">
          <CalendarIcon size={24} style={{ marginRight: 10, color: 'var(--accent-cyan)' }} />
          <h2>{monthNames[month]} {year}</h2>
        </div>
        <div className="calendar-controls">
          <button className="brutalist-button-square" onClick={prevMonth} aria-label="Previous month">
            <ChevronLeft size={20} />
          </button>
          <button className="brutalist-button-square" onClick={nextMonth} aria-label="Next month">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="calendar-weekdays">
        {daysOfWeek.map(day => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="calendar-grid">
        {renderDays()}
      </div>
    </div>
  );
};

export default EventCalendar;
