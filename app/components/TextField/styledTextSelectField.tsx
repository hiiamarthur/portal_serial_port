import Block from 'components/Common/Element/Block'
import StyledBody4 from 'components/Common/Element/body4'
import styled, { css } from 'styled-components'
import { useState } from 'react'
import StyledTextField from './styledTextField'
import { map } from 'lodash'
import StyledSelectOption from './styledSelectOption'
// import TextField

const Container = styled(Block)`
    ${(props) => props.errors && props.childprops && props.errors[props.childprops.id] && css`
        {
            /* background-color: ivory; */
            /* border: none; */
            border: 2px solid red;
            
            /* border-radius: 5px;   */
        },
    `}
    ${(props) => css`
            #right-icon{
                background-image: ${props.showDropDownList ? "url('/svg/icon_vector_up.svg')" : "url('/svg/icon_vector_down.svg')"};
            /* background-image: url('/svg/eye.svg'); */
             {
                
            }
        },
    `}

        box-sizing: border-box;
        
        /* Auto layout */
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 6px 8px 6px 20px;
        gap: 16px;

        /* position: absolute; */
        height: 30px;
        left: 20px;
        top: 20px;

        /* Light grey 2 */
        background: #FAFAFA;

        border: 1px solid #959595;
        border-radius: 20px;
        width: 100%;
        /* @media (min-width: 620px) {
            width: 600px;
        } */
        /* pointer-events: none; */

    &:focus-within{
        border: 1px solid #333333;
        
        > i {
            background:url('/svg/Search_black.svg');
        }
        > input::placeholder{
            color: #333333;
        }
    }

    .error-msg {
        display: none;
    }

    input:invalid {
        
        /* & {
            background-color: ivory;
            border: none;
            outline: 2px solid red;
            border-radius: 5px;
        } */

        /* error-msg {
            background-color: red;
            display: flex;
        } */
    }


    #left-icon {
        left:0;
        padding:10px 10px;
        background-image:url('/svg/Search_grey.svg');
        /* color:#30A3F1; */
    }

    #right-icon {
        /* left:0;   */
        /* width: 20px;
        height: 20px; */
        padding:10px 20px;

        /* color:#30A3F1; */
    }

    input {
        width: 100%;
        height: 100%;
        border: none;
        background: #FAFAFA;
        /* pointer-events: auto; */
     }

    
`


const StyledTextSelectField = (props) => {
    const { errors, options, value, onClick, ...restProps } = props
    const [showDropDownList, setDropDownList] = useState(false)
    const [currValue, setCurrValue] = useState(null)
    let error = false
    // if(props.id)
    //     props.id = "id"
    const setError = (e) => {
        error = true
    }

    function myFunction(e) {
        if (!props.id) return
        setDropDownList(!showDropDownList)

    }

    const getValue = (e) => {
        if (e && e.target && e.target.value) {
            setCurrValue(e.target.value)
            setDropDownList(false)
            if (onClick)
                onClick(e.target.value)
        }

    }

    const list = map(options, (option, index) => {
        return (
            <StyledSelectOption hover value={option} type="select" onClick={getValue}></StyledSelectOption>
        )
    })
    return (
        <Block display='inline-block' {...restProps}>
            <Container errors={errors}  showDropDownList={showDropDownList}>
                {/* <i id='left-icon' aria-hidden="true" style={{ backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}></i> */}
                <input
                    id={props.id}
                    type="text"
                    name={props.name}
                    value={currValue || value}
                    placeholder={props.placeholder}
                    onChange={props.handleValidation}
                    width="fit-content"
                />
                {/* <input type="reset" value="Reset" ></input> */}

                <button style={{ border: 'none', background: 'none' }} onClick={(e) => {
                    myFunction(e)
                    // console.log("ONCLICK,", e, a.value)
                }}><i id="right-icon" aria-hidden="true" style={{ backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }} /></button>
            </Container>
            <Block display={showDropDownList ? 'block' : 'none'}
                backgroundColor="#FAFAFA"
            borderRadius="16px"
            position='absolute' 
            zIndex="9">
                {list}
            </Block>
            {errors && errors[props.id] && <Block display='flex'><i aria-hidden="true" className='error-icon' /><StyledBody4 color='errorRed'>{errors[props.id]}</StyledBody4></Block>}
        </Block>

    )
}

export default StyledTextSelectField