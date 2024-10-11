const SERVER_URL = "http://127.0.0.1:8787/";

async function save_data(
    user_data,
    plugin_data
) {
    await fetch(SERVER_URL + "data/collect", {
        method: "POST",
        body: JSON.stringify({
            instance_ulid: "abcdefghi",
            consented: true,
            form_data: user_data,
            plugin_data: plugin_data
        })
    })
}