import { withCookies } from 'react-cookie'
import Block from 'components/Common/Element/Block'
// import { getEnvVariable, test } from '/lib/helper'
import { preprocessServerSideProps } from 'lib/serverside-prepro'
import { useStore } from 'store/index'
import get from 'lodash/get'
import { CustomRequest, internalAPICallHandler } from 'lib/api/handler'
import SimpleCard from 'components/Card/simpleCard'
import FormHandler from 'components/Form'
import BasicButton from 'components/Button/BasicButton'
import { Add, FilterList, MoreVert, Search } from '@mui/icons-material'
import { DownloadCloud } from 'react-feather'
import { AlertColor, Box, ButtonGroup, Collapse } from '@mui/material'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { ChangePalletDetailInput, ChangePalletDetailSchema, PalletDetailListInput, PalletDetailListSchema } from 'lib/validations/pallet.schema'
import StyledBody1 from 'components/Common/Element/body1'
import { deserialize, stringify } from 'superjson'
import Image from 'next/image'
import { Prisma, PrismaClient } from '@prisma/client'
import StyledBody2 from 'components/Common/Element/body2'
import general from 'data/general'
import { machineContent } from 'data/machine'
import { palletContent } from 'data/pallet'
import { deserializeListInit } from 'lib/superjson'
import { ZodError } from 'zod'
import ListFormHandler from 'components/Form/list'
// import axios from 'axios'
import { default as axios } from 'lib/axios'
import BasicSnackBar, { SnackBarProps } from 'components/snackbar'
// import { prisma } from '../../../lib/prisma'

function CreateChildFormList(props) {
    return (
        <FormHandler
            {...props}
        // formType="PalletDetailForm"
        // palletDetailData={palletDetailData}
        // machineData={machineData}
        // masterProductData={masterProductData}
        // index={index}
        // palletNo={outstandingPalletNumber}
        // // parentInvoke={parentInvoke}
        // handleChildChange={handleChildChange}
        // childCallbackFetcher={(func) => {
        //     // handleChildCallback(func, index)
        // }}
        // setChildResult={async (promise: Promise<string>) => {
        //     console.log("setChildResult", promise)
        //     const result = await promise
        //     if (result == "error") {
        //         validateResult.push(false)
        //         setValidateResult([...validateResult])
        //     } else {
        //         validateResult.push(true)
        //         setValidateResult([...validateResult])
        //     }
        //     setParentInvoke(false)
        //     // setChildResult(result)
        // }}
        // errorFromParent={errorsFromParent[index]}
        // mode="add"
        />
    )
}


