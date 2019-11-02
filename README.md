## Formbuilder; for selection forms with changing fields  
The form library is aimed specifically at forms where changing one field  
can change the options in the other fields.  

#### Set up using the Form and Selector components -  
RegSelectors will hold a static set of selections, while UpdateSelectors  
fields can change based on the variables in other Selectors.  
#### Each selector needs a dataget fcn/object to set the contents  
This can be a function that retrieves data or just an array that specifies  
what the options will be.  
For UpdateSelectors it needs to be a fcn because the UpdateSelector will call  
it anytime the specified other fields (changeon) change.  
RegSelectors will just call it/use it once to populate the selector.  
#### The form needs a submit fcn  
The submit function will be passed the values stored in each selector, as well  
as the submit event. I found the event hard to work with so it is just there  
if anyone else prefers that format.  
#### Also takes a defaultval  
The argument is optional, but there is a good chance the Selector will not  
pick the default value you want, since there are a lot of possible formats,  
values and sorting preferences.  
#### Selector variable sorting is alphabetical/numeric by default -  
I just try and get it to do ascending order alpha/numeric sort as consistently  
as possible.

### Example setup 
Two RegSelectors and and UpdateSelector that will update its values if either  
of the others changes.  
```javascript
import { Form, RegSelector, UpdateSelector } from '@jadesrochers/formbuilder'
const Form = (props) => {
  return(
    <Form
      submitFormFcn = {handleFormSubmit}
    >
      <RegSelector dataget={getDataYears} varname='year' defaultval={props.year} />
      <RegSelector dataget={getDataMonths} varname='month' defaultval={props.month} />
      <UpdateSelector dataget={getDataVars} varname='varname' defaultval={props.varname} changeon={['year', 'month']}
/>
    </Form>
  )
}
```

