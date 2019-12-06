import React, { Component } from "react";
import PropTypes from "prop-types";

export default class DayNumber extends Component {
  render() {
    return this.props.visible ? (
      <div className="appointment-picker__col__name">
        {this.props.dayNumber}
      </div>
    ) : null;
  }
}

DayNumber.propTypes = {
  dayNumber: PropTypes.string,
  visible: PropTypes.bool,
};
