declare namespace NodeJS {
  interface ProcessEnv {
    PORT: number;
    MYSQL_HOST: string;
    MYSQL_PORT: number;
    MYSQL_USER: string;
    MYSQL_PASSWORD: string;
    MYSQL_DATABASE: string;
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
  }
}

declare namespace Express {
  interface Request {
    user?: {
      sub: number;
      name: string;
      role: string;
    };
  }
}
