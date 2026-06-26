import { RESOURCE_MANAGER_URL } from "../constants"
import type { ProjectStatus } from "@/zustand/useProject"

export type Response<T> = {
  success: boolean
  data: T[]
}

export type ResponseProj<T> = {
  success: boolean
  result: T
}

export interface RepositoryData {
  parent: string
  access: number
  depth: number
  id: string
  text: string
  type: string
  leaf: boolean
  iconCls: string
  uri: ResourceTargetUri
  qtip: string
}

export interface DocumentData {
  owner: {
    tooltip: string
    label: string
    uri: string
  }
  thumbnail: string
  downloadable: boolean
  created: string
  description: string
  permission: number
  leaf: boolean
  uri: ResourceTargetUri
  storagetype: string
  filedownload: string
  size: number
  name: string
  modified: string
  mimetype: string
  id: string
}

export type ResourceTargetKind = "project" | "repository" | "document"
export type ResourceTargetUri =
  `${string}/resource/${ResourceTargetKind}/${string}`

export const isResourceTargetUri = (
  value: string
): value is ResourceTargetUri =>
  /\/resource\/(project|repository|document)\//.test(value)

export const getResourceTargetKind = (
  uri: ResourceTargetUri
): ResourceTargetKind => {
  const match = uri.match(/\/resource\/(project|repository|document)\//)
  if (!match) throw new Error("Invalid ResourceTargetUri")
  return match[1] as ResourceTargetKind
}

export const getResourceTargetId = (uri: ResourceTargetUri): string => {
  const match = uri.match(/\/resource\/(project|repository|document)\/(.+)/)
  if (!match) throw new Error("Invalid ResourceTargetUri")
  return match[2]
}

export interface ProjectChildBase {
  access: number
  description: string
  type: string
  modified: string
  id: number
  key: string
  owner: {
    label: string
    uri: string
  }
  languages: string[]
  created: string
}

export interface ProjectRepository extends ProjectChildBase {
  mongoid?: string
  access: number
  name: string
  description: string
  type: "REPOSITORY"
  children: (ProjectRepository | ProjectDocument)[]
  modified: string
  id: number
  uri: ResourceTargetUri
  key: string
  owner: {
    label: string
    uri: string
  }
  languages: string[]
  created: string
}

export interface ProjectDocument extends ProjectChildBase {
  mongoid: string
  mime: string
  collection: string
  type: "DOCUMENT"
  uri: ResourceTargetUri
  download: string
  size: number
  port: number
  name: string
  host: string
  views: any[]
}

export interface ResourceProject {
  access: number
  description: string
  type: "PROJECT" | "REPOSITORY"
  children: (ProjectRepository | ProjectDocument | string)[]
  modified: string
  id: number
  key: string
  owner: {
    label: string
    uri: string
  }
  //preferences: {}
  //parentProject: {}
  languages: string[]
  created: string
  author: string[]
  query_strategie: string[]
  permission: number
  uri: ResourceTargetUri
  depth: number
  //meta: {}
  elements: number
  name: string
  subrepositories: number
  rootProject: boolean
  frontend: string
  parents: any[]
  status: ProjectStatus
}

export const targetsToTargetString = (
  targets: ResourceTargetUri[] | ResourceTargetUri
): string => {
  return JSON.stringify(targets)
}

export const getRepositories = async (
  session: string,
  node: string
): Promise<Response<RepositoryData>> => {
  const response = await fetch(
    `${RESOURCE_MANAGER_URL}/getrepositories?session=${session}&node=${node}`
  )
  return response.json()
}

export const getRepository = async (
  session: string,
  uri: string
): Promise<ResponseProj<ProjectRepository>> => {
  const response = await fetch(
    `${RESOURCE_MANAGER_URL}/repository/${uri}?session=${session}`
  )
  return response.json()
}

export const getDocuments = async (
  session: string,
  node: string,
  limit?: number
): Promise<Response<DocumentData>> => {
  const urlSearchParams = new URLSearchParams()
  urlSearchParams.append("session", session)
  urlSearchParams.append("node", node)
  if (limit) urlSearchParams.append("limit", limit.toString())
  const response = await fetch(
    `${RESOURCE_MANAGER_URL}/getdocuments?${urlSearchParams}`
  )
  return response.json()
}

export const getProjects = async (
  session: string,
  depth: number = 1
): Promise<ResponseProj<ResourceProject[]>> => {
  const response = await fetch(
    `${RESOURCE_MANAGER_URL}/projects?session=${session}&depth=${depth}`
  )
  return response.json()
}

export const getProject = async (
  session: string,
  projectId: string,
  depth: number = 1
): Promise<ResponseProj<ResourceProject>> => {
  const response = await fetch(
    `${RESOURCE_MANAGER_URL}/project/${projectId}?session=${session}&depth=${depth}`
  )
  return response.json()
}

export const deleteProject = async (
  session: string,
  target: ResourceTargetUri,
  parent: ResourceTargetUri
) => {
  const id = getResourceTargetId(target)
  const response = await fetch(
    `${RESOURCE_MANAGER_URL}/project/${id}?session=${session}&target=${target}&parent=${parent}`,
    {
      method: "DELETE"
    }
  )
  return response.json()
}

export const deleteItem = async (
  session: string,
  target: ResourceTargetUri | ResourceTargetUri[],
  parent: ResourceTargetUri
) => {
  const response = await fetch(
    `${RESOURCE_MANAGER_URL}/delete?session=${session}&target=${targetsToTargetString(target)}&parent=${parent}`,
    {
      method: "POST"
    }
  )
  return response.json()
}

export const deleteRepository = async (
  session: string,
  target: ResourceTargetUri,
  parent: ResourceTargetUri
) => {
  const response = await fetch(
    `${RESOURCE_MANAGER_URL}/repository?session=${session}&target=${target}&parent=${parent}`,
    {
      method: "DELETE"
    }
  )
  return response.json()
}
// ${RESOURCE_MANAGER_URL}/project?session=SESSION&name=scoring_test&description=scoring_test&parent=29620&frontend=scoring&key=core_scoring_test
export const createProject = async (
  session: string,
  name: string,
  description: string,
  parent: string,
  frontend: string,
  key: string
) => {
  const response = await fetch(
    `${RESOURCE_MANAGER_URL}/project?session=${session}&name=${name}&description=${description}&parent=${parent}&frontend=${frontend}&key=${key}`,
    {
      method: "POST"
    }
  )
  return response.json()
}

export const createRepository = async (
  session: string,
  name: string,
  parent: ResourceTargetUri
) => {
  const response = await fetch(
    `${RESOURCE_MANAGER_URL}/repository?session=${session}&name=${name}&parent=${parent}`,
    {
      method: "POST"
    }
  )
  return response.json()
}
