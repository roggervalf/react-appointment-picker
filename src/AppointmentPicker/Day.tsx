import React, { Component } from 'react';
import DayNumber from './DayNumber';

interface DayProps {
  dayNumber: string;
  visible: boolean;
  isSelected: boolean;
  children: React.ReactNode;
}

export class Day extends Component<DayProps> {
  render() {
    const { visible, dayNumber, isSelected } = this.props;
    const className =
      'appointment-picker__col' +
      (isSelected
        ? ' appointment-picker__col--selected'
        : ' appointment-picker__col--enabled');
    return (
      <div className={className}>
        <DayNumber dayNumber={dayNumber} visible={visible} />
        {this.props.children}
      </div>
    );
  }
}
