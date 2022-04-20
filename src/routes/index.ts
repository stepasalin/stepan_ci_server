import { Router } from 'express';
import { getTests, addTest } from '../controllers/auto_tests';
import { getRuns, addRun, findForAgent, appendLog, updateRunStatus, getRunCmd, getLog } from '../controllers/runs';
import { getAgents, addAgent, updateAgentStatus } from '../controllers/agents';
import bodyParser from 'body-parser';

const jsonParser = bodyParser.json();

// eslint-disable-next-line new-cap
const router = Router();

router.get('/all-auto-tests', getTests);
router.get('/run-log', getLog)
router.post('/add-auto-test', jsonParser, addTest);
router.get('/all-runs', getRuns);
router.post('/add-run', jsonParser, addRun);
router.get('/all-agents', jsonParser, getAgents);
router.post('/add-agent', jsonParser, addAgent);
router.post('/get-run', jsonParser, findForAgent);
router.post('/append-log', jsonParser, appendLog);
router.post('/upate-run-status', jsonParser, updateRunStatus);
router.get('/run-command', jsonParser, getRunCmd);
router.post('/update-agent-status', jsonParser, updateAgentStatus);


export default router;
