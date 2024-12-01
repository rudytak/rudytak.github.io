const SERVER_URL = "https://plugframe.rudytak.workers.dev/";
// const SERVER_URL = "http://127.0.0.1:8787/";

async function save_data(
    user_data,
    plugin_data
) {
    print(user_data, plugin_data)
    if (user_data == undefined || user_data == {}) {
        return { ok: false }
    }

    return await fetch(SERVER_URL + "data/collect", {
        method: "POST",
        body: JSON.stringify({
            instance_ulid: "WOF_alex_lee",
            consented: false,
            form_data: user_data,
            plugin_data: plugin_data
        })
    })
}

async function send_to_email(email, pdf_name = null, b64_pdf = null) {
    const url = SERVER_URL + "email/send";

    // Use JSON for simple email requests without attachments
    const emailData = {
        to: email,
        subject: `My Wheel of Life from ${(new Date).toDateString()}`,
        text: "",
        bcc: "info.alex.lee.coaching@gmail.com",
        attachments: [{
            filename: pdf_name,
            base64data: b64_pdf
        }]
    };

    return await fetch(url, {
        method: "POST",
        body: JSON.stringify(emailData),
    });
}
