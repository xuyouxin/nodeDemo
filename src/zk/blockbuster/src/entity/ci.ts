import { Lease } from "./lease";

export class Ci {

  uri: string;

  data?: {};

  maxLease: number;

  leases?: Lease[];
}
