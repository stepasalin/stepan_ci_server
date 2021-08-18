import {Router} from 'express';
import {getTests, addTest} from '../controllers/tests';
import {getRuns, addRun} from '../controllers/runs';
import bodyParser from 'body-parser';

const jsonParser = bodyParser.json();

const router: Router = Router();

router.get('/all-tests', getTests);
router.post('/add-test', jsonParser, addTest);
router.get('/all-runs', getRuns);
router.post('/add-run', jsonParser, addRun);


export default router;
