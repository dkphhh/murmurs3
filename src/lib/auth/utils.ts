
import { authClient } from "./auth-client.ts";

// import { auth } from "./auth";


export async function clientSignUp(email: string, password: string) {
    const res = await authClient.signUp.email(
        {
            email,
            password,
            name: email.split("@")[0],

        }
    )
    return res;
}

export async function clientSignIn(email: string, password: string) {
    const res = await authClient.signIn.email({

        email,
        password,

    })
    return res;
}




// export async function serverSignUp(email: string, password: string) {

//     const response = await auth.api.signUpEmail({
//         body: {
//             email,
//             password,
//             name: email.split("@")[0],
//         },

//     });


//     return response;

// }



// export async function serverSignIn(email: string, password: string) {

//     const response = await auth.api.signInEmail({
//         body: {
//             email,
//             password
//         },

//     });


//     return response;

// }

// export async function signInOrUp(email: string, password: string) {
//     const [theUser] = await db.select().from(user).where(eq(user.email, email));

//     if (theUser) {
//         return await signIn(email, password)
//     }


//     return await signUp(email, password)



// }