import React, { Component } from 'react';

interface DayNumberProps {
  dayNumber: string;
  visible: boolean;
}

export default class DayNumber extends Component<DayNumberProps> {
  render() {
    return this.props.visible ? (
      <div className='appointment-picker__col__name'>
        {this.props.dayNumber}
      </div>
    ) : null;
  }
}
