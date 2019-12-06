# react-appointment-picker

> Component to pick appointments

[![NPM](https://img.shields.io/npm/v/react-appointment-picker.svg)](https://www.npmjs.com/package/react-appointment-picker) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Demo

[![Edit AppointmentPicker](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/gracious-shadow-2u8jz?fontsize=14)

## About

This react component is useful for schedules. Based in [react-seat-picker](https://www.npmjs.com/package/react-seat-picker).

## Install

```bash
npm install --save react-appointment-picker
```

Or

```bash
yarn add react-appointment-picker
```


## Usage

```jsx
import React, { Component } from 'react'

import AppointmentPicker from 'react-appointment-picker'

export default class App extends Component {
  state = {
    loading: false,
  }
  addAppointmentCallback=({day, number, time, id}, addCb) => {
    this.setState({
      loading: true
    }, async() => {
      await new Promise(resolve => setTimeout(resolve, 2500))
      console.log(`Added appointment ${number}, day ${day}, time ${time}, id ${id}`)
      addCb(day, number, time, id)
      this.setState({ loading: false })
    })
  }
  addAppointmentCallbackContinuousCase=({day, number, time, id}, addCb,params,removeCb) => {
    this.setState({
      loading: true
    }, async() => {
      if(removeCb){
        await new Promise(resolve => setTimeout(resolve, 1250))
        console.log(`Removed appointment ${params.number}, day ${params.day}, time ${params.time}, id ${params.id}`)
        removeCb(params.day, params.number)
      }
      await new Promise(resolve => setTimeout(resolve, 1250))
      console.log(`Added appointment ${number}, day ${day}, time ${time}, id ${id}`)
      addCb(day, number, time, id) 
      this.setState({ loading: false })
    })
  }
  removeAppointmentCallback=({day, number, time, id}, removeCb) => {
    this.setState({
      loading: true
    }, async() => {
      await new Promise(resolve => setTimeout(resolve, 2500))
      console.log(`Removed appointment ${number}, day ${day}, time ${time}, id ${id}`)
      removeCb(day, number)
      this.setState({ loading: false })
    })
  }
  render () {
    const days = [
      [{ id: 1, number: 1, isSelected: true, periods: 2 }, { id: 2, number: 2 }, null, { id: 3, number: '3', isReserved: true }, { id: 4, number: '4' }, null, { id: 5, number: 5 }, { id: 6, number: 6 }],
      [{ id: 7, number: 1, isReserved: true, periods: 3 }, { id: 8, number: 2, isReserved: true }, null, { id: 9, number: '3', isReserved: true }, { id: 10, number: '4' }, null, { id: 11, number: 5 }, { id: 12, number: 6 }],
      [{ id: 13, number: 1 }, { id: 14, number: 2 }, null, { id: 15, number: 3, isReserved: true }, { id: 16, number: '4' }, null, { id: 17, number: 5 }, { id: 18, number: 6 }],
      [{ id: 19, number: 1 }, { id: 20, number: 2 }, null, { id: 21, number: 3 }, { id: 22, number: '4' }, null, { id: 23, number: 5 }, { id: 24, number: 6 }],
      [{ id: 25, number: 1, isReserved: true }, { id: 26, number: 2 }, null, { id: 27, number: '3', isReserved: true }, { id: 28, number: '4' }, null, { id: 29, number: 5 }, { id: 30, number: 6, isReserved: true }]
    ]
    const {loading} = this.state
    return (
      <div>
        <h1>Appointment Picker</h1>
        <AppointmentPicker
          addAppointmentCallback={this.addAppointmentCallback}
          removeAppointmentCallback={this.removeAppointmentCallback}
          initialDay={new Date('2018-05-05')}
          days={days}
          maxReservableAppointments={3}
          alpha
          visible
          selectedByDefault
          loading={loading}
        />
        <h1>Appointment Picker Continuous Case</h1>
        <AppointmentPicker
          addAppointmentCallback={this.addAppointmentCallbackContinuousCase}
          removeAppointmentCallback={this.removeAppointmentCallback}
          initialDay={new Date('2018-05-05')}
          days={days}
          maxReservableAppointments={2}
          alpha
          visible
          selectedByDefault
          loading={loading}
          continuous
        />
      </div>
    )
  }
}
```

### Props

Name | Type | Default | Required|Description
---- | ----- | ------- | ------ | -----------
`alpha` | boolean | `false` | `false` | Displays the name of the day of the week (`true`), otherwise in `dd-mm-yyyy` format.
`visible` | boolean | `false` | `false` | Shows the day (`true`), otherwise they are hidden (`false`).
`loading` | boolean | `false` | `false` | Shows a white mask on the appointmentPicker.
`continuous` | boolean | `false` | `false` | Allows to continue select appointments while remove previos ones if you already have max reservable appointmets.
`selectedByDefault` | boolean | `false` | `false` | Allow to have already selected appointments (`true`), otherwise (`false`) they aren´t going to be checked by their isSelected property.
`maxReservableAppointments` | number | 0 | `false` | Limits the number of selectable appointments.
`initialDay` | Date | - | `true` | Sets the initial day for your days.
`unitTime` | number | 15 * 60 * 1000 | `false` | Sets the minimal period of time between appointments.
`local` | string | `en-US` | `false` | Sets the locale param for Dates variables. See [documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString).
`addAppointmentCallback` | function | ({day, number, time, id}, addCb) => { console.log(`Added appointment ${number}, day ${day}, time ${time}, id ${id}`); addCb(day, number, time, id);}, | `false` | Should be customized as you need. Remember to use addCb(day,number,time,id) for accepting the selection, otherwise ommit it. For continuous case see the example where should use removeCb(day,number) for previosly selected appointment.
`removeAppointmentCallback` | function | ({day, number, time, id}, removeCb) => {console.log( `Removed appointment ${number}, day ${day}, time ${time}, id ${id}`); removeCb(day,number);} | `false` | Should be customized as you need. Remember to use removeCb(day,number) for accepting the deselection, otherwise ommit it.
`days` | array | - | `true` | Array of arrays of json. (See next section).

### Appointment properties

Each json in days prop could be `null` (empty appointment) or has these properties.

Name | Type | Default | Required|Description
---- | ----- | ------- | ------ | -----------
`id` | number or string | undefined | `false` | It identify an appointment.
`number` | number or string | undefined | `false` | It will be its order.
`isSelected` | boolean | `false` | `false` | It will be checked in case selectedByDefault is true.
`isReserved` | boolean | `false` | `false` | Disable the option of click it.
`periods` | number | 1 | `false` | Represents how many periods belongs to an appointment.

## License

MIT © [Rogger794](https://github.com/Rogger794)
