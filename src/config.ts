export const PORT: string | number = process.env.PORT || 4000;

export const MONGO_URI: string =
  process.env.NODE_ENV == 'production'
    ? 'mongodb://root:password@localhost:27017/prod_db?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false'
    : 'mongodb://root:password@localhost:27017/test_db?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false';
