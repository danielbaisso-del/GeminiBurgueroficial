# Prisma Configuration for Vercel Deployment

## Important Notes

When deploying to Vercel (serverless environment), the default Prisma setup may not work optimally due to connection pooling limitations.

## Recommended: Use Prisma Data Proxy

### Setup Steps:

1. **Enable Data Proxy in Prisma Cloud**
   - Go to https://cloud.prisma.io
   - Create or select your project
   - Navigate to "Data Proxy" section
   - Enable Data Proxy for your database

2. **Get Connection String**
   - Copy the Data Proxy connection string
   - It will look like: `prisma://aws-us-east-1.prisma-data.com/?api_key=...`

3. **Update Environment Variable**
   - Set `DATABASE_URL` in Vercel to the Data Proxy connection string
   - Do NOT use the direct MySQL connection string in production

## Alternative: Direct Connection with Pooling

If you cannot use Data Proxy, ensure your database supports connection pooling or use PlanetScale:

### PlanetScale Example:
```
DATABASE_URL="mysql://user:pass@aws.connect.psdb.cloud/database?sslaccept=strict"
```

## Schema Location

The Prisma schema is located at:
- `backend/prisma/schema.prisma`

## Running Migrations

### Development (Local):
```bash
cd backend
npx prisma migrate dev
```

### Production (After Deployment):
```bash
# Set production DATABASE_URL in your local environment
export DATABASE_URL="prisma://your-data-proxy-url"

cd backend
npx prisma migrate deploy
```

## Generate Prisma Client

The Prisma Client is automatically generated during the build process via the `vercel-build` script:

```json
"vercel-build": "prisma generate && tsc"
```

## Connection Pooling Considerations

In serverless environments:
- Each function invocation creates a new database connection
- Without proper pooling, you'll quickly exhaust connection limits
- Data Proxy handles connection pooling automatically
- Traditional MySQL connections may fail under load

## Testing Locally

```bash
# Use local DATABASE_URL
cd backend
npx prisma generate
npx prisma db push  # For development only
```

## Resources

- [Prisma Data Proxy Documentation](https://www.prisma.io/docs/data-platform/data-proxy)
- [Best Practices for Serverless](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Prisma with Vercel](https://vercel.com/guides/deploying-prisma-with-vercel)
