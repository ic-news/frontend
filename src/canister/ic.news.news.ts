import type { ActorMethod } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";

export interface AddCategoryArgs {
  args: Array<Category>;
}
export interface AddFullNewsArgs {
  args: Array<FullNewsArg>;
}
export interface AddTagArgs {
  args: Array<Tag>;
}
export interface AppMessage {
  result: WebSocketValue;
  topic: string;
  args: Array<string>;
  timestamp: bigint;
}
export interface ArchivedFullNews {
  callback: [Principal, string];
  start: bigint;
  length: bigint;
}
export interface CanisterOutputCertifiedMessages {
  messages: Array<CanisterOutputMessage>;
  cert: Uint8Array | number[];
  tree: Uint8Array | number[];
  is_end_of_queue: boolean;
}
export interface CanisterOutputMessage {
  key: string;
  content: Uint8Array | number[];
  client_key: ClientKey;
}
export interface CanisterWsCloseArguments {
  client_key: ClientKey;
}
export type CanisterWsCloseResult = { Ok: null } | { Err: string };
export interface CanisterWsGetMessagesArguments {
  nonce: bigint;
}
export type CanisterWsGetMessagesResult =
  | {
      Ok: CanisterOutputCertifiedMessages;
    }
  | { Err: string };
export interface CanisterWsMessageArguments {
  msg: WebsocketMessage;
}
export type CanisterWsMessageResult = { Ok: null } | { Err: string };
export interface CanisterWsOpenArguments {
  gateway_principal: GatewayPrincipal;
  client_nonce: bigint;
}
export type CanisterWsOpenResult = { Ok: null } | { Err: string };
export interface Category {
  metadata: [] | [Value];
  name: string;
}
export interface ClientKey {
  client_principal: ClientPrincipal;
  client_nonce: bigint;
}
export type ClientPrincipal = Principal;
export type Error =
  | { NotController: null }
  | { CommonError: null }
  | { InvalidRequest: null }
  | { InternalError: string };
export interface FullArchiveData {
  end: bigint;
  stored_news: bigint;
  start: bigint;
  canister: FullArchiveInterface;
}
export interface FullArchiveInterface {
  append_news: ActorMethod<[Array<FullNews>], Result_2>;
  get_news: ActorMethod<[bigint], Result_1>;
  query_news: ActorMethod<[NewsRequest], FullNewsRange>;
  remaining_capacity: ActorMethod<[], Result>;
  total_news: ActorMethod<[], Result>;
}
export interface FullNews {
  id: [] | [string];
  title: string;
  content: string;
  provider: Value;
  metadata: Value;
  hash: string;
  tags: Array<string>;
  description: string;
  created_at: bigint;
  imageUrl: [] | [string];
  category: string;
  index: bigint;
}
export interface FullNewsArg {
  id: [] | [string];
  title: string;
  content: string;
  hash: string;
  tags: Array<string>;
  description: string;
  created_at: bigint;
  imageUrl: [] | [string];
  category: string;
  metadata: Value;
}
export interface FullNewsRange {
  news: Array<FullNews>;
}
export interface FullNewsResponse {
  news: Array<FullNews>;
  first_index: bigint;
  length: bigint;
  archived_news: Array<ArchivedFullNews>;
}
export type GatewayPrincipal = Principal;
export interface NewsRequest {
  start: bigint;
  length: bigint;
}
export interface NewsRequest__1 {
  start: bigint;
  length: bigint;
}
export type Result = { ok: bigint } | { err: Error };
export type Result_1 = { ok: FullNews } | { err: Error };
export type Result_2 = { ok: boolean } | { err: Error };
export type Result_3 = { ok: Array<FullNews> } | { err: Error };
export type Result_4 = { ok: [boolean, string] } | { err: Error };
export type Result_5 = { ok: Array<Tag> } | { err: Error };
export type Result_6 = { ok: Array<[Principal, string]> } | { err: Error };
export type Result_7 = { ok: Array<Category> } | { err: Error };
export type Result_8 = { ok: Array<FullArchiveData> } | { err: Error };
export interface Tag {
  metadata: [] | [Value];
  name: string;
}
export type Value =
  | { Int: bigint }
  | { Map: Array<[string, Value]> }
  | { Nat: bigint }
  | { Blob: Uint8Array | number[] }
  | { Bool: boolean }
  | { Text: string }
  | { Float: number }
  | { Principal: Principal }
  | { Array: Array<Value> };
export type WebSocketValue =
  | { Tags: Array<Tag> }
  | { NewsByIndex: FullNews }
  | { LatestNews: Array<FullNews> }
  | { NewsByHash: FullNews }
  | { NewsByTime: Array<FullNews> }
  | { Archives: Array<FullArchiveData> }
  | { Categories: Array<Category> }
  | { Common: Value };
