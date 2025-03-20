import { error as toast } from "@/components/ui/sonner";
import { Actor, ActorSubclass, HttpAgent } from "@dfinity/agent";
import { IDL } from "@dfinity/candid";
import { Principal } from "@dfinity/principal";
import { useMemo } from "react";

interface UseActorParams {
  canisterId: Principal | string;
  interfaceFactory: IDL.InterfaceFactory;
  auth?: boolean;
}

export async function getActor<T>({
  canisterId,
  interfaceFactory,
}: UseActorParams): Promise<ActorSubclass<T> | null> {
  try {
    const agent = new HttpAgent({ host: "https://ic0.app" });
    const actor = await Actor.createActor(interfaceFactory, {
      agent,
      canisterId: typeof canisterId === "string" ? Principal.fromText(canisterId) : canisterId,
    });
    return actor as ActorSubclass<T>;
  } catch (error) {
    console.error(`Failed to create actor for canister ${canisterId}:`, error);
    toast("Connection Error", {
      description: "Failed to connect to IC network. Please try again.",
      duration: 3000,
    });
    return null;
  }
}

export default function useActor<T>({
  canisterId,
  interfaceFactory,
}: UseActorParams): ActorSubclass<T> | null {
  return useMemo(
    () =>
      Actor.createActor(interfaceFactory, {
        agent: new HttpAgent({ host: "https://ic0.app" }),
        canisterId: typeof canisterId === "string" ? Principal.fromText(canisterId) : canisterId,
      }),
    [canisterId, interfaceFactory]
  );
}
