export default ({ IDL }: { IDL: any }) => {
  const Metadata = IDL.Rec();
  const Category = IDL.Record({
    metadata: IDL.Opt(Metadata),
    name: IDL.Text,
  });
  
  Metadata.fill(
    IDL.Variant({
      Int: IDL.Int,
      Map: IDL.Vec(IDL.Tuple(IDL.Text, Metadata)),
      Nat: IDL.Nat,
      Blob: IDL.Vec(IDL.Nat8),
      Bool: IDL.Bool,
      Text: IDL.Text,
      Float: IDL.Float64,
      Principal: IDL.Principal,
      Array: IDL.Vec(Metadata),
    })
  );

  const News = IDL.Record({
    id: IDL.Opt(IDL.Text),
    title: IDL.Text,
    provider: Metadata,
    metadata: Metadata,
    hash: IDL.Text,
    tags: IDL.Vec(IDL.Text),
    description: IDL.Text,
    created_at: IDL.Nat,
    category: IDL.Text,
    index: IDL.Nat,
  });

  const Archive = IDL.Record({
    end: IDL.Nat,
    stored_news: IDL.Nat,
    start: IDL.Nat,
    canister: IDL.Service({
      append_news: IDL.Func([IDL.Vec(News)], [IDL.Variant({
        ok: IDL.Bool,
        err: IDL.Variant({
          NotController: IDL.Null,
          CommonError: IDL.Null,
          InvalidRequest: IDL.Null,
          InternalError: IDL.Text,
        }),
      })], []),
      get_news: IDL.Func([IDL.Nat], [IDL.Variant({
        ok: News,
        err: IDL.Variant({
          NotController: IDL.Null,
          CommonError: IDL.Null,
          InvalidRequest: IDL.Null,
          InternalError: IDL.Text,
        }),
      })], ['query']),
      query_news: IDL.Func([IDL.Record({
        start: IDL.Nat,
        length: IDL.Nat,
      })], [IDL.Record({
        news: IDL.Vec(News),
      })], ['query']),
      remaining_capacity: IDL.Func([], [IDL.Variant({
        ok: IDL.Nat,
        err: IDL.Variant({
          NotController: IDL.Null,
          CommonError: IDL.Null,
          InvalidRequest: IDL.Null,
          InternalError: IDL.Text,
        }),
      })], ['query']),
      total_news: IDL.Func([], [IDL.Variant({
        ok: IDL.Nat,
        err: IDL.Variant({
          NotController: IDL.Null,
          CommonError: IDL.Null,
          InvalidRequest: IDL.Null,
          InternalError: IDL.Text,
        }),
      })], ['query']),
    }),
  });

  const ErrorResponse = IDL.Variant({
    NotController: IDL.Null,
    CommonError: IDL.Null,
    InvalidRequest: IDL.Null,
    InternalError: IDL.Text,
  });

  return IDL.Service({
    get_archives: IDL.Func([], [IDL.Variant({
      ok: IDL.Vec(Archive),
      err: ErrorResponse,
    })], ['query']),
    get_categories: IDL.Func([], [IDL.Variant({
      ok: IDL.Vec(Category),
      err: ErrorResponse,
    })], ['query']),
    get_news_by_hash: IDL.Func([IDL.Text], [IDL.Variant({
      ok: News,
      err: ErrorResponse,
    })], ['query']),
    get_news_by_index: IDL.Func([IDL.Nat], [IDL.Variant({
      ok: News,
      err: ErrorResponse,
    })], ['composite_query']),
    get_news_by_time: IDL.Func([IDL.Nat, IDL.Nat], [IDL.Variant({
      ok: IDL.Vec(News),
      err: ErrorResponse,
    })], ['query']),
    get_providers: IDL.Func([], [IDL.Variant({
      ok: IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Text)),
      err: ErrorResponse,
    })], ['query']),
    get_tags: IDL.Func([], [IDL.Variant({
      ok: IDL.Vec(Category),
      err: ErrorResponse,
    })], ['query']),
    get_task_status: IDL.Func([], [IDL.Variant({
      ok: IDL.Tuple(IDL.Bool, IDL.Text),
      err: ErrorResponse,
    })], ['query']),
    query_latest_news: IDL.Func([IDL.Nat], [IDL.Variant({
      ok: IDL.Vec(News),
      err: ErrorResponse,
    })], ['query']),
    query_news: IDL.Func([IDL.Record({
      start: IDL.Nat,
      length: IDL.Nat,
    })], [IDL.Record({
      news: IDL.Vec(News),
      first_index: IDL.Nat,
      length: IDL.Nat,
      archived_news: IDL.Vec(IDL.Record({
        callback: IDL.Func([IDL.Record({
          start: IDL.Nat,
          length: IDL.Nat,
        })], [IDL.Record({
          news: IDL.Vec(News),
        })], ['query']),
        start: IDL.Nat,
        length: IDL.Nat,
      })),
    })], ['composite_query']),
    total_news: IDL.Func([], [IDL.Variant({
      ok: IDL.Nat,
      err: ErrorResponse,
    })], ['query']),
  });
};