export interface WebsocketMessage {
  sequence_num: bigint;
  content: Uint8Array | number[];
  client_key: ClientKey;
  timestamp: bigint;
  is_service_message: boolean;
}
export interface _SERVICE {
  add_categories: ActorMethod<[AddCategoryArgs], Result_2>;
  add_news: ActorMethod<[AddFullNewsArgs], Result_2>;
  add_provider: ActorMethod<[Principal, string], Result_2>;
  add_tags: ActorMethod<[AddTagArgs], Result_2>;
  get_archives: ActorMethod<[], Result_8>;
  get_categories: ActorMethod<[], Result_7>;
  get_news_by_hash: ActorMethod<[string], Result_1>;
  get_news_by_index: ActorMethod<[bigint], Result_1>;
  get_news_by_time: ActorMethod<[bigint, bigint], Result_3>;
  get_providers: ActorMethod<[], Result_6>;
  get_tags: ActorMethod<[], Result_5>;
  get_task_status: ActorMethod<[], Result_4>;
  query_latest_news: ActorMethod<[bigint], Result_3>;
  query_news: ActorMethod<[NewsRequest__1], FullNewsResponse>;
  total_news: ActorMethod<[], Result>;
  ws_close: ActorMethod<[CanisterWsCloseArguments], CanisterWsCloseResult>;
  ws_get_messages: ActorMethod<[CanisterWsGetMessagesArguments], CanisterWsGetMessagesResult>;
  ws_message: ActorMethod<[CanisterWsMessageArguments, [] | [AppMessage]], CanisterWsMessageResult>;
  ws_open: ActorMethod<[CanisterWsOpenArguments], CanisterWsOpenResult>;
}
export const idlFactory = ({ IDL }: any) => {
  const Value = IDL.Rec();
  Value.fill(
    IDL.Variant({
      Int: IDL.Int,
      Map: IDL.Vec(IDL.Tuple(IDL.Text, Value)),
      Nat: IDL.Nat,
      Blob: IDL.Vec(IDL.Nat8),
      Bool: IDL.Bool,
      Text: IDL.Text,
      Float: IDL.Float64,
      Principal: IDL.Principal,
      Array: IDL.Vec(Value),
    })
  );
  const Category = IDL.Record({
    metadata: IDL.Opt(Value),
    name: IDL.Text,
  });
  const AddCategoryArgs = IDL.Record({ args: IDL.Vec(Category) });
  const Error = IDL.Variant({
    NotController: IDL.Null,
    CommonError: IDL.Null,
    InvalidRequest: IDL.Null,
    InternalError: IDL.Text,
  });
  const Result_2 = IDL.Variant({ ok: IDL.Bool, err: Error });
  const FullNewsArg = IDL.Record({
    id: IDL.Opt(IDL.Text),
    title: IDL.Text,
    content: IDL.Text,
    metadata: Value,
    hash: IDL.Text,
    tags: IDL.Vec(IDL.Text),
    description: IDL.Text,
    created_at: IDL.Nat,
    imageUrl: IDL.Opt(IDL.Text),
    category: IDL.Text,
  });
  const AddFullNewsArgs = IDL.Record({ args: IDL.Vec(FullNewsArg) });
  const Tag = IDL.Record({ metadata: IDL.Opt(Value), name: IDL.Text });
  const AddTagArgs = IDL.Record({ args: IDL.Vec(Tag) });
  const FullNews = IDL.Record({
    id: IDL.Opt(IDL.Text),
    title: IDL.Text,
    content: IDL.Text,
    provider: Value,
    metadata: Value,
    hash: IDL.Text,
    tags: IDL.Vec(IDL.Text),
    description: IDL.Text,
    created_at: IDL.Nat,
    imageUrl: IDL.Opt(IDL.Text),
    category: IDL.Text,
    index: IDL.Nat,
  });
  const Result_1 = IDL.Variant({ ok: FullNews, err: Error });
  const NewsRequest = IDL.Record({ start: IDL.Nat, length: IDL.Nat });
  const FullNewsRange = IDL.Record({ news: IDL.Vec(FullNews) });
  const Result = IDL.Variant({ ok: IDL.Nat, err: Error });
  const FullArchiveInterface = IDL.Service({
    append_news: IDL.Func([IDL.Vec(FullNews)], [Result_2], []),
    get_news: IDL.Func([IDL.Nat], [Result_1], ["query"]),
    query_news: IDL.Func([NewsRequest], [FullNewsRange], ["query"]),
    remaining_capacity: IDL.Func([], [Result], ["query"]),
    total_news: IDL.Func([], [Result], ["query"]),
  });
  const FullArchiveData = IDL.Record({
    end: IDL.Nat,
    stored_news: IDL.Nat,
    start: IDL.Nat,
    canister: FullArchiveInterface,
  });
  const Result_8 = IDL.Variant({
    ok: IDL.Vec(FullArchiveData),
    err: Error,
  });
  const Result_7 = IDL.Variant({ ok: IDL.Vec(Category), err: Error });
  const Result_3 = IDL.Variant({ ok: IDL.Vec(FullNews), err: Error });
  const Result_6 = IDL.Variant({
    ok: IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Text)),
    err: Error,
  });
  const Result_5 = IDL.Variant({ ok: IDL.Vec(Tag), err: Error });
  const Result_4 = IDL.Variant({
    ok: IDL.Tuple(IDL.Bool, IDL.Text),
    err: Error,
  });
  const NewsRequest__1 = IDL.Record({ start: IDL.Nat, length: IDL.Nat });
  const ArchivedFullNews = IDL.Record({
    callback: IDL.Func([NewsRequest], [FullNewsRange], ["query"]),
    start: IDL.Nat,
    length: IDL.Nat,
  });
  const FullNewsResponse = IDL.Record({
    news: IDL.Vec(FullNews),
    first_index: IDL.Nat,
    length: IDL.Nat,
    archived_news: IDL.Vec(ArchivedFullNews),
  });
  const ClientPrincipal = IDL.Principal;
  const ClientKey = IDL.Record({
    client_principal: ClientPrincipal,
    client_nonce: IDL.Nat64,
  });
  const CanisterWsCloseArguments = IDL.Record({ client_key: ClientKey });
  const CanisterWsCloseResult = IDL.Variant({
    Ok: IDL.Null,
    Err: IDL.Text,
  });
  const CanisterWsGetMessagesArguments = IDL.Record({ nonce: IDL.Nat64 });
  const CanisterOutputMessage = IDL.Record({
    key: IDL.Text,
    content: IDL.Vec(IDL.Nat8),
    client_key: ClientKey,
  });
  const CanisterOutputCertifiedMessages = IDL.Record({
    messages: IDL.Vec(CanisterOutputMessage),
    cert: IDL.Vec(IDL.Nat8),
    tree: IDL.Vec(IDL.Nat8),
    is_end_of_queue: IDL.Bool,
  });
  const CanisterWsGetMessagesResult = IDL.Variant({
    Ok: CanisterOutputCertifiedMessages,
    Err: IDL.Text,
  });
  const WebsocketMessage = IDL.Record({
    sequence_num: IDL.Nat64,
    content: IDL.Vec(IDL.Nat8),
    client_key: ClientKey,
    timestamp: IDL.Nat64,
    is_service_message: IDL.Bool,
  });
  const CanisterWsMessageArguments = IDL.Record({ msg: WebsocketMessage });
  const WebSocketValue = IDL.Variant({
    Tags: IDL.Vec(Tag),
    NewsByIndex: FullNews,
    LatestNews: IDL.Vec(FullNews),
    NewsByHash: FullNews,
    NewsByTime: IDL.Vec(FullNews),
    Archives: IDL.Vec(FullArchiveData),
    Categories: IDL.Vec(Category),
    Common: Value,
  });
  const AppMessage = IDL.Record({
    result: WebSocketValue,
    topic: IDL.Text,
    args: IDL.Vec(IDL.Text),
    timestamp: IDL.Nat64,
  });
  const CanisterWsMessageResult = IDL.Variant({
    Ok: IDL.Null,
    Err: IDL.Text,
  });
  const GatewayPrincipal = IDL.Principal;
  const CanisterWsOpenArguments = IDL.Record({
    gateway_principal: GatewayPrincipal,
    client_nonce: IDL.Nat64,
  });
  const CanisterWsOpenResult = IDL.Variant({
    Ok: IDL.Null,
    Err: IDL.Text,
  });
  return IDL.Service({
    add_categories: IDL.Func([AddCategoryArgs], [Result_2], []),
    add_news: IDL.Func([AddFullNewsArgs], [Result_2], []),
    add_provider: IDL.Func([IDL.Principal, IDL.Text], [Result_2], []),
    add_tags: IDL.Func([AddTagArgs], [Result_2], []),
    get_archives: IDL.Func([], [Result_8], ["query"]),
    get_categories: IDL.Func([], [Result_7], ["query"]),
    get_news_by_hash: IDL.Func([IDL.Text], [Result_1], ["query"]),
    get_news_by_index: IDL.Func([IDL.Nat], [Result_1], ["composite_query"]),
    get_news_by_time: IDL.Func([IDL.Nat, IDL.Nat], [Result_3], ["query"]),
    get_providers: IDL.Func([], [Result_6], ["query"]),
    get_tags: IDL.Func([], [Result_5], ["query"]),
    get_task_status: IDL.Func([], [Result_4], ["query"]),
    query_latest_news: IDL.Func([IDL.Nat], [Result_3], ["query"]),
    query_news: IDL.Func([NewsRequest__1], [FullNewsResponse], ["composite_query"]),
    total_news: IDL.Func([], [Result], ["query"]),
    ws_close: IDL.Func([CanisterWsCloseArguments], [CanisterWsCloseResult], []),
    ws_get_messages: IDL.Func(
      [CanisterWsGetMessagesArguments],
      [CanisterWsGetMessagesResult],
      ["query"]
    ),
    ws_message: IDL.Func(
      [CanisterWsMessageArguments, IDL.Opt(AppMessage)],
      [CanisterWsMessageResult],
      []
    ),
    ws_open: IDL.Func([CanisterWsOpenArguments], [CanisterWsOpenResult], []),
  });
};
export const init = ({ IDL }: any) => {
  return [];
};
