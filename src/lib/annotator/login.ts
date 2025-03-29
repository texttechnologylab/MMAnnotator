import { toast } from "sonner"
import { getCookie, setCookie } from "../helpers"

export async function loginPublic(
  userName: string,
  password: string
): Promise<string | null> {
  const params = new URLSearchParams()
  params.set("username", userName)
  params.set("password", password)
  const response = await fetch("https://authority.hucompute.org" + "/login", {
    //TODO: await fetch(useANNO().getAuthorityManagerURL() + '/login', {
    method: "POST",
    body: params
  }).catch((err) => console.error(err))
  if (response && response.ok) {
    //SET COOKIES
    const jsonResponse = await response.json()
    if (jsonResponse.success === false) {
      toast.error("Login failed", {
        description:
          "Login failed, please ensure the credentials you've entered are correct and try again. If the issue persists please contact the TTLab team."
      })
      console.error("Login failed")
      return null
    }
    const userName = generateRandomString(10)
    setCookie("user", jsonResponse.result.user)
    setCookie("userName", userName)
    setCookie("session", jsonResponse.result.session)
    localStorage.setItem("view", `user_${userName}`)
    /*Ext.create('TextAnnotator.model.User', {
            user: result.user,
            userName: result.user,
            fullName: result.fullName,
            session: result.session,
            preferences: result.preferences,
        });*/

    return jsonResponse.result.session
  } else {
    toast.error("Login failed", {
      description:
        "Login failed. An issue occured when trying to store the credentials as cookies. Please try again and if the issue persists contact the TTLab team."
    })
    return ""
  }
}
function generateRandomString(length: number) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    result += characters.charAt(randomIndex)
  }
  return result
}
export async function checkLogin(): Promise<boolean> {
  const response = await fetch(
    `https://authority.hucompute.org/checklogin?session=${getCookie("session")}`,
    {
      method: "GET"
    }
  ).catch((err) => console.error(err))
  if (response && response.ok) {
    const jsonResponse = await response.json()
    if (jsonResponse.success === false) {
      console.error(jsonResponse.message)
      return false
    }
    return true
  } else {
    console.error("Something went wrong ...")
    return false
  }
}
