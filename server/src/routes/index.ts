import { Router, Request } from 'express';
import { isAuthenticated } from '../config/passport';

const routes = Router();

//Welcome page
routes.get('/',
    async function (req, res) {
        const result = {
            code: 200,
            msg : 'welcome'
        }
       res.send(result);
    })

//Users Dashboard page
routes.get('/dashboard', isAuthenticated,
    async function (req, res) {
       res.send(200)
    });


export default routes;