const PalletConfig = (props) => {
    const { cookies, profile, palletDetailListdata, machineData, masterProductData } = props
    const {
        state: {
            site: { lang, systemConstant: { cloudFrontURL, schema } },
            user: { userProfile, accessToken }
        },
        dispatch,
    } = useStore()
    const machineString = get(machineContent, lang)
    const palletString = get(palletContent, lang)
    const router = useRouter()
    const generalString = get(general, lang)

    const [validateResult, setValidateResult] = useState<boolean[]>([])
    const [invokeFunc, setInvokeFunc] = useState<Function>(null)
    const [dataListFunc, setDataListFunc] = useState<Function>(null)
    const [clickSubmit, setClickSubmit] = useState(false)
    const [preserveState, setPreserveState] = useState({})
    const [invokeChild, setInvokeChild] = useState(false)
    const [parentInvoke, setParentInvoke] = useState(false)
    const [errorsFromParent, setErrorsFromParent] = useState([])
    const [submitChildCallbackList, setSubmitChildCallbackList] = useState([])
    const [palletDetailList, setPalletDetailList] = useState<ChangePalletDetailInput[]>(palletDetailListdata ? [...palletDetailListdata] : [])
    const [snackBarProps, setSnackbarProps] = useState<SnackBarProps>({
        open: false,
        handleClose: () => {
        },
        message: "",
        severity: 'success'
    })

    const handleChildChange = (index: number, data, isDelete = false) => {
        console.log("handleChildChange", index, data, palletDetailList, isDelete)
        let tempPalletDetailList = palletDetailList
        if (isDelete) {
            tempPalletDetailList.splice(index, 1)
            handleChildCallback(index, null, true)
        }
        else {
            tempPalletDetailList[index] = data
        }

        setPalletDetailList([...tempPalletDetailList])
    }

    const parentHandleChildChange = (index, data, isDelete, dataList, setDataList, updateList, setUpdateList) => {
        let tempDataList = dataList
        if (isDelete) {
            console.log("delete item", dataList)
            var deleteItem = tempDataList.splice(index, 1)
            // handleChildCallback(index, null, true)
        }
        else {
            tempDataList[index] = {
                ...tempDataList[index],
                ...data
            }
            let outstandingItem = tempDataList[index]
            const findResult = palletDetailListdata.find((parentData) => parentData.palletID == outstandingItem.palletID)
            if (findResult) {
                let assignObj = Object.keys(outstandingItem).reduce((result, key, index) => {
                    if (findResult[key] != outstandingItem[key]) {
                        result[key] = outstandingItem[key]
                    }
                    return result
                }, {})
                if (Object.keys(assignObj).length > 0) {
                    var diffObj = {
                        ...assignObj,
                        palletID: findResult.palletID,
                        palletDetailID: findResult.palletDetailID,
                    }
                    console.log("handleChildChangexd2", index, updateList, findResult)
                    let outstandingID = updateList.findIndex((item) => item.palletID == findResult.palletID)
                    if (outstandingID != -1) {
                        // let editIndex = updateList.findIndex((item) => item.palletID == findResult.palletID)
                        updateList[outstandingID] = diffObj;
                    } else {
                        updateList.push(diffObj)
                    }
                } else {
                    let deleteIndex = updateList.findIndex((item) => item.palletID == findResult.palletID)
                    updateList.splice(deleteIndex, 1)
                }

            }
        }
        console.log("handleChildChangexd", index, updateList)
        if (setDataList)
            setDataList([...tempDataList])
        if (setUpdateList) {
            setUpdateList([...updateList])
        }
    }

    const handleChildCallback = (func, index, isDelete = false) => {
        let tempCallbackList = submitChildCallbackList
        if (isDelete) {
            tempCallbackList.splice(index, 1)
        } else {
            tempCallbackList.push(func)
        }
        setSubmitChildCallbackList([...tempCallbackList])
    }


    let outstandingPalletNumber = 1

    const a = palletDetailListdata ? palletDetailListdata.map((palletDetailData, index) => {
        return <SimpleCard>
            <FormHandler formType="PalletDetailForm" palletDetailData={palletDetailData} machineData={machineData} masterProductData={masterProductData} handleChildChange={handleChildChange} palletNo={machineData.palletNo} index={index} mode="edit" />
        </SimpleCard>
    }) : null

    // const list = palletDetailList.map((palletDetailData, index) => {
    //     outstandingPalletNumber += 1
    //     if (palletDetailListdata.some((oldPalletDetailData) => { return oldPalletDetailData.palletID == outstandingPalletNumber })) {
    //         outstandingPalletNumber += 1
    //     }
    //     return <SimpleCard>
    //         <FormHandler formType="PalletDetailForm" palletDetailData={palletDetailData} machineData={machineData} masterProductData={masterProductData} handleChildChange={handleChildChange} index={index} palletNo={outstandingPalletNumber} parentInvoke={parentInvoke}
    //             childCallbackFetcher={(func) => {
    //                 // handleChildCallback(func, index)
    //             }} setChildResult={async (promise: Promise<string>) => {
    //                 console.log("setChildResult", promise)
    //                 const result = await promise
    //                 if (result == "error") {
    //                     validateResult.push(false)
    //                     setValidateResult([...validateResult])
    //                 } else {
    //                     validateResult.push(true)
    //                     setValidateResult([...validateResult])
    //                 }
    //                 setParentInvoke(false)
    //                 // setChildResult(result)
    //             }}
    //             errorFromParent={errorsFromParent[index]}
    //             mode="add" />
    //     </SimpleCard>
    // })

    // const childFormList = palletDetailList.map((palletDetailData, index) => {
    //     outstandingPalletNumber += 1
    //     if (palletDetailListdata.some((oldPalletDetailData) => { return oldPalletDetailData.palletID == outstandingPalletNumber })) {
    //         outstandingPalletNumber += 1
    //     }
    //     return (
    //         <CreateChildFormList
    //             formType="PalletDetailForm"
    //             palletDetailData={palletDetailData}
    //             machineData={machineData}
    //             masterProductData={masterProductData}
    //             index={index}
    //             palletNo={outstandingPalletNumber}
    //             // parentInvoke={parentInvoke}
    //             handleChildChange={handleChildChange}
    //         />
    //     )
    // })

    const handleSetHandleBarProps = useCallback((open: boolean, handleClose?: () => void, message?: String, severity?: AlertColor) => {
        setSnackbarProps({
            open: open,
            handleClose: handleClose,
            message: message,
            severity: severity
        })
    }, [])

    const handleClickAdd = () => {
        setInvokeChild(true)
        // dataListFunc()
        // let tempPalletDetailList = palletDetailList

        // let tempPalletDetail: ChangePalletDetailInput = {}
        // console.log(tempPalletDetailList)
        // tempPalletDetailList.push(tempPalletDetail)
        // setPalletDetailList([...tempPalletDetailList])
    }



    console.log("pallet config props", props,
        // list,
        a, palletDetailList)

    const machineAttachment = machineData.attachments.map((attachment) => {
        return <Image
            src={`https://${cloudFrontURL}/${schema}/image/machine/${attachment.attachmentDisplayID}/${attachment.name}`}
            // layout="fill"
            width="100%"
            height="100%"
        />
    })

    const handleSubmit = async (detailList: any[], updateDetailList: any[]) => {
        console.log("handleSubmit palletConfig", detailList)
        // const
        const formData = new FormData()
        const updateList = detailList.filter((detailItem) => palletDetailList.map((originDetail) => originDetail.palletID).includes(detailItem.palletID))
        const createList = detailList.filter((detailItem) => !palletDetailList.map((originDetail) => originDetail.palletID).includes(detailItem.palletID))
        let newFilePalletIDs = []
        let changeFilePalletIDs = []
        // createItem
        console.log("handleSubmit palletConfig a", detailList)
        let createData: Prisma.MachinePalletDetailCreateWithoutMachineInput[] = createList.map((createItem: any) => {
            const { file, productID, ...restField } = createItem
            let attachment: File = file
            if (attachment instanceof File) {
                //notes: they need to appedn together
                formData.append("newFiles", attachment)
                newFilePalletIDs.push(createItem.palletID)
            }
            console.log("handleSubmit file", attachment instanceof File)
            let result: Prisma.MachinePalletDetailCreateWithoutMachineInput = {
                status: "created",
                ...(file instanceof File ? {
                    attachment: {
                        create: {
                            type: attachment.type.split('/')[0],
                            name: attachment.name,
                            tableName: "machinePalletDetail",
                            tableUsage: "default",
                        }
                    },
                } : {}),
                ...(productID && {
                    masterProduct: {
                        connect: {
                            productID: productID
                        }
                    }
                }),
                ...restField
            }
            return result
        })
        console.log("handleSubmit palletConfig b", detailList)
        let updateData: Prisma.MachinePalletDetailUpdateWithWhereUniqueWithoutMachineInput[] = updateDetailList.map((updateItem) => {
            const { file, palletDetailID, currentAttachment, ...restField } = updateItem
            if (file instanceof File) {
                formData.append("changeFiles", file)
                changeFilePalletIDs.push(updateItem.palletID)
            }

            let result: Prisma.MachinePalletDetailUpdateWithWhereUniqueWithoutMachineInput = {
                where: {
                    palletDetailID: palletDetailID
                },
                data: {
                    ...(file && {
                        attachment: {
                            update: {
                                type: file.type.split('/')[0],
                                name: file.name,
                                tableName: "machinePalletDetail",
                                tableUsage: "default",
                            }
                        }
                    }),
                    // status: "updated",
                    ...restField
                }
            }
            return result
        })


        // let a: Prisma.MachinePalletDetailCreateManyMachineInput[] = createList.map((createItem) => {

        //     const fileAttachment = attachment as File
        //     let result: Prisma.MachinePalletDetailCreateManyMachineInput = {
        //         status: "created",

        //         ...(fileAttachment ? {
        //             // att
        //         } : {}),
        //         ...createItem
        //     }
        //     return result
        // })
        const update: Prisma.MachineUpdateInput = {
            machinePalletDetail: {
                create: createData,
                // createMany: {
                //     data: []
                // },
                update: updateData
            }
        }

        const queryArg: Prisma.MachineUpdateArgs = {
            where: {
                machineID: machineData.machineID,
            },
            data: update,
            include: {
                machinePalletDetail: {
                    include: {
                        attachment: true
                    }
                }
            }
        }
        
        const removeFileList = palletDetailListdata.filter((item) =>
            updateDetailList.find((updateDetail) => updateDetail.palletID == item.palletID)?.file
        ).map((item, index) => {
            // if () { 
            return {
                id: item.attachment?.attachmentDisplayID,
                type: item.attachment?.type,
                collection: item.attachment?.tableName,
                name: item.attachment?.name,
            }
            // }

        })

        formData.set("changeFilePalletIDs", stringify(changeFilePalletIDs))
        formData.set("newFilePalletIDs", stringify(newFilePalletIDs))
        formData.set("query", stringify(queryArg))
        formData.set("removeFileList", stringify(removeFileList))
        console.log("handleSubmit palletConfig c", detailList)
        console.log("updatexdd input", update, queryArg, removeFileList,)


        let result = await axios.post(`/api/machine/changePalletConfig`, formData, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                // 'Content-Type': 'multipart/form-data',
            },
        }).then(async ({ data }) => {
            // const { result } = data
            // let attachmentRecord = result.attachment
            // if (result.attachment) {
            //     await handleUpdateS3(attachment, attachmentRecord, token)
            // }
            handleSetHandleBarProps(true, () => { router.push(`/${lang}/machine-management`) }, machineString.editmachineSnackBar, "success")
            return result
        }).catch((err) => {
            console.log(err)
            handleSetHandleBarProps(true, () => { handleSetHandleBarProps(false) }, `${err}`, "error")
        })
    }

    const handleDelete = (deleteItem) => { 

    }
    // setValidateResult([])


    useEffect(() => {
        console.log("useEffect,validate submit", validateResult, palletDetailList)
        if (validateResult.length != 0) {
            if (validateResult.length == palletDetailList.length && validateResult.every((result) => result)) {
                setValidateResult([])
                setErrorsFromParent([])
                try {
                    let body = palletDetailList as PalletDetailListInput
                    let data = PalletDetailListSchema.parse(body)

                    // handleSubmit()
                } catch (e) {
                    if (e instanceof ZodError) {
                        console.log("error handleOnSubmit useEffect", palletDetailList, e, e.name, e.message, e.cause, e.issues)
                        const errorsList = e.errors.reduce((result, error, index) => {
                            let obj: any = {}
                            obj[error.path[2]] = error.message
                            result.push(obj)
                            return result
                        }, [])

                        setErrorsFromParent([...errorsList])
                    }
                }
            } else {
                setValidateResult([])
            }
        }

    }, [validateResult])


    return (
        <>
            <SimpleCard title="Machine Detail">
                <Block className="flex">
                    {machineAttachment}
                    <Block>
                        <StyledBody1>
                            {machineString.statusPlaceholder + ":" + machineData.status}
                        </StyledBody1>
                        <StyledBody2>
                            {machineString.palletNoPlaceholder + ":" + machineData.palletNo}
                        </StyledBody2>
                        <StyledBody2>
                            {machineString.machineNamePlaceholder + ":" + machineData.machineName}
                        </StyledBody2>
                    </Block>
                    {/* {`${Object.keys(machineData)}`} */}

                </Block>
            </SimpleCard >
            {/* {a} */}
            {/* <Block className=" border-[2px] border-[red]">
                {list}
           </Block> */}
            <Block className=" border-[2px] border-[green]">
                <ListFormHandler
                    Container={SimpleCard}
                    handleSubmit={handleSubmit}
                    assignInvoke={(func) => {
                        setInvokeFunc(func)
                    }}
                    assignSetDataList={(func) => {
                        setDataListFunc(() => func)
                    }}
                    // parentInvoke={parentInvoke}
                    parentClickSubmit={clickSubmit}
                    preserveState={preserveState}
                    setParentClickSubmit={(value, preserveState) => {
                        setClickSubmit(value)
                        setPreserveState(preserveState)
                    }}
                    listFormType={"PallDetailList"}
                    // setParentInvoke={setParentInvoke}
                    invoke={invokeChild}
                    parentDataList={palletDetailList}
                    handleChildChange={handleChildChange}
                    ChildForm={(props) => {

                        let mode = "edit";

                        console.log("childForm props", props, outstandingPalletNumber)
                        if (palletDetailListdata.some((oldPalletDetailData) => { return oldPalletDetailData.palletID == outstandingPalletNumber })) {
                            outstandingPalletNumber += 1
                        }
                        if (props.index >= palletDetailListdata.length) {
                            mode = "add";
                        }
                        let palletNo = Math.max(outstandingPalletNumber, props.index + 1)
                        return <CreateChildFormList
                            {...props}
                            formType="PalletDetailForm"
                            palletDetailData={palletDetailList[props.index]}
                            machineData={machineData}
                            masterProductData={masterProductData}
                            palletNo={palletNo}
                            mode={mode}
                        // handleChildChange={handleChildChange}
                        />
                    }}
                    parentHandleChildChange={parentHandleChildChange}
                // ChildformList={(props) => {
                //     return palletDetailList.map((palletDetailData, index) => {
                //         outstandingPalletNumber += 1
                //         if (palletDetailListdata.some((oldPalletDetailData) => { return oldPalletDetailData.palletID == outstandingPalletNumber })) {
                //             outstandingPalletNumber += 1
                //         }
                //         return (
                //             <CreateChildFormList
                //                 formType="PalletDetailForm"
                //                 palletDetailData={palletDetailData}
                //                 machineData={machineData}
                //                 masterProductData={masterProductData}
                //                 index={index}
                //                 palletNo={outstandingPalletNumber}
                //                 // parentInvoke={parentInvoke}
                //                 handleChildChange={handleChildChange}
                //                 {...props}
                //             />
                //         )
                //     })
                // }
                // }
                ></ListFormHandler>
            </Block >

            {/* 
            <Block className="flex justify-center">
                <BasicButton className="mt-10 mr-3 w-32" onClick={(e) => {
                    // setClickSubmit(!clickSubmit)
                    // if (invokeFunc) {
                    //     invokeFunc(true)
                    // }
                    // setInvokeChild(true)
                    // setParentInvoke(true)
                    // setInvokeFunc(true)
                    // if (submitChildCallbackList.every((func) => {
                    //     return func(e, () => {
                    //         return true
                    //     }, "editPalletDetail")
                    // }))
                    //     console.log("all okay", palletDetailList)
                }}>{generalString.confirm}</BasicButton>
                <BasicButton className="mt-10 ml-3 w-32" onClick={(e) => {
                    router.back()
                }}>{generalString.back}</BasicButton>
            </Block> */}
            <BasicSnackBar {...snackBarProps} />
        </>
    )
}

