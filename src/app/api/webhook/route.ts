import { NextRequest, NextResponse } from 'next/server';

const token = process.env.TOKEN;
const mytoken = process.env.MYTOKEN;

class WhatsAppHelper {
    static async sendMsgToUser(phon_no_id: string, from: string, msg_body: string) {
        await fetch(`https://graph.facebook.com/v13.0/${phon_no_id}/messages?access_token=${token}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to: from,
                text: {
                    body: `Hi.. I'm Anil, your message is ${msg_body}`
                }
            })
        });
    }

    // static async saveCustomerData(phon_no_id: string, from: string, msg_body: string) {

    // }
}

/*
This GET function is used to verify the webhook URL. When we create a webhook, Facebook sends a GET request to the webhook URL with some query parameters. We need to verify the webhook URL by checking the query parameters and sending a response with the challenge parameter.
*/
export async function GET(req: NextRequest) {
    const mode = req.nextUrl.searchParams.get("hub.mode");
    const challange = req.nextUrl.searchParams.get("hub.challenge");
    const verify_token = req.nextUrl.searchParams.get("hub.verify_token");

    // console.log(mode, challange, verify_token);

    if (mode && verify_token) {

        if (mode === "subscribe" && verify_token === mytoken) {
            return new NextResponse(challange, { status: 200 });
        }
    }
    return new NextResponse(null, { status: 403 });
}

/* 
This POST function is used to receive messages from the customer. When a customer sends a message, Facebook sends a POST request to the webhook URL with the message data. We need to extract the message data from the request body and send a response with status 200.

We can reply back to customer messages by sending a POST request to the Facebook API with the customer phone number and message data. URL: https://graph.facebook.com/v13.0/${phon_no_id}/messages?access_token=${token}
*/
export async function POST(req: NextRequest) {

    try {
        const body_param = await req.json();

        console.log(JSON.stringify(body_param, null, 2));
        
/*
    example of when message is received from customer body_params: {
    "object": "whatsapp_business_account",
    "entry": [
        {
        "id": "530068663527769",
        "changes": [
            {
            "value": {
                "messaging_product": "whatsapp",
                "metadata": {
                "display_phone_number": "15551862024",
                "phone_number_id": "528195583715572"
                },
                "contacts": [
                {
                    "profile": {
                    "name": "Anil Kumar"
                    },
                    "wa_id": "917018348115"
                }
                ],
                "messages": [
                {
                    "from": "917018348115",
                    "id": "wamid.HBgMOTE3MDE4MzQ4MTE1FQIAEhggQzZDMzVGRTc4MzNGNjkwN0IwNjU5OTdBQzYxQjNCRDEA",
                    "timestamp": "1738428923",
                    "text": {
                    "body": "Hi"
                    },
                    "type": "text"
                }
                ]
            },
            "field": "messages"
            }
        ]
        }
    ]
    }
*/

        if (!body_param || !body_param.object) {
            return new NextResponse("Invalid request body", { status: 400 });
        }

        const entry = body_param.entry?.[0];
        const change = entry?.changes?.[0];
        const value = change?.value;
        const messages = value?.messages?.[0];

        if (messages && value.metadata) {
            const phon_no_id = value.metadata.phone_number_id;
            const from = messages.from;
            const msg_body = messages.text?.body || "";

            // Ensure helper function calls are awaited correctly
            // await WhatsAppHelper.saveCustomerData(phon_no_id, from, msg_body);
            await WhatsAppHelper.sendMsgToUser(phon_no_id, from, msg_body);

            return new NextResponse(null, { status: 200 });
        }
    } catch (error) {
        console.error("Error processing request:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }

    return new NextResponse("Forbidden", { status: 403 });
}