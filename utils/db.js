import { MongoClient } from 'mongodb';

class DBClient {
    constructor() {
        const host = process.env.DB_HOST || 'localhost';
        const port = process.env.DB_PORT || 27017;
        const database = process.env.DB_DATABASE || 'files_manager';
        // Create MongoDB client
        const uri = `mongodb://${host}:${port}`;
        this.client = new MongoClient(uri, { useUnifiedTopology: true });
        this.client.connect((err) => {
            if (err) {
                this.db = null;
                console.error(err);
            } else {
                this.db = this.client.db(database);
                console.log('DB connected');
            }
        });
    }

    isAlive() {
        return !!this.db;
    }

    async nbUsers() {
        // Get the number of documents in the collection users
        if (!this.isAlive) return 0;
        return this.db.collection('users').countDocuments();
    }

    async nbFiles() {
        // Get the number of documents in the collection files
        if (!this.isAlive) return 0;
        return this.db.collection('files').countDocuments();
    }
}

const dbClient = new DBClient();
module.exports = dbClient;
