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
    let formset = jest.fn()
    // Need to use mount for this hook to function
    let wrapper = mount(<HookWrapper 
      hook={() => useSelector([1,2,3], 2, formset, "noname")}   
    >  
    </HookWrapper>) 
    wrapper.update()
    /* console.log('useSelector: ', wrapper.debug()) */

    let hook = wrapper.find('div').props().hook;
    expect(hook.opts).toEqual([1,2,3])
    expect(hook.current).toEqual(undefined)

    /* hook = wrapper.find('div').props().hook; */
    /* act(() => { */
    /*   hook.setcurrent(3) */
    /* }) */
    /* wrapper.update() */
    /* hook = wrapper.find('div').props().hook; */
    /* expect(hook.current).toEqual(3) */

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
    let formset = jest.fn()
    let wrapper 
    await act( async () => {
      wrapper = mount(
        <HookWrapper 
          hook={() => useSelector(testfn, 4, formset, "noname")}   
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
          hook={() => useSelector(dataProm, 4,  formset, "noname")}   
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
      dataget={[1,2,3]} defaults={{"test1": undefined}}
      varname="test1" formset={formset}
      formvals={{'test1': 0}}
      />) 
    /* console.log(wrapper.debug()) */
    expect(wrapper.find('select').props().value).toEqual(0)
    expect(wrapper.text()).toEqual('123')
  });

  test('Change the value of a selector', () => {
    let formset = jest.fn()
    let wrapper = mount(<RegSelector 
      dataget={[1,2,3]} defaults={{"test1": 999}}
      varname="test1" formset={formset}
      formvals={{'test1': 3}}
      />) 
    expect(wrapper.find('select').props().value).toEqual(3)
    let onChange = wrapper.find('select').props().onChange
    act(() => {
      onChange({target: {value: 4}})
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
         dataget={dataget} defaults={{'year': 2000}}
         varname='year' formset={formset}
         formvals={{'month': 1, 'year': 2001}}
         changeon={['year', 'month']}
         />)
     })
     expect(wrapper.find('select').props().value).toEqual(2001)
     let onChange = wrapper.find('select').props().onChange

     await act( async () => {
       onChange({target: {value: 3}})
     })

     wrapper.update()
     /* console.log(wrapper.debug()) */
     // Now I don't know exactly what I intended, but 
     // the value is kept stable unless there is clear cause to change it.
     expect(wrapper.find('select').props().value).toEqual(2001)
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
    let formset = jest.fn()
    console.log('Currently broken test: \n')
    let wrapper = mount(
      <Form 
        submitFormFcn={submitFormFcn}
        defaults={{'test1': 1}}
      >
        <RegSelector
          dataget={[1,2,3]}
          varname='test1'  formset={formset}
          formvals={{'test1': 0}}
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
