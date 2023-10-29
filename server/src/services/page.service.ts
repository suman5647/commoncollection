import { Request, Response } from 'express';

export class pageCount {

    async pageCalculations(req: Request, res: Response) {
        
        let perPage = parseInt(req.query.perPage as string);  //size of the records per page
        let page = parseInt(req.query.page as string);  // page number

        if (perPage == undefined || !perPage) {
            perPage = 8;
        }

        if (page == undefined || page == 1 || !page) {
            page = 0;
        }
        else {
            page = (page - 1);
        }

        let skip = page * perPage; //skipping the records 

        return { page, perPage, skip }
    }
}