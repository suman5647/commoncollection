import { IModel, ITenantModel, IDocumentModel } from './base';
import { FileTypes, FileModes } from './common';

export interface TicketDocument {
    fileType: FileTypes;
    fileMode: FileModes;
    title: string;
    uniqueName: string;
}

export interface Tickets extends IModel, ITenantModel, IDocumentModel<Tickets> {
    tenantId: string;
    ticketType: string;
    caseId: string;
    email: string;
    phone: number;
    title: string;
    description: string;
    attachments: TicketDocument[];
}