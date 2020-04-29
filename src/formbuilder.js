/** @jsx jsx */
import React, { useState, useMemo, useEffect } from 'react';
import { jsx, css } from '@emotion/core'
import * as R from 'ramda';
import * as fps from '@jadesrochers/fpstreamline';

var handleChange = R.curry((name, childsetter, formsetter, changed) => {
  /* console.log('handle change: ', changed) */
  const value = changed.target.value;
  childsetter(value)
  formsetter(name, value)
})

// This one only runs the useEffect once; good for static list of 
// options or making request for single set that will not change.
const useSelector = (dataget, defaultval) => {
  const [opts, setopts] = useState(defaultval)
  const [current, setcurrent] = useState(defaultval)
  React.useEffect(()=> {
  let datagetter
    if(typeof dataget === "function"){
      datagetter = async () => {
        setopts(await dataget())
      }
    }else{
      datagetter = () => setopts(dataget)
    }
    datagetter()
  }, [])

  return { opts, current, setcurrent }
}

// If you need to pass static values, don't use this one.
// Updates the options based on other values in the form
const useUpdateSelector = ( dataget, formvals, updatearr, defaultval ) => {
  const [opts, setopts] = useState(defaultval)
  const [current, setcurrent] = useState(defaultval)
  const datawrap = () => dataget(formvals)
  React.useEffect(()=> {
    let datagetter
     datagetter = async () => {
       setopts(await datawrap())
     }
   datagetter()
  }, updatearr )
  // The updatearr arg must be array, determines when the options are reset.
  return { opts, current, setcurrent }
}

const useAddFormValue = () => {
  const [values, setValues] = useState({})
  const setname = (name, value) => {
    let addon = {}
    addon[name] = value
    setValues({...values, ...addon})
  }
  return { values, setname, setValues }
}

const backgroundArrow = css`
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat;
  background-position: center right 0.5em;
  background-size: 0.7em 0.7em;
`;

const hoverColor = css`
  &:hover {
    color: #f4f6f6;
  }
`
const activeState = css`
  &:active {
    transform: translateY(1px);
    filter: saturate(150%);
  }
`

const colorBorder = css`
  border-left-width: 1px;
  border-style: solid;
  border-left-color: #fff;
`

const selectFilled = css`
  line-height: 1.1;
  padding: .4em 1.3em .4em .6em;
  border: 1px solid #fff;
  color: #000;
  appearance: none;
  background-color: #3498db;
  font-size: 1.0em;
`;

const optionStyle = css`
  background-color: #34495e;
`;



const OptionList = (props) => {
  return(
    R.map((opt) => (
      <option 
        key={fps.isTypeof('string')(opt) ? opt : R.toString(opt)} 
        item={opt}
        css={[(props.cssStyles ? props.cssStyles : undefined)]}
      >
        {opt} 
      </option>
    ))(props.options)
  )
}

const Selector = (props) => {
 let options = props.opts ? props.opts : ''
 return(
   <select 
    value = {props.current} 
    key = {props.varname}
    onChange = {(chg) => handleChange(props.varname, props.setcurrent, props.formset, chg)}
    css={[selectFilled,backgroundArrow,hoverColor,(props.cssStyles ? props.cssStyles : undefined)]}
    >
     <OptionList
       key={"formoptions"}
       options={options}
       cssStyles={optionStyle}
     />
   </select>
 )
}

const RegSelector = (props) => {
console.log('regselector props: ',props)
 const { opts, current, setcurrent } = useSelector(props.dataget, props.defaults[props.varname]) 
 // Changed to useEffect to make React 6.13 happy regarding not updating
 // other components in fucntion body (with props.formset) except in useEffect
 useEffect(() => props.formset(props.varname, (opts ? current : props.formvals[props.varname])), [opts])
 useMemo(() => setcurrent(props.formvals[props.varname]), [])
 return(

   <Selector {...props}  opts={opts} setcurrent={setcurrent} current={current} />
    )
}

// UpdateSelector: returns a <form> <select> element.
// Requires a getter function (dataget) to populate the options list, 
// the state variable tracking the form values (formvals)
const UpdateSelector = (props) => {
console.log('updateselector props: ',props)
 const { opts, current, setcurrent } = useUpdateSelector(props.dataget, props.formvals, R.map((name) => props.formvals[name])(props.changeon), props.defaults[props.varname])

 console.log('updateselector opts, current, formvals: ', opts, current, props.formvals)
 useMemo(() => { setcurrent(opts ? opts[0] : props.formvals[props.varname]) }, [opts])
 useEffect(() => props.formset(props.varname, (opts ? current : props.formvals[props.varname])), [opts])
 // when the options for the selector change, grab the first
 // and set is as the current

 return(
   <Selector {...props}  opts={opts} setcurrent={setcurrent} current={current} />
 )

}

// The purpose of the nested selector: 
// To allow updateselectors to depend on each other in a certain order
// so that they will always get the correct result
const NestedSelector = (props) => {
 const { opts, current, setcurrent } = useUpdateSelector(props.dataget, props.formvals, R.map((name) => props.formvals[name])(props.changeon))
 /* console.log('NestedSelector current: ', current) */
 // If options exist, set the current
 console.log('nestedselector opts, current, formvals: ', opts, current, props.formvals)
 useMemo(() => setcurrent(opts ? opts[0] : props.formvals[props.varname]), [opts])
 useEffect(() => props.formset(props.varname, (opts ? current : props.formvals[props.varname])), [opts])
 /* useMemo(() => setcurrent(props.defaultval), [props.defaultval]) */
 const pass = { formvals: props.formvals, formset: props.formset, update: current, defaults: props.defaults }
 const propsToChildren = R.map(child => {
    return React.cloneElement(child, { ...pass })
 })(fps.toArray(props.children))

 return(
   <>
     <Selector {...props}  opts={opts} setcurrent={setcurrent} current={current} />
     { propsToChildren }
   </>
 )

}


// Need TO DO: have Form set all the defaults itself to avoid unset 
// value problems
const Form = (props) => {
  console.log('Form props: ',props)
  const { values, setname, setValues } = useAddFormValue()
  const pass = {formset: setname, formvals: values, defaults: props.defaults}
  console.log('Form pass: ', pass)
  const propsToChildren = R.map(child => {
    return React.cloneElement(child, { ...pass, key: child.props.varname})
  })(fps.toArray(props.children))
 
  if( R.isEmpty(values) ){
    setValues(props.defaults)
  }
  
  // The props.submitFcn is usually to get the data back to the parent.
  return(
  <form 
     onSubmit={(e) => {
       props.submitFormFcn(values,e) 
     } }
  >
    { propsToChildren }
    <input css={[ selectFilled, colorBorder, hoverColor, activeState,(props.cssStyles ? props.cssStyles : undefined)]}
     type={"submit"} value={"Submit"}
     key={"submitbutton"}
    />
  </form>
  )
}

export { Form, RegSelector, UpdateSelector, NestedSelector, useSelector, useAddFormValue, OptionList }
