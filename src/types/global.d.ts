import { IConnector } from '../connector/connectors';

declare global {
  interface Window {
    icConnector: IConnector | null;
  }
}
