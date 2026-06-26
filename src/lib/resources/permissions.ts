import { chunkArray } from "../helpers"
import { AUTHORITY_MANAGER_URL } from "../constants"
import type { ResourceTargetUri } from "./repository"

export const setAccessPermissions = (
  session: string,
  target: string,
  authority: string,
  level: string,
  recursive: boolean
): Promise<{ success: boolean }> => {
  const urlSearchParams = new URLSearchParams()
  urlSearchParams.append("session", session)
  urlSearchParams.append("target", target)
  urlSearchParams.append("authority", authority)
  urlSearchParams.append("level", level)
  urlSearchParams.append("recursive", String(recursive))

  return fetch(
    `${AUTHORITY_MANAGER_URL}/setaccesspermission?${urlSearchParams.toString()}`,
    {
      method: "POST"
    }
  ).then((response) => response.json())
}

export const setAccessPermissionsForTargets = async (
  session: string,
  targets: ResourceTargetUri[],
  authority: string,
  level: string,
  recursive: boolean,
  chunkSize: number = 50
) => {
  const chunks = chunkArray(targets, chunkSize)
  const promises = []
  for (const chunk of chunks) {
    promises.push(
      setAccessPermissions(
        session,
        `["${chunk.join('","')}"]`,
        authority,
        level,
        recursive
      )
    )
  }
  const res = await Promise.all(promises)
  res.every((entry) => entry.success)
  return { success: true }
}
//${AUTHORITY_MANAGER_URL}/listuserscombo

export interface UserCombo {
  affiliation: string
  name: string
  description: string
  uri: string
  email: string
}
export const getListUsersCombo = (
  session: string,
  page: string,
  start: string,
  limit: string
): Promise<UserCombo[]> => {
  return fetch(
    `${AUTHORITY_MANAGER_URL}/listuserscombo?session=${session}&page=${page}&start=${start}&limit=${limit}`,
    {
      method: "POST"
    }
  ).then((response) => response.json())
}

export interface GroupCombo {
  owner: {
    name: string
    uri: string
  }
  affiliation: string
  name: string
  description: string
  uri: string
}

export const getListGroupsCombo = (
  session: string,
  page: string,
  start: string,
  limit: string
): Promise<GroupCombo[]> => {
  return fetch(
    `${AUTHORITY_MANAGER_URL}/listgroupscombo?session=${session}&page=${page}&start=${start}&limit=${limit}`,
    {
      method: "POST"
    }
  ).then((response) => response.json())
}

export interface AccessPermission {
  level: number
  authority: {
    label: string
    uri: string
  }
  object: string
}

export interface AccessResponse {
  success: boolean
  access: AccessPermission[]
}

export const getListAccessPermissions = (
  session: string,
  target: ResourceTargetUri | string,
  type: "USER" | "GROUP",
  page: string,
  start: string,
  limit: string
): Promise<AccessResponse> => {
  const urlSearchParams = new URLSearchParams()
  urlSearchParams.append("session", session)
  urlSearchParams.append("type", type)
  urlSearchParams.append("target", target)
  urlSearchParams.append("page", page)
  urlSearchParams.append("start", start)
  urlSearchParams.append("limit", limit)
  return fetch(
    `${AUTHORITY_MANAGER_URL}/listaccesspermissions?${urlSearchParams.toString()}`,
    {
      method: "POST"
    }
  ).then((response) => response.json())
}

export const getAccessPermissionsForTargets = async (
  session: string,
  targets: ResourceTargetUri[],
  type: "USER" | "GROUP",
  chunkSize: number = 50
): Promise<AccessPermission[]> => {
  const accessPermissions = []
  for (let i = 0; i < targets.length; i += chunkSize) {
    console.log(targets.length)
    accessPermissions.push(
      getListAccessPermissions(
        session!,
        `["${targets.slice(i, i + chunkSize).join('","')}"]`,
        type,
        "0",
        "0",
        "100"
      )
    )
  }
  const permissions = await Promise.all(accessPermissions)
  return permissions.flatMap((entry) => entry.access)
}
