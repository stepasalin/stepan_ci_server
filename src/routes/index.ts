import { Router } from 'express';
import { getTests, addTest } from '../controllers/auto_tests';
import { getRuns, addRun } from '../controllers/runs';
import { getAgents, addAgent } from '../controllers/agents';
import bodyParser from 'body-parser';

const jsonParser = bodyParser.json();

// eslint-disable-next-line new-cap
const router = Router();

router.get('/all-auto-tests', getTests);
router.post('/add-auto-test', jsonParser, addTest);
router.get('/all-runs', getRuns);
router.post('/add-run', jsonParser, addRun);
router.post('/all-agents', jsonParser, getAgents);
router.post('/add-agent', jsonParser, addAgent);

export default router;
