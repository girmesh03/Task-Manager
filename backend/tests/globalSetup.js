export default async () => {
  process.env.MONGODB_URI = 'mongodb://girmazewdei38:U58TPjHxeS2FZ5Ht@task-manager-cluster-shard-00-00.kz7pm.mongodb.net:27017,task-manager-cluster-shard-00-01.kz7pm.mongodb.net:27017,task-manager-cluster-shard-00-02.kz7pm.mongodb.net:27017/task-manager-automated-tests?replicaSet=atlas-k5qt7x-shard-0&ssl=true&authSource=admin';
  process.env.NODE_ENV = 'test';
  process.env.JWT_ACCESS_SECRET = 'test-access-secret-min-32-characters-long';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-min-32-characters-long';
  process.env.JWT_ACCESS_EXPIRES_IN = '15m';
  process.env.JWT_REFRESH_EXPIRES_IN = '7d';
};
