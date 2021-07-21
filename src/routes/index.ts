import {Router} from 'express';
// import {getTests, addTest, updateTest, deleteTest} from '../controllers/tests';
import {getTests, addTest} from '../controllers/tests';

const router: Router = Router();

router.get('/all-tests', getTests);

router.post('/add-test', addTest);

// router.put('/edit-todo/:id', updateTest);

// router.delete('/delete-todo/:id', deleteTest);

export default router;
