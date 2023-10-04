// import OutsideClickHandler from 'react-outside-click-handler'
import Block from '/components/Common/Element/Block'
import { useStore } from '/store'
import { useRouter } from 'next/router'
const Popup = (props) => {
  const {
    type,
    callback,
    payload = {},
    maxWidth = 'calc(430px - 25px)',
    propsToPopup,
  } = props
  const a = useStore()
  const router = useRouter()
  const {
    state: {
      site: {
        lang,
        popup = '',
        popupType = '',
        loading,
        redeemData,
        popupGlobal,
      },
    },
    dispatch,
  } = useStore()

  let popupComponent = false

  const closePopup = () => {
    if (!loading) {
      document.querySelector('body').classList.remove('no-scroll')
      dispatch({ type: 'closePopup' })
      popupComponent = false
    }

    if (popupType === 'redeem') {
      if (!redeemData) router.push('/[lang]', `/${lang}`)
    }
  }

  switch (popupType) {
  
    // case 'messageDeleteproduct':
    // popupComponent = (
    //   <MessageDeleteproduct isOpen={true} closePopup={closePopup} {...propsToPopup} />
    // )
    // break;
  }



  const available =
    (type === 'global' && popupGlobal) || (type === 'local' && !popupGlobal)

  return (
    <>
      {popup && popupComponent && available && (
        <Block
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="100%"
          height="100%"
          bg="black50"
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex="1500"
        >
          <Block position='relative' >
            <Block position='absolute' top='50%' left='50%' transform="-50%, -50%" >
              {popupComponent}
            </Block>
          </Block>

        </Block>
      )}
    </>
  )
}

export default Popup
