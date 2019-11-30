import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Day from './Day'
import Appointment from './Appointment'
import Blank from './Blank'

export class AppointmentPicker extends Component {
  static propTypes = {
    addAppointmentCallback: PropTypes.func,
    alpha: PropTypes.bool,
    visible: PropTypes.bool,
    simple: PropTypes.bool,
    loading: PropTypes.bool,
    selectedByDefault: PropTypes.bool,
    removeAppointmentCallback: PropTypes.func,
    maxReservableAppointments: PropTypes.number,
    initialDay: PropTypes.instanceOf(Date).isRequired,
    unitTime: PropTypes.number,
    local: PropTypes.string,
    days: PropTypes.arrayOf(
      PropTypes.arrayOf(
        PropTypes.shape({
          number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
          isReserved: PropTypes.bool,
          isSelected: PropTypes.bool,
          periods: PropTypes.number
        })
      )
    ).isRequired
  }

  static defaultProps = {
    addAppointmentCallback: ({day, number, time, id}, addCb, params, removeCb) => {
      console.log(`Added appointment ${number}, day ${day}, time ${time}, id ${id}`)
      addCb(day, number, time, id)
    },
    removeAppointmentCallback: ({day, number, time, id}, removeCb) => {
      console.log(`Removed appointment ${number}, day ${day}, time ${time}, id ${id}`)
      removeCb(day, number)
    },
    simple: false,
    maxReservableAppointments: 0,
    initialDay: new Date(),
    unitTime: 15 * 60 * 1000,
    local: 'en-US'
  }

  constructor (props) {
    super(props)
    const { days } = props
    const {selectedAppointments, size} = this.getAlreadySelectedAppointments()
    const dayPeriods = days.map(day => {
      let periods = 0
      day.forEach((obj) => {
        periods = obj ? (obj.periods ? (periods + obj.periods) : (periods + 1)) : (periods + 1)
      })
      return periods
    })
    this.state = {
      selectedAppointments: selectedAppointments,
      size: size,
      dayPeriods,
      dayLength: (Math.max.apply(null, dayPeriods))
    }
  }

  static getDerivedStateFromProps (props, state) {
    if (props.maxReservableAppointments < state.size) {
      let sum = 0
      let selectedAppointments = {}
      for (let array in state.selectedAppointments) {
        if (
          sum + state.selectedAppointments[array].length <
          props.maxReservableAppointments
        ) {
          selectedAppointments[array] = state.selectedAppointments[array].slice(0)
        } else {
          const dif = props.maxReservableAppointments - sum
          selectedAppointments[array] = state.selectedAppointments[array].slice(0, dif)
          return {
            selectedAppointments: selectedAppointments,
            size: props.maxReservableAppointments
          }
        }
        sum = sum + state.selectedAppointments[array].length
      }
    }
    return null
  }

  shouldComponentUpdate (nextProps, nextState) {
    return nextState.selectedAppointments !== this.state.selectedAppointments || this.props.loading !== nextProps.loading
  }

  getAlreadySelectedAppointments = () => {
    let selectedAppointments = {}
    let size = 0
    const {
      maxReservableAppointments,
      alpha,
      selectedByDefault,
      initialDay,
      unitTime,
      local
    } = this.props
    if (selectedByDefault) {
      this.props.days.forEach((day, index) => {
        const actualDay = new Date(initialDay.getTime() + 60 * 60 * 24 * 1000 * index)
        const dayNumber = alpha
          ? actualDay.toLocaleDateString(local, {weekday: 'long'})
          : actualDay.toLocaleDateString(local)

        let key = 0
        day.forEach((appointment, index) => {
          if (appointment === null) {
            key = key + 1
          } else if (appointment.isSelected) {
            const time = new Date(actualDay.getTime() + unitTime * (key)).toLocaleTimeString(local)
            const appointmentAlreadySelected = this.includeAppointment(selectedAppointments, dayNumber, appointment.number)
            if (size < maxReservableAppointments && !appointmentAlreadySelected) {
              selectedAppointments = this.addAppointment(selectedAppointments, dayNumber, appointment.number, time, appointment.id)
              size = size + 1
            }
          }
        })
      })
    }
    return {selectedAppointments, size}
  }

  includeAppointment=(selectedAppointments, day, number) => {
    if (selectedAppointments[day]) {
      return !!selectedAppointments[day][number]
    }
    return false
  }

  addAppointment=(selectedAppointments, day, number, time, id) => {
    if (selectedAppointments[day]) {
      if (!selectedAppointments[day][number]) {
        selectedAppointments[day][number] = {
          id,
          time
        }
      }
    } else {
      selectedAppointments[day] = {}
      selectedAppointments[day][number] = {
        id,
        time
      }
    }
    return {...selectedAppointments}
  }

