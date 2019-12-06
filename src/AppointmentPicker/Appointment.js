import React, { Component } from "react";
import PropTypes from "prop-types";

export default class Appointment extends Component {
  static defaultProps = {
    isSelected: false,
  };

  handleClick = () => {
    !this.props.isReserved && this.props.selectAppointment();
  };

  render() {
    const { isSelected, isEnabled, isReserved, periods } = this.props;
    const className =
      "appointment" +
      (isSelected ? " appointment--selected" : "") +
      (!isSelected && isEnabled && !isReserved ? " appointment--enabled" : "") +
      (isReserved ? " appointment--reserved" : "");
    const style = {
      height: `calc(2rem*${periods || 1} + 0.2rem*(${periods || 1} - 1))`,
    };
    return (
      <div style={style} className={className} onClick={this.handleClick}>
        <span className="appointment__time">{this.props.time}</span>
      </div>
    );
  }
}

Appointment.propTypes = {
  isSelected: PropTypes.bool,
  isReserved: PropTypes.bool,
  isEnabled: PropTypes.bool,
  periods: PropTypes.number,
  time: PropTypes.string,
  selectAppointment: PropTypes.func.isRequired,
};
