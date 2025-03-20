import { ActorSubclass } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';
import { Connector } from './types';

export const host = 'https://icp0.io';

export type CreateActorArgs = {
  canisterId: Principal;
  interfaceFactory: IDL.InterfaceFactory;
};

export interface WalletConnectorConfig {
  whitelist: string[];
  host: string;
  dev?: boolean;
}

export interface IConnector {
  init: () => Promise<boolean>;
  isConnected: () => Promise<boolean>;
  createActor: <Service>({
    canisterId,
    interfaceFactory,
  }: CreateActorArgs) => Promise<ActorSubclass<Service> | undefined>;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  // getPrincipal: Promise<string | undefined>;
  getPrincipal: any;
  type: Connector;
  expired: () => Promise<boolean>;
}

export { Connector as ConnectorType };