  deleteAppointment=(day, number) => {
    let { selectedAppointments } = this.state
    if (selectedAppointments[day]) {
      delete selectedAppointments[day][number]
      /* selectedAppointments[day] = selectedAppointments[day].filter((value) => {
        return value !== number
      }) */
      if (!Object.keys(selectedAppointments[day]).length > 0) {
        delete (selectedAppointments[day])
      }
    }
    return {...selectedAppointments}
  }

  acceptSelection= (day, number, time, id) => {
    let { selectedAppointments } = this.state
    const size = this.state.size

    this.setState(
      {
        selectedAppointments: this.addAppointment(selectedAppointments, day, number, time, id),
        size: size + 1
      }
    )
  }

  acceptDeselection= (day, number) => {
    const size = this.state.size

    this.setState(
      {
        selectedAppointments: this.deleteAppointment(day, number),
        size: size - 1
      }
    )
  }

  selectAppointment = (day, number, time, id) => {
    let { selectedAppointments } = this.state
    const size = this.state.size
    const {
      maxReservableAppointments,
      addAppointmentCallback,
      removeAppointmentCallback,
      simple
    } = this.props
    const appointmentAlreadySelected = this.includeAppointment(selectedAppointments, day, number)

    console.log(day, number, time, id, appointmentAlreadySelected, size)
    if (size < maxReservableAppointments) {
      if (!appointmentAlreadySelected) 
        addAppointmentCallback({day, number, time, id}, this.acceptSelection)
      else 
        removeAppointmentCallback({day, number, time, id}, this.acceptDeselection)
    } else {
      if (selectedAppointments[day] && appointmentAlreadySelected)
        removeAppointmentCallback({day, number, time, id}, this.acceptDeselection)
      else if (simple) {
        const auxDay = Object.keys(selectedAppointments)[0]
        const auxNumber = Object.keys(selectedAppointments[auxDay])[0]
        addAppointmentCallback({day, number, time, id}, this.acceptSelection,
          {day: auxDay, number: auxNumber, time: selectedAppointments[auxDay][auxNumber].time, id: selectedAppointments[auxDay][auxNumber].id}, this.acceptDeselection)
      }
    }

    /* if (size < maxReservableAppointments && !appointmentAlreadySelected) {
      addAppointmentCallback(day, number, time, id, this.acceptSelection)
    } else if (selectedAppointments[day] && appointmentAlreadySelected) {
      removeAppointmentCallback(day, number, time, id, this.acceptDeselection)
    } */
  }

  render () {
    return (<div className='appointment-content'>
      <div className={this.props.loading ? 'loader' : null} />
      <div className='appointment-picker'>
        {this.renderDays()}
      </div>
    </div>)
  }

  renderDays () {
    const { selectedAppointments: appointments, dayPeriods } = this.state
    const { alpha, visible, initialDay, local } = this.props
    return this.props.days.map((day, index) => {
      const actualDay = new Date(initialDay.getTime() + 60 * 60 * 24 * 1000 * index)
      /* const options = {
        weekday: 'long'
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      } */
      const dayNumber = alpha
        ? actualDay.toLocaleDateString(local, {weekday: 'long'})
        : actualDay.toLocaleDateString(local)

      const isSelected = !!appointments[dayNumber]
      const props = {
        visible,
        dayNumber,
        isSelected,
        selectedAppointment: null,
        appointments: day,
        selectAppointment: this.selectAppointment
      }

      return (
        <Day key={index} {...props}>{this.renderAppointments(day, dayNumber, isSelected, dayPeriods[index], actualDay)} </Day>
      )
    })
  }

  renderAppointments (appointments, dayNumber, isDaySelected, periods, actualDay) {
    const { selectedAppointments, size, dayLength } = this.state
    const { maxReservableAppointments, unitTime, local, simple } = this.props
    const blanks = new Array((dayLength - periods) > 0 ? (dayLength - periods) : 0).fill(0)
    let key = 0
    let day = appointments.map((appointment, index) => {
      if (appointment === null) {
        key = key + 1
        return <Blank key={key} />
      }
      const time = new Date(actualDay.getTime() + unitTime * (key)).toLocaleTimeString(local)
      const isSelected =
        isDaySelected && this.includeAppointment(selectedAppointments, dayNumber, appointment.number)
      const props = {
        isSelected,
        orientation: appointment.orientation,
        isReserved: appointment.isReserved,
        isEnabled: size < maxReservableAppointments || simple,
        selectAppointment: this.selectAppointment.bind(this, dayNumber, appointment.number, time, appointment.id),
        appointmentNumber: time,
        periods: appointment.periods ? appointment.periods : 1,
        time: time
      }
      key = key + (appointment ? (appointment.periods ? appointment.periods : 1) : 1)
      return <Appointment key={key} {...props} />
    })
    if (blanks.length > 0) {
      blanks.forEach((blank, index) => {
        day.push(<Blank key={(key + index + 1) * 2} />)
      })
    }
    return day
  }
}
