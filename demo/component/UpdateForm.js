// This is possible because of a webpack resolve alias that points
// selectbox to ../../src/index.js
import React from "react";
import * as R from "ramda";
import { Form, RegSelector, UpdateSelector, NestedSelector } from 'formbuilder'

const handleFormSubmit = R.curry((pathfn,values,event) => {
  event.preventDefault();
  window.alert(`Current form values: ${values.year} ${values.month} ${values.day}`)
})


const testData = {
  2015: {
    jan: [ 1,2,3,4 ],
    feb: [ 7,8,9,10 ],
    mar: [ 21,22,23,24 ],
  },
  2016: {
    '03': [ 1,2,20,22],
    '04': [ 17,18,19,20,21 ],
    '05': [ 4,8,14,18 ],
  },
  2017: {
    jan: [ 23,25,27,29 ],
    apr: [ 10,11,15,20],
    jul: [ 3, 7, 11, 19],
    nov: [ 14,15,16,17],
  },
}

const getMonths = (data) => (vals) => {
  const rslt = R.keys(data[vals.year])
  return rslt
}

const getDays = (data) => (vals) => {
  const rslt = data[vals.year][vals.month]
  /* console.log('Rslt:', rslt) */
  return rslt
}
// Making a covid Form; I think select elements for year/mo/day are needed.
// In order to populate those, I need to get all possible years, months, and days in a structure that allows changing the days based on the month and 
// the month based on the year should it come to that.
const UpdateSelectors = (props) => {
  const datemap = testData
  const years = R.keys(datemap)
  const month = 'feb'
  /* const month = R.keys(datemap[years[0]]).slice(-1)[0] */
  const day = 9 
  /* const day = datemap[years[0]][month][0] */
  const formSubmit = handleFormSubmit(props.pathFcn)
  return(
     <Form
       submitFormFcn = {formSubmit} defaults={{year: years[0], month, day }}
     >
       <RegSelector dataget={() => years} varname='year'  />
       <UpdateSelector dataget={getMonths(datemap)} varname='month' changeon={['year']} />
       <UpdateSelector key={"nested1"} dataget={getDays(datemap)} varname='day' changeon={[ 'year', 'month']} />
     </Form>
  )
}


const testData2 = {
  2015: {
    jan: [ 1,2,3,4 ],
    feb: [ 7,8,9,10 ],
    mar: [ 5,10,15,21 ],
    apr: [ 10,11,15,20],
    jul: [ 3, 7, 11, 19],
    nov: [ 14,15,16,17],
  },
}

const UpdateSelectors3 = (props) => {
  const datemap = testData2
  const years = R.keys(datemap)
  const month = 'feb'
  /* const month = R.keys(datemap[years[0]]).slice(-1)[0] */
  const day = 9 
  /* const day = datemap[years[0]][month][0] */
  const formSubmit = handleFormSubmit(props.pathFcn)
  return(
     <Form
       submitFormFcn = {formSubmit} defaults={{year: years[0], month, day }}
     >
       <RegSelector dataget={() => years} varname='year'  />
       <UpdateSelector dataget={getMonths(datemap)} varname='month' changeon={['year']} />
       <UpdateSelector key={"nested1"} dataget={getDays(datemap)} varname='day' changeon={['year', 'month']} />
     </Form>
  )
}

export { UpdateSelectors, UpdateSelectors3 };
