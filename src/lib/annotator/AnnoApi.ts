import { getCookie } from "../helpers"

type CallbackFunction = (data: string) => void

export async function getUsernameFromURIShort(
    uri: string,
    callback: CallbackFunction
) {
    const check = uri + "?session=" + getCookie("session")
    const response = await fetch(check).catch((_err) => callback("unknown"))
    if (response && response.ok) {
        const jsonResponse = await response.json()
        if (typeof jsonResponse.result === "undefined") {
            callback(jsonResponse.name)
        } else {
            callback(jsonResponse.result.description)
        }
    } else {
        callback("unknown")
    }
}

export function getUsernameFromURI(uri: string, callback: CallbackFunction) {
    const check = uri + "?session=" + getCookie("session")
    fetch(check)
        .then((response) => {
            if (response.ok) {
                response.json().then((jsonResponse) => {
                    if (typeof jsonResponse.result === "undefined") {
                        callback(jsonResponse.name)
                    } else {
                        callback(jsonResponse.result.description)
                    }
                })
            } else {
                callback("unknown")
            }
        })
        .catch((_err) => callback("unknown"))
}
