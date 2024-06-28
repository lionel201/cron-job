import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cron  from "node-cron";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

app.get("/", (req: Request, res: Response) => {
    res.send("Express + TypeScript Server");
});

app.listen(port, () => {
    function logMessage() {
        console.log('Cron job executed at:', new Date().toLocaleString());
    }
    const task = cron.schedule('*/5 * * * * *', () => {
        logMessage();
    },{
        scheduled: false
    });

    if(process.env["IS_START_JOB"] ==='true'){
        task.start();
    }else {
        task.stop()
    }

    console.log(`[server]: Server is running at http://localhost:${port}`);
});