import React from 'react';

interface AppointmentProps {
  isSelected: boolean;
  isReserved?: boolean;
  isEnabled: boolean;
  periods?: number;
  time: string;
  selectAppointment: () => void;
}

const Appointment = ({
  isSelected = false,
  isReserved,
  isEnabled,
  periods,
  time,
  selectAppointment
}: AppointmentProps) => {
  const handleClick = () => {
    !isReserved && selectAppointment();
  };

  const className =
    'appointment' +
    (isSelected ? ' appointment--selected' : '') +
    (!isSelected && isEnabled && !isReserved ? ' appointment--enabled' : '') +
    (isReserved ? ' appointment--reserved' : '');
  const style = {
    height: `calc(2rem*${periods || 1} + 0.2rem*(${periods || 1} - 1))`
  };
  return (
    <div style={style} className={className} onClick={handleClick}>
      <span className='appointment__time'>{time}</span>
    </div>
  );
};

export { Appointment };
