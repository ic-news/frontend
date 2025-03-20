import { useWalletConnector } from "@/connector";
import { HttpAgent, Identity } from "@dfinity/agent";
import { useMemo } from "react";

export default function useAgent(host = "https://ic0.app") {
  const { wallet } = useWalletConnector();
  const agent = useMemo(() => {
    const agentOptions: { host: string; identity?: Identity; providerUrl: string } = {
      providerUrl: "https://identity.ic0.app",
      host,
    };
    if (wallet?.identity) {
      agentOptions.identity = wallet.identity;
    }
    return new HttpAgent(agentOptions);
  }, [host, wallet]);

  return { agent };
}
