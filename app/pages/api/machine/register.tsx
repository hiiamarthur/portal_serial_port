
import { generatePassword, getErrorResponse } from "lib/helper";
import { AuthorisedMiddleware, generateDisplayID, prisma } from "lib/prisma";
import {
    RegisterUserInput,
    RegisterUserSchema,
} from "lib/validations/user.schema";
import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { NextApiRequest, NextApiResponse } from "next";
import { Prisma } from "@prisma/client";
import CustomNextApiResponse from "lib/response";
import { CreateMachineInput, CreateMachineSchema } from "lib/validations/machine.schema";
import { signServerToken } from "lib/jwt";
import formidable from "formidable";
import { addFileToS3 } from "../aws/s3";
import { parse } from "superjson";

type ResponseData = {
    body: any
}

export const config = {
    api: {
        bodyParser: false
    },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // res.status(200).json({ body: 'John Doe' })
    console.log("register machine service");
    try {

        var form = formidable({});
        let fields: formidable.Fields<string>
        let formidableFiles: formidable.Files<string>


        [fields, formidableFiles] = await form.parse(req);
        await AuthorisedMiddleware(req)
        const stringObj: any = fields
        const { files } = formidableFiles

        const { data2, select2 } = stringObj
        let body: any = {}
        for (const key in stringObj) {
            body[key] = parse(stringObj[key])
        }
        const { data, select }: { data: Prisma.MachineCreateInput, select: Prisma.MachineSelect } = body
        // const data: Prisma.MachineCreateInput = parse()
        console.log("register machine service", files, data, select);
        // const body = (await data) as CreateMachineInput;
        // const inputData = CreateMachineSchema.parse(body);

        // const password = generatePassword(2);

        // const hashedPassword = await hash(data.password, 12);

        // let userCreatenput: Prisma.UserCreateInput = {
        //     name
        // }
        // let input2: Prisma.UserRoleCreateOrConnectWithoutUsersInput = {
        //     connectOrCreate: {

        //     }
        // }
        const machine = await prisma.machine.create({
            data: data,
            select: select,
        })

        let count = 0
        for (const file of files) {
            let field = {
                id: machine.attachments[count].attachmentDisplayID,
                type: machine.attachments[count].type,
                collection: machine.attachments[count].tableName,
            }
            await addFileToS3(file, field)
            count += 1
        }



        const serverToken = await signServerToken({
            sub: machine.machineID,
            machineDisplayID: machine.machineDisplayID,
        }, {
            exp: '1y'
        })
        console.log("serverToken is", serverToken)
        await prisma.machine.update({
            where: {
                machineID: machine.machineID
            },
            ...(select && { select: select }),
            data: {
                serverToken
            }
        })

        CustomNextApiResponse(res, { machine, }, 200)
        // CustomNextApiResponse(res, { test: "ok" }, 200)
        // res.status(200).json(
        //     {
        //         status: "success",
        //         data: { user: { ...user, password: undefined } },
        //     }

        // );

        res.end();
    } catch (error: any) {
        let statusCode = 400
        if (error instanceof ZodError) {
            // return getErrorResponse(400, "failed validations", error);
        }

        if (error.code === "P2002") {
            // return getErrorResponse(409, "user with that name already exists");
        }
        if (error && error.statusCode) {
            statusCode = error.statusCode
        }
        console.log("error:", error);
        CustomNextApiResponse(res, error, statusCode)
        // res.status(400).json(error);

    }
}



