import React, { useState, useRef } from 'react';
import { Day } from './Day';
import { Appointment } from './Appointment';
import { Blank } from './Blank';

type IdentifierType = string | number;

interface AddedAppointmentInterface {
  day: string;
  number: IdentifierType;
  time: string;
  id?: IdentifierType;
}

type AddCallbackType = (
  day: string,
  number: IdentifierType,
  time: string,
  id?: IdentifierType
) => void;

type RemoveCallbackType = (day: string, number: IdentifierType) => void;

interface SimpleAddCaseInterface {
  addedAppointment: AddedAppointmentInterface;
  addCb: AddCallbackType;
}

interface ContinuousAddCaseInterface extends SimpleAddCaseInterface {
  removedAppointment: AddedAppointmentInterface;
  removeCb: RemoveCallbackType;
}

type AddAppointmentType = (
  args: ContinuousAddCaseInterface | SimpleAddCaseInterface
) => void;

type RemoveAppointmentType = (
  appointment: AddedAppointmentInterface,
  removeCb: RemoveCallbackType
) => void;

export type AppointmentAttributesType = {
  id?: IdentifierType;
  number: IdentifierType;
  isReserved?: boolean;
  isSelected?: boolean;
  periods?: number;
} | null;

interface AppointmentPickerPropsInterface {
  addAppointmentCallback?: AddAppointmentType;
  removeAppointmentCallback?: RemoveAppointmentType;
  alpha?: boolean;
  continuous?: boolean;
  selectedByDefault?: boolean;
  maxReservableAppointments?: number;
  initialDay?: Date;
  unitTime?: number;
  local?: string;
  visible?: boolean;
  loading?: boolean;
  days: AppointmentAttributesType[][];
}

interface SelectedAppointmentInterface {
  time: string;
  id?: IdentifierType;
}

type SelectedAppointmentMapType = Map<
  string,
  Map<IdentifierType, SelectedAppointmentInterface>
>;

interface getAlreadySelectedAppointmentsInterface {
  alpha?: boolean;
  selectedByDefault?: boolean;
  maxReservableAppointments?: number;
  initialDay?: Date;
  unitTime?: number;
  local?: string;
  days?: AppointmentAttributesType[][];
}

const getAlreadySelectedAppointments = ({
  maxReservableAppointments,
  days,
  alpha,
  selectedByDefault,
  initialDay,
  unitTime,
  local
}: getAlreadySelectedAppointmentsInterface) => {
  const selectedAppointments = new Map();
  let size = 0;
  if (selectedByDefault) {
    days.forEach((day, index) => {
      const actualDay = new Date(
        initialDay.getTime() + 60 * 60 * 24 * 1000 * index
      );
      const dayNumber = alpha
        ? actualDay.toLocaleDateString(local, { weekday: 'long' })
        : actualDay.toLocaleDateString(local);

      let key = 0;
      day.forEach((appointment, _) => {
        if (appointment === null) {
          key = key + 1;
        } else if (appointment.isSelected) {
          const time = new Date(
            actualDay.getTime() + unitTime * key
          ).toLocaleTimeString(local);
          const appointmentAlreadySelected = includeAppointment(
            selectedAppointments,
            dayNumber,
            appointment.number
          );
          if (size < maxReservableAppointments && !appointmentAlreadySelected) {
            addAppointment(
              selectedAppointments,
              dayNumber,
              appointment.number,
              time,
              appointment.id
            );
            size = size + 1;
          }
        }
      });
    });
  }
  return { selectedAppointments, size };
};

const includeAppointment = (
  selectedAppointments: SelectedAppointmentMapType,
  day: string,
  number: IdentifierType
) => {
  const currentDay = selectedAppointments.get(day);
  if (currentDay) {
    return !!currentDay.get(number);
  }
  return false;
};

const addAppointment = (
  selectedAppointments: SelectedAppointmentMapType,
  day: string,
  number: IdentifierType,
  time: string,
  id?: IdentifierType
) => {
  const currentDay = selectedAppointments.get(day);
  if (currentDay) {
    const currentAppointment = currentDay.get(number);
    if (!currentAppointment) {
      currentDay.set(number, {
        id,
        time
      });
    }
  } else {
    selectedAppointments.set(
      day,
      new Map([
        [
          number,
          {
            id,
            time
          }
        ]
      ])
    );
  }
};

