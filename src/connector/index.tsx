import { ActorSubclass } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { IDL } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { host, IConnector } from './connectors';
import { InternetIdentityConnector } from './internet-identity';
import { Connector } from './types';

type ConnectorClass = { new (...args: any[]): IConnector };

export type ProviderOptions = {
  connector: ConnectorClass;
  id: string;
  name: string;
};

export type Provider = {
  connector: IConnector;
  id: string;
  name: string;
};

export type ConnectConfig = {
  whitelist: Array<string>;
  host: string;
  providerUrl: string;
  dev: boolean;
};

interface Wallet {
  client?: AuthClient;
  account?: string;
  identity?: any;
  principal?: string;
  type?: string;
}

interface WalletConnectorContextType {
  connector: IConnector | null;
  connect: () => Promise<boolean>;
  logout: () => Promise<void>;
  isConnected: boolean;
  isLoading: boolean;
  createActor: <Service>(
    canisterId: string,
    interfaceFactory: IDL.InterfaceFactory
  ) => Promise<ActorSubclass<Service> | undefined>;
  connectorType: Connector;
  setConnectorType: (type: Connector) => void;
  getConnectorPrincipal: () => Promise<string | null>;
  getConnectorIsConnected: () => Promise<boolean>;
  isUnlocked: boolean;
  wallet: Wallet;
}

const WalletConnectorContext = createContext<WalletConnectorContextType | undefined>(undefined);

interface ProviderProps {
  children: ReactNode;
}

const defaultWallet: Wallet = {
  client: undefined,
  account: undefined,
  identity: undefined,
  principal: undefined,
  type: undefined,
};

export const WalletConnectorProvider = ({ children }: ProviderProps) => {
  // const { pools } = useExchangeFactory();
  const [wallet, setWallet] = useState<Wallet>(defaultWallet);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlocked] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [connector, setConnector] = useState<IConnector | null>(null);
  const [connectorType, setConnectorType] = useState<Connector>(Connector.IC);
  // const createConnector = useCallback(
  //   async (connector: Connector) => {
  //     if (!pools) return;
  //     const config = {
  //       host,
  //       whitelist: [
  //         process.env.NEXT_PUBLIC_EXCHANGE_FACTORY_CANISTER_ID as string,
  //         ...pools.map((pool: PoolMetadataProps) => pool.address as string),
  //       ],
  //     };

  //     switch (connector) {
  //       case Connector.IC:
  //         return new InternetIdentityConnector(config);
  //       default:
  //         throw new Error(`Connector error ${connector}: Not support this connect for now`);
  //     }
  //   },
  //   [pools]
  // );
  const createConnector = useCallback(async (connector: Connector) => {
    const config = {
      host,
      whitelist: [process.env.NEXT_PUBLIC_EXCHANGE_FACTORY_CANISTER_ID as string],
    };

    switch (connector) {
      case Connector.IC:
        return new InternetIdentityConnector(config);
      default:
        throw new Error(`Connector error ${connector}: Not support this connect for now`);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const createdConnector = await createConnector(connectorType);
      if (!createdConnector) return;
      await createdConnector?.init?.();
      setConnector(createdConnector);
      setIsConnected((await createdConnector?.isConnected()) ?? false);
      setWallet({ ...createdConnector });
      setIsLoading(false);
    })();
  }, [connectorType, createConnector]);

  const connect = async () => {
    if (!connector) return false;
    try {
      const connected = await connector.connect();
      if (connected) {
        setIsConnected(true);
        window.icConnector = connector;
        setWallet({
          ...wallet,
          principal: await connector.getPrincipal,
          type: connectorType,
        });
      }
      return connected;
    } catch (error) {
      console.error('Connection error:', error);
      return false;
    }
  };

  const logout = async () => {
    if (!connector) return;
    await connector.disconnect();
    setIsConnected(false);
    setWallet(defaultWallet);
    window.icConnector = null;
  };

  const createActor = async <Service,>(
    canisterId: string | Principal,
    interfaceFactory: IDL.InterfaceFactory
  ): Promise<ActorSubclass<Service> | undefined> => {
    return await connector?.createActor({
      canisterId: typeof canisterId === 'string' ? Principal.fromText(canisterId) : canisterId,
      interfaceFactory,
    });
  };

  const getConnectorPrincipal = async () => {
    return connector?.getPrincipal ?? null;
  };

  const getConnectorIsConnected = async () => {
    return connector?.isConnected() ?? false;
  };

  const value = {
    connector,
    connect,
    logout,
    isConnected,
    isLoading,
    createActor,
    connectorType,
    setConnectorType,
    getConnectorPrincipal,
    getConnectorIsConnected,
    isUnlocked,
    wallet,
  };

  return (
    <WalletConnectorContext.Provider value={value}>{children}</WalletConnectorContext.Provider>
  );
};

export const useWalletConnector = () => {
  const context = useContext(WalletConnectorContext);
  if (context === undefined) {
    throw new Error('useWalletConnector must be used within a WalletConnectorProvider');
  }
  return context;
};

export { Connector };
