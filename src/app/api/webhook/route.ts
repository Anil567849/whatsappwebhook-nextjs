import { NextRequest, NextResponse } from "next/server";

const token = process.env.TOKEN;
const mytoken = process.env.MYTOKEN;//prasath_token

export async function GET(req: NextRequest) {
    let mode = req.nextUrl.searchParams.get("hub.mode");
    let challange = req.nextUrl.searchParams.get("hub.challenge");
    let token = req.nextUrl.searchParams.get("hub.verify_token");

    if (mode && token) {

        if (mode === "subscribe" && token === mytoken) {
            return NextResponse.json(challange, { status: 200 });
        }
        return NextResponse.json(null, { status: 403 });

    }
}

export async function POST(req: NextRequest) {

    let body_param = await req.json();

    console.log(JSON.stringify(body_param, null, 2));

    if (body_param && body_param.object) {
        if (body_param.entry &&
            body_param.entry[0].changes &&
            body_param.entry[0].changes[0].value.messages &&
            body_param.entry[0].changes[0].value.messages[0]
        ) {
            let phon_no_id = body_param.entry[0].changes[0].value.metadata.phone_number_id;
            let from = body_param.entry[0].changes[0].value.messages[0].from;
            let msg_body = body_param.entry[0].changes[0].value.messages[0].text.body;

            console.log("phone number " + phon_no_id);
            console.log("from " + from);
            console.log("boady param " + msg_body);

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

            return NextResponse.json(null, { status: 200 });
        }
    }
    return NextResponse.json(null, { status: 404 });
}