const AppointmentPicker = ({
  alpha,
  selectedByDefault,
  continuous,
  loading,
  addAppointmentCallback = ({
    addedAppointment: { day, number, time, id },
    addCb
  }) => {
    console.log(
      `Added appointment ${number}, day ${day}, time ${time}, id ${id}`
    );
    addCb(day, number, time, id);
  },
  removeAppointmentCallback = ({ day, number, time, id }, removeCb) => {
    console.log(
      `Removed appointment ${number}, day ${day}, time ${time}, id ${id}`
    );
    removeCb(day, number);
  },
  days,
  maxReservableAppointments = 0,
  initialDay = new Date(),
  unitTime = 15 * 60 * 1000,
  visible,
  local = 'en-US'
}: AppointmentPickerPropsInterface) => {
  const {
    selectedAppointments: alreadySelectedAppointments,
    size: actualSize
  } = getAlreadySelectedAppointments({
    maxReservableAppointments,
    days,
    alpha,
    selectedByDefault,
    initialDay,
    unitTime,
    local
  });
  const actualDayPeriods = days.map((day) => {
    let periods = 0;
    day.forEach((obj) => {
      periods = obj
        ? obj.periods
          ? periods + obj.periods
          : periods + 1
        : periods + 1;
    });
    return periods;
  });
  const [selectedAppointments, setSelectedAppointments] = useState(
    alreadySelectedAppointments
  );
  const size = useRef(actualSize);
  const [, setSize] = useState(actualSize);
  const [dayPeriods] = useState(actualDayPeriods);
  const [dayLength] = useState(Math.max.apply(null, dayPeriods));

  if (maxReservableAppointments < size.current) {
    let sum = 0;
    const newSelectedAppointments = new Map();
    for (const currentDay of selectedAppointments.keys()) {
      const day = selectedAppointments.get(currentDay);
      const lengthByDay = day ? day.size : 0;
      if (sum + lengthByDay < maxReservableAppointments) {
        newSelectedAppointments.set(currentDay, day);
      } else {
        const dif = maxReservableAppointments - sum;
        let i = 0;
        if (day) {
          for (const currentNumber of day.keys()) {
            if (i < dif) day.delete(currentNumber);
            i++;
          }
        }
        newSelectedAppointments.set(currentDay, day);
        setSelectedAppointments(newSelectedAppointments);
        setSize(maxReservableAppointments);
      }
      sum = sum + lengthByDay;
    }
  }

  const deleteAppointment = (day: string, number: IdentifierType) => {
    const currentDay = selectedAppointments.get(day);
    if (currentDay) {
      currentDay.delete(number);
      if (!(currentDay.size > 0)) {
        selectedAppointments.delete(day);
      }
    }
  };

  const acceptSelection = (
    day: string,
    number: IdentifierType,
    time: string,
    id?: IdentifierType
  ) => {
    if (size.current < maxReservableAppointments) {
      addAppointment(selectedAppointments, day, number, time, id);
      size.current = size.current + 1;
      setSize((currentSize) => currentSize + 1);
    }
  };

  const acceptDeselection = (day: string, number: IdentifierType) => {
    deleteAppointment(day, number);
    size.current = size.current - 1;
    setSize((currentSize) => currentSize - 1);
  };

  const selectAppointment = (
    day: string,
    number: IdentifierType,
    time: string,
    id?: IdentifierType
  ) => {
    const appointmentAlreadySelected = includeAppointment(
      selectedAppointments,
      day,
      number
    );

    if (size.current < maxReservableAppointments) {
      if (!appointmentAlreadySelected) {
        addAppointmentCallback({
          addedAppointment: { day, number, time, id },
          addCb: acceptSelection
        });
      } else {
        removeAppointmentCallback({ day, number, time, id }, acceptDeselection);
      }
    } else {
      const currentDay = selectedAppointments.get(day);
      if (currentDay && appointmentAlreadySelected) {
        removeAppointmentCallback({ day, number, time, id }, acceptDeselection);
      } else if (continuous) {
        const auxDay = selectedAppointments.keys().next().value;
        const auxDayInstance = selectedAppointments.get(auxDay);
        const auxNumber = auxDayInstance.keys().next().value;
        const auxNumberInstance = auxDayInstance.get(auxNumber);
        addAppointmentCallback({
          addedAppointment: { day, number, time, id },
          addCb: acceptSelection,
          removedAppointment: {
            day: auxDay,
            number: auxNumber,
            time: auxNumberInstance.time,
            id: auxNumberInstance.id
          },
          removeCb: acceptDeselection
        });
      }
    }
  };

  const renderDays = () => {
    return days.map((day, index) => {
      const actualDay = new Date(
        initialDay.getTime() + 60 * 60 * 24 * 1000 * index
      );
      /* const options = {
        weekday: 'long'
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      } */
      const dayNumber = alpha
        ? actualDay.toLocaleDateString(local, { weekday: 'long' })
        : actualDay.toLocaleDateString(local);

      const isSelected = !!selectedAppointments.get(dayNumber);
      const props = {
        visible,
        dayNumber,
        isSelected,
        selectedAppointment: null,
        appointments: day,
        selectAppointment
      };

      return (
        <Day key={index} {...props}>
          {renderAppointments(
            day,
            dayNumber,
            isSelected,
            dayPeriods[index],
            actualDay
          )}
        </Day>
      );
    });
  };

  const renderAppointments = (
    appointments: AppointmentAttributesType[],
    dayNumber: string,
    isDaySelected: boolean,
    periods: number,
    actualDay: Date
  ) => {
    const blanks = new Array(
      dayLength - periods > 0 ? dayLength - periods : 0
    ).fill(0);
    let key = 0;
    const day = appointments.map((appointment) => {
      if (appointment === null) {
        key = key + 1;
        return <Blank key={key} />;
      }
      const time = new Date(
        actualDay.getTime() + unitTime * key
      ).toLocaleTimeString(local);
      const isSelected =
        isDaySelected &&
        includeAppointment(selectedAppointments, dayNumber, appointment.number);
      const props = {
        isSelected,
        isReserved: appointment.isReserved,
        isEnabled: size.current < maxReservableAppointments || continuous,
        selectAppointment: () => {
          selectAppointment(
            dayNumber,
            appointment.number,
            time,
            appointment.id
          );
        },
        appointmentNumber: time,
        periods: appointment.periods ? appointment.periods : 1,
        time: time
      };
      key =
        key +
        (appointment ? (appointment.periods ? appointment.periods : 1) : 1);
      return <Appointment key={key} {...props} />;
    });
    if (blanks.length > 0) {
      blanks.forEach((_, index) => {
        day.push(<Blank key={(key + index + 1) * 2} />);
      });
    }
    return day;
  };

  return (
    <div className='appointment-content'>
      <div className={loading ? 'loader' : undefined} />
      <div className='appointment-picker'>{renderDays()}</div>
    </div>
  );
};

export { AppointmentPicker };
