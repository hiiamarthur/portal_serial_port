import { CustomCtx, preprocessServerSideProps } from 'lib/serverside-prepro'
import Block from 'components/Common/Element/Block'
import { useStore } from 'store'
import getConfig from 'next/config'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { withCookies } from 'react-cookie'
import { CustomRequest, internalAPICallHandler } from 'lib/api/handler'
import StyledH1 from 'components/Common/Element/H1'
import FormHandler from 'components/Form'
import superjson, { deserializeObjInit, deserializeListInit } from 'lib/superjson'
import { deserialize } from 'superjson'
import get from 'lodash/get'
import { machineContent } from 'data/machine'
import BasicButton from 'components/Button/BasicButton'
const { publicRuntimeConfig } = getConfig()
const { API_URL, APP_URL } = publicRuntimeConfig


const MachineDetail = (props) => {
    const { cookies, clientUserData, machineTypeData, machineData } = props
    const token = cookies.get("accessToken")
    const role = cookies.get("userRole")
    const {
        state: {
            site: { lang, pageName },
            user: { userProfile }
        },
        dispatch,
    } = useStore()
    const router = useRouter()

    const machineString = get(machineContent, lang)
    const palletConfigBtnList = Object.keys(machineString.palletConfiguration).map((key) => {
        const item = machineString.palletConfiguration[key]
        return <BasicButton onClick={() => {
            router.push(`${router.asPath}/${item.url}`)
        }}>{item.name}</BasicButton>
    })

    return (
        <Block>
            <StyledH1 className={`${lang == 'en' ? 'font-jost' : 'font-notoSansTC'}`} color="white"
            >
                {pageName}
            </StyledH1>

            <Block boxShadow='0px 10px 30px rgba(0, 0, 0, 0.1)' bg='white' borderRadius='32px' mb='30px'>
                <FormHandler formType="MachineForm" mode="edit" machineData={machineData} clientUserData={clientUserData} machineTypeData={machineTypeData}/>
            </Block>

            <Block>
                {palletConfigBtnList}
            </Block>
            {/* <Popup type="local" /> */}
        </Block>
    )
}

export async function getServerSideProps(ctx: CustomCtx) {
    const preProps = await preprocessServerSideProps(ctx)
    if (preProps.redirect)
        return preProps

    const { pageName } = ctx.query
    const { profile, token, user, systemConstant } = ctx?.props || {}
    const { slug, lang, id } = ctx.params
    const collection = 'machine'
    var getMachine: CustomRequest = {
        query: {
            collection,
            where: {
                machineDisplayID: id
            },
            isUnique: true
        },
        method: ctx.req.method,
    }

    const getClientUser: CustomRequest = {
        query: {
            collection: "user",
            where: {
                userRoleID: 3
            }
        },
        method: "GET"
    }

    const getMachineType: CustomRequest = {
        query: {
            collection: "machineType",

        },
        method: "GET"
    }

    const clientUserData = await internalAPICallHandler(getClientUser).then((data) => {
        return deserializeListInit(data.result)
    }).catch((e) => {
        console.log("error getserversideProps", e)
    })

    const machineTypeData = await internalAPICallHandler(getMachineType).then((data) => {
        return deserializeListInit(data.result)
    }).catch((e) => {
        console.log("error getserversideProps", e)
    })


    const machineData = await internalAPICallHandler(getMachine).then((data) => {
        return deserializeObjInit(data.result)
    }).catch((e) => {
        console.log("error getserversideProps", e)
    })



    return {
        props: {
            machineData,
            collection,
            machineTypeData,
            clientUserData,
            user,
            systemConstant
        },
    }
}

export default withCookies(MachineDetail)