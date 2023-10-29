import { Mongoose } from 'mongoose';
import { keys } from '../config/keys';

var mongoose: Mongoose = new Mongoose();
let db_url = keys.localMongoDB.database; // "mongodb://localhost:27017/ccdb_dev?authSource=admin";
let db_crds = { useNewUrlParser: true, useUnifiedTopology: true }; // user: 'ccdb_dev', pass: 'cc@pWd'
mongoose.connect(db_url, db_crds).then(db => {
    console.log('connected to mongodb');
}).catch(err => console.error(err));

mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongodDB connection error:'));

const mongo = mongoose;

export default mongo;