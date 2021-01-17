/** @jsx jsx */
import React, { useState, useEffect } from 'react';
import { jsx, css } from '@emotion/core'
import * as R from 'ramda';
import * as fps from '@jadesrochers/fpstreamline';

var handleChange = R.curry((name, formsetter, changed) => {
  const value = changed.target.value;
  /* console.log('handle change: ', name, value) */
  formsetter(name, value)
})

// This one only runs the useEffect once; good for static list of 
// options or making request for single set that will not change.
const useSelector = (dataget, defaultval, formset, varname) => {
  const [opts, setopts] = useState(defaultval)
  /* const [current, setcurrent] = useState(defaultval) */
  useEffect(()=> {
  let datagetter
    if(typeof dataget === "function"){
      datagetter = async () => {
        const data = await dataget()
        setopts(data)
        formset(varname, defaultval)
        /* setcurrent(data[0]) */
      }
    }else{
      datagetter = () => {
        setopts(dataget)
        formset(varname, defaultval)
        /* setcurrent(dataget[0]) */
      }
    }
    datagetter()
  }, [])

  return { opts }
}

// If you need to pass static values, don't use this one.
// Updates the options based on other values in the form
const useUpdateSelector = ( props ) => {
  const [opts, setopts] = useState(props.default)
  const [rencount, setrencount] = useState(0)
  /* const [current, setcurrent] = useState(props.default) */
  const datawrap = () => props.dataget(props.formvals)
  useEffect(()=> {
    const datagetter = async () => {
      const data = await datawrap()
      /* console.log('data: ', data) */
      // With multiple update selectors, need this to avoid
      // invalid values
      if(data){
        /* setcurrent(data[0]) */
        if(rencount === 0){
          props.formset(props.varname, props.default)
          setrencount(1)
        }else{
          props.formset(props.varname, data[0]) 
        }
        setopts(data)
      }
    }
    datagetter()
  }, props.updatearr )

  useEffect(()=> {
    return () => {  
      props.formset(props.varname, props.default)
    };
  }, [])
  // The updatearr arg must be array, determines when the options are reset.
  return { opts }
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

  /* background-color: #34495e; */
const optionStyle = css`
  background-color: #124851;
  color: #d8d8d8;
  background: #124851;
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
    ))(fps.toArray(props.options))
  )
}

const Selector = (props) => {
 /* console.log('Selector name and formvals: ', props.formvals, props.varname) */
 const options = props.opts ? props.opts : ''
 return(
   <select 
    value = {props.formvals[props.varname]} 
    key = {props.varname}
    onChange = {(chg) => handleChange(props.varname, props.formset, chg)}
    css={[selectFilled,backgroundArrow,hoverColor,(props.cssStyles ? props.cssStyles : undefined)]}
    >
     <OptionList
       key={"formoptions"}
       options={options}
       cssStyles={props.optionStyle ? props.optionStyle : optionStyle}     />
   </select>
 )
}

const RegSelector = (props) => {
 const { opts } = useSelector(props.dataget, props.defaults[props.varname], props.formset, props.varname) 
 // Changed to useEffect to make React 6.13 happy regarding not updating
 // other components in fucntion body (with props.formset) except in useEffect
 useEffect(() => props.formset(props.varname, (props.defaults[props.varname])), [])
 /* useMemo(() => setcurrent(props.formvals[props.varname]), []) */
 return(
   <Selector {...props}  opts={opts} />
    )
}

// UpdateSelector: returns a <form> <select> element.
// Requires a getter function (dataget) to populate the options list, 
// the state variable tracking the form values (formvals)
const UpdateSelector = (props) => {
  const updater = { ...props, updatearr: R.map((name) => props.formvals[name])(props.changeon), default: props.defaults[props.varname] } 
  const { opts, } = useUpdateSelector(updater)

  return(
    <Selector {...props} opts={opts} />
  )
}

// The purpose of the nested selector: 
// To allow updateselectors to depend on each other in a certain order
// so that they will always get the correct result
const NestedSelector = (props) => {
  const updater = { ...props, updatearr: R.map((name) => props.formvals[name])(props.changeon), default: props.defaults[props.varname] } 
  const { opts, current, setcurrent } = useUpdateSelector(updater)

  const pass = { formvals: props.formvals, formset: props.formset, defaults: props.defaults }
  const propsToChildren = R.map(child => {
    return React.cloneElement(child, { ...pass })
  })(fps.toArray(props.children))

 // The useMemo statement assumes that the value of this selector
 // is needed for the nested selector to update. If not, don't use this.
 return(
   <>
     <Selector {...props} opts={opts} setcurrent={setcurrent} current={current} />
     { propsToChildren }
   </>
 )
     /* { useMemo(() => propsToChildren, R.values(R.pick(props.nestchange, props.formvals)) )} */
}


// Need TO DO: have Form set all the defaults itself to avoid unset 
// value problems
const Form = (props) => {
  const { values, setname, setValues } = useAddFormValue()
  const pass = {formset: setname, formvals: values, defaults: props.defaults, cssStyles: props.cssStyles, optionStyle: props.optionStyle}
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
    <input css={[ selectFilled, colorBorder, hoverColor, activeState,(props.submitStyle ? props.submitStyle : props.cssStyles)]}
     type={"submit"} value={"Submit"}
     key={"submitbutton"}
    />
  </form>
  )
}

export { Form, RegSelector, UpdateSelector, NestedSelector, useSelector, useAddFormValue, OptionList }
