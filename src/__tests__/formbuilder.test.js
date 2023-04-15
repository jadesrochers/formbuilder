import React from 'react';
import { render, screen, renderHook, act, waitFor, fireEvent } from '@testing-library/react'
import { Form, RegSelector, UpdateSelector, useSelector, useAddFormValue, OptionList } from '../formbuilder'
import '@testing-library/jest-dom'

const FakeField = (props) => {
    return(
        <div />
    )
}

describe('formbuilder tests', () => {
    // Tests the useSelector Hook - sets option data, nothing else
    test('Test useselector with sync data', async () => {
        let formset = jest.fn()
        const output = renderHook(() => useSelector([1,2,3], 2, formset, "noname"))
        const { result } = output
        expect(result.current.opts).toEqual([1,2,3])
    });


    // Fix this test when Async act() comes out and allows
    // useEffect to work
    test('Test useSelecor with async', async () => {
        const dataProm = () => {
            return new Promise((resolve, reject) => {
                resolve([1,2,3,4,5]);
            })
        }
        const testfn = () => [1,2,3,4]
        const formset = jest.fn()

        // Test a function returning the form data
        let output = renderHook((props = {}) => useSelector(testfn, 4, formset, "noname"))
        await waitFor(() => expect(output.result.current.opts).toEqual([1,2,3,4]))

        // Test an async function returning the form data
        output = renderHook(() => useSelector(dataProm, 4, formset, "noname"))
        await waitFor(() => expect(output.result.current.opts).toEqual([1,2,3,4,5]))
    });
})


describe('OptionList tests', () => {
    test('Get a set of options', () => {
        render(<OptionList options={[1,2,3,4]} />) 
        expect(screen.getByText('1')).toBeInTheDocument()
        expect(screen.getByText('2')).toBeInTheDocument()
        expect(screen.getByText('3')).toBeInTheDocument()
        expect(screen.getByText('4')).toBeInTheDocument()
    });
});


describe('Selector tests', () => {

    test('Create a selector', () => {
        let formset = jest.fn()
        const { container } = render(<RegSelector 
            dataget={[1,2,3]} defaults={{"test1": undefined}}
            varname="test1" formset={formset}
            formvals={{'test1': 0}}
            />) 
        expect(container.getElementsByTagName('select').item(0)).toBeInTheDocument()
        expect(screen.getByText('1')).toBeInTheDocument()
        expect(screen.getByText('2')).toBeInTheDocument()
        expect(screen.getByText('3')).toBeInTheDocument()
    });

    test('Change the value of a selector', async () => {
        const formset = jest.fn()
        // Default text for selector is 999, should then update to [1 2 3]
        const { container } = render(
            <RegSelector 
            dataget={[1,2,3]} defaults={{"test1": 999}}
            varname="test1" formset={formset}
            formvals={{'test1': 3}}
            />) 
        const selectElem = container.getElementsByTagName('select').item(0)

        // Change the selected item
        act(() => {
            // You don't call Fcns with RTL, instead fire events
            fireEvent.change(selectElem, {target: {value: 3}})
        })
        await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument())
    });

    test('Create and Change an updateselector', async () => {
        let formset = jest.fn()
        let dataget = jest.fn()
        let wrapper
        dataget.mockReturnValueOnce([1,2,3])
        dataget.mockReturnValueOnce([1,2,3])
        const { container } = render(
            <UpdateSelector
            dataget={dataget} defaults={{'year': 2000}}
            varname='year' formset={formset}
            formvals={{'month': 1, 'year': 2001}}
            changeon={['year', 'month']}
            />)
        const selectElem = container.getElementsByTagName('select').item(0)
        expect(screen.getByText('2000')).toBeInTheDocument()

        act(() => {
            fireEvent.change(selectElem, {target: {value: 3}})
        })

        await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument())
        await waitFor(() => expect(screen.getByText('1')).toBeInTheDocument())
        await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument())
    });

});

describe('Form tests', () => {

    test('Create a form', () => {
        let submitFormFcn = jest.fn()
        const { container } = render(
            <Form 
            submitFormFcn={submitFormFcn}
            >
            <FakeField varname="test1" />
            </Form> 
        ) 
        expect(container.getElementsByTagName('form').length).toEqual(1)
    });

    test('Create a form with field and submit it', async () => {
        let submitFormFcn = jest.fn()
        let formset = jest.fn()
        const { container } = render(
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

        const inputElem = container.getElementsByTagName('input').item(0)
        act(() => {
            fireEvent.submit(inputElem)
        })

        await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument())
        expect(submitFormFcn).toHaveBeenCalledTimes(1)
    });
});

describe('useAddFormHook tests', () => {
    test('Create and set a value in the hook', async () => {
        const { result } = renderHook(() => useAddFormValue())
        expect(result.current.values).toEqual({})

        act(() => {
            result.current.setname('test5', 61)
        })
        expect(result.current.values).toEqual({test5: 61})
    });
});
