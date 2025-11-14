/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export enum OrganizationStatus {
  OrgStatusFree = "free",
  OrgStatusTrial = "trial",
  OrgStatusTrialExpired = "trial_expired",
  OrgStatusSubscribed = "subscribed",
  OrgStatusSubscriptionExpired = "subscription_expired",
}

export interface AddGroupMembersRequest {
  userIds: string[];
}

export interface CreateGroupRequest {
  description?: string;
  name: string;
}

export interface CreateOrganizationRequest {
  expiryDate?: string;
  name: string;
  ownerEmail: string;
  ownerFirstName: string;
  ownerLastName: string;
  status: OrganizationStatus;
}

export interface CreateUserRequest {
  email: string;
  firstName?: string;
  groupIds?: string[];
  lastName?: string;
}

export interface Group {
  createdAt: string;
  createdBy: string;
  description: string;
  id: string;
  name: string;
  system: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface HTTPError {
  /** @example 400 */
  code?: number;
  /** @example "detailed error message" */
  error?: string;
  /** @example "status bad request" */
  status?: string;
}

export interface Organization {
  createdAt?: string;
  createdBy?: string;
  expiryDate?: string;
  id?: string;
  name?: string;
  owner?: string;
  status?: OrganizationStatus;
  updatedAt?: string;
  updatedBy?: string;
}

export interface RemoveGroupMembersRequest {
  userIds: string[];
}

export interface UpdateGroupRequest {
  description?: string;
  name?: string;
}

export interface UpdateOrganizationRequest {
  expiryDate?: string;
  name?: string;
  owner?: string;
  status?: OrganizationStatus;
}

export interface UpdateUserRequest {
  disabled?: boolean;
  groupIds?: string[];
}

export interface User {
  avatarUrl?: string;
  createdAt?: string;
  createdBy?: string;
  disabled?: boolean;
  email?: string;
  firstName?: string;
  id?: string;
  lastName?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "/api/v1";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const responseToParse = responseFormat ? response.clone() : response;
      const data = !responseFormat
        ? r
        : await responseToParse[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title Colabri API
 * @version 1.0
 * @termsOfService http://swagger.io/terms/
 * @baseUrl /api/v1
 * @contact Karsten Daemen <support@colabri.cloud> (http://colabri.cloud/support)
 *
 * This is the Colabri API.
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  organizations = {
    /**
     * @description This endpoint will retrieve a list of organizations. Only cloud admins are allowed to list organizations.
     *
     * @tags organizations
     * @name GetOrganizations
     * @summary List organizations
     * @request GET:/organizations
     */
    getOrganizations: (
      query?: {
        /**
         * Number of organizations to return
         * @default 10
         */
        limit?: number;
        /**
         * Number of organizations to skip
         * @default 0
         */
        offset?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<Organization, HTTPError>({
        path: `/organizations`,
        method: "GET",
        query: query,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description This endpoint will create a new organization on the platform. Only cloud admins are allowed to create organizations.
     *
     * @tags organizations
     * @name PostOrganization
     * @summary Create a new organization
     * @request POST:/organizations
     */
    postOrganization: (
      organization: CreateOrganizationRequest,
      params: RequestParams = {},
    ) =>
      this.request<Organization, HTTPError>({
        path: `/organizations`,
        method: "POST",
        body: organization,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description This endpoint will retrieve an organization by its ID. Only users who are members of the organization can retrieve organizations.
     *
     * @tags organizations
     * @name GetOrganization
     * @summary Get an organization by ID
     * @request GET:/organizations/{orgId}
     */
    getOrganization: (orgId: string, params: RequestParams = {}) =>
      this.request<Organization, HTTPError>({
        path: `/organizations/${orgId}`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description This endpoint will mark an existing organization as deleted on the platform. Only cloud admins are allowed to delete organizations.
     *
     * @tags organizations
     * @name DeleteOrganization
     * @summary Mark an existing organization as deleted
     * @request DELETE:/organizations/{orgId}
     */
    deleteOrganization: (
      orgId: string,
      organization: UpdateOrganizationRequest,
      params: RequestParams = {},
    ) =>
      this.request<Organization, HTTPError>({
        path: `/organizations/${orgId}`,
        method: "DELETE",
        body: organization,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description This endpoint will update an existing organization on the platform. Only cloud admins are allowed to update organizations.
     *
     * @tags organizations
     * @name PatchOrganization
     * @summary Update an existing organization
     * @request PATCH:/organizations/{orgId}
     */
    patchOrganization: (
      orgId: string,
      organization: UpdateOrganizationRequest,
      params: RequestParams = {},
    ) =>
      this.request<Organization, HTTPError>({
        path: `/organizations/${orgId}`,
        method: "PATCH",
        body: organization,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  orgId = {
    /**
     * @description This endpoint will retrieve all groups in the specified organization. Only users who are members of the organization can list groups. The following fields are supported for filtering or sorting: name, description, system, createdAt, updatedAt.
     *
     * @tags groups
     * @name GetGroups
     * @summary List all groups in an organization
     * @request GET:/{orgId}/groups
     */
    getGroups: (
      orgId: string,
      query?: {
        /**
         * Number of groups to return
         * @default 10
         */
        limit?: number;
        /**
         * Number of groups to skip
         * @default 0
         */
        offset?: number;
        /** Sort groups by fields: e.g. [{'direction':'asc','field':'name'}] */
        sort?: string;
        /** Filter groups by fields: e.g. {'items':[{'id':'1','field':'name', 'operator':'contains','value':'Admin'}], 'logicOperator':'and'} */
        filter?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<Group[], HTTPError>({
        path: `/${orgId}/groups`,
        method: "GET",
        query: query,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description This endpoint will create a new group in the specified organization. Only organization admins can create groups.
     *
     * @tags groups
     * @name PostGroup
     * @summary Create a new group
     * @request POST:/{orgId}/groups
     */
    postGroup: (
      orgId: string,
      group: CreateGroupRequest,
      params: RequestParams = {},
    ) =>
      this.request<Group, HTTPError>({
        path: `/${orgId}/groups`,
        method: "POST",
        body: group,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description This endpoint will retrieve a group by its name. Only users who are members of the organization can retrieve groups.
     *
     * @tags groups
     * @name GetGroupsByName
     * @summary Get a group by name
     * @request GET:/{orgId}/groups/by-name
     */
    getGroupsByName: (
      orgId: string,
      query: {
        /** Group Name */
        name: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<Group, HTTPError>({
        path: `/${orgId}/groups/by-name`,
        method: "GET",
        query: query,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description This endpoint will retrieve a group by its ID. Only users who are members of the organization can retrieve groups.
     *
     * @tags groups
     * @name GetGroup
     * @summary Get a group by ID
     * @request GET:/{orgId}/groups/{groupId}
     */
    getGroup: (orgId: string, groupId: string, params: RequestParams = {}) =>
      this.request<Group, HTTPError>({
        path: `/${orgId}/groups/${groupId}`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description This endpoint will delete a group by its ID. Only organization admins can delete groups.
     *
     * @tags groups
     * @name DeleteGroup
     * @summary Delete a group by ID
     * @request DELETE:/{orgId}/groups/{groupId}
     */
    deleteGroup: (orgId: string, groupId: string, params: RequestParams = {}) =>
      this.request<void, HTTPError>({
        path: `/${orgId}/groups/${groupId}`,
        method: "DELETE",
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description This endpoint will update the specified group. Only organization admins can update groups.
     *
     * @tags groups
     * @name PatchGroup
     * @summary Update a group
     * @request PATCH:/{orgId}/groups/{groupId}
     */
    patchGroup: (
      orgId: string,
      groupId: string,
      group: UpdateGroupRequest,
      params: RequestParams = {},
    ) =>
      this.request<Group, HTTPError>({
        path: `/${orgId}/groups/${groupId}`,
        method: "PATCH",
        body: group,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description This endpoint will retrieve all members of the specified group. Only users who are members of the organization can list group members. The following fields are supported for filtering or sorting: firstName, lastName, email.
     *
     * @tags groups
     * @name GetGroupsMembers
     * @summary List all members of a group
     * @request GET:/{orgId}/groups/{groupId}/members
     */
    getGroupsMembers: (
      orgId: string,
      groupId: string,
      query?: {
        /**
         * Number of members to return
         * @default 10
         */
        limit?: number;
        /**
         * Number of members to skip
         * @default 0
         */
        offset?: number;
        /** Sort members by fields: e.g. [{'direction':'asc','field':'firstName'}] */
        sort?: string;
        /** Filter members by fields: e.g. {'items':[{'id':'1','field':'firstName', 'operator':'contains','value':'John'}], 'logicOperator':'and'} */
        filter?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<User[], HTTPError>({
        path: `/${orgId}/groups/${groupId}/members`,
        method: "GET",
        query: query,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description This endpoint will add members to the specified group. Only organization admins can add group members.
     *
     * @tags groups
     * @name PostGroupsMember
     * @summary Add members to a group
     * @request POST:/{orgId}/groups/{groupId}/members
     */
    postGroupsMember: (
      orgId: string,
      groupId: string,
      members: AddGroupMembersRequest,
      params: RequestParams = {},
    ) =>
      this.request<void, HTTPError>({
        path: `/${orgId}/groups/${groupId}/members`,
        method: "POST",
        body: members,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description This endpoint will remove members from the specified group. Only organization admins can remove group members.
     *
     * @tags groups
     * @name DeleteGroupsMember
     * @summary Remove members from a group
     * @request DELETE:/{orgId}/groups/{groupId}/members
     */
    deleteGroupsMember: (
      orgId: string,
      groupId: string,
      members: RemoveGroupMembersRequest,
      params: RequestParams = {},
    ) =>
      this.request<void, HTTPError>({
        path: `/${orgId}/groups/${groupId}/members`,
        method: "DELETE",
        body: members,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description This endpoint will retrieve all users in the specified organization. Only users who are members of the organization can list users.
     *
     * @tags users
     * @name GetUsers
     * @summary List all users in an organization
     * @request GET:/{orgId}/users
     */
    getUsers: (
      orgId: string,
      query?: {
        /**
         * Number of users to return
         * @default 10
         */
        limit?: number;
        /**
         * Number of users to skip
         * @default 0
         */
        offset?: number;
        /** Sort users by fields: e.g. [{'direction':'asc','field':'lastName'}] */
        sort?: string;
        /** Filter users by fields: e.g. {'items':[{'id':'1','field':'lastName', 'operator':'equals','value':'Smith'}], 'logicOperator':'and'} */
        filter?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<User[], HTTPError>({
        path: `/${orgId}/users`,
        method: "GET",
        query: query,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description This endpoint will create a new user in the specified organization. Only organization admins can create users.
     *
     * @tags users
     * @name PostUser
     * @summary Create a new user
     * @request POST:/{orgId}/users
     */
    postUser: (
      orgId: string,
      user: CreateUserRequest,
      params: RequestParams = {},
    ) =>
      this.request<User, HTTPError>({
        path: `/${orgId}/users`,
        method: "POST",
        body: user,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description This endpoint will retrieve all users in the specified organization matching the given email. Only users who are members of the organization can retrieve users.
     *
     * @tags users
     * @name GetUsersByEmail
     * @summary Get users by email
     * @request GET:/{orgId}/users/by-email
     */
    getUsersByEmail: (
      orgId: string,
      query: {
        /** Email to search for */
        email: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<User[], HTTPError>({
        path: `/${orgId}/users/by-email`,
        method: "GET",
        query: query,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description This endpoint will retrieve a user by its ID. Only users who are members of the organization can retrieve users.
     *
     * @tags users
     * @name GetUser
     * @summary Get a user by ID
     * @request GET:/{orgId}/users/{userId}
     */
    getUser: (orgId: string, userId: string, params: RequestParams = {}) =>
      this.request<User, HTTPError>({
        path: `/${orgId}/users/${userId}`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description This endpoint will delete a user by its ID. Only organization admins can delete users.
     *
     * @tags users
     * @name DeleteUser
     * @summary Delete a user by ID
     * @request DELETE:/{orgId}/users/{userId}
     */
    deleteUser: (orgId: string, userId: string, params: RequestParams = {}) =>
      this.request<void, HTTPError>({
        path: `/${orgId}/users/${userId}`,
        method: "DELETE",
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description This endpoint will update the specified user. Only organization admins can update users.
     *
     * @tags users
     * @name PatchUser
     * @summary Update a user
     * @request PATCH:/{orgId}/users/{userId}
     */
    patchUser: (
      orgId: string,
      userId: string,
      user: UpdateUserRequest,
      params: RequestParams = {},
    ) =>
      this.request<User, HTTPError>({
        path: `/${orgId}/users/${userId}`,
        method: "PATCH",
        body: user,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description This endpoint will retrieve all groups of a specified user. Only organization admins can access this endpoint or the user themself.
     *
     * @tags users
     * @name GetUsersGroups
     * @summary Get groups of a user
     * @request GET:/{orgId}/users/{userId}/groups
     */
    getUsersGroups: (
      orgId: string,
      userId: string,
      params: RequestParams = {},
    ) =>
      this.request<Group[], HTTPError>({
        path: `/${orgId}/users/${userId}/groups`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
