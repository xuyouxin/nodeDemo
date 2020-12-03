import { getRepository } from "typeorm";
import { Lease } from "../entity/lease";

export const deleteExpiredLeasesInSchedule = () => {
    const leaseRepository = getRepository(Lease);
    setInterval(async () => {
        await leaseRepository
            .createQueryBuilder()
            .delete()
            .where("expiredAfter < strftime('%Y-%m-%d %H:%M:%f', 'now')")
            .execute();
    }, 1000);
};
