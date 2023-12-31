import Block from 'components/Common/Element/Block'
import StyledBody4 from 'components/Common/Element/body4'
import styled, { css } from 'styled-components'
import { useState } from 'react'
import StyledTextField from './styledTextField'
import { map } from 'lodash'
import StyledSelectOption from './styledSelectOption'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Button, IconButton, MenuItem, Select, SelectChangeEvent, SvgIcon, TableFooter, TablePagination, InputBase, InputBasePropsColorOverrides, SelectProps, InputProps } from '@mui/material';
import { muiTheme } from 'styles/mui'
import { hexToRgbA } from 'lib/helper'
import { OverridableStringUnion } from '@mui/types'

// import TextField


const BootstrapInput = styled(InputBase)(({ theme, color, inputProps }) => ({
    borderRadius: 4,
    '&.Mui-focused': {
        '& .MuiInputBase-input': {
            // border: '1px solid red',
            borderColor: theme.palette[color].main,
            border: `2px solid ${hexToRgbA(theme.palette[color].main, 1)}`
        },

    },
    'label + &': {
        marginTop: theme.spacing(3),
    },
    '& .MuiInputBase-input': {
        borderRadius: '4px',
        position: 'relative',
        backgroundColor: theme.palette.background.paper,
        border: '1px solid #ced4da',
        fontSize: 16,
        padding: '10px 26px 10px 12px',
        ...(inputProps.variant == "filled" ? {
            background: hexToRgbA(theme.palette[color].main, 1),
            color: 'white',
        } : {
            // color: 'black',
        }),

        transition: theme.transitions.create(['border-color', 'box-shadow']),
        // Use the system font instead of the default Roboto font.
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),

        '&:focus': {
            // ...(inputProps.variant == "outlined" ? {
            //     border: `2px solid ${hexToRgbA(theme.palette[color].main)}`
            // } : {}),
            // borderRadius: 4,
            // borderColor: theme.palette[color].light,
            // boxShadow: `0 0 0 0.2rem ${hexToRgbA(theme.palette[color].light, 0.5) }`,
        },
    },
}));

type styledDropDownButtonProps = {
    id?: string,
    name?: string,
    error?: any,
    color?: OverridableStringUnion<"error" | "primary" | "secondary" | "info" | "success" | "warning", InputBasePropsColorOverrides>
    options?: {
        value: any,
        label: any,
    }[],
    value?: any,
    onChange?: (e) => void,
    variant?: 'standard' | 'outlined' | 'filled',
    handleValidation?: (e, string, customParam?: any) => void,
    disabled?: boolean,
    [name: string]: any
}

const StyledDropDownButton = (props: styledDropDownButtonProps) => {
    const { id, name, error, color, options, value, onChange, variant, handleValidation, disabled, ...restProps } = props
    const [showDropDownList, setDropDownList] = useState(false)
    const [currValue, setCurrValue] = useState(value)

    const list = map(options, (option, index) => {
        return (
            <MenuItem value={option.value}>{`${option.label}`}</MenuItem>
        )
    })
    return (
        <Select
            error={error}
            variant={variant || 'filled'}
            id={id}
            name={name}
            sx={{
                textDecorationColor: "white",
                padding: '0.5px',
            }}
            onChange={(e) => {
                setCurrValue(e.target.value)
                if (handleValidation) {
                    //notes: assume ID is value
                    console.log("handleValidationy")
                    handleValidation(e, "number")
                }
                onChange(e)
            }}
            disabled={disabled}
            value={`${value}`}
            IconComponent={KeyboardArrowDownIcon}
            input={
                <BootstrapInput color={color || 'primary'} theme={muiTheme}
                    inputProps={{
                        variant: variant || 'filled'
                    }}
                />}
        >
            {list}
        </Select>
    )
}

export default StyledDropDownButton