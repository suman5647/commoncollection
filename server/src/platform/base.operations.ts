import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { keys } from '../config/keys';

export interface IAPIOperations {
}

export class BaseAPIOperations implements IAPIOperations {
    get Params(): any {
        return this.req.params;
    }

    get userId(): any {
        let claims = this.getclaims();
        return claims ? claims.email : undefined;
    }

    get tenantId(): string {
        let claims = this.getclaims();
        return claims ? claims.tenantId : this.tenantNameFromUrl;
    }

    get tenantNameFromUrl(): string {
        let tenantFromUrl = keys.tenantMappping[this.domainRootName];
        if (!tenantFromUrl) tenantFromUrl = keys.tenantMappping.default;
        return tenantFromUrl;
    }

    get domainRootName(): string {
        if (!this.domainName) {
            // var origin = req.get('origin');
            var host = this.req.get('host');
            if (host) {
                this.domainName = host;
                let domainParts = host.split('.');
                let lengthDomain = domainParts.length;
                if (domainParts.length > 0) {
                    this.domainName = domainParts[domainParts.length - 1];
                }
            }
        }

        return this.domainName;
    }

    get role(): any {
        let claims = this.getclaims();
        return claims ? claims.role : undefined;
    }

    get language(): any {
        let claims = this.getclaims();
        return claims ? claims.language : undefined;
    }

    private domainName: string;
    private claims: any;
    private req: Request;
    private res: Response;

    constructor(req: Request, res: Response) {
        this.req = req;      
        this.res = res;  
    }

    /**
     * Only for testing
     * @param claims user claims
     * @param domainName domain name http://commoncollection.com
     */
    init(claims: any | { email: string, tenantId: string, role: string, language: string }, domainName = 'commoncollection') {
        this.claims = {
            email: claims.email,
            tenantId: claims.tenantId,
            role: claims.role,
            language: claims.language,
        };

        this.domainName = domainName;
    }

    getclaims(): any {
        if (this.claims) {
            return this.claims;
        }

        if (this.req.headers && this.req.headers.authorization) {
            let token = this.req.headers.authorization;
            //return jwt.decode(token).split(' ')[1];
            this.claims = jwt.decode(token);
            return this.claims;
        }
        
        return undefined;
    }
}
