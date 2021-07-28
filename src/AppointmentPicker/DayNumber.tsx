import React from 'react';

interface DayNumberProps {
  dayNumber: string;
  visible: boolean;
}

const DayNumber = ({ visible, dayNumber }: DayNumberProps) => {
  return visible ? (
    <div className='appointment-picker__col__name'>{dayNumber}</div>
  ) : null;
};

export default DayNumber;
