import { IModel, ITenantModel, IDocumentModel } from './base';
import { UserLite } from './user';

export interface ReportAbuseSummary {
    count: number;
    recentUpdate: Date;
}
export interface ReportAbuse extends IModel, ITenantModel, IDocumentModel<ReportAbuse> {
    tenantId: string;
    caseId: string;
    on: any;
    comments: string;
    user: UserLite;
}