import Block from 'components/Common/Element/Block'
import { useRouter } from 'next/router'
import { useStore } from 'store'
import get from 'lodash/get'
import styled from 'styled-components'
import { useState, useEffect } from 'react'
import general from 'data/general'
import Button5 from '../Button/Button5'
import Button6 from 'components/Button/Button6'
import Button4 from 'components/Button/Button4'
import BasicButton from 'components/Button/BasicButton'
import SvgIconUnionGrey from 'public/svg/icon_union_grey.svg'
import { KeyboardArrowLeft } from '@mui/icons-material'
const StyledHeaderContainer = styled(Block)``

const Header = (props) => {
  const { headerButtonTheme, headerTheme, headerPosition } = props
  const router = useRouter()
  const {
    state: {
      site: { lang, storeHeaderTheme },
    },
    dispatch,
  } = useStore()
  const [selectedLang, setSelectLang] = useState(lang)
  useEffect(() => {
    console.log("setSelectlang",lang)
    const urlLang = get(window, 'location.href', '').match(/\/(tc|en)/)
    if (get(urlLang, '[1]') && selectedLang !== get(urlLang, '[1]')) {
      dispatch({
        type: 'switchLang',
        payload: { lang: selectedLang },
      })
      router.push(
        window.location.href.replace(
          '/' + get(urlLang, '[1]'),
          '/' + selectedLang,
        ),
      )
    }
    dispatch({ type: 'setLoading', payload: { value: false } })
  }, [selectedLang])

  const generalString = get(general,lang)

  return (
    <>
      <StyledHeaderContainer
        className={`top-0 ${headerTheme == 'white' ? 'bg-green' :'bg-transparent'} flex items-center` } 
        // id="header"
        // // position={"fixed"}
        // top="0"
        // zIndex="101"
        // backgroundColor={headerTheme === 'white' ? '#8EC9C0' : 'transparent'}
        // width="100%"
      >
        {/* <Button
        ></Button> */}
        <BasicButton variant="text" className="md:hidden xs:block z-0" sx={{
          color: 'white',
        }} onClick={() => { 
          router.back()
        }}><KeyboardArrowLeft /></BasicButton>
        <Button5
          onClick={() => {
            setSelectLang(generalString.switchLangCode)
          }}>{generalString.lang}</Button5>
      </StyledHeaderContainer>
      {/* <Popup type="local" propsToPopup={{ menuItems: mobileMenuItems }} /> */}
    </>
  )
}

export default Header
