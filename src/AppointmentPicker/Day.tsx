import React from 'react';
import DayNumber from './DayNumber';

interface DayProps {
  dayNumber: string;
  visible: boolean;
  isSelected: boolean;
  children: React.ReactNode;
}

export const Day = ({ visible, dayNumber, isSelected, children }: DayProps) => {
  const className =
    'appointment-picker__col' +
    (isSelected
      ? ' appointment-picker__col--selected'
      : ' appointment-picker__col--enabled');
  return (
    <div className={className}>
      <DayNumber dayNumber={dayNumber} visible={visible} />
      {children}
    </div>
  );
};
