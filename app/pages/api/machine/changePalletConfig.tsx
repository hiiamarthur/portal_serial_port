

import { AuthorisedMiddleware, generateDisplayID, prisma } from "lib/prisma";
import { ZodError } from "zod";
import { NextApiRequest, NextApiResponse } from "next";
import { Prisma } from "@prisma/client";
import CustomNextApiResponse from "lib/response";
import { CreateMachineInput, CreateMachineSchema } from "lib/validations/machine.schema";
import { signServerToken } from "lib/jwt";
import formidable from "formidable";
import { addFileToS3, removeFileFromS3 } from "../aws/s3";
import { parse } from "superjson";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { ObjectIdentifier } from "@aws-sdk/client-s3";
import { globalS3Client } from "lib/aws";
import { IOEvent, handleIOEmit } from "lib/socketIO";

export const config = {
    api: {
        bodyParser: false
    },
}

async function POST(req: NextApiRequest, res: NextApiResponse) {
    var form = formidable({});
    let fields: formidable.Fields<string>
    let formidableFiles: formidable.Files<string>


    [fields, formidableFiles] = await form.parse(req);
    const stringObj: any = fields
    const { newFiles, changeFiles } = formidableFiles

    let body: any = {}
    for (const key in stringObj) {
        body[key] = parse(stringObj[key])
    }
    const { query, removeFileList, newFilePalletIDs, changeFilePalletIDs }: { query: Prisma.MachineUpdateArgs, removeFileList: any[], newFilePalletIDs: number[], changeFilePalletIDs: number[] }
        = body
    const { machinePalletDetail, ...restInclude } = query.include
    const { include } = machinePalletDetail as Prisma.Machine$machinePalletDetailArgs<DefaultArgs>
    console.log("changePallet machine service", query.data.machinePalletDetail, include, newFiles, changeFiles, removeFileList);
    const machine = await prisma.machine.update({
        where: query.where,
        include: {
            machinePalletDetail: {
                include: {
                    attachment: true
                }
            },
            ...restInclude
        },
        data: query.data,
    })

    let count = 0
    if (newFiles?.length > 0) {
        for (const file of newFiles) {
            //notes: they need to appedn together so that they called here
            let outstanding = machine.machinePalletDetail.find((detail) => { return detail.palletID == newFilePalletIDs[count] }).attachment
            if (outstanding) {
                let field = {
                    id: outstanding.attachmentDisplayID,
                    type: outstanding.type,
                    collection: outstanding.tableName,
                }
                await addFileToS3(file, field)
            }

            count += 1
        }
    }

    if (changeFiles?.length > 0) {
        for (const file of changeFiles) {
            //notes: they need to appedn together so that they called here
            console.log("changeFile log", machine.machinePalletDetail, changeFilePalletIDs)
            let outstanding = machine.machinePalletDetail.find((detail) => { return detail.palletID == changeFilePalletIDs[count] }).attachment
            if (outstanding) {
                let field = {
                    id: outstanding.attachmentDisplayID,
                    type: outstanding.type,
                    collection: outstanding.tableName,
                }
                await addFileToS3(file, field)
            }

            count += 1
        }
    }

    if (removeFileList.length > 0) {
        const keyList: ObjectIdentifier[] = removeFileList.map((removeFile) => {
            return {
                Key: `${globalS3Client.schema}/${removeFile.type}/${removeFile.collection}/${removeFile.id}/${removeFile.name}`
            }
        })
        await removeFileFromS3(keyList)
        // for (const removeFile in removeFileList) {
        // }
    }

    const updateList = query.data.machinePalletDetail.update as Prisma.MachinePalletDetailUpdateWithWhereUniqueWithoutMachineInput[]

    // handleIOEmit(machine.socketID, "changePalletPrice",
    //     machine.machinePalletDetail.map((item) => {
    //         item.palletID,
    //             item.price
    //     }));
    await IOEvent(machine.socketID, "changePalletPrice",
        machine.machinePalletDetail.map((item) => {
            return {
                palletID: item.palletID,
                price:item.price
            }
        }))

    CustomNextApiResponse(res, { machine }, 200)
}

async function DELETE(req: NextApiRequest, res: NextApiResponse) {
    var form = formidable({});
    let fields: formidable.Fields<string>
    let formidableFiles: formidable.Files<string>
    [fields, formidableFiles] = await form.parse(req);

    const stringObj: any = fields
    const { newFiles, changeFiles } = formidableFiles

    let body: any = {}
    for (const key in stringObj) {
        body[key] = parse(stringObj[key])
    }

    const { deleteIDList }: { deleteIDList: number[] } = body

    const palletDetailDelete = prisma.machinePalletDetail.deleteMany({
        where: {
            attachmentID: {
                in: deleteIDList
            }
        },
    })

    const attachmentDelete = prisma.attachment.deleteMany({
        where: {
            attachmentID: {
                in: deleteIDList
            }
        }
    })

    // await result = await 

    const result = await prisma.$transaction([palletDetailDelete, attachmentDelete])

    CustomNextApiResponse(res, { result }, 200)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log("change pallet config machine service");
    try {
        await AuthorisedMiddleware(req)
        if (!globalS3Client.s3) {
            throw "s3Client have not been inistalized"
        }
        const method = req.method
        switch (method) {
            case "POST":
                await POST(req, res)
                break;
            case "DELETE":
                await DELETE(req, res)
                break;
        }


        // CustomNextApiResponse(res, { test: "ok" }, 400)

        res.end();
    } catch (error: any) {
        let statusCode = 400

        if (error && error.statusCode) {
            statusCode = error.statusCode
        }
        console.log("error:", error);
        CustomNextApiResponse(res, error, statusCode)
    }
}



