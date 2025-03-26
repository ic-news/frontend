import type { ActorMethod } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";

export interface Listing {
  id: number;
  self_reported_circulating_supply: number;
  num_market_pairs: number;
  name: string;
  slug: string;
  tags: Array<string>;
  quote: Quote;
  last_updated: string;
  self_reported_market_cap: number;
  cmc_rank: number;
  platform: [] | [Platform];
  circulating_supply: number;
  date_added: string;
  max_supply: number;
  total_supply: number;
  symbol: string;
  infinite_supply: boolean;
}
export interface Platform {
  id: number;
  name: string;
  slug: string;
  token_address: string;
  symbol: string;
}
export interface Quote {
  market_cap: number;
  percent_change_1h: number;
  percent_change_7d: number;
  volume_change_24h: number;
  volume_24h: number;
  last_updated: string;
  fully_diluted_market_cap: number;
  percent_change_24h: number;
  percent_change_30d: number;
  percent_change_60d: number;
  percent_change_90d: number;
  price: number;
  market_cap_dominance: number;
}
export interface _SERVICE {
  add_manager: ActorMethod<[Principal], { Ok: null } | { Err: string }>;
  delete_listing: ActorMethod<[string], { Ok: null } | { Err: string }>;
  get_listing: ActorMethod<[string], [] | [Listing]>;
  get_listings: ActorMethod<[[] | [bigint], [] | [bigint], [] | [boolean]], Array<Listing>>;
  list_managers: ActorMethod<[], { Ok: Array<Principal> } | { Err: string }>;
  remove_manager: ActorMethod<[Principal], { Ok: null } | { Err: string }>;
  upsert_listing: ActorMethod<[Listing], { Ok: null } | { Err: string }>;
  upsert_listings: ActorMethod<[Array<Listing>], { Ok: null } | { Err: string }>;
}
export const idlFactory = ({ IDL }: any) => {
  const Quote = IDL.Record({
    market_cap: IDL.Float64,
    percent_change_1h: IDL.Float64,
    percent_change_7d: IDL.Float64,
    volume_change_24h: IDL.Float64,
    volume_24h: IDL.Float64,
    last_updated: IDL.Text,
    fully_diluted_market_cap: IDL.Float64,
    percent_change_24h: IDL.Float64,
    percent_change_30d: IDL.Float64,
    percent_change_60d: IDL.Float64,
    percent_change_90d: IDL.Float64,
    price: IDL.Float64,
    market_cap_dominance: IDL.Float64,
  });
  const Platform = IDL.Record({
    id: IDL.Nat32,
    name: IDL.Text,
    slug: IDL.Text,
    token_address: IDL.Text,
    symbol: IDL.Text,
  });
  const Listing = IDL.Record({
    id: IDL.Nat32,
    self_reported_circulating_supply: IDL.Float64,
    num_market_pairs: IDL.Nat32,
    name: IDL.Text,
    slug: IDL.Text,
    tags: IDL.Vec(IDL.Text),
    quote: Quote,
    last_updated: IDL.Text,
    self_reported_market_cap: IDL.Float64,
    cmc_rank: IDL.Nat32,
    platform: IDL.Opt(Platform),
    circulating_supply: IDL.Float64,
    date_added: IDL.Text,
    max_supply: IDL.Float64,
    total_supply: IDL.Float64,
    symbol: IDL.Text,
    infinite_supply: IDL.Bool,
  });
  return IDL.Service({
    add_manager: IDL.Func([IDL.Principal], [IDL.Variant({ Ok: IDL.Null, Err: IDL.Text })], []),
    delete_listing: IDL.Func([IDL.Text], [IDL.Variant({ Ok: IDL.Null, Err: IDL.Text })], []),
    get_listing: IDL.Func([IDL.Text], [IDL.Opt(Listing)], ["query"]),
    get_listings: IDL.Func(
      [IDL.Opt(IDL.Nat), IDL.Opt(IDL.Nat), IDL.Opt(IDL.Bool)],
      [IDL.Vec(Listing)],
      ["query"]
    ),
    list_managers: IDL.Func(
      [],
      [IDL.Variant({ Ok: IDL.Vec(IDL.Principal), Err: IDL.Text })],
      ["query"]
    ),
    remove_manager: IDL.Func([IDL.Principal], [IDL.Variant({ Ok: IDL.Null, Err: IDL.Text })], []),
    upsert_listing: IDL.Func([Listing], [IDL.Variant({ Ok: IDL.Null, Err: IDL.Text })], []),
    upsert_listings: IDL.Func(
      [IDL.Vec(Listing)],
      [IDL.Variant({ Ok: IDL.Null, Err: IDL.Text })],
      []
    ),
  });
};
export const init = ({ IDL }: any) => {
  return [];
};