export async function getServerSideProps(ctx) {
    console.log("getserversideprops xdd")
    const preProps = await preprocessServerSideProps(ctx)
    if (preProps.redirect)
        return preProps

    const { profile, token, siteConfig, systemConstant } = ctx?.props || {}
    const { lang, id } = ctx.params
    const collection = 'machinePalletDetail'
    const userType = profile?.userType

    var b: Prisma.MachinePalletDetailInclude = {

    }
    var getPalletDetail: CustomRequest = {
        query: {
            collection,
            where: {
                machine: {
                    machineDisplayID: id
                }
            },
            orderBy: {
                palletID: 'asc',
            },
            include: {
                attachment: true
            }
        },
        method: ctx.req.method,
    }

    const palletDetailListdata = await internalAPICallHandler(getPalletDetail).then((data) => {
        return deserializeListInit(data.result)
    }).catch((e) => {
        console.log("error getserversideProps", e)
    })

    var getMachine: CustomRequest = {
        query: {
            collection: 'machine',
            where: {
                machineDisplayID: id
            },
            include: {
                attachments: true
            },

            isUnique: true
        },
        method: "GET"
    }

    const machineData = await internalAPICallHandler(getMachine).then((data) => {
        return deserialize(data.result)
    }).catch((e) => {
        console.log("error getserversideProps", e)
    })

    var getMasterProductList: CustomRequest = {
        query: {
            collection: 'masterProduct',
        },
        method: "GET"
    }

    const masterProductData = await internalAPICallHandler(getMasterProductList).then((data) => {
        // console.log("masterProductData yo", data.result, convertObjListDecimalToNum(data.result))
        return deserializeListInit(data.result)
    }).catch((e) => {
        console.log("error getserversideProps", e)
    })

    // const a = test();
    // const b = await prisma.

    return {
        props: {
            palletDetailListdata,
            masterProductData,
            machineData,
            systemConstant
        },
    }
}

export default withCookies(PalletConfig)