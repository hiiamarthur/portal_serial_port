import { createGlobalStyle } from 'styled-components'
import { normalize } from 'polished'
import fonts from '/styles/theme/fonts'

const GlobalStyle = createGlobalStyle`
  ${normalize}

  div {
    box-sizing: border-box;
    word-break: break-word;
  }
  a {
    text-decoration: none;
    cursor: pointer;
  }
  
  body {
    -webkit-tap-highlight-color: rgba(0,0,0,0);
    -webkit-touch-callout: none;
    -webkit-text-size-adjust: 100%;
    -webkit-font-smoothing: antialiased;
    margin: auto;
    overflow-x: hidden;
    background-size: 100%;
    font-family: ${fonts.inter};
    &.no-scroll {
      overflow: hidden;
    }
    svg, img {
      display: block;
    }
  }

  * {
    -webkit-tap-highlight-color: transparent;

    &:focus {
      outline: none;
    }
  }

h1,
h2,
h3,
h4,
h5,
h6,
.h1,
.h2,
.h3,
.h4,
.h5,
.h6 {
      margin-top: 0;
    margin-bottom: 0.5rem;

    font-weight: 500;
    line-height: 1.2;
    color: #203A45;
}


  /* H1 Header */
  h1 {
    font-size: 1.875rem;
    /* identical to box height */
  }

  h2 {
    /* H2 Header */
    font-size: 1.64rem;
  }

  h3 {
    font-size: 1.40rem;
  }

  h4 {
    font-size: 1.17rem;
  }

  h5 {
  font-size: 0.9375rem;
  }

  textarea {
    /* width: 100%;
    height: 100% */
  }

  .bodyBold1 {
    /* font-family: 'Inter'; */
    font-style: normal;
    font-weight: 600;
    font-size: 18px;
    line-height: 22px;
  }

  .body1 {
    /* font-family: 'Inter'; */
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 19px;
  }

  .body2 {
    /* font-family: 'Inter'; */
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 30px;
  }

  .body3 {
    /* font-family: 'Inter'; */
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 24px;
  }

  .body4 {
    /* font-family: 'Inter'; */
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 20px;
  }

  .bodyLight1 {
    /* font-family: 'Inter'; */
    font-style: normal;
    font-weight: 300;
    font-size: 16px;
    line-height: 19px;
  }

  .containerNoMenu {
    /* border: 1px solid red; */
    max-width: 1466px;
    padding-right: 20px;
    padding-left: 20px;
    margin-left: auto;
    margin-right: auto;
  }

  .container {
    /* border: 1px solid blue; */
    max-width: 1366px;
    padding-right: 20px;
    padding-left: 20px;
    margin-left: auto;
    margin-right: auto;
    
    /* @media only screen and (min-width: 1800px){
      max-width: 1366px;
    }

    @media only screen and (min-width: 1024px) and (max-width: 1800px){
      max-width: 1266px;
    } */
  }

  .popupContainer {
    max-width: 608px;
    padding-right: 5px;
    padding-left: 5px;
    margin-left: auto;
    margin-right: auto;
  }

  .error-icon {
      padding:10px 10px;
        background-repeat: no-repeat;
         background-position: center;
         background-image:url('/svg/icon_error.svg');
    }

    #__next {
    overflow-x: hidden;
  }

  /* width */
  ::-webkit-scrollbar {
    width: 10px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: transparent; 
  }
  
  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: #D9D9D9; 
    border-radius: 30px;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    /* background: #555;  */
  }
`

export default GlobalStyle
