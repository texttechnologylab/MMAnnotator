import { getCookie, setCookie } from "@/lib/helpers"
import { create } from "zustand"

interface UserState {
  userName: string | null
  userUri: string | null
  session: string | null
  setUserName: (userName: string | null) => void
  setSession: (session: string | null) => void
  update: () => void
  clear: () => void
}

export const useUser = create<UserState>((set, _get) => ({
  userName: getCookie("userName") || null,
  session: getCookie("session") || null,
  userUri: getCookie("user") || null,
  setUserName: (userName) => {
    setCookie("userName", userName || "")
    set({ userName: userName })
  },
  setSession: (session) => {
    setCookie("session", session || "")
    set({ session: session })
  },
  update: () => {
    set({
      userName: getCookie("userName") || null,
      session: getCookie("session") || null,
      userUri: getCookie("user") || null
    })
  },
  clear: () => {
    setCookie("userName", "")
    setCookie("session", "")
    localStorage.removeItem("view")
    set({ userName: null, session: null })
  }
}))
