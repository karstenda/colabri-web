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

export enum StatementGridRowType {
  StatementGridRowTypeLocal = "local",
  StatementGridRowTypeReference = "reference",
}

export enum ResolvedPrplType {
  ResolvedPrplUserType = "user",
  ResolvedPrplGroupType = "group",
  ResolvedPrplSystemType = "system",
  ResolvedPrplUnknownType = "unknown",
}

export enum OrganizationStatus {
  OrgStatusFree = "free",
  OrgStatusTrial = "trial",
  OrgStatusTrialExpired = "trial_expired",
  OrgStatusSubscribed = "subscribed",
  OrgStatusSubscriptionExpired = "subscription_expired",
}

export enum OrganizationSettingsKey {
  OrganizationSettingsKeyShowQuickSetup = "SHOW_QUICK_SETUP",
}

export enum GPCScope {
  GPCScopeSegment = "gpcSegment",
  GPCScopeFamily = "gpcFamily",
  GPCScopeClass = "gpcClass",
  GPCScopeBrick = "gpcBrick",
  GPCScopeAttribute = "gpcAttribute",
  GPCScopeValue = "gpcValue",
}

export enum DocumentType {
  DocumentTypeColabStatement = "colab-statement",
  DocumentTypeColabSheet = "colab-sheet",
}

export enum ContentLanguageDirection {
  ContentLanguageDirectionLTR = "ltr",
  ContentLanguageDirectionRTL = "rtl",
}

export enum ColabSheetBlockType {
  ColabSheetBlockTypeText = "text",
  ColabSheetBlockTypeStatementGrid = "statement-grid",
}

export enum ColabCommentType {
  ColabCommentUserType = "user",
}

export enum ColabCommentState {
  ColabCommentStateOpen = "open",
  ColabCommentStateResolved = "resolved",
}

export enum ColabApprovalType {
  ColabApprovalTypeUser = "user",
  ColabApprovalTypeGroup = "group",
}

export enum ColabApprovalState {
  Approved = "approved",
  Rejected = "rejected",
  Pending = "pending",
  Draft = "draft",
}

export enum AttributeType {
  AttributeTypeString = "string",
  AttributeTypeNumber = "number",
  AttributeTypeBoolean = "boolean",
  AttributeTypeDate = "date",
}

export interface AddGroupMembersRequest {
  userIds: string[];
}

export interface Attribute {
  config: Record<string, any>;
  createdAt: string;
  createdBy: string;
  id: string;
  name: string;
  type: AttributeType;
  updatedAt: string;
  updatedBy: string;
}

export interface AttributeValue {
  attribute: Attribute;
  createdAt: string;
  createdBy: string;
  id: string;
  updatedAt: string;
  updatedBy: string;
  value: AttributeValueStruct;
}

export interface AttributeValueOnly {
  createdAt: string;
  createdBy: string;
  id: string;
  updatedAt: string;
  updatedBy: string;
  value: AttributeValueStruct;
}

export interface AttributeValueStruct {
  display: string;
  value: any;
}

export interface CheckOrganizationNameRequest {
  name: string;
  recaptchaToken: string;
}

export interface CheckOrganizationNameResponse {
  available?: boolean;
}

export interface ColabApproval {
  state: ColabApprovalState;
  type: ColabApprovalType;
}

export interface ColabComment {
  author: string;
  state: ColabCommentState;
  text: TextElement;
  timestamp: string;
  type: ColabCommentType;
}

export interface ColabDocument {
  acls: Record<string, string[]>;
  container?: string;
  containerType?: string;
  createdAt: string;
  createdBy: string;
  id: string;
  json: string;
  name: string;
  owner: string;
  peerMap: Record<string, string>;
  sheet?: ColabSheetModel;
  statement?: ColabStatementModel;
  streams: Record<string, DocumentStream>;
  synced: boolean;
  type: string;
  updatedAt: string;
  updatedBy: string;
  versionV: Record<string, number>;
}

export interface ColabModelProperties {
  contentType: string;
  countryCodes?: string[];
  langCodes?: string[];
  masterLangCode?: string;
  type: DocumentType;
}

export interface ColabSheetBlockDictionary {
  "statement-grid"?: ColabSheetStatementGridBlock;
  text?: ColabSheetTextBlock;
}

export interface ColabSheetModel {
  acls?: Record<string, string[]>;
  approvals: Record<string, ColabApproval>;
  content: any[];
  properties: ColabModelProperties;
}

