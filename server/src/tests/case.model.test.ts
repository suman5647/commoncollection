import { Case, CaseDocument } from '../data/case';
import { CaseService } from '../services/case.service';

let cservice: CaseService = new CaseService();

let case1 = {
    tenantId: 'case1',
    caseId: 'cc',
    attachments: [
        {
            fileMode: 0,
            fileType: 'image/jpg',
            title: 'Please help to restore the village and their hope',
            uniqueName: 'cc_casephoto_9e104b1e-5714-4d56-8ff1-e4b215b0a8a7'
        },
        {
            _id: "5d89c036e623833e0c0c9ab1",
            fileMode: 0,
            fileType: 'image/jpg',
            title: 'Please help to restore the village and their hope',
            uniqueName: 'cc_casephoto_81ab9675-409e-472e-845c-93a4542b598b'
        },
        {
            _id: "5d89c036e623833e0c0c9ab0",
            fileMode: 0,
            fileType: 'image/jpg',
            title: 'Please help to restore the village and their hope',
            uniqueName: 'cc_casephoto_05bb9028-4b41-489d-a8cd-1c65863327a0'
        },
        {
            _id: "5d89c036e623833e0c0c9aaf",
            fileMode: 0,
            fileType: 'image/jpg',
            title: 'Please help to restore the village and their hope',
            uniqueName: 'cc_casephoto_9e104b1e-5714-4d56-8ff1-e4b215b0a8a7'
        }
    ]
};

 function call() {
    var getCaseDetails = cservice.findOneSelect({ tenantId: 'cc', status: ['Open', 'Completed'], caseId: 'hyderabad-case0004' }, 'tenantId caseId status attachments donations beneficiary content').
    then(res=>{
        // CaseUtil.UpdateCase(res);
        console.log(res);

    });
    // CaseUtil.UpdateCase(getCaseDetails);
    // console.log(getCaseDetails)
}

call();
// console.log(case1);

// CaseUtil.UpdateCase(case1 as Case);

// console.log(case1);