import express, { NextFunction, Request, RequestHandler, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv'
import morgan from 'morgan';
import cors from 'cors';
import mongoosePaginate from 'mongoose-paginate-v2';
import compression from "compression";


if (!process.env.NODE_ENV) {
    const result = dotenv.config();

    if (result.error) {
        throw result.error;
    }
}


//Runnning Environment
console.log(`Running Environment: ${process.env.NODE_ENV}`);


//CONNECT TO DATABASE
mongoose.connect(process.env.DB_URL as unknown as string).then(
    () => {
        console.log(`Database Connected at URL`);
    },
    err => {
        console.log(`Error connecting Database at URL instance due to: `, err);
    }
);

mongoose.connection.on('connected', () => {
    console.log(`Database Connection Established`);
})

mongoose.connection.on('error', (err) => {
    console.log(`Database Connection Error: ${err}`);
})

mongoose.connection.on('reconnected', () => {
    console.log(`Database Connection Reconnected`);
})

// Custom Label for paginate results
mongoosePaginate.paginate.options = {
    customLabels: {
        totalDocs: 'total',
        limit: 'limit',
        page: 'page',
        totalPages: 'pages',
        pagingCounter: false,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: false,
        nextPage: false,
    },
};

const app = express();

app.use(express.json({ limit: '100mb' }));
app.use(express.json({ limit: '100mb' }));

app.use(compression());


// CORS Config
app.use(cors({
    origin: "*",
    optionsSuccessStatus: 200,
    methods: "GET, PUT, POST, DELETE, OPTIONS"
}));


app.options("*", cors({ origin: "*", optionsSuccessStatus: 200 }));

app.use((req: Request, res: Response, next: NextFunction) => {
    res.removeHeader("X-Powered-By");
    res.removeHeader("Date");
    res.removeHeader("Connection");
    res.setHeader("Server", "SSV Normandy");
    next();
});



app.listen(process.env.PORT, function () {
    console.log(`Swoove Server Running on port: ${process.env.PORT}`);
});