export interface ColabSheetStatementGridBlock {
  acls: Record<string, string[]>;
  rows: ColabSheetStatementGridRow[];
  title: TextElement;
  type: ColabSheetBlockType;
}

export interface ColabSheetStatementGridRow {
  statement?: ColabStatementModel;
  statementRef?: ColabSheetStatementRef;
  type: StatementGridRowType;
}

export interface ColabSheetStatementRef {
  docId: string;
  version: number;
  versionV: string;
}

export interface ColabSheetTextBlock {
  acls: Record<string, string[]>;
  approvals: Record<string, ColabApproval>;
  textElement: TextElement;
  title: TextElement;
  type: ColabSheetBlockType;
}

export interface ColabStatementElement {
  acls: Record<string, string[]>;
  approvals: Record<string, ColabUserApproval>;
  comments?: ColabComment[];
  textElement: TextElement;
}

export interface ColabStatementModel {
  acls?: Record<string, string[]>;
  content: Record<string, ColabStatementElement>;
  properties: ColabModelProperties;
}

export interface ColabUserApproval {
  date?: string;
  state: ColabApprovalState;
  type: ColabApprovalType;
  user: string;
}

export interface ContentType {
  code?: string;
  description?: string;
  docType?: DocumentType;
  name?: string;
}

export interface CreateAttributeRequest {
  config: Record<string, any>;
  name: string;
  type: AttributeType;
}

export interface CreateAttributeValueRequest {
  attributeId?: string;
  attributeName?: string;
  value: AttributeValueStruct;
}

export interface CreateDocumentRequest {
  acls?: Record<string, string[]>;
  /** @example "OatKind-Choc-Sheet" */
  name: string;
  /** @example "colab-doc" */
  type: DocumentType;
}

export interface CreateGroupRequest {
  description?: string;
  name: string;
}

export interface CreateLibraryRequest {
  name: string;
  type: string;
}

export interface CreateOrganizationRequest {
  expiryDate?: string;
  name: string;
  ownerEmail: string;
  ownerFirstName: string;
  ownerLastName: string;
  status: OrganizationStatus;
}

export interface CreateProductRequest {
  attributeValues?: CreateAttributeValueRequest[];
  name: string;
}

export interface CreateSheetDocRequest {
  /** @example "OatKind-Choc-Sheet" */
  name: string;
  sheet: ColabSheetModel;
}

export interface CreateStatementDocRequest {
  /** @example "OatKind-Choc-Sheet" */
  name: string;
  statement: ColabStatementModel;
}

export interface CreateTrialOrganizationRequest {
  name: string;
  ownerEmail: string;
  ownerFirstName: string;
  ownerLastName: string;
  recaptchaToken: string;
}

export interface CreateUserRequest {
  email: string;
  firstName?: string;
  groupIds?: string[];
  lastName?: string;
}

export interface Document {
  acls: Record<string, string[]>;
  container?: string;
  containerType?: string;
  createdAt: string;
  createdBy: string;
  id: string;
  name: string;
  owner: string;
  peerMap: Record<string, string>;
  sheet?: ColabSheetModel;
  statement?: ColabStatementModel;
  streams: Record<string, DocumentStream>;
  type: string;
  updatedAt: string;
  updatedBy: string;
  versionV: Record<string, number>;
}

export interface DocumentStream {
  content: number[];
  createdAt: string;
  document: string;
  id: string;
  name: string;
  pointer: string;
  size: number;
  version: number;
}

export interface GPCNode {
  code?: string;
  description?: string;
  parentNodes?: GPCNode[];
  scope?: GPCScope;
}

export interface GetColabDocVersionRequest {
  version: number;
  versionV: Record<string, number>;
}

