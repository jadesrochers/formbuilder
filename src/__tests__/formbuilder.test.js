import React from 'react';
import { mount } from '../enzyme';
import { Form, RegSelector, UpdateSelector, useSelector, useAddFormValue, OptionList } from '../formbuilder'
import { act } from 'react-dom/test-utils';
import { HookWrapper } from '@jadesrochers/reacthelpers'

const FakeField = (props) => {
  return(
    <div />
  )
}

describe('formbuilder tests', () => {
  test('Test useselector with sync data', () => {
    // Need to use mount for this hook to function
    let wrapper = mount(<HookWrapper 
      hook={() => useSelector([1,2,3],2)}   
    >  
    </HookWrapper>) 
    wrapper.update()
    /* console.log('useSelector: ', wrapper.debug()) */

    let hook = wrapper.find('div').props().hook;
    expect(hook.opts).toEqual([1,2,3])
    expect(hook.current).toEqual(undefined)

    hook = wrapper.find('div').props().hook;
    act(() => {
      hook.setcurrent(3)
    })
    wrapper.update()
    hook = wrapper.find('div').props().hook;
    expect(hook.current).toEqual(3)

  });


  // Fix this test when Async act() comes out and allows
  // useEffect to work
  test('Test useSelecor with async', async () => {
    let dataProm = () => {
      return new Promise((resolve, reject) => {
      resolve([1,2,3,4,5]);
     })
    }
    let testfn = jest.fn(() => [1,2,3,4])
    let wrapper 
    await act( async () => {
      wrapper = mount(
        <HookWrapper 
          hook={() => useSelector(testfn,'test1',4)}   
        >
        </HookWrapper>
      ) 
    })

    wrapper.update()
    let hook = wrapper.find('div').props().hook;
    expect(hook.opts).toEqual([1,2,3,4])

    await act( async () => {
      wrapper = mount(
        <HookWrapper 
          hook={() => useSelector(dataProm,'test2',4)}   
        >
        </HookWrapper>
      ) 
    })

    wrapper.update()
    hook = wrapper.find('div').props().hook;
    expect(hook.opts).toEqual([1,2,3,4,5])
  });
})

describe('OptionList tests', () => {
  test('Get a set of options', () => {
    let wrapper = mount(<OptionList options={[1,2,3,4]} />) 
    // Tried an element match but did not work for unknown reason
    // even though the options seem very simple.
    expect(wrapper.find('option').get(0).props.item).toEqual(1)
    expect(wrapper.find('option').get(1).props.item).toEqual(2)
    expect(wrapper.find('option').get(2).props.item).toEqual(3)
    expect(wrapper.find('option').get(3).props.item).toEqual(4)
  });
});

describe('Selector tests', () => {

  test('Create a selector', () => {
    let formset = jest.fn()
    let wrapper = mount(<RegSelector 
      dataget={[1,2,3]} defaultval={0}
      varname="test1" formset={formset}
      />) 
    /* console.log(wrapper.debug()) */
    expect(wrapper.find('select').props().value).toEqual(0)
    expect(wrapper.text()).toEqual('123')
  });

  test('Change the value of a selector', () => {
    let formset = jest.fn()
    let wrapper = mount(<RegSelector 
      dataget={[1,2,3]} defaultval={0}
      varname="test1" formset={formset}
      />) 
    expect(wrapper.find('select').props().value).toEqual(0)
    let onChange = wrapper.find('select').props().onChange
    act(() => {
      onChange({target: {value: 3}})
    })
    wrapper.update()
    expect(wrapper.find('select').props().value).toEqual(3)
    expect(wrapper.text()).toEqual('123')
  });

  test('Create and Change an updateselector', async () => {
    // Update when act() async support added, 16.9 goal for react team.
    let formset = jest.fn()
    let dataget = jest.fn()
    let wrapper
    dataget.mockReturnValueOnce([1,2,3])
    dataget.mockReturnValueOnce([1,2,3])
    act(() => {
      wrapper = mount(<UpdateSelector
         dataget={dataget} defaultval={0}
         varname="test1" formset={formset}
         formvals={{month: 1, year: 2001}}
         changeon={['year', 'month']}
         />)
     })
     expect(wrapper.find('select').props().value).toEqual(undefined)
     let onChange = wrapper.find('select').props().onChange

     await act( async () => {
       onChange({target: {value: 3}})
     })

     wrapper.update()
     /* console.log(wrapper.debug()) */
     // This is not working quite as intended, should switch to
     // three but because the options are not yet populated it 
     // throws it back to one.
     expect(wrapper.find('select').props().value).toEqual(1)
     expect(wrapper.text()).toEqual('123')
  });



});

describe('Form tests', () => {

  test('Create a form', () => {
    let submitFormFcn = jest.fn()
    let wrapper = mount(
      <Form 
        submitFormFcn={submitFormFcn}
      >
        <FakeField varname="test1" />
      </Form> 
      ) 
    expect(wrapper.find('form').length).toEqual(1)
  });

  test('Create a form with field and submit it', () => {
    let submitFormFcn = jest.fn()
    let wrapper = mount(
      <Form 
        submitFormFcn={submitFormFcn}
      >
        <RegSelector
          dataget={[1,2,3]} defaultval={1}
          varname="test1" 
        />
      </Form> 
      ) 
    let submit = wrapper.find('form').props().onSubmit 
    submit({testsubmit: true})
    expect(submitFormFcn).toHaveBeenCalledWith({"test1": 1}, {testsubmit: true})
  });
});

describe('useAddFormHook tests', () => {
  test('Create and set a value in the hook', () => {
    let wrapper = mount(<HookWrapper 
      hook={() => useAddFormValue()}   
    >  
    </HookWrapper>) 

    let hook = wrapper.find('div').props().hook;
    expect(hook.values).toEqual({})
    
    act(() => {
      hook.setname('test5', 61)
    })
    wrapper.update()
    hook = wrapper.find('div').props().hook;

    expect(hook.values).toEqual({test5: 61})
  });
});
