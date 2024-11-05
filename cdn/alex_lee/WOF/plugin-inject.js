const SERVER_URL = "https://plugframe.rudytak.workers.dev/";

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