export interface GetStatementVersionResponse {
  binary: string;
  createdAt: string;
  peerMap: Record<string, string>;
  statement: ColabStatementModel;
  version: number;
  versionV: Record<string, number>;
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

export interface Library {
  acls: Record<string, string[]>;
  createdAt: string;
  createdBy: string;
  id: string;
  name: string;
  type: string;
  updatedAt: string;
  updatedBy: string;
}

export interface MoveDocToLibraryRequest {
  docId: string;
}

export interface OrgContentLanguage {
  code: string;
  countryCode: string;
  defaultFont: string[];
  id: string;
  langCode: string;
  name: string;
  spellCheck?: boolean;
  spellCheckLangCode?: string;
  textDirection: ContentLanguageDirection;
}

export interface OrgCountry {
  code?: string;
  continent?: string;
  emoji?: string;
  id?: string;
  languages?: string[];
  name?: string;
}

export interface OrgProduct {
  attributeValues?: Record<string, AttributeValue>;
  createdAt: string;
  createdBy: string;
  id: string;
  name: string;
  updatedAt: string;
  updatedBy: string;
}

export interface Organization {
  createdAt: string;
  createdBy: string;
  expiryDate?: string;
  id: string;
  name: string;
  owner: string;
  status: OrganizationStatus;
  updatedAt: string;
  updatedBy: string;
}

export interface OrganizationSetting {
  created_at?: string;
  created_by?: string;
  id: string;
  key: OrganizationSettingsKey;
  org: string;
  type: string;
  updated_at?: string;
  updated_by?: string;
  value?: string;
}

export interface PlatformContentLanguage {
  code: string;
  countryCode: string;
  defaultFont: string[];
  endonym?: string;
  langCode: string;
  name: string;
  spellCheck: boolean;
  spellCheckLangCode: string;
  textDirection: ContentLanguageDirection;
}

export interface PlatformCountry {
  code?: string;
  continent?: string;
  emoji?: string;
  languages?: string[];
  name?: string;
}

export interface RemoveGroupMembersRequest {
  userIds: string[];
}

export interface ResolvedPrpl {
  group?: Group;
  prpl: string;
  system?: string;
  type: ResolvedPrplType;
  user?: User;
}

export interface SheetDocument {
  acls: Record<string, string[]>;
  container?: string;
  containerType?: string;
  createdAt: string;
  createdBy: string;
  id: string;
  name: string;
  owner: string;
  peerMap: Record<string, string>;
  sheet: ColabSheetModel;
  statement?: ColabStatementModel;
  streams: Record<string, DocumentStream>;
  type: string;
  updatedAt: string;
  updatedBy: string;
  versionV: Record<string, number>;
}

export interface SpellCheckRequest {
  data?: string;
  language: string;
  text?: string;
}

export interface SpellCheckResult {
  language?: SpellLanguage;
  matches?: SpellMatch[];
  software?: SpellSoftware;
}

export interface SpellContext {
  length?: number;
  offset?: number;
  text?: string;
}

export interface SpellDetectedLang {
  code?: string;
  name?: string;
}

export interface SpellLanguage {
  code?: string;
  detectedLanguage?: SpellDetectedLang;
  name?: string;
}

export interface SpellMatch {
  context?: SpellContext;
  length?: number;
  message?: string;
  offset?: number;
  replacements?: SpellReplacement[];
  rule?: SpellRule;
  sentence?: string;
  shortMessage?: string;
}

export interface SpellReplacement {
  value?: string;
}

export interface SpellRule {
  category?: SpellRuleCategory;
  description?: string;
  id?: string;
  issueType?: string;
  subId?: string;
  urls?: SpellRuleURL[];
}

export interface SpellRuleCategory {
  id?: string;
  name?: string;
}

export interface SpellRuleURL {
  value?: string;
}

export interface SpellSoftware {
  apiVersion?: number;
  buildDate?: string;
  name?: string;
  premium?: boolean;
  status?: string;
  version?: string;
}

export interface StatementDocument {
  acls: Record<string, string[]>;
  container?: string;
  containerType?: string;
  createdAt: string;
  createdBy: string;
  id: string;
  name: string;
  owner: string;
  peerMap: Record<string, string>;
  sheet?: ColabSheetModel;
  statement: ColabStatementModel;
  streams: Record<string, DocumentStream>;
  type: string;
  updatedAt: string;
  updatedBy: string;
  versionV: Record<string, number>;
}

export interface SyncColabDocResponse {
  success: boolean;
}

export interface TextElement {
  attributes: Record<string, string>;
  children: TextElementChildrenOrString;
  nodeName: string;
}

export interface TextElementChild {
  attributes: Record<string, string>;
  children: TextElementChildrenOrString;
  nodeName: string;
}

export interface TextElementChildrenOrString {
  asChildren?: TextElementChild[];
  asString?: string[];
}

export interface UpdateAttributeValueRequest {
  value: AttributeValueStruct;
}

export interface UpdateGroupRequest {
  description?: string;
  name?: string;
}

export interface UpdateLibraryRequest {
  acls?: Record<string, string[]>;
  name?: string;
}

export interface UpdateOrganizationRequest {
  expiryDate?: string;
  name?: string;
  owner?: string;
  status?: OrganizationStatus;
}

export interface UpdateOrganizationSettingRequest {
  value?: string;
}

export interface UpdateProductRequest {
  attributeValues?: CreateAttributeValueRequest[];
  name?: string;
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
  countries = {
    /**
     * @description Retrieve a list of all countries supported by the platform
     *
     * @tags countries
     * @name GetCountries
     * @summary List all available countries on the platform
     * @request GET:/countries
     */
    getCountries: (params: RequestParams = {}) =>
      this.request<PlatformCountry[], HTTPError>({
        path: `/countries`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  gpc = {
    /**
     * @description Retrieve the platform GPC tree nodes filtered by codes and query.
     *
     * @tags gpc
     * @name GetGpc
     * @summary List GS1 Global Product Classification (GPC) with optional filters
     * @request GET:/gpc
     */
    getGpc: (
      query: {
        /** GPC Segment Code */
        gpcSegmentCode?: string;
        /** GPC Family Code */
        gpcFamilyCode?: string;
        /** GPC Class Code */
        gpcClassCode?: string;
        /** GPC Brick Code */
        gpcBrickCode?: string;
        /** GPC Attribute Code */
        gpcAttributeCode?: string;
        /** GPC Attribute Value Code */
        gpcValueCode?: string;
        /** Query Scope (gpcSegment, gpcFamily, gpcClass, gpcBrick, gpcAttribute, gpcValue) */
        queryScope:
          | "gpcSegment"
          | "gpcFamily"
          | "gpcClass"
          | "gpcBrick"
          | "gpcAttribute"
          | "gpcValue";
        /** Query Value (Description substring) */
        queryValue?: string;
        /** Max number of results (max 50, default 50) */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<GPCNode[], HTTPError>({
        path: `/gpc`,
        method: "GET",
        query: query,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  languages = {
    /**
     * @description Retrieve a list of all languages supported by the platform
     *
     * @tags languages
     * @name GetLanguages
     * @summary List all available languages on the platform
     * @request GET:/languages
     */
    getLanguages: (params: RequestParams = {}) =>
      this.request<PlatformContentLanguage[], HTTPError>({
        path: `/languages`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
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
  prpls = {
    /**
     * @description This endpoint will check the given principal strings and resolve them into their user, group, etc. objects. This endpoint only gets data but requires a POST request to potentially handle a very large list of principals.
     *
     * @tags principals
     * @name PostPrplsResolve
     * @summary Resolves the passed principals
     * @request POST:/prpls/resolve
     */
    postPrplsResolve: (prpls: string[], params: RequestParams = {}) =>
      this.request<Record<string, ResolvedPrpl>, HTTPError>({
        path: `/prpls/resolve`,
        method: "POST",
        body: prpls,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  sheets = {
    /**
     * @description This endpoint will list all blocks that are supported in ColabSheets.
     *
     * @tags sheets
     * @name GetSheetsBlockdict
     * @summary Get all supported blocks in ColabSheets
     * @request GET:/sheets/blockdict
     */
    getSheetsBlockdict: (params: RequestParams = {}) =>
      this.request<ColabSheetBlockDictionary, HTTPError>({
        path: `/sheets/blockdict`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  trials = {
    /**
     * @description This endpoint will create a new organization on the platform. Only cloud admins are allowed to create organizations.
     *
     * @tags trials
     * @name PostTrial
     * @summary Create a new trial organization
     * @request POST:/trials
     */
    postTrial: (
      organization: CreateTrialOrganizationRequest,
      params: RequestParams = {},
    ) =>
      this.request<Organization, HTTPError>({
        path: `/trials`,
        method: "POST",
        body: organization,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Verifies that an organization name has not been taken yet. Requires passing a valid reCAPTCHA token.
     *
     * @tags trials
     * @name PostTrialsCheckName
     * @summary Check whether an organization name is available
     * @request POST:/trials/check-name
     */
    postTrialsCheckName: (
      request: CheckOrganizationNameRequest,
      params: RequestParams = {},
    ) =>
      this.request<CheckOrganizationNameResponse, HTTPError>({
        path: `/trials/check-name`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  orgId = {
    /**
     * @description List all attributes in the specified organization
     *
     * @tags attributes
     * @name GetAttributes
     * @summary List all attributes
     * @request GET:/{orgId}/attributes
     */
    getAttributes: (orgId: string, params: RequestParams = {}) =>
      this.request<Attribute[], HTTPError>({
        path: `/${orgId}/attributes`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Create a new attribute in the specified organization
     *
     * @tags attributes
     * @name PostAttribute
     * @summary Create a new attribute
     * @request POST:/{orgId}/attributes
     */
    postAttribute: (
      orgId: string,
      attribute: CreateAttributeRequest,
      params: RequestParams = {},
    ) =>
      this.request<Attribute, HTTPError>({
        path: `/${orgId}/attributes`,
        method: "POST",
        body: attribute,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete an attribute (soft delete) in the specified organization
     *
     * @tags attributes
     * @name DeleteAttribute
     * @summary Delete an attribute
     * @request DELETE:/{orgId}/attributes/{attributeId}
     */
    deleteAttribute: (
      orgId: string,
      attributeId: string,
      params: RequestParams = {},
    ) =>
      this.request<Attribute, HTTPError>({
        path: `/${orgId}/attributes/${attributeId}`,
        method: "DELETE",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Update an existing attribute in the specified organization
     *
     * @tags attributes
     * @name PatchAttribute
     * @summary Update an attribute
     * @request PATCH:/{orgId}/attributes/{attributeId}
     */
    patchAttribute: (
      orgId: string,
      attributeId: string,
      attribute: CreateAttributeRequest,
      params: RequestParams = {},
    ) =>
      this.request<Attribute, HTTPError>({
        path: `/${orgId}/attributes/${attributeId}`,
        method: "PATCH",
        body: attribute,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieves a list of all content types available in the organization.
     *
     * @tags templates
     * @name GetContentTypes
     * @summary List all content types
     * @request GET:/{orgId}/content-types
     */
    getContentTypes: (orgId: string, params: RequestParams = {}) =>
      this.request<ContentType[], HTTPError>({
        path: `/${orgId}/content-types`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieve a list of all countries configured for a specific organization
     *
     * @tags countries
     * @name GetCountries
     * @summary List countries for an organization
     * @request GET:/{orgId}/countries
     */
    getCountries: (orgId: string, params: RequestParams = {}) =>
      this.request<OrgCountry[], HTTPError>({
        path: `/${orgId}/countries`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Add new countries to be used within a specific organization
     *
     * @tags countries
     * @name PostCountrie
     * @summary Add countries for an organization
     * @request POST:/{orgId}/countries
     */
    postCountrie: (
      orgId: string,
      countryCodes: string[],
      params: RequestParams = {},
    ) =>
      this.request<OrgCountry[], HTTPError>({
        path: `/${orgId}/countries`,
        method: "POST",
        body: countryCodes,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Remove countries from a specific organization by country ID
     *
     * @tags countries
     * @name DeleteCountrie
     * @summary Delete countries for an organization
     * @request DELETE:/{orgId}/countries
     */
    deleteCountrie: (
      orgId: string,
      countryIds: string[],
      params: RequestParams = {},
    ) =>
      this.request<OrgCountry[], HTTPError>({
        path: `/${orgId}/countries`,
        method: "DELETE",
        body: countryIds,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Create a new document in the specified organization
     *
     * @tags documents
     * @name PostDocument
     * @summary Create a new document
     * @request POST:/{orgId}/documents
     */
    postDocument: (
      orgId: string,
      document: CreateDocumentRequest,
      params: RequestParams = {},
    ) =>
      this.request<Document, HTTPError>({
        path: `/${orgId}/documents`,
        method: "POST",
        body: document,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieve a document by its ID in the specified organization
     *
     * @tags documents
     * @name GetDocument
     * @summary Get document by ID
     * @request GET:/{orgId}/documents/{docId}
     */
    getDocument: (orgId: string, docId: string, params: RequestParams = {}) =>
      this.request<Document, HTTPError>({
        path: `/${orgId}/documents/${docId}`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Soft delete a document within the specified organization
     *
     * @tags documents
     * @name DeleteDocument
     * @summary Delete a document
     * @request DELETE:/{orgId}/documents/{docId}
     */
    deleteDocument: (
      orgId: string,
      docId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, HTTPError>({
        path: `/${orgId}/documents/${docId}`,
        method: "DELETE",
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description List all attribute values for a specific document in the specified organization
     *
     * @tags attributes
     * @name GetDocumentsAttributes
     * @summary List all attribute values for a document
     * @request GET:/{orgId}/documents/{docId}/attributes
     */
    getDocumentsAttributes: (
      orgId: string,
      docId: string,
      params: RequestParams = {},
    ) =>
      this.request<AttributeValue[], HTTPError>({
        path: `/${orgId}/documents/${docId}/attributes`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Create attribute values for a specific document in the specified organization
     *
     * @tags attributes
     * @name PostDocumentsAttribute
     * @summary Create attribute values for a document
     * @request POST:/{orgId}/documents/{docId}/attributes
     */
    postDocumentsAttribute: (
      orgId: string,
      docId: string,
      attributeValues: CreateAttributeValueRequest[],
      params: RequestParams = {},
    ) =>
      this.request<AttributeValue[], HTTPError>({
        path: `/${orgId}/documents/${docId}/attributes`,
        method: "POST",
        body: attributeValues,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete attribute values (soft delete) for a specific document in the specified organization
     *
     * @tags attributes
     * @name DeleteDocumentsAttribute
     * @summary Delete attribute values for a document
     * @request DELETE:/{orgId}/documents/{docId}/attributes
     */
    deleteDocumentsAttribute: (
      orgId: string,
      docId: string,
      attributeValueIds: string[],
      params: RequestParams = {},
    ) =>
      this.request<AttributeValueOnly[], HTTPError>({
        path: `/${orgId}/documents/${docId}/attributes`,
        method: "DELETE",
        body: attributeValueIds,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Update attribute values for a specific document in the specified organization
     *
     * @tags attributes
     * @name PatchDocumentsAttribute
     * @summary Update attribute values for a document
     * @request PATCH:/{orgId}/documents/{docId}/attributes
     */
    patchDocumentsAttribute: (
      orgId: string,
      docId: string,
      attributeValues: Record<string, UpdateAttributeValueRequest>,
      params: RequestParams = {},
    ) =>
      this.request<AttributeValueOnly[], HTTPError>({
        path: `/${orgId}/documents/${docId}/attributes`,
        method: "PATCH",
        body: attributeValues,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieve a ColabDocument by its ID in the specified organization
     *
     * @tags documents
     * @name GetDocumentsColab
     * @summary Get a Colabdocument by ID
     * @request GET:/{orgId}/documents/{docId}/colab
     */
    getDocumentsColab: (
      orgId: string,
      docId: string,
      params: RequestParams = {},
    ) =>
      this.request<ColabDocument, HTTPError>({
        path: `/${orgId}/documents/${docId}/colab`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description This endpoint will parse a ColabDoc and alters the appropiate database relations.
     *
     * @tags documents
     * @name PostDocumentsSync
     * @summary Synchronizes the state of a ColabDoc with the rest of the DB
     * @request POST:/{orgId}/documents/{docId}/sync
     */
    postDocumentsSync: (
      orgId: string,
      docId: string,
      params: RequestParams = {},
    ) =>
      this.request<SyncColabDocResponse, HTTPError>({
        path: `/${orgId}/documents/${docId}/sync`,
        method: "POST",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

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
     * @description Retrieve a list of all content languages configured for a specific organization
     *
     * @tags languages
     * @name GetLanguages
     * @summary List content languages for an organization
     * @request GET:/{orgId}/languages
     */
    getLanguages: (orgId: string, params: RequestParams = {}) =>
      this.request<OrgContentLanguage[], HTTPError>({
        path: `/${orgId}/languages`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Add new content languages to be used within a specific organization
     *
     * @tags languages
     * @name PostLanguage
     * @summary Add content languages for an organization
     * @request POST:/{orgId}/languages
     */
    postLanguage: (
      orgId: string,
      langCodes: string[],
      params: RequestParams = {},
    ) =>
      this.request<arrray, HTTPError>({
        path: `/${orgId}/languages`,
        method: "POST",
        body: langCodes,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Remove content languages from a specific organization by language ID
     *
     * @tags languages
     * @name DeleteLanguage
     * @summary Delete content languages for an organization
     * @request DELETE:/{orgId}/languages
     */
    deleteLanguage: (
      orgId: string,
      langIds: string[],
      params: RequestParams = {},
    ) =>
      this.request<OrgContentLanguage[], HTTPError>({
        path: `/${orgId}/languages`,
        method: "DELETE",
        body: langIds,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description List all libraries in the specified organization
     *
     * @tags libraries
     * @name GetLibraries
     * @summary List all libraries
     * @request GET:/{orgId}/libraries
     */
    getLibraries: (orgId: string, params: RequestParams = {}) =>
      this.request<Library, any>({
        path: `/${orgId}/libraries`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Create a new library in the specified organization
     *
     * @tags libraries
     * @name PostLibrarie
     * @summary Create a new library
     * @request POST:/{orgId}/libraries
     */
    postLibrarie: (
      orgId: string,
      library: CreateLibraryRequest,
      params: RequestParams = {},
    ) =>
      this.request<Library, any>({
        path: `/${orgId}/libraries`,
        method: "POST",
        body: library,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieve a specific library in the specified organization
     *
     * @tags libraries
     * @name GetLibrarie
     * @summary Get a library
     * @request GET:/{orgId}/libraries/{libraryId}
     */
    getLibrarie: (
      orgId: string,
      libraryId: string,
      params: RequestParams = {},
    ) =>
      this.request<Library, any>({
        path: `/${orgId}/libraries/${libraryId}`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete a library in the specified organization
     *
     * @tags libraries
     * @name DeleteLibrarie
     * @summary Delete a library
     * @request DELETE:/{orgId}/libraries/{libraryId}
     */
    deleteLibrarie: (
      orgId: string,
      libraryId: string,
      params: RequestParams = {},
    ) =>
      this.request<Library, any>({
        path: `/${orgId}/libraries/${libraryId}`,
        method: "DELETE",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Update an existing library in the specified organization
     *
     * @tags libraries
     * @name PatchLibrarie
     * @summary Update a library
     * @request PATCH:/{orgId}/libraries/{libraryId}
     */
    patchLibrarie: (
      orgId: string,
      libraryId: string,
      library: UpdateLibraryRequest,
      params: RequestParams = {},
    ) =>
      this.request<Library, any>({
        path: `/${orgId}/libraries/${libraryId}`,
        method: "PATCH",
        body: library,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Move a document to a specified library within the organization
     *
     * @tags libraries
     * @name PostLibrariesMove
     * @summary Move a document to a library
     * @request POST:/{orgId}/libraries/{libraryId}/move
     */
    postLibrariesMove: (
      orgId: string,
      libraryId: string,
      payload: MoveDocToLibraryRequest,
      params: RequestParams = {},
    ) =>
      this.request<Library[], any>({
        path: `/${orgId}/libraries/${libraryId}/move`,
        method: "POST",
        body: payload,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description List all products in the specified organization
     *
     * @tags products
     * @name GetProducts
     * @summary List products
     * @request GET:/{orgId}/products
     */
    getProducts: (orgId: string, params: RequestParams = {}) =>
      this.request<OrgProduct[], HTTPError>({
        path: `/${orgId}/products`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Create a new product in the specified organization
     *
     * @tags products
     * @name PostProduct
     * @summary Create a new product
     * @request POST:/{orgId}/products
     */
    postProduct: (
      orgId: string,
      product: CreateProductRequest,
      params: RequestParams = {},
    ) =>
      this.request<OrgProduct, HTTPError>({
        path: `/${orgId}/products`,
        method: "POST",
        body: product,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get a product by ID in the specified organization
     *
     * @tags products
     * @name GetProduct
     * @summary Get a product
     * @request GET:/{orgId}/products/{productId}
     */
    getProduct: (
      orgId: string,
      productId: string,
      params: RequestParams = {},
    ) =>
      this.request<OrgProduct, HTTPError>({
        path: `/${orgId}/products/${productId}`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Update a product in the specified organization
     *
     * @tags products
     * @name PutProduct
     * @summary Update a product
     * @request PUT:/{orgId}/products/{productId}
     */
    putProduct: (
      orgId: string,
      productId: string,
      product: UpdateProductRequest,
      params: RequestParams = {},
    ) =>
      this.request<OrgProduct, HTTPError>({
        path: `/${orgId}/products/${productId}`,
        method: "PUT",
        body: product,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete a product in the specified organization
     *
     * @tags products
     * @name DeleteProduct
     * @summary Delete a product
     * @request DELETE:/{orgId}/products/{productId}
     */
    deleteProduct: (
      orgId: string,
      productId: string,
      params: RequestParams = {},
    ) =>
      this.request<OrgProduct, HTTPError>({
        path: `/${orgId}/products/${productId}`,
        method: "DELETE",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get a specific setting by key.
     *
     * @tags organization_settings
     * @name GetSetting
     * @summary Get an organization setting
     * @request GET:/{orgId}/settings/{type}/{key}
     */
    getSetting: (
      orgId: string,
      type: "user-feature" | "app-feature" | "user-setting" | "app-setting",
      key: "SHOW_QUICK_SETUP",
      params: RequestParams = {},
    ) =>
      this.request<OrganizationSetting, HTTPError>({
        path: `/${orgId}/settings/${type}/${key}`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Create or update a setting value. Only organization admins can set settings.
     *
     * @tags organization_settings
     * @name PutSetting
     * @summary Put an organization setting
     * @request PUT:/{orgId}/settings/{type}/{key}
     */
    putSetting: (
      orgId: string,
      type: "user-feature" | "app-feature" | "user-setting" | "app-setting",
      key: "SHOW_QUICK_SETUP",
      setting: UpdateOrganizationSettingRequest,
      params: RequestParams = {},
    ) =>
      this.request<OrganizationSetting, HTTPError>({
        path: `/${orgId}/settings/${type}/${key}`,
        method: "PUT",
        body: setting,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description This endpoint will retrieve all sheets in the specified organization. Only users who are members of the organization can list sheets.
     *
     * @tags sheets
     * @name GetSheets
     * @summary List all sheets in an organization
     * @request GET:/{orgId}/sheets
     */
    getSheets: (
      orgId: string,
      query?: {
        /**
         * Number of sheets to return
         * @default 10
         */
        limit?: number;
        /**
         * Number of sheets to skip
         * @default 0
         */
        offset?: number;
        /** Sort sheets by fields: e.g. [{'direction':'asc','field':'owner'}] */
        sort?: string;
        /** Filter sheets by fields: e.g. {'items':[{'id':'1','field':'name', 'operator':'equals','value':'Sheet X'}], 'logicOperator':'and'} */
        filter?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<SheetDocument[], HTTPError>({
        path: `/${orgId}/sheets`,
        method: "GET",
        query: query,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Create a new sheet for a user
     *
     * @tags sheets
     * @name PostSheet
     * @summary Create a new sheet
     * @request POST:/{orgId}/sheets
     */
    postSheet: (
      orgId: string,
      sheet: CreateSheetDocRequest,
      params: RequestParams = {},
    ) =>
      this.request<SheetDocument, HTTPError>({
        path: `/${orgId}/sheets`,
        method: "POST",
        body: sheet,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description This endpoint will check the provided text for spelling errors. This endpoint only gets data but requires a POST request to potentially handle a very large amount of text.
     *
     * @tags spell
     * @name PostSpellCheck
     * @summary Checks spelling of the provided text
     * @request POST:/{orgId}/spell/check
     */
    postSpellCheck: (
      orgId: string,
      spellcheck: SpellCheckRequest,
      params: RequestParams = {},
    ) =>
      this.request<SpellCheckResult, HTTPError>({
        path: `/${orgId}/spell/check`,
        method: "POST",
        body: spellcheck,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description This endpoint will retrieve all statements in the specified organization. Only users who are members of the organization can list statements.
     *
     * @tags statements
     * @name GetStatements
     * @summary List all statements in an organization
     * @request GET:/{orgId}/statements
     */
    getStatements: (
      orgId: string,
      query?: {
        /**
         * Number of statements to return
         * @default 10
         */
        limit?: number;
        /**
         * Number of statements to skip
         * @default 0
         */
        offset?: number;
        /** Sort statements by fields: e.g. [{'direction':'asc','field':'lastName'}] */
        sort?: string;
        /** Filter statements by fields: e.g. {'items':[{'id':'1','field':'lastName', 'operator':'equals','value':'Smith'}], 'logicOperator':'and'} */
        filter?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<StatementDocument[], HTTPError>({
        path: `/${orgId}/statements`,
        method: "GET",
        query: query,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Create a new statement for a user
     *
     * @tags statements
     * @name PostStatement
     * @summary Create a new statement
     * @request POST:/{orgId}/statements
     */
    postStatement: (
      orgId: string,
      statement: CreateStatementDocRequest,
      params: RequestParams = {},
    ) =>
      this.request<StatementDocument, HTTPError>({
        path: `/${orgId}/statements`,
        method: "POST",
        body: statement,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description This endpoint will retrieve the state of a specific version of a statement as opposed to the latest. Since the version vector can be quite large, this endpoint supports POST instead of GET. It does not modify any state.
     *
     * @tags statements
     * @name PostStatementsVersion
     * @request POST:/{orgId}/statements/{docId}/version
     */
    postStatementsVersion: (
      orgId: string,
      docId: string,
      statement: GetColabDocVersionRequest,
      params: RequestParams = {},
    ) =>
      this.request<GetStatementVersionResponse, HTTPError>({
        path: `/${orgId}/statements/${docId}/version`,
        method: "POST",
        body: statement,
        type: ContentType.Json,
        format: "json",
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
