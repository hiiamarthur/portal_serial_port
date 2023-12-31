
import { generatePassword, getErrorResponse } from "lib/helper";
import { generateDisplayID, prisma } from "lib/prisma";
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

type ResponseData = {
    body: any
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // res.status(200).json({ body: 'John Doe' })
    console.log("register service");
    try {
        const { data } = req.body
        const body = (await data) as RegisterUserInput;
        const inputData = RegisterUserSchema.parse(body);

        const password = generatePassword(2);

        const hashedPassword = await hash(inputData.password, 12);

        // let userCreatenput: Prisma.UserCreateInput = {
        //     name
        // }
        // let input2: Prisma.UserRoleCreateOrConnectWithoutUsersInput = {
        //     connectOrCreate: {

        //     }
        // }
        const user = await prisma.user.create({
            data: {
                name: inputData.name,
                nameEn: inputData.nameEn,
                username: inputData.username,
                password: hashedPassword,
                authenticated: false,
                userRole: {
                    connect: {
                        userRoleID: inputData.userRole
                    }
                },
                userType: {
                    connect: {
                        userTypeID: inputData.userType
                    }
                },
                // userDisplayID: await generateDisplayID("user"),
                // photo: data.photo,
            },
        });
        CustomNextApiResponse(res, { user: { ...user, password: undefined } }, 200)
        // res.status(200).json(
        //     {
        //         status: "success",
        //         data: { user: { ...user, password: undefined } },
        //     }

        // );

        res.end();
    } catch (error: any) {
        if (error instanceof ZodError) {
            // return getErrorResponse(400, "failed validations", error);
        }

        if (error.code === "P2002") {
            // return getErrorResponse(409, "user with that name already exists");
        }
        console.log("error:", error);
        CustomNextApiResponse(res, error, 400)
        // res.status(400).json(error);

    }
}



