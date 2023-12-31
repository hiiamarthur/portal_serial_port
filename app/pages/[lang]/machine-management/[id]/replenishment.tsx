import axios from "axios"
import BasicButton from "components/Button/BasicButton"
import get from 'lodash/get'
import Block from 'components/Common/Element/Block'
import { CustomRequest, internalAPICallHandler } from "lib/api/handler"
import { CustomCtx, preprocessServerSideProps } from "lib/serverside-prepro"
import { useCallback, useEffect, useState } from "react"
import { withCookies } from "react-cookie"
import { useStore } from 'store'
import io, { Socket } from 'socket.io-client'
import { machineContent } from "data/machine"
import Popup from "components/Popup"
import { Prisma } from "@prisma/client"
import { serialize, stringify } from "superjson"
import { SnackBarProps } from "components/snackbar"
import { AlertColor } from "@mui/material"
import { palletContent } from "data/pallet"
import { useRouter } from "next/router"

function ReplenishmentPage(props) {
    const { machineData } = props
    let socket: Socket;
    const {
        state: {
            site: { lang, systemConstant: { cloudFrontURL, schema } },
            user: { accessToken, userProfile }
        },
        dispatch
    } = useStore()
    const machineString = get(machineContent, lang)
    const palletString = get(palletContent, lang)
    const router = useRouter()
    const [replenishmentStage, setReplenishmentStage] = useState(0)
    const [popupData, setPopupData] = useState([])

    const [snackBarProps, setSnackbarProps] = useState<SnackBarProps>({
        open: false,
        handleClose: () => {
        },
        message: "",
        severity: 'success'
    })
    const handleSetHandleBarProps = useCallback((open: boolean, handleClose?: () => void, message?: String, severity?: AlertColor) => {
        setSnackbarProps({
            open: open,
            handleClose: handleClose,
            message: message,
            severity: severity
        })
    }, [])
    useEffect(() => {
        socketHandler();

        const exitingFunction = async () => {
            console.log("leaving Page...");
            if (replenishmentStage == 1) {
                await axios.post(`/api/socketio/${machineData.machineDisplayID}/end-replenishment`, {
                    payload: {
                        foo: "bar"
                    }
                }, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }).catch((e) => {
                    console.log("connection timeout");
                })
            }

        };

        router.events.on("routeChangeStart", exitingFunction);

        return () => {
            console.log("unmounting component...");
            router.events.off("routeChangeStart", exitingFunction);
        };
    }, [])

    const socketHandler = async () => {
        console.log('socketInitializer')
        // await fetch('/api/socketio/init');
        socket = io({
            query: {
                client: "local"
            },
        })

        socket.on("connect", () => {
            console.log("local connected", socket);
            console.log('socketInitializer', socket, socket.connected)

        })



        socket.on("local-replenishment", async response => {
            const { data } = response
            console.log('later2', response);
            setReplenishmentStage(2)
            setPopupData(data)
            dispatch({
                type: 'showPopup',
                payload: {
                    popup: true,
                    popupType: 'confirmEndReplenishment',
                    isGlobal: false,
                },
            })
        })
    }

    const handleStartReplenishment = useCallback(async () => {
        axios.post(`/api/socketio/${machineData.machineDisplayID}/replenishment`, {
            payload: {
                foo: "bar"
            },
            emitOnly: true,
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }).then(() => {
            setReplenishmentStage(1)
            dispatch({
                type: 'showPopup',
                payload: {
                    popup: true,
                    popupType: 'replenishment',
                    isGlobal: false,
                },
            })
        }).catch(err => {
            handleSetHandleBarProps(true, () => { handleSetHandleBarProps(false) }, `${err}`, "error")
        })


    }, [accessToken])

    const handleFinishReplenishment = useCallback((updateData: any[]) => {
        const update: Prisma.MachinePalletDetailUpdateWithWhereUniqueWithoutMachineInput[] =
            updateData.map((item) => {
                const { id, currentInventory, inventory } = item
                return {
                    where: {
                        palletDetailID: id
                    },
                    data: {
                        inventory: (inventory + currentInventory)
                    }
                }
            });



        const replenishmentData: Prisma.ReplenishmentCreateWithoutMachineInput = {
            details: stringify(updateData),
            user: {
                connect: {
                    userID: userProfile.userID
                }
            }
        }

        const machineQuery: Prisma.MachineUpdateArgs = {
            where: {
                machineID: machineData.machineID,
            },

            data: {
                machinePalletDetail: {
                    update: update
                },
                replenishment: {
                    create: replenishmentData
                }
            }
        }

        const data: Prisma.MachineUpdateInput = {
            machinePalletDetail: {
                update: update
            },
            replenishment: {
                create: replenishmentData
            }
        }

        setReplenishmentStage(0)
        console.log("machineQuery", machineQuery)
        axios.put(`/api/prisma/machine/${machineData.machineID}`,
            { data },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }).then(() => {
                handleSetHandleBarProps(true, () => { router.reload() }, palletString.replenishmentSnackBar, "success")
            }).catch(e => {
                handleSetHandleBarProps(true, () => { }, `${e}`, "error")
            })
    }, [accessToken]);


    console.log("Replenishment props", props, accessToken)
    return (
        <Block>
            <BasicButton
                onClick={() => {
                    dispatch({
                        type: 'showPopup',
                        payload: {
                            popup: true,
                            popupType: 'confirmStartReplenishment',
                            isGlobal: false,
                        },
                    })
                }}>Start Replenishment</BasicButton>

            <BasicButton
                onClick={() => {
                    axios.post(`/api/socketio/test`, {
                        payload: {
                            foo: "bar"
                        }
                    }, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    })
                }}>show Replenishment history</BasicButton>
            <Popup type="local" propsToPopup={{
                proceedFunc: (data) => {
                    switch (replenishmentStage) {
                        case 0:
                            handleStartReplenishment()
                            break;
                        case 1:
                            // handle
                            break;
                        case 2:
                            handleFinishReplenishment(data)
                            break;
                    }

                }, title: machineString.machineFormPopupTitle, message: machineString.machineFormPopupMessage, popupData: popupData
            }} />
        </Block>
    )
}

export async function getServerSideProps(ctx) {
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
            include: {
                replenishment: true,
            },
            isUnique: true
        },
        method: ctx.req.method,
    }


    const machineData = await internalAPICallHandler(getMachine).then((data) => {
        console.log("result xdd", data.result)
        return data.result.json
    }).catch((e) => {
        console.log("error getserversideProps", e)
    })

    console.log("ctx result", machineData, getMachine)



    return {
        props: {
            machineData,
            collection,
            user,
            systemConstant
        },
    }
}

export default withCookies(ReplenishmentPage)