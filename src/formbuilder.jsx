import React, { useState, useEffect } from 'react';
import * as R from 'ramda';
import * as fps from '@jadesrochers/fpstreamline';
import styles from "./formbuilder.module.css"

var handleChange = R.curry((name, formsetter, changed) => {
    const value = changed.target.value;
    /* console.log('handle change: ', name, value) */
    formsetter(name, value)
})

// Set the options for a List - Does Not select an option from that list
// Runs the useEffect once; good for static list of 
// options or making request for set that will not change later.
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
                }else if(rencount === 1){
                    props.formset(props.varname, data[0]) 
                    setrencount(2)
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


const OptionList = (props) => {
    return(
        R.map((opt) => (
            <option 
            key={fps.isTypeof('string')(opt) ? opt : R.toString(opt)} 
            item={opt}
            className={props.classnames ? props.classnames.join(' ') : undefined}
            // css={[(props.cssStyles ? props.cssStyles : undefined)]}
            >
            {opt} 
            </option>
        ))(fps.toArray(props.options))
    )
}

const Selector = (props) => {
    /* console.log('Selector name and formvals: ', props.formvals, props.varname) */
    const defaultStyles = `${styles.backgroundArrow} ${styles.selectFilled} ${styles.hoverColor}`
    const classnames = props.classnames ? `${props.classnames.join(' ')}` : defaultStyles
    const options = props.opts ? props.opts : ''
    return(
        <select 
        value = {props.formvals[props.varname]} 
        key = {props.varname}
        onChange = {(chg) => handleChange(props.varname, props.formset, chg)}
        className={classnames}
        theme={classnames}
        // css={[selectFilled,backgroundArrow,hoverColor,(props.cssStyles ? props.cssStyles : undefined)]}
        >
        <OptionList
        key={"formoptions"}
        options={options}
        className={props.optionclassnames ? props.optionclassnames.join(' ') : undefined}
        // cssStyles={props.optionStyle ? props.optionStyle : optionStyle}
        />
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
    const pass = {formset: setname, formvals: values, defaults: props.defaults, classnames: props.classnames, optionclassnames: props.optionclassnames}
    const propsToChildren = R.map(child => {
        return React.cloneElement(child, { ...pass, key: child.props.varname})
    })(fps.toArray(props.children))
    const defaultStyles = `${styles.selectFilled} ${styles.colorBorder} ${styles.hoverColor} ${styles.activeState}`

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
        <input 
        // css={[ selectFilled, colorBorder, hoverColor, activeState, (props.submitStyle ? props.submitStyle : props.cssStyles)]}
        className={defaultStyles}
        theme={props.classnames ? props.classnames.join(' ') : undefined}
        type={"submit"} value={"Submit"}
        key={"submitbutton"}
        />
        </form>
    )
}

export { Form, RegSelector, UpdateSelector, NestedSelector, useSelector, useAddFormValue, OptionList }
