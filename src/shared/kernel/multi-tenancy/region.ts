import { AppError } from "../../infrastructure/errors/app-error.ts";
import { ValueObject } from "../domain-types.ts";

interface RegionIdProps {
    value: string;
}

export class RegionId extends ValueObject<RegionIdProps> {
    private static get SUPPORTED_REGIONS(): Set<string> {
        const env = Deno.env.get("SUPPORTED_REGIONS");
        if (!env) return new Set(["EU", "US"]); // Default/Fallback
        return new Set(env.split(",").map(r => r.trim().toUpperCase()));
    }

    private constructor(props: RegionIdProps) {
        super(props);
    }

    public static create(value: string): RegionId {
        const upperValue = value.toUpperCase();
        if (!RegionId.SUPPORTED_REGIONS.has(upperValue)) {
            throw AppError.from("INVALID_ARGUMENT", `Invalid RegionId: ${value}. Supported: ${Array.from(RegionId.SUPPORTED_REGIONS).join(", ")}`);
        }
        return new RegionId({ value: upperValue });
    }

    get value(): string {
        return this.props.value;
    }

    public static readonly EU = RegionId.create("EU");
    public static readonly US = RegionId.create("US");

    public override toString(): string {
        return this.value;
    }
}
