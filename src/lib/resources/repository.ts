import { ProjectStatus } from "@/zustand/useProject"

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
  uri: string
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
  uri: string
  storagetype: string
  filedownload: string
  size: number
  name: string
  modified: string
  mimetype: string
  id: string
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
  uri: string
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
  uri: string
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
  type: "PROJECT"
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
  uri: string
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

export const getRepositories = async (
  session: string,
  node: string
): Promise<Response<RepositoryData>> => {
  const response = await fetch(
    `https://resources.hucompute.org/getrepositories?session=${session}&node=${node}`
  )
  return response.json()
}

export const getRepository = async (
  session: string,
  uri: string
): Promise<ResponseProj<ProjectRepository>> => {
  const response = await fetch(
    `https://resources.hucompute.org/repository/${uri}?session=${session}`
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
    `https://resources.hucompute.org/getdocuments?${urlSearchParams}`
  )
  return response.json()
}

export const getProjects = async (
  session: string
): Promise<ResponseProj<ResourceProject[]>> => {
  const response = await fetch(
    `https://resources.hucompute.org/projects?session=${session}`
  )
  return response.json()
}

export const getProject = async (
  session: string,
  projectId: string
): Promise<ResponseProj<ResourceProject>> => {
  const response = await fetch(
    `https://resources.hucompute.org/project/${projectId}?session=${session}`
  )
  return response.json()
}

export const deleteItem = async (
  session: string,
  target: string,
  parent: string
) => {
  const response = await fetch(
    `https://resources.hucompute.org/delete?session=${session}&target=${target}&parent=${parent}`,
    {
      method: "POST"
    }
  )
  return response.json()
}

export const deleteRepository = async (
  session: string,
  target: string,
  parent: string
) => {
  const response = await fetch(
    `https://resources.hucompute.org/deleterepository?session=${session}&target=${target}&parent=${parent}`,
    {
      method: "POST"
    }
  )
  return response.json()
}
// https://resources.hucompute.org/project?session=SESSION&name=scoring_test&description=scoring_test&parent=29620&frontend=scoring&key=core_scoring_test
export const createProject = async (
  session: string,
  name: string,
  description: string,
  parent: string,
  frontend: string,
  key: string
) => {
  const response = await fetch(
    `https://resources.hucompute.org/project?session=${session}&name=${name}&description=${description}&parent=${parent}&frontend=${frontend}&key=${key}`,
    {
      method: "POST"
    }
  )
  return response.json()
}

export const createRepository = async (
  session: string,
  name: string,
  parent: string
) => {
  const response = await fetch(
    `https://resources.hucompute.org/createrepository?session=${session}&name=${name}&parent=${parent}`,
    {
      method: "POST"
    }
  )
  return response.json()
}
