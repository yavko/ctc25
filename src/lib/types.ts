export interface Indicator {
  message: string;
  type: string;
}

export type Response = {
  overall: string;
  risk: number;
  indicators?: Indicator[];
} | null;
