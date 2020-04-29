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
    apr: [ 10,11,15,20],
    jul: [ 3, 7, 11, 19],
    nov: [ 14,15,16,17],
  },
}

const getMonths = (vals) => {
  /* console.log('vals for getMonths: ', vals) */
  return R.keys(testData[vals.year]) 
}

const getDays = (vals) => {
  /* console.log('vals for getDays: ', vals) */
  return testData[vals.year][vals.month]
}
// Making a covid Form; I think select elements for year/mo/day are needed.
// In order to populate those, I need to get all possible years, months, and days in a structure that allows changing the days based on the month and 
// the month based on the year should it come to that.
const UpdateSelectors = (props) => {
  const datemap = testData
  const years = R.keys(datemap)
  const month = R.keys(datemap[years[0]]).slice(-1)[0]
  const day = datemap[years[0]][month][0]
  console.log('year, month, day: ', years, month, day )
  const formSubmit = handleFormSubmit(props.pathFcn)
  return(
     <Form
       submitFormFcn = {formSubmit} defaults={{year: years[0], month, day }}
     >
       <RegSelector dataget={() => years} varname='year'  />
       <NestedSelector dataget={getMonths} varname='month' changeon={['year']} >
         <UpdateSelector key={"nested1"} dataget={getDays} varname='day' changeon={['year', 'month']} />
       </NestedSelector>
        
     </Form>
  )
}



export { UpdateSelectors };
