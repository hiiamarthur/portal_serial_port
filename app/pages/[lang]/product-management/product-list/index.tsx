import { CustomCtx, preprocessServerSideProps } from 'lib/serverside-prepro'
import Block from 'components/Common/Element/Block'
import { useStore } from 'store'
import get from 'lodash/get'
import getConfig from 'next/config'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { withCookies } from 'react-cookie'
import { CustomRequest, internalAPICallHandler } from 'lib/api/handler'
import ExpandableRowTable from 'components/Table/expandableTable'
import StyledH1 from 'components/Common/Element/H1'
import { handleDeleteS3, mapDataByCol } from 'lib/helper'
import { productContent } from 'data/product'
import axios from 'axios'
import BasicSnackBar, { SnackBarProps } from 'components/snackbar'
import { Prisma } from '@prisma/client'
import { AlertColor } from '@mui/material'
import { deserialize } from 'superjson'
import { deserializeListInit } from 'lib/superjson'
const ProductList = (props) => {
    const { cookies, profile, data, columnMap, collection } = props
    const token = cookies.get("accessToken")
    const role = cookies.get("userRole")

    const {
        state: {
            site: { lang, pageName },
            user: { userProfile }
        },
        dispatch,
    } = useStore()

    const [snackBarProps, setSnackbarProps] = useState<SnackBarProps>({
        open: false,
        handleClose: () => {
        },
        message: "",
        severity: 'success'
    })
    const productString = get(productContent, lang)
    const router = useRouter()

    const handleSetHandleBarProps = useCallback((open: boolean, handleClose: () => void, message: String, severity: AlertColor) => {
        setSnackbarProps({
            open: open,
            handleClose: handleClose,
            message: message,
            severity: severity
        })
    }, [])

    const handleDelete = useCallback(
        async (oldData) => {
            const id = oldData[0]
            let select: Prisma.MasterProductSelect = {
                attachment: true
            }
            await axios.delete(`/api/prisma/masterProduct/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                data: {
                    select
                }
            }).then(async (data) => {
                console.log("success!!")
                await handleDeleteS3(oldData.attachment, token).catch((e) => {
                    throw e
                })
                handleSetHandleBarProps(true, () => { router.reload() }, productString.editProductSnackBar, "success")
            }).catch((e) => {
                handleSetHandleBarProps(true, () => { }, `${e}`, "error")
            })
        }, [])


    return (
        <Block>
            <StyledH1 className={`text-white ${lang == 'en' ? 'font-jost' : 'font-notoSansTC'}`} color="white"
            >
                {pageName}
            </StyledH1>

            <Block boxShadow='0px 10px 30px rgba(0, 0, 0, 0.1)' borderRadius='32px' mb='30px'>
                <ExpandableRowTable
                    dataObjList={mapDataByCol(data, columnMap, role, false)}
                    mobileDataObjList={mapDataByCol(data, columnMap, role, true)}
                    columnsFromParent={columnMap}
                    popupTitle={productString.deleteFromPopupTitle}
                    title={pageName}
                    message={productString.deleteProductPopupMessage}
                    handleDelete={(data) => {
                        handleDelete(data)
                    }}
                    handleClickAdd={() => {
                        router.push(`/${lang}/product-management/create-product`)
                    }}
                />
            </Block>
            <BasicSnackBar {...snackBarProps} />
        </Block>
    )
}

export async function getServerSideProps(ctx: CustomCtx) {
    console.log("productList", global.s3)
    const preProps = await preprocessServerSideProps(ctx)
    if (preProps.redirect)
        return preProps

    const { profile, token, siteConfig, user } = ctx?.props || {}
    const collection = 'masterProduct'
    const columnMap = [
        {
            name: "productID",
            desktopIgnore: true,
            objPath: "productID",
        },
        {
            name: "productDisplayID",
            mobileDisplay: true,
            mobileCollapse: true,
            objPath: "productDisplayID",
        },
        {
            name: "isActive",
            mobileCollapse: true,
            objPath: "isActive",
        },
        {
            name: "suspend",
            mobileCollapse: true,
            objPath: "suspend",
        },
        {
            name: "productName",
            mobileCollapse: true,
            objPath: "productName",
        },
        {
            name: "productNameEn",
            mobileCollapse: false,
            objPath: "productNameEn",
        },
        {
            name: "desc",
            mobileCollapse: false,
            objPath: "desc",
        },
        {
            name: "descEn",
            mobileCollapse: false,
            objPath: "descEn",
        },
        {
            name: "price",
            mobileCollapse: false,
            objPath: "price",
        },
        {
            name: "unitPrice",
            mobileCollapse: false,
            objPath: "unitPrice",
        },
        {
            name: "unit",
            mobileCollapse: false,
            objPath: "unit",
        },
        {
            name: "currency",
            mobileCollapse: false,
            objPath: "currency",
        },
        {
            name: "remark",
            mobileCollapse: false,
            objPath: "remark",
        },
        {
            name: "createdAt",
            mobileCollapse: false,
            objPath: "createdAt",
        },
        {
            name: "updatedAt",
            mobileCollapse: false,
            objPath: "updatedAt",
        },
    ]

    var customRequest: CustomRequest = {
        query: {
            collection,
        },
        method: ctx.req.method,
    }

    const data = await internalAPICallHandler(customRequest).then((data) => {
        return deserializeListInit(data.result)
    }).catch((e) => {
        console.log("error getserversideProps", e)
    })

    console.log("dataxd", data)
    return {
        props: {
            data,
            columnMap,
            headerTheme: 'white',
            headerPosition: 'fixed',
            collection,
        },
    }
}

export default withCookies(ProductList)