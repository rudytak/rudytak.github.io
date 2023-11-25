/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
      "Access-Control-Max-Age": "86400",
    };
    const databaseID = "KV_database";
    const ordersID = "orders";
    const ENDPOINT = "https://hazargulhan543-wix-plugin.rudytak.workers.dev";

    let response_obj = {
      // other request information
      // URL: request.url,

      // default values
      type: "EMTPY", // "EMPTY"
      res: {},
    };

    try {
      const _URL = new URL(request.url);
      let key = _URL.searchParams.get("key");
      let value;
      switch (_URL.pathname) {
        case "/keys":
          response_obj = {
            ...response_obj,
            type: "KEYS_LIST",
            res: await env[databaseID].list(),
          };
          break;

        case "/get":
          value = await env[databaseID].get(key);

          if (value == null) {
            response_obj = {
              ...response_obj,
              type: "EMPTY_PAIR",
              res: {},
            };
          } else {
            response_obj = {
              ...response_obj,
              type: "KEY_VAL_PAIR",
              res: {
                key: key,
                value: value,
              },
            };
          }
          break;

        case "/save":
          let r_key = btoa(
            (Math.random() + 1).toString(36).substring(2) + //random string
            Date.now().toString() // date for uniqueness
          );
          let value_to_save = request.body;

          await env[databaseID].put(r_key, value_to_save);

          response_obj = {
            ...response_obj,
            type: "SAVED_KEY",
            res: {
              key: r_key,
              url: `${ENDPOINT}/get?key=${r_key}`,
            },
          };
          break;

        case "/place_order":
          let order_num = Date.now().toString();
          let order_info = request.body;

          await env[ordersID].put(
            order_num,
            order_info
          )

          response_obj = {
            ...response_obj,
            type: "PLACED_ORDER",
            res: {
              order_number: order_num,
            },
          };
      }
    } catch (error) {
      response_obj = {
        ...response_obj,
        type: "ERROR",
        res: {
          error: error,
        },
      };
    }

    return new Response(JSON.stringify(response_obj), {
      headers: {
        ...corsHeaders,
      },
    });
  },
};
