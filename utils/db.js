import { MongoClient, ObjectID } from 'mongodb';
import sha1 from 'sha1';

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

  async getUser(email) {
    await this.client.connect();
    const user = await this.client.db(this.database).collection('users').find({ email }).toArray();
    if (!user.length) return null;
    return user[0];
  }

  async userExist(email) {
    const user = await this.getUser(email);
    if (user) return true;
    return false;
  }

  async createUser(email, password) {
    const hashPwd = sha1(password);
    await this.client.connect();

    const result = await this.client.db(this.database)
      .collection('users').insertOne({ email, password: hashPwd });
    return result;
  }

  async getUserById(id) {
    const _id = new ObjectID(id);
    await this.client.connect();
    const user = await this.client.db(this.database).collection('users').find({ _id }).toArray();
    if (!user.length) return null;
    return user[0];
  }

  async getFilesById(id) {
    const _id = new ObjectID(id);
    await this.client.connect();
    const file = await this.client.db(this.database).collection('files').find({ _id }).toArray();
    if (!file.length) return null;
    file[0].id = file[0]._id;
    delete file[0]._id;
    delete file[0].localPath;
    // Manually place id at the beginning
    const reorderedFile = {
      id: file[0].id,
      ...({ ...file[0] }),
    };
    return reorderedFile;
  }

  async createFile(fileData) {
    await this.client.connect();
    const result = await this.client.db(this.database).collection('files').insertOne(fileData);
    const { insertedId } = result;

    // Optional: Fetch the inserted document by ID
    const newFile = await this.getFilesById(insertedId);
    return newFile;
  }
}

const dbClient = new DBClient();

export default dbClient;
