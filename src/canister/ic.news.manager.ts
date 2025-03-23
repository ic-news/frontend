import type { ActorMethod } from "@dfinity/agent";

export interface Language {
  updated_at?: bigint;
  language_code: string;
  language: string;
  enabled: boolean;
  country_code: string;
}
export interface Channel {
  updated_at: bigint;
  name: string;
  platform: string;
  enabled: boolean;
}
export interface _SERVICE {
  get_channels: ActorMethod<[[] | [string]], Array<Channel>>;
  get_languages: ActorMethod<[[] | [boolean]], Array<Language>>;
}
export const idlFactory = ({ IDL }: any) => {
  return IDL.Service({
    get_channels: IDL.Func(
      [IDL.Opt(IDL.Text)],
      [
        IDL.Vec(
          IDL.Record({
            updated_at: IDL.Nat64,
            name: IDL.Text,
            platform: IDL.Text,
            enabled: IDL.Bool,
          })
        ),
      ],
      ["query"]
    ),
    get_languages: IDL.Func(
      [IDL.Opt(IDL.Bool)],
      [
        IDL.Vec(
          IDL.Record({
            updated_at: IDL.Nat64,
            language_code: IDL.Text,
            language: IDL.Text,
            enabled: IDL.Bool,
            country_code: IDL.Text,
          })
        ),
      ],
      ["query"]
    ),
  });
};
export const init = ({ IDL }: any) => {
  return [];
};